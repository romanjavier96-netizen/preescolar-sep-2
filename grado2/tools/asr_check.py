# Verificación por reconocimiento de voz (Whisper) de una muestra de clips por personaje.
import json, random, subprocess, numpy as np, unicodedata, re, sys
from faster_whisper import WhisperModel
norm = lambda s: re.sub(r'[^a-zñ ]', '', unicodedata.normalize('NFD', s.lower()).replace('n\u0303', 'ñ').encode('ascii', 'ignore').decode() if False else ''.join(ch for ch in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(ch) != 'Mn')).split()
m = WhisperModel('base', device='cpu', compute_type='int8')
random.seed(int(sys.argv[1]) if len(sys.argv) > 1 else 7); N = int(sys.argv[2]) if len(sys.argv) > 2 else 6
tot = []
for c in ['teco', 'luna', 'leo', 'axi']:
    man = json.load(open(f'www/audio/{c}/manifest.json'))
    for t in random.sample([k for k in man if len(k) > 12], N):
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'www/audio/{c}/{man[t]}', '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
        a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
        segs, _ = m.transcribe(a, language='es')
        hyp = ''.join(s.text for s in segs).strip(); A, B = set(norm(t)), set(norm(hyp))
        sc = len(A & B) / max(1, len(A)); tot.append(sc)
        print(f'{c} {sc:.2f} | {t} → {hyp}')
print('promedio de palabras reconocidas: %.2f' % (sum(tot) / len(tot)))
