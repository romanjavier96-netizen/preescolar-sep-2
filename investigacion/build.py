import json,re
raw=json.load(open('raw2.json'))
def paras(lines):
    ps=[];last=None
    for t,s in lines:
        if last is not None and t-last<16: ps[-1][1].append(s)
        else: ps.append([t,[s]])
        last=t
    out=[]
    for t,ss in ps:
        txt=''
        for s in ss:
            if txt.endswith('-') and not txt.endswith(' -'): txt=txt[:-1]+s
            elif txt.endswith('−'): txt=txt+s
            else: txt=(txt+' '+s).strip()
        out.append((t,txt))
    return out
res={}
cur=None
for pg in raw:
    c=pg['campo']; res.setdefault(c,[])
    conts=paras(pg['cont']); pdas=paras(pg['pda2'])
    # merge contenido paragraphs that don't end with '.' with next
    m=[]
    for t,s in conts:
        if m and not m[-1][1].endswith('.'): m[-1]=(m[-1][0],m[-1][1]+' '+s)
        else: m.append((t,s))
    conts=m
    for t,s in pdas:
        owner=None
        for ct,cs in conts:
            if ct<=t+3: owner=cs
        if owner is None:
            # continuation from previous page
            if res[c]: 
                lst=res[c][-1]['pda']
                if lst and not lst[-1].endswith('.'): lst[-1]+=' '+s
                else: lst.append(s)
            continue
        if not res[c] or res[c][-1]['contenido']!=owner:
            res[c].append({'contenido':owner,'pda':[]})
        lst=res[c][-1]['pda']
        if lst and not lst[-1].endswith('.'): lst[-1]+=' '+s
        else: lst.append(s)
    for ct,cs in conts:
        if not any(x['contenido']==cs for x in res[c]): res[c].append({'contenido':cs,'pda':[]})
json.dump(res,open('pda2.json','w'),ensure_ascii=False,indent=1)
for c,v in res.items():
    print('=====',c,len(v))
    for x in v: print(' *',x['contenido'][:110],'| PDA:',len(x['pda']))
