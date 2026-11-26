import pdfplumber, re, json
pdf = pdfplumber.open('fase2.pdf')
out=[]
for i,pg in enumerate(pdf.pages):
    words = pg.extract_words(keep_blank_chars=False, use_text_flow=False)
    txt = ' '.join(w['text'] for w in words)
    if 'Procesos de desarrollo de aprendizaje' not in txt or 'Contenidos' not in txt: continue
    # find header markers
    hdr = [w for w in words if w['text'] in ('1°','2°','3°')]
    if len(hdr)<3: continue
    x1 = [w for w in hdr if w['text']=='1°'][0]; x2=[w for w in hdr if w['text']=='2°'][0]; x3=[w for w in hdr if w['text']=='3°'][0]
    top = x2['bottom']+2
    # column boundaries: midpoints
    c1l = x1['x0'] - (x2['x0']-x1['x0'])/2
    b12 = (x1['x1']+x2['x0'])/2; b23=(x2['x1']+x3['x0'])/2
    # crude: col1 starts roughly where first PDA text begins; derive from words
    campo = 'LEN'
    for k,v in (('Lenguajes','LEN'),('Saberes y Pensamiento','SPC'),('Ética, Naturaleza','ENS'),('De lo Humano','HUC')):
        if k in txt: campo=v
    body=[w for w in words if w['top']>top and w['bottom']<pg.height-30]
    # boundary between contenido and col1: find gap. use x0 of '1°' minus 60
    bc1 = c1l
    def col(w):
        cx=w['x0']
        if cx<bc1: return 0
        if cx<b12: return 1
        if cx<b23: return 2
        return 3
    lines={}
    for w in body:
        c=col(w); key=(c, round(w['top']))
        lines.setdefault(key,[]).append(w)
    cols={0:[],2:[]}
    for (c,t),ws in sorted(lines.items(), key=lambda kv:(kv[0][0],kv[0][1])):
        if c in cols: cols[c].append((t,' '.join(x['text'] for x in sorted(ws,key=lambda z:z['x0']))))
    out.append(dict(page=i+1,campo=campo,cont=cols[0],pda2=cols[2]))
json.dump(out,open('raw2.json','w'),ensure_ascii=False,indent=0)
print(len(out),[ (o['page'],o['campo']) for o in out])
