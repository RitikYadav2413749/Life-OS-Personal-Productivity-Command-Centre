import re

with open(r'c:\Users\ritik\Downloads\Life OS\frontend\dash.py', 'r', encoding='utf-8') as f:
    content = f.read()

html_match = re.search(r"return '''(.*?)'''", content, re.DOTALL)
if html_match:
    html = html_match.group(1)
    # Replace relative API paths with the absolute Render URL
    html = html.replace("fetch('/api/start'", "fetch('https://life-os-personal-productivity-command.onrender.com/api/start'")
    html = html.replace("new EventSource('/api/stream')", "new EventSource('https://life-os-personal-productivity-command.onrender.com/api/stream')")
    
    with open(r'c:\Users\ritik\Downloads\Life OS\frontend\index.html', 'w', encoding='utf-8') as f_out:
        f_out.write(html)
    print('HTML successfully extracted and modified!')
else:
    print('HTML block not found.')
