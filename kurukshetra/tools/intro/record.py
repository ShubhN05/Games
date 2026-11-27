"""Record the intro films from the real game: media/intro.mp4 (keyboard) and media/intro-phone.mp4 (touch screens).

    python tools/intro/record.py            (the game must be served at http://127.0.0.1:8010/kurukshetra/)
    python tools/intro/record.py --phone    only the phone film (--pc: only the keyboard film)
    python tools/intro/record.py --sound    only put new sound on the films already made

Music: put it in tools/intro/music.mp3 (see sound.py; it is not uploaded).
Needs Google Chrome and the Python packages websockets, imageio-ffmpeg and numpy. Frames go to a temporary folder.
Record again after a character or the battlefield changes."""
import base64, json, shutil, subprocess, sys, tempfile, time, urllib.request
from pathlib import Path

import imageio_ffmpeg
from websockets.sync.client import connect

from sound import make_sound

HERE = Path(__file__).resolve().parent
GAME = HERE.parent.parent
URL = 'http://127.0.0.1:8010/kurukshetra/index.html?intro=0&touch='
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
FPS, PORT = 30, 9333
MUSIC = HERE / 'music.mp3'
# one film for each kind of player; the phone one is drawn at a phone's size and enlarged to the same 1280 x 720
VERSIONS = {
    'pc':    {'touch': 0, 'width': 1280, 'height': 720, 'film': GAME / 'media' / 'intro.mp4',       'events': HERE / 'events.json'},
    'phone': {'touch': 1, 'width': 667,  'height': 375, 'film': GAME / 'media' / 'intro-phone.mp4', 'events': HERE / 'events-phone.json'},
}
# what the captions say differs between keys and thumbs
WORDS = {
    'pc': {'moves': 'Fast and slow arrows: straight, low, jumping and high',
           'stop': 'The next number stops it: 2 Water stops 1 Fire', 'strike': 'One key for each of the five elements',
           'great': 'Brahmastra · Pashupata · Narayanastra: once in a match', 'lower': 'Lower your bow, and it passes you by'},
    'phone': {'moves': 'Left thumb shoots with F and S · Right thumb jumps and ducks',
              'stop': 'Hold SUPER and slide to the next number: 2 Water stops 1 Fire', 'strike': 'Slide to any of the five elements',
              'great': 'Hold ★ and slide: your great weapons and the shield', 'lower': 'Pull the stick down, and it passes you by'},
}


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
    def __init__(self, page, work, pictures=True):
        self.page, self.frames, self.events, self.pictures = page, 0, [], pictures
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
            if self.pictures:
                image = self.page.send('Page.captureScreenshot', format='jpeg', quality=93)
                (self.dir / f'{self.frames:05d}.jpg').write_bytes(base64.b64decode(image['data']))
            self.frames += 1


def ramp(t, start, end, fade=0.35):
    """0..1 opacity of a text shown from start to end seconds"""
    return max(0.0, min(1.0, (t - start) / fade, (end - t) / fade))


def once(t, when):
    return when <= t < when + 1 / FPS - 1e-9


def thumb(film, t, start, length, button, index):
    """phone film: a thumb lands on a wheel at `start`, slides to circle `index` and lifts `length` seconds later"""
    if once(t, start):
        film.call('wheel', button, index, 0)
    elif once(t, start + length):
        film.call('wheel', button, index, 1)
    elif start < t < start + length:
        film.call('wheel', button, index, min(0.95, (t - start) / length))


def film_scenes(film, kind):
    words, phone = WORDS[kind], kind == 'phone'
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
                film.call('meKey', '3')           # he raises the bow and the arrow starts to glow
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
        film.call('text', 'cap', f'Shoot. Jump. Duck.<small>{words["moves"]}</small>', ramp(t, 0.3, length - 0.2))
        return None
    film.shoot(7.4, moves)

    # 4. super arrows
    film.call('scene', 'arjun', 'karna', True)

    def supers(t, length):
        if once(t, 0.2):
            film.call('foeKey', '1')
        if phone:
            thumb(film, t, 3.4, 0.8, 'tSuper', 1)      # slide to 2 Water
            thumb(film, t, 4.85, 0.45, 'tSuper', 3)    # slide to 4 Mountain
        else:
            if once(t, 3.9):
                film.call('meKey', '2')
            if once(t, 4.8):
                film.call('meKey', '4')
        if t < 4.8:
            film.call('text', 'cap', f'Super arrows<small>{words["stop"]}</small>', ramp(t, 0.3, 4.8))
        else:
            film.call('text', 'cap', f'Now strike back<small>{words["strike"]}</small>', ramp(t, 4.8, length - 0.2))
        return None
    film.shoot(11.8, supers)

    # 5. the great weapons
    film.call('scene', 'arjun', 'ashvatthama', True)

    def great(t, length):
        if once(t, 0.2):
            film.call('foeKey', '7')
        if phone:
            thumb(film, t, 0.9, 1.9, 'tStar', None)    # open the star wheel, look, and let go in the middle
        if once(t, 4.3):
            film.call('hold', 'ArrowDown', True)
        if t < 3.3:
            film.call('text', 'cap', f'Great weapons<small>{words["great"]}</small>', ramp(t, 0.3, 3.3))
        else:
            film.call('text', 'cap', f'Narayanastra<small>{words["lower"]}</small>', ramp(t, 3.3, length - 0.2))
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


def play_scenes(work, kind, pictures):
    """run the staged scenes in the real game; returns the Film (with its pictures, or only its timings)"""
    v, page = VERSIONS[kind], Page(work)
    try:
        page.send('Page.enable')
        page.send('Emulation.setDeviceMetricsOverride', width=v['width'], height=v['height'], deviceScaleFactor=1280 / v['width'], mobile=False)
        page.send('Page.addScriptToEvaluateOnNewDocument', source='window.requestAnimationFrame = () => 0;')   # only the recording moves time
        page.send('Page.navigate', url=URL + str(v['touch']))
        for _ in range(300):
            if page.js('!!window.__m && getComputedStyle(document.getElementById("loading")).display === "none"'):
                break
            time.sleep(0.3)
        else:
            raise RuntimeError('the game did not load')
        page.js((HERE / 'stage.js').read_text(encoding='utf-8'))
        film = Film(page, work, pictures)
        film_scenes(film, kind)
    finally:
        page.close()
    v['events'].write_text(json.dumps({'seconds': film.frames / FPS, 'events': film.events}), encoding='utf-8')
    return film


def ffmpeg(*args):
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', *map(str, args)], check=True)


def make(kind, sound_only):
    v, work = VERSIONS[kind], Path(tempfile.mkdtemp(prefix='kurukshetra-intro-'))
    out, film = v['film'], None
    if not sound_only or not v['events'].exists():
        film = play_scenes(work, kind, pictures=not sound_only)
    timings = json.loads(v['events'].read_text(encoding='utf-8'))
    seconds, wav = timings['seconds'], work / 'sound.wav'
    make_sound(wav, seconds, timings['events'], MUSIC)
    out.parent.mkdir(exist_ok=True)
    sound = ['-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart']
    if sound_only:                       # keep the pictures exactly as they are
        new = work / out.name
        ffmpeg('-i', out, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', *sound, new)
        shutil.copyfile(new, out)
    else:
        ffmpeg('-framerate', FPS, '-i', film.dir / '%05d.jpg', '-i', wav, '-vf', 'scale=1280:720:in_range=full:out_range=tv,format=yuv420p',
               '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', *sound, out)
    keep = '--keep' in sys.argv
    print(f'{out}  {seconds:.1f} s  {out.stat().st_size / 1e6:.1f} MB  music: {"music.mp3" if MUSIC.exists() else "made by script"}'
          + (f'  working files in {work}' if keep else ''), flush=True)
    if not keep:
        shutil.rmtree(work, ignore_errors=True)


def main():
    chosen = [kind for kind in VERSIONS if '--' + kind in sys.argv] or list(VERSIONS)
    for kind in chosen:
        make(kind, '--sound' in sys.argv)


if __name__ == '__main__':
    main()
