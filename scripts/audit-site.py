"""Audit public pages for missing destinations, assets, duplicate ids and placeholders."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import re
import json
import subprocess

ROOT=Path(__file__).resolve().parents[1]
PAGES=['index','company','research','science','programs','business','products','partnership','contact','privacy','terms','shop']
RENDERED=json.loads(subprocess.check_output(['node',str(ROOT/'scripts/render-audit-pages.mjs')],text=True))
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.links=[];self.ids=[];self.assets=[];self.h1=0;self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='a' and 'href' in a:self.links.append(a['href'])
        if tag in ('img','script') and a.get('src'):self.assets.append(a['src'])
        if tag=='link' and a.get('rel') in ('stylesheet','icon','preload'):self.assets.append(a['href'])
        if tag=='h1':self.h1+=1

errors=[];count=0
for name,language in [(name,language) for name in PAGES for language in (['en','ko'] if name in RENDERED else ['en'])]:
    file=ROOT/(name+'.html');text=RENDERED.get(name,{}).get(language,file.read_text());page=Page(text)
    if name not in ('science','programs') and page.h1!=1:errors.append(f'{name}: expected one h1')
    if len(page.ids)!=len(set(page.ids)):errors.append(f'{name}: duplicate id')
    if 'data:image/' in text:errors.append(f'{name}: embedded image remains')
    for link in page.links:
        url=urlsplit(link)
        if url.scheme or url.netloc:continue
        target=ROOT/(url.path.lstrip('/') or 'index') if url.path else file
        if not target.suffix:target=target.with_suffix('.html')
        if not target.exists():errors.append(f'{name}: missing route {link}')
        elif url.fragment and url.fragment not in Page(RENDERED.get(target.stem,{}).get(language,target.read_text())).ids:errors.append(f'{name}: missing anchor {link}')
        count+=1
    assets=page.assets+re.findall(r'url\([\"\']?(/assets/[^\)\"\']+)',text)
    for asset in assets:
        if asset.startswith('/') and not (ROOT/urlsplit(asset).path.lstrip('/')).exists():errors.append(f'{name}: missing asset {asset}')
    for placeholder in ['가상의 연락처','임의로 연결','프로토타입 단계']:
        if placeholder in text:errors.append(f'{name}: internal placeholder copy: {placeholder}')
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(PAGES)} public pages (v05 rendered in EN/KO), {count} internal links, assets, anchors, heading structure and placeholder copy')
