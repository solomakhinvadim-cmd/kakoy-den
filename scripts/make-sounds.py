"""Синтез звуков уведомлений (python3 scripts/make-sounds.py).

Все звуки собраны из синусоид и шума в коде — без записей и без нейросетей.
Короткие (<2 с), моно, 44.1 кГц, 16 бит — подходят и для iOS, и для Android.
"""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')
rng = np.random.default_rng(7)


def t_axis(sec):
    return np.arange(int(SR * sec)) / SR


def env_adsr(n, a=0.02, r=0.15):
    e = np.ones(n)
    na, nr = int(SR * a), int(SR * r)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def bandpass(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def formant(x, f, bw):
    return bandpass(x, max(40, f - bw / 2), f + bw / 2)


def save(name, x, gain=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    pad = np.zeros(int(SR * 0.05))
    x = np.concatenate([pad, x, pad])
    wavfile.write(os.path.join(OUT, name), SR, (x * 32767).astype(np.int16))


def meow():
    """Мяу: гармонический тон с дугой высоты и движением гласной «и → а → у»."""
    t = t_axis(0.75)
    p = t / t[-1]
    f0 = 520 + 330 * np.sin(np.pi * np.clip(p * 1.15, 0, 1)) - 120 * p
    phase = 2 * np.pi * np.cumsum(f0) / SR
    src = sum(np.sin(k * phase) / k for k in range(1, 16))
    # гласные «и», «а», «у» фильтруются целиком и плавно перетекают друг в друга
    vowel = lambda f1, f2: formant(src, f1, 260) + 0.6 * formant(src, f2, 400)
    v_i, v_a, v_u = vowel(400, 2300), vowel(900, 1400), vowel(450, 900)
    w_i = np.clip(1 - p / 0.35, 0, 1)
    w_u = np.clip((p - 0.35) / 0.65, 0, 1)
    w_a = 1 - w_i - w_u
    out = w_i * v_i + w_a * v_a + w_u * v_u
    out *= env_adsr(len(out), a=0.06, r=0.25)
    out += 0.01 * rng.standard_normal(len(out)) * env_adsr(len(out), 0.02, 0.3)
    save('meow.wav', out)


def rustle():
    """Шелест страницы: короткие пачки отфильтрованного шума с «взмахом»."""
    t = t_axis(0.9)
    noise = rng.standard_normal(len(t))
    swoosh = np.exp(-((t - 0.32) / 0.14) ** 2)
    crackle = (rng.random(len(t)) < 0.004) * rng.standard_normal(len(t)) * 3
    x = bandpass(noise, 1800, 7000) * swoosh + bandpass(crackle, 2500, 9000) * swoosh
    flick = bandpass(rng.standard_normal(len(t)), 3000, 8000) * np.exp(-((t - 0.7) / 0.03) ** 2) * 1.4
    save('rustle.wav', x + flick, gain=0.6)


def birds():
    """Птички: три быстрых чирика вверх по частоте с трелью."""
    parts = []
    for f_start, f_end, dur in [(2600, 4200, 0.09), (2800, 4600, 0.08), (3000, 5000, 0.12)]:
        t = t_axis(dur)
        p = t / dur
        f = f_start + (f_end - f_start) * p ** 0.7
        f = f * (1 + 0.04 * np.sin(2 * np.pi * 55 * t))
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * p) ** 1.5
        parts += [y, np.zeros(int(SR * 0.06))]
    tail = t_axis(0.18)
    trill = np.sin(2 * np.pi * np.cumsum(3800 + 300 * np.sin(2 * np.pi * 30 * tail)) / SR)
    trill *= np.sin(np.pi * tail / tail[-1]) * 0.6
    save('birds.wav', np.concatenate(parts + [trill]), gain=0.7)


def croak():
    """Ква-ква: низкая пачка импульсов с формантами «а», два раза."""
    def one(dur, f0):
        t = t_axis(dur)
        p = t / dur
        pulse_rate = f0 * (1 - 0.15 * p)
        phase = np.cumsum(pulse_rate) / SR
        train = (np.diff(np.floor(phase), prepend=0) > 0).astype(float)
        rough = 1 + 0.6 * np.sign(np.sin(2 * np.pi * 28 * t))  # «рокот»
        src = sosfilt(butter(1, 3000, fs=SR, output='sos'), train * rough)
        y = formant(src, 700, 300) + 0.7 * formant(src, 1200, 300) + 0.3 * formant(src, 2500, 500)
        return y * env_adsr(len(t), a=0.015, r=0.08)

    save('croak.wav', np.concatenate([one(0.22, 140), np.zeros(int(SR * 0.09)), one(0.3, 125)]))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    meow(); rustle(); birds(); croak()
    print('ok', sorted(os.listdir(OUT)))
