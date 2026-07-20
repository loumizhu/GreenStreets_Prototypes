import re

with open('D:\\((_atWork_))\\DuneTech\\GreenStreets-UI-UX\\Prototypes\\greenstreets_prototype_v3.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(r'data:image/[^\"\']+', 'BASE64', html)

with open('D:\\((_atWork_))\\DuneTech\\GreenStreets-UI-UX\\Prototypes\\cleaned.html', 'w', encoding='utf-8') as f:
    f.write(html)
