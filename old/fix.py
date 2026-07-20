import re

with open('D:\\((_atWork_))\\DuneTech\\GreenStreets-UI-UX\\Prototypes\\greenstreets_prototype_v3.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add type="button" to all <button> tags that don't have it
html = re.sub(r'<button\b(?![^>]*\btype=)', r'<button type="button"', html)

# 2. Add return false to onclicks on buttons and a tags
def fix_onclick(match):
    prefix = match.group(1)
    onclick_content = match.group(2)
    suffix = match.group(3)
    if 'return false' not in onclick_content:
        onclick_content = onclick_content.rstrip(';') + ';return false'
    return f'{prefix}onclick="{onclick_content}"{suffix}'

html = re.sub(r'(<[^>]+?)onclick="([^"]+)"([^>]*>)', fix_onclick, html)

# 3. Add the "Onboarding progress" bar to s5
progress_bar = """<div class="grp" style="grid-column:1/-1"><div class="grp-hdr">Onboarding progress</div><div class="grp-body"><div class="steps">
  <div class="step"><div class="sdot">1</div><div class="slbl">Company</div></div>
  <div class="step"><div class="sdot curr">2</div><div class="slbl curr">Jurisdiction</div></div>
  <div class="step"><div class="sdot">3</div><div class="slbl">Admin user</div></div>
  <div class="step"><div class="sdot">4</div><div class="slbl">Confirm</div></div>
</div></div></div>"""

# Find the start of s5's grids
s5_pattern = r'(<div class="screen" id="s5">.*?<div class="grids">)'
if re.search(s5_pattern, html, re.DOTALL):
    html = re.sub(s5_pattern, r'\1\n        ' + progress_bar, html, flags=re.DOTALL)

with open('D:\\((_atWork_))\\DuneTech\\GreenStreets-UI-UX\\Prototypes\\greenstreets_prototype_v3.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Modifications complete.")
