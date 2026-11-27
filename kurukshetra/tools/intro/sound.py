"""The intro's sound track, made from nothing but sums (so it is ours): a drone, war drums, a plucked tune, a conch,
and a sound for each thing that happens on screen."""
import wave

import numpy as np

RATE = 44100
rng = np.random.default_rng(7)


def times(seconds):
    return np.arange(int(seconds * RATE)) / RATE


def noise(seconds, smooth=1):
    n = rng.uniform(-1, 1, int(seconds * RATE))
    return np.convolve(n, np.ones(smooth) / smooth, mode='same') if smooth > 1 else n


def swell(t, attack, release):
    """rises over `attack` seconds and fades over the last `release` seconds"""
    return np.clip(t / attack, 0, 1) * np.clip((t[-1] - t) / release, 0, 1)


def glide(t, start, end, speed):
    """a tone whose pitch slides from start to end"""
    freq = end + (start - end) * np.exp(-t * speed)
    return np.sin(2 * np.pi * np.cumsum(freq) / RATE)


def war_drum(strength=1.0):
    t = times(0.9)
    return strength * (glide(t, 150, 52, 18) * np.exp(-t * 5.5) + 0.35 * noise(0.9, 30) * np.exp(-t * 28))


def pluck(freq, seconds=1.4):
    """a plucked string (Karplus-Strong)"""
    period = int(RATE / freq)
    ring = list(noise(period / RATE + 0.001, 2)[:period])
    out = np.empty(int(seconds * RATE))
    for i in range(len(out)):
        k = i % period
        out[i] = ring[k]
        ring[k] = 0.996 * 0.5 * (ring[k] + ring[(k + 1) % period])
    return out * swell(times(seconds), 0.002, 0.2)


def bell(freqs, seconds, decay):
    t = times(seconds)
    return sum(np.sin(2 * np.pi * f * t + i) * np.exp(-t * decay * (1 + 0.35 * i)) / (1 + 0.6 * i) for i, f in enumerate(freqs))


def conch(seconds=3.0):
    t = times(seconds)
    freq = 233 * (1 - 0.12 * np.exp(-t * 4)) * (1 + 0.006 * np.sin(2 * np.pi * 5 * t))
    phase = 2 * np.pi * np.cumsum(freq) / RATE
    tone = sum(np.sin(k * phase) / k ** 1.4 for k in range(1, 7))
    return (tone + 0.25 * noise(seconds, 12)) * swell(t, 0.5, 1.0)


def effect(name):
    if name == 'gong':
        return 0.55 * bell([98, 147, 209, 263, 337, 421], 4.0, 0.9)
    if name == 'drum':
        return 0.85 * war_drum()
    if name == 'bow':
        t = times(0.35)
        return 0.3 * noise(0.35, 3) * np.exp(-t * 22) + 0.25 * glide(t, 420, 180, 25) * np.exp(-t * 14)
    if name == 'charge':
        t = times(1.6)
        return 0.14 * (glide(t, 300, 950, 1.1) + glide(t, 452, 1420, 1.1)) * swell(t, 0.9, 0.4)
    if name == 'release':
        t = times(1.1)
        return 0.5 * noise(1.1, 14) * swell(t, 0.25, 0.7) + 0.2 * glide(t, 700, 160, 3) * np.exp(-t * 3)
    if name == 'counter':
        return 0.22 * bell([880, 1320, 1760], 0.8, 5)
    if name == 'hit':
        t = times(0.4)
        return 0.55 * glide(t, 190, 70, 22) * np.exp(-t * 14) + 0.2 * noise(0.4, 6) * np.exp(-t * 30)
    if name in ('boom', 'clash'):
        t = times(1.8)
        blast = 0.9 * glide(t, 110, 34, 6) * np.exp(-t * 2.6) + 0.6 * noise(1.8, 9) * np.exp(-t * 4.5)
        if name == 'clash':
            blast[:int(1.2 * RATE)] += 0.25 * bell([620, 933, 1397, 2090], 1.2, 4)
        return blast
    if name == 'pass':
        return 0.2 * bell([523, 659, 784, 1046], 2.0, 1.6)
    return np.zeros(1)


def add(track, sound, at):
    i = int(at * RATE)
    if i < len(track):
        track[i:i + len(sound)] += sound[:len(track) - i]


def make_sound(path, seconds, events):
    """events: [(time in seconds, name)] from the recording"""
    t = times(seconds)
    track = np.zeros(len(t))
    # drone on D and A, breathing slowly
    for f, level in [(73.4, 0.07), (110.0, 0.045), (146.8, 0.035), (220.6, 0.018), (293.2, 0.01)]:
        track += level * np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * 0.17 * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * (0.11 + f / 4000) * t))
    # the conch opens and closes
    add(track, 0.16 * conch(), 0.4)
    add(track, 0.14 * conch(3.2), seconds - 3.5)
    # war drums: a steady march that grows quieter while the fighting is heard
    beat = 60 / 92
    for n, at in enumerate(np.arange(3.6, seconds - 3.8, beat / 2)):
        strong = [1.0, 0, 0.35, 0, 0.7, 0.3, 0.45, 0][n % 8]
        if strong:
            add(track, war_drum(strong * (0.36 if at < 16.6 else 0.2)), at)
    # a plucked tune while the archers are shown
    scale = {'D': 293.7, 'Eb': 311.1, 'F#': 370.0, 'G': 392.0, 'A': 440.0, 'Bb': 466.2, 'C#': 554.4, 'D2': 587.3}
    tune = 'D F# G A . Bb A G F# . Eb D . A D2 C# Bb A . G F# Eb D . . .'.split()
    for n, note in enumerate(tune * 2):
        at = 3.7 + n * beat / 2
        if note != '.' and at < 16.4:
            add(track, 0.15 * pluck(scale[note]), at)
    for at, name in events:
        add(track, effect(name), at)
    track *= swell(t, 0.3, 1.2)
    track = np.tanh(track * 1.15)                                 # gentle limiting
    track *= 0.89 / np.max(np.abs(track))
    left, right = track, np.roll(track, int(0.009 * RATE)) * 0.97       # a little width
    data = (np.stack([left, right], axis=1) * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(data.tobytes())
