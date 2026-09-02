import re, sys, io, os

def classes(text):
    return set(m.group(1) for m in re.finditer(r'\.([A-Za-z][A-Za-z0-9_-]*)', text))

def read(p):
    return io.open(p, encoding='utf-8', errors='replace').read()

def strip_comments(t):
    return re.sub(r'/\*.*?\*/', '', t, flags=re.S)

def top_blocks(t):
    """Yield (selector, body, is_at) top-level blocks."""
    out=[]; i=0; n=len(t); buf=''
    while i < n:
        ch=t[i]
        if ch=='{':
            depth=1; j=i+1
            while j<n and depth>0:
                if t[j]=='{': depth+=1
                elif t[j]=='}': depth-=1
                j+=1
            out.append((buf.strip(), t[i+1:j-1]))
            buf=''; i=j
        elif ch=='}':
            buf=''; i+=1
        else:
            buf+=ch; i+=1
    return out

AT_NEST = ('@media','@supports','@container','@layer')

def one_line(s):
    """Collapse a rule to a single line.

    CRITICAL: regenerate.sh de-duplicates the extracted rules with
    `awk '!seen[$0]++'`, which compares LINES. A multi-line rule whose first
    lines are identical between two portals but whose last line differs (e.g.
    .act-mini in Super Admin vs Retailer Admin) had its shared lines eaten as
    duplicates and left its final line orphaned — a fragment with no selector
    and a stray `}`, which broke every rule after it in the file. One rule per
    line makes that dedupe correct by construction."""
    return ' '.join(s.split())

def filter_css(text, keep):
    text = strip_comments(text)
    res=[]
    for sel, body in top_blocks(text):
        if not sel: continue
        low = sel.lower()
        if low.startswith(AT_NEST):
            inner = filter_css_inner(body, keep)
            if inner.strip():
                res.append(one_line(sel) + '{' + inner + '}')
            continue
        if low.startswith('@keyframes') or low.startswith('@-webkit-keyframes'):
            # keep keyframes only if name looks portal-specific
            continue
        if low.startswith('@'):
            continue
        if sel_ok(sel, keep):
            res.append(one_line(sel) + '{' + one_line(body) + '}')
    return '\n'.join(res)

def filter_css_inner(text, keep):
    res=[]
    for sel, body in top_blocks(text):
        if not sel: continue
        if sel.lower().startswith('@'): continue
        if sel_ok(sel, keep):
            res.append(one_line(sel) + '{' + one_line(body) + '}')
    return ''.join(res)

def sel_ok(sel, keep):
    parts = [p.strip() for p in sel.split(',') if p.strip()]
    if not parts: return False
    for p in parts:
        cs = classes(p)
        if not cs: return False
        if not (cs & keep): return False
    return True

if __name__ == '__main__':
    src, keepfile, out = sys.argv[1], sys.argv[2], sys.argv[3]
    keep = set(x.strip() for x in io.open(keepfile).read().split() if x.strip())
    txt = read(src)
    io.open(out,'w',encoding='utf-8').write(filter_css(txt, keep))
    print(out, os.path.getsize(out))
