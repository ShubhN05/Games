"""Record the intro video from the real game and write media/intro.mp4.

    python tools/intro/record.py            (the game must be served at http://127.0.0.1:8010/kurukshetra/)

Needs Google Chrome and the Python packages websockets and imageio-ffmpeg. Frames go to a temporary folder.
Run it again after a character or the battlefield changes."""
import base64, json, shutil, subprocess, sys, tempfile, time, urllib.request
from pathlib import Path

import imageio_ffmpeg
from websockets.sync.client import connect

from sound import make_sound

HERE = Path(__file__).resolve().parent
GAME = HERE.parent.parent
URL = 'http://127.0.0.1:8010/kurukshetra/index.html?touch=0&intro=0'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
FPS, PORT = 30, 9333


class Page:
    """a tab of a headless Chrome, spoken to over the DevTools protocol"""

    def __init__(self, work):
        self.chrome = subprocess.Popen([CHROME, '--headless=new', f'--remote-debugging-port={PORT}', f'--user-data-dir={work / "profile"}',
                                        '--window-size=1280,720', '--hide-scrollbars', '--mute-audio', '--no-first-run', '--enable-gpu', '--use-angle=d3d11', 'about:blank'],
                                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(100):
            try:
                tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/list', timeout=2))
                address = next(t['webSocketDebuggerUrl'] for t in tabs if t['type'] == 'page')
                break
            except Exception:
                time.sleep(0.2)
        else:
            raise RuntimeError('Chrome did not start')
        self.ws, self.n = connect(address, max_size=None), 0

    def send(self, method, **params):
        self.n += 1
        self.ws.send(json.dumps({'id': self.n, 'method': method, 'params': params}))
        while True:
            reply = json.loads(self.ws.recv(timeout=180))
            if reply.get('id') == self.n:
                if 'error' in reply:
                    raise RuntimeError(f'{method}: {reply["error"]}')
                return reply.get('result', {})

    def js(self, code):
        result = self.send('Runtime.evaluate', expression=code, awaitPromise=True, returnByValue=True)
        if 'exceptionDetails' in result:
            raise RuntimeError(f'page error in {code[:80]!r}: {result["exceptionDetails"].get("exception", {}).get("description")}')
        return result['result'].get('value')

    def close(self):
        self.ws.close()
        self.chrome.terminate()
        self.chrome.wait(timeout=20)


class Film:
    def __init__(self, page, work):
        self.page, self.frames, self.events = page, 0, []
        self.dir = work / 'frames'
        self.dir.mkdir()

    def call(self, name, *args):
        return self.page.js(f'__intro.{name}({", ".join(json.dumps(a) for a in args)})')

    def sound(self, name):
        self.events.append((self.frames / FPS, name))

    def shoot(self, seconds, each=None):
        """record a scene; each(t, length) sets it up for the frame at t seconds and returns the camera view"""
        length = round(seconds * FPS)
        for i in range(length):
            t = i / FPS
            view = each(t, seconds) if each else None
            self.call('fade', max(0, 1 - t / 0.2, 1 - (seconds - t) / 0.2) if seconds > 1 else 0)
            for name in self.call('frame', view):
                self.sound(name)
            image = self.page.send('Page.captureScreenshot', format='jpeg', quality=93)
            (self.dir / f'{self.frames:05d}.jpg').write_bytes(base64.b64decode(image['data']))
            self.frames += 1


def ramp(t, start, end, fade=0.35):
    """0..1 opacity of a text shown from start to end seconds"""
    return max(0.0, min(1.0, (t - start) / fade, (end - t) / fade))


def once(t, when):
    return when <= t < when + 1 / FPS - 1e-9


def film_scenes(film):
    # 1. the title over the battlefield
    film.call('scene', 'arjun', 'karna', False)
    film.sound('gong')

    def opening(t, length):
        film.call('text', 'title', '<h1>KURUKSHETRA</h1><p>AN ARCHERY DUEL</p>', ramp(t, 0.3, length, 0.7))
        return {'zoom': 18.5 - 3.8 * t / length}
    film.shoot(3.6, opening)
    film.call('text', 'title', None, 0)

    # 2. the five archers
    archers = [('arjun', 'karna', 'ARJUN', 'The wielder of Gandiva', 'Brahmastra · Pashupata'),
               ('karna', 'arjun', 'KARNA', 'Son of the Sun', 'Brahmastra'),
               ('bhishma', 'arjun', 'BHISHMA', 'The grandsire', 'Brahmastra'),
               ('drona', 'arjun', 'DRONA', 'Teacher of princes', 'Brahmastra'),
               ('ashvatthama', 'arjun', 'ASHVATTHAMA', 'Son of Drona', 'Brahmastra · Narayanastra')]
    for me, other, name, title, weapons in archers:
        film.call('scene', me, other, False)
        film.sound('drum')

        def portrait(t, length, name=name, title=title, weapons=weapons):
            if once(t, 0.8):
                film.call('key', 'Digit3')        # he raises the bow and the arrow starts to glow
            film.call('text', 'card', f'<h2>{name}</h2><p>{title}</p><span>{weapons}</span>', ramp(t, 0.15, length, 0.3))
            return {'close': 62 - 34 * t / length, 'far': 4.7 - 0.45 * t / length}
        film.shoot(2.6, portrait)
        film.call('text', 'card', None, 0)

    # 3. shooting, jumping, ducking
    film.call('scene', 'arjun', 'karna', True)

    def moves(t, length):
        if once(t, 0.2):
            film.call('foeShoot', 'hard', 'low')
        if once(t, 2.2):
            film.call('foeShoot', 'hard', 'straight')
        if t < 4.4:
            film.call('dodge')
        if once(t, 4.5):
            film.call('hold', 'ArrowDown', False)
            film.call('key', 'KeyF')
        if once(t, 5.3):
            film.call('key', 'KeyS')
        film.call('text', 'cap', 'Shoot. Jump. Duck.<small>Fast and slow arrows: straight, low, jumping and high</small>', ramp(t, 0.3, length - 0.2))
        return None
    film.shoot(7.4, moves)

    # 4. super arrows
    film.call('scene', 'arjun', 'karna', True)

    def supers(t, length):
        if once(t, 0.2):
            film.call('foeKey', '1')
        if once(t, 3.9):
            film.call('key', 'Digit2')
        if once(t, 4.8):
            film.call('key', 'Digit4')
        if t < 4.8:
            film.call('text', 'cap', 'Super arrows<small>The next number stops it: 2 Water stops 1 Fire</small>', ramp(t, 0.3, 4.8))
        else:
            film.call('text', 'cap', 'Now strike back<small>One key for each of the five elements</small>', ramp(t, 4.8, length - 0.2))
        return None
    film.shoot(11.8, supers)

    # 5. the great weapons
    film.call('scene', 'arjun', 'ashvatthama', True)

    def great(t, length):
        if once(t, 0.2):
            film.call('foeKey', '7')
        if once(t, 4.3):
            film.call('hold', 'ArrowDown', True)
        if t < 3.3:
            film.call('text', 'cap', 'Great weapons<small>Brahmastra · Pashupata · Narayanastra: once in a match</small>', ramp(t, 0.3, 3.3))
        else:
            film.call('text', 'cap', 'Narayanastra<small>Lower your bow, and it passes you by</small>', ramp(t, 3.3, length - 0.2))
        return None
    film.shoot(7.2, great)
    film.call('text', 'cap', None, 0)

    # 6. the closing title
    film.call('scene', 'arjun', 'karna', False)
    film.sound('gong')

    def closing(t, length):
        film.call('text', 'title', '<h1>KURUKSHETRA</h1><p>CHOOSE YOUR ARCHER</p>', min(1.0, t / 0.6))
        return {'zoom': 14.7 + 2.8 * t / length}
    film.shoot(3.8, closing)


def main():
    work = Path(tempfile.mkdtemp(prefix='kurukshetra-intro-'))
    page = Page(work)
    try:
        page.send('Page.enable')
        page.send('Emulation.setDeviceMetricsOverride', width=1280, height=720, deviceScaleFactor=1, mobile=False)
        page.send('Page.addScriptToEvaluateOnNewDocument', source='window.requestAnimationFrame = () => 0;')   # only the recording moves time
        page.send('Page.navigate', url=URL)
        for _ in range(300):
            if page.js('!!window.__m && getComputedStyle(document.getElementById("loading")).display === "none"'):
                break
            time.sleep(0.3)
        else:
            raise RuntimeError('the game did not load')
        page.js((HERE / 'stage.js').read_text(encoding='utf-8'))
        film = Film(page, work)
        film_scenes(film)
    finally:
        page.close()
    seconds = film.frames / FPS
    wav = work / 'sound.wav'
    make_sound(wav, seconds, film.events)
    out = GAME / 'media' / 'intro.mp4'
    out.parent.mkdir(exist_ok=True)
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', str(film.dir / '%05d.jpg'), '-i', str(wav),
                    '-vf', 'scale=in_range=full:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', str(out)], check=True)
    keep = '--keep' in sys.argv
    print(f'{out}  {seconds:.1f} s  {out.stat().st_size / 1e6:.1f} MB  {len(film.events)} sounds' + (f'  frames in {work}' if keep else ''))
    if not keep:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == '__main__':
    main()
