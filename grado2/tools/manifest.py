# Escribe audio/<personaje>/manifest.json con las frases que sí tienen MP3
import json, hashlib, os
ROOT = '/workspace/preescolar-sep/grado2/www/audio'
PH = json.load(open('/workspace/preescolar-sep/grado2/tools/phrases.json'))
for cid in ['teco', 'luna', 'leo', 'axi']:
    man = {}; miss = 0
    for t in PH:
        h = hashlib.sha1(t.encode()).hexdigest()[:12] + '.mp3'
        p = os.path.join(ROOT, cid, h)
        if os.path.exists(p) and os.path.getsize(p) > 400: man[t] = h
        else: miss += 1
    json.dump(man, open(os.path.join(ROOT, cid, 'manifest.json'), 'w'), ensure_ascii=False)
    print(cid, len(man), 'clips, faltan', miss)
