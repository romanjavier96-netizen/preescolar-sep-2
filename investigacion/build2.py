import re,json,subprocess
pages=open('fase2.txt').read().split('\f')
bad=re.compile(r'■|Programa de Estudio|Procesos de desarrollo|^\s*Contenidos+\s*$|del Campo formativo')
res={};campo=None
for i,pg in enumerate(pages):
    if 'Procesos de desarrollo de aprendizaje' not in pg: continue
    for k,v in (('■ Lenguajes','LEN'),('■ Saberes','SPC'),('■ Ética','ENS'),('■ De lo Humano','HUC')):
        if k in pg: campo=v
    L=pg.split('\n')
    hi=[j for j,l in enumerate(L) if '1°' in l and '2°' in l and '3°' in l]
    if not hi: continue
    h=L[hi[0]]; p1=h.index('1°'); p2=h.index('2°'); p3=h.index('3°')
    s1=p1-15; s2=p2-15; s3=p3-14
    rows=[]
    for l in L[hi[0]+1:]:
        if bad.search(l): continue
        # adjust split points to nearest whitespace boundary to the left
        def cut(s,pos):
            pos=min(pos,len(s))
            while 0<pos<len(s) and s[pos-1]!=' ' and s[pos]!=' ': pos-=1
            return pos
        a=cut(l,s1); b=cut(l,s2); c=cut(l,s3)
        rows.append((l[:a].strip(), l[b:c].strip()))
    res.setdefault(campo,[]).append(rows)
# assemble
def join(parts):
    t=''
    for s in parts:
        if not s: continue
        if t.endswith('-'): t=t[:-1]+s
        elif t.endswith('−'): t+=s
        else: t=(t+' '+s).strip()
    return t
out={}
for campo,pgs in res.items():
    items=[];cont=[];pda=[];blank_c=0
    curC=None
    for rows in pgs:
        for c,p in rows:
            if c:
                if curC is None or (curC['done'] ):
                    curC={'c':[c],'p':[[]],'done':False}; items.append(curC)
                else: curC['c'].append(c)
                if c.endswith('.'): curC['done']=True
            if curC is None: continue
            if p: curC['p'][-1].append(p)
            else:
                if curC['p'][-1]: curC['p'].append([])
    out[campo]=[{'contenido':join(x['c']),'pda':[j for j in (join(pp) for pp in x['p']) if j]} for x in items]
# merge pda fragments not ending in '.'
for campo,v in out.items():
    for x in v:
        m=[]
        for p in x['pda']:
            if m and not m[-1].endswith('.'): m[-1]=join([m[-1],p])
            else: m.append(p)
        x['pda']=m
json.dump(out,open('pda2.json','w'),ensure_ascii=False,indent=1)
for c,v in out.items():
    print('=====',c,len(v))
    for x in v:
        print('##',x['contenido']);[print('  -',p) for p in x['pda']]
