import json, hashlib, wave, subprocess, os, sys
import onnxruntime as _ort
_OrigIS = _ort.InferenceSession
def _IS(path, sess_options=None, providers=None, **kw):
    so = sess_options or _ort.SessionOptions()
    so.intra_op_num_threads = int(os.environ.get('ORT_THREADS', '1')); so.inter_op_num_threads = 1
    return _OrigIS(path, sess_options=so, providers=providers or ['CPUExecutionProvider'], **kw)
_ort.InferenceSession = _IS
from piper import PiperVoice
from piper.config import SynthesisConfig

VOICES = {
  'teco': dict(model='es_MX-claude-high.onnx', length=1.15, noise=0.55, noise_w=0.7, semitones=-1.0,
               eq='equalizer=f=250:t=q:w=0.7:g=2.5,lowpass=f=8500'),
  'luna': dict(model='es_MX-claude-high.onnx', length=1.08, noise=0.667, noise_w=0.8, semitones=4.2,
               eq='equalizer=f=3500:t=q:w=0.8:g=1.8,lowpass=f=9000'),
  'leo':  dict(model='es_MX-ald-medium.onnx', length=1.15, noise=0.667, noise_w=0.8, semitones=4.0,
               eq='equalizer=f=250:t=q:w=0.7:g=2,lowpass=f=8500'),
  'axi':  dict(model='es_MX-claude-high.onnx', length=1.12, noise=0.6, noise_w=0.8, semitones=4.5,
               eq='equalizer=f=3500:t=q:w=0.8:g=1.5,lowpass=f=9000'),
}
ROOT = '/workspace/preescolar-sep/grado2/www/audio'
REUSE = '/workspace/ninos-app/www/audio'
import shutil
PH = json.load(open('/workspace/preescolar-sep/grado2/tools/phrases.json'))
only = [sys.argv[1]]
SH, NSH = int(sys.argv[2]), int(sys.argv[3])
PH = [t for i, t in enumerate(PH) if i % NSH == SH]
models = {}
for cid in only:
    cfg = VOICES[cid]
    if cfg['model'] not in models:
        print('load', cfg['model'], flush=True)
        models[cfg['model']] = PiperVoice.load('/workspace/tts/' + cfg['model'])
    voice = models[cfg['model']]
    syn = SynthesisConfig(length_scale=cfg['length'], noise_scale=cfg['noise'], noise_w_scale=cfg['noise_w'])
    out = os.path.join(ROOT, cid)
    os.makedirs(out, exist_ok=True)
    man = {}
    pitch = 2 ** (cfg['semitones'] / 12)
    n = 0
    for t in PH:
        h = hashlib.sha1(t.encode()).hexdigest()[:12]
        man[t] = h + '.mp3'
        mp = os.path.join(out, h + '.mp3')
        if os.path.exists(mp) and os.path.getsize(mp) > 400:
            n += 1
            continue
        old = os.path.join(REUSE, cid, h + '.mp3')
        if os.path.exists(old) and os.path.getsize(old) > 400:
            shutil.copyfile(old, mp); n += 1
            continue
        wav = f'/tmp/{cid}_{h}.wav'
        sh = f'/tmp/{cid}_{h}_s.wav'
        with wave.open(wav, 'wb') as w:
            voice.synthesize_wav(t, w, syn_config=syn)
        af = f"rubberband=pitch={pitch:.5f}:pitchq=quality:formant=preserved:channels=together,{cfg['eq']},silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.12,loudnorm=I=-16:LRA=11:TP=-1.5"
        r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', af, '-ac', '1', '-ar', '22050', '-b:a', '32k', mp], capture_output=True, text=True)
        if r.returncode != 0:
            # fallback without rubberband if filter fails
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '22050', '-b:a', '32k', mp], check=True)
        for tmp in (wav, sh):
            try: os.remove(tmp)
            except: pass
        n += 1
        if n % 80 == 0:
            print(cid, n, '/', len(PH), flush=True)
    print('DONE', cid, n, 'files', flush=True)
