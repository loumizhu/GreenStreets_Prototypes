import re
with open('cleaned.html', 'r', encoding='utf-8') as f:
    data = f.read()

onclicks = set(re.findall(r'onclick="([^"]+)"', data))
print("Onclick handlers:")
for o in onclicks:
    print(o)

print("\nButtons without onclick:")
buttons = re.findall(r'<button[^>]*>.*?</button>', data)
for b in buttons:
    if 'onclick' not in b:
        print(b)
