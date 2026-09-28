from pathlib import Path
base=Path(__file__).with_name('build_master.py').read_text()
exec(base.split('# 01')[0])
OUT=ROOT/'release-v3.1';OUT.mkdir(exist_ok=True);(OUT/'boards').mkdir(exist_ok=True)
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
from fontTools.svgLib.path import parse_path
from fontTools.pens.reportLabPen import ReportLabPen
from pypdf import PdfReader
photos={}
for key in ['food','wellness','beauty','brand']:
 src=ROOT.parent/'biotrix-editorial/assets'/f'editorial-{key}.webp';shutil.copy(src,OUT/src.name)
 dest=OUT/f'editorial-{key}.jpg';Image.open(src).convert('RGB').save(dest,quality=85,optimize=True);photos[key]=dest
PHOTO64S={k:base64.b64encode(p.read_bytes()).decode() for k,p in photos.items()}
boards=[]
# The original board utility provides simple native vector primitives only.
def page(title,section,note=''):
 b=Board(title,section);boards.append(b);b.header(len(boards));
 b.ops=[tuple(str(x).replace('DM-2.0','DM-3.1') if isinstance(x,str) else x for x in op) for op in b.ops]
 if note:b.note(note)
 return b
b=page('좋은 일상은, 작은 선택에서.','EDITORIAL EVERYDAY','DM-3.1 / 사진의 반복을 줄이고, 장면과 타이포그래피로 브랜드의 리듬을 만듭니다.')
b.text(48,261,'Everyday,',66,F,False);b.text(48,340,'a little better.',66,F,False);b.lines(50,419,['잘 먹고, 나를 돌보고,','편안하게 가꾸는 일.'],25,F,False,43);b.button(48,551,'우리의 세 가지 분야',205);b.photo(645,190,507,498,'food');b.text(48,674,'소유: HQ 홈페이지 디자인실 / 공개 홈페이지 구현 기준',13,G)
b=page('반복 대신, 서로 다른 네 개의 장면.','ART DIRECTION','한 원본을 잘라 다른 사진처럼 쓰지 않습니다. 아래 네 장면은 각각 독립적으로 생성했습니다.')
for i,(key,title,desc) in enumerate([('food','01 / THE TABLE','식탁의 계절 · 대각선 정물 구도'),('wellness','02 / THE MORNING','사람이 있는 공간 · 환경과 움직임'),('beauty','03 / THE TEXTURE','물과 소재 · 매크로 질감'),('brand','04 / THE LANDSCAPE','자연의 깊이 · 넓은 풍경')]):
 x=48+(i%2)*564;y=183+(i//2)*267;b.photo(x,y,340,226,key);b.text(x+357,y+46,title,12,F,True);b.lines(x+357,y+86,desc.split(' · '),13,G,False,26)
b=page('하나의 사진에는 하나의 역할.','PLACEMENT RULES','홈의 사진 원본은 각각 한 번만 배치합니다. 카드 탐색에는 사진을 반복하지 않습니다.')
for i,(t,lines) in enumerate([('메인 슬라이드',['식탁 → 아침 → 소재의 질감','사진 영역만 전환 / 문구는 고정','6.5초 · 이전/다음 · 일시정지']),('브랜드 이야기',['과수원 풍경은 브랜드 관점에 사용','보유 농장이나 공급자로 소개하지 않음','브랜드 이미지라는 캡션 제공']),('분야 탐색',['큰 영문 서체 + 한글 분야명','선·여백·배경 반응으로 탐색 유도','반복 사진 카드 제거'])]):b.card(48+i*374,190,352,230,t,lines)
b.rect(48,465,1104,228,F,12);b.lines(76,510,['통일감은 같은 사진이 아니라, 시각적 기준에서 만듭니다.','Forest · Ivory · 따뜻한 빛 · 자연스러운 질감 · 명확한 글자 위계','원본 출처: OpenAI 이미지 생성 / 실제 상품·시설·인물의 증빙 사진 아님','제품 출시 시에는 검증된 실제 상품 사진을 별도로 사용합니다.'],20,W,False,44)
b=page('색·서체·로고의 일관성.','FOUNDATIONS','B의 내부 여백으로 잎의 움직임을 만듭니다. 한 가지 색상으로 16px에서도 또렷하게 사용합니다.')
b.rect(48,185,538,188,W,12);b.logo(80,222,1.5);b.text(215,345,'NEGATIVE B / Forest · one ink',12,G)
for i,(name,col) in enumerate([('Forest',F),('Ivory',I),('Sage','#E2E8DC'),('Peach','#EEE1D3')]):
 x=627+i*135;b.rect(x,185,120,118,col,8,L);b.text(x,333,name,13,F);b.text(x,354,col,11,G)
b.card(48,409,536,283,'TYPOGRAPHY',['한글: 시스템 Sans / 가독성과 자연스러운 줄바꿈','영문 분야: Georgia / Food · Wellness · Beauty','홈 H1: 데스크톱 36~58px · 모바일 33~49px','본문: 14~17px · 행간 1.7~1.95','캡션 10~12px / 실제 페이지와 토큰 파일 대조'])
b.card(612,409,540,283,'LAYOUT',['최대 1320px / PC 여백 56px','태블릿 32px / 모바일 20px','홈: 문구 43% : 사진 57%','모바일: 문구 → 4:3 사진 → 컨트롤','간격·서체는 assets/editorial.css가 실행 기준'])
def nav(b,x,y,w):
 b.rect(x,y,w,42,I);b.logo(x+15,y+7,.37);b.text(x+w-300,y+26,'브랜드 소개    사업 분야    제품    파트너십    문의',8,G)
def foot(b,x,y,w):b.rect(x,y,w,55,F);b.text(x+20,y+34,'BIOTRIX / 일상에 가까운 좋은 선택.',12,W)
b=page('홈 / 첫 화면의 대비.','HOME · DESKTOP','문구와 사진을 겹치지 않고 분리합니다. 흰 그라데이션을 덮어 사진을 희미하게 만들지 않습니다.')
nav(b,48,184,1104);b.rect(48,226,475,348,I);b.text(72,267,'A LITTLE BETTER, EVERY DAY',9,F,True);b.lines(72,332,['좋은 일상은,','작은 선택에서.'],34,F,False,50);b.lines(73,431,['잘 먹고, 나를 돌보고, 편안하게 가꾸는 일.','BIOTRIX가 함께하고 싶은 일상입니다.'],12,G);b.button(73,503,'우리의 세 가지 분야',178);b.photo(523,226,629,348,'food');b.rect(523,574,629,42,'#ECE8DE');b.text(543,601,'FOOD · 식탁에 놓인 계절',11,F);b.text(967,601,'←    01 / 03    일시정지    →',10,F);b.text(72,651,'거창한 변화보다, 매일 손이 가는 좋은 것들.',27,F);b.text(73,698,'이후 흐름: 세 분야 탐색 → 브랜드 관점 → 파트너십',13,G)
b=page('홈 / 사진을 반복하지 않는 탐색.','HOME · LOWER SECTIONS','사진 카드 대신 큰 분야명과 선으로 화면의 속도를 바꿉니다.')
for i,(title,kor,desc) in enumerate([('Food','식품','제철의 맛을 가까이.'),('Wellness','건강','나에게 맞는 작은 습관.'),('Beauty','뷰티','나를 돌보는 기분 좋은 시간.')]):
 y=192+i*106;b.rule(48,y,630);b.text(60,y+62,f'0{i+1}',14,G);b.text(112,y+64,title,47,F);b.text(384,y+59,kor,12,G);b.text(438,y+58,'↗',28,F);b.text(111,y+93,desc,11,G)
b.photo(744,188,408,291,'brand');b.lines(744,525,['무엇을 더할지보다,','왜 필요한지부터.'],30,F,False,43);b.text(744,635,'과수원은 브랜드 스토리에서 한 번 사용합니다.',12,G)
b.rect(48,567,630,125,F,8);b.lines(72,610,['좋은 만남이','더 좋은 일상으로.'],26,W,False,36)
b=page('모바일 / 여백과 사진의 균형.','HOME · MOBILE','390px 기준. 문구를 읽은 뒤 사진이 이어지고, 버튼과 메뉴는 손가락으로 누르기 쉽게 유지합니다.')
for i,key in enumerate(['food','wellness','beauty']):
 x=48+i*268;b.rect(x,184,240,530,K,22);b.rect(x+5,189,230,520,I,18);b.logo(x+20,208,.36);b.text(x+192,228,'메뉴',10,F);b.text(x+20,284,'좋은 일상은,',23,F);b.text(x+20,318,'작은 선택에서.',23,F);b.lines(x+20,357,['잘 먹고, 나를 돌보고,','편안하게 가꾸는 일.'],11,G);b.button(x+20,404,'우리의 세 가지 분야',186);b.photo(x+5,477,230,172,key);b.text(x+20,683,f'0{i+1} / 03     ←   일시정지   →',10,F)
b.lines(885,212,['사진 비율 4:3','20px 좌우 여백','사진 속 핵심 피사체 확인','화살표가 화면 밖으로','나가지 않도록 검수','메뉴 Escape 닫기','동작 줄이기: 수동 전환'],15,G,False,43)
b=page('브랜드 소개 / 글자로 만드는 인상.','BRAND','브랜드 소개에는 홈의 사진을 다시 채워 넣지 않습니다.')
nav(b,48,184,744);b.lines(76,283,['매일의 선택에,','분명한 기준을.'],35,F,False,47);b.rect(48,402,744,202,'#E2E8DC');b.text(76,477,'Closer to',56,F);b.text(76,547,'everyday.',56,F);b.lines(459,460,['오늘도 자연스럽게','손이 가는 것.','제품을 쓰는 사람의','일상을 생각합니다.'],16,F,False,31);foot(b,48,635,744)
b.card(825,184,327,247,'핵심 메시지',['일상의 작은 선택을 돕는 브랜드','근거 없는 성과·연혁·인증 금지','가까이 · 명확하게 · 꾸준히'])
b.card(825,457,327,236,'시각적 역할',['큰 문장과 배경색으로 구분','외부 폰트 요청 없이 빠르게 표시','모바일은 문장 → 설명 순서'])
b=page('사업 분야 / 색과 크기로 구분.','BUSINESS','사진을 더 넣는 대신, 분야마다 배경색과 문장의 리듬을 달리합니다.')
for i,(t,col,copy) in enumerate([('Food','#EEE1D3',['계절이 식탁에','도착하는 순간.']),('Wellness','#E2E8DC',['나에게 맞는 속도로,','매일 조금씩.']),('Beauty','#E6E5DF',['나를 돌보는 시간이','즐거워지도록.'])]):
 y=186+i*171;b.rect(48,y,1104,158,col);b.text(80,y+98,t,59,F);b.lines(700,y+61,copy,25,F,False,37);b.text(700,y+134,'분야별 제품 안내 →',11,F)
b=page('제품 / 준비 상태도 완성된 화면으로.','PRODUCTS','임시 상품 이미지·가상 가격·눌러도 작동하지 않는 구매 버튼을 만들지 않습니다.')
b.text(48,220,'일상에 더할, 다음 좋은 선택.',36,F);b.text(48,269,'제품이 준비되면 정보와 확인된 판매처를 안내합니다.',16,G)
for i,(title,copy) in enumerate([('FOOD','제철의 맛을 가까이.'),('WELLNESS','나에게 맞는 작은 습관.'),('BEAUTY','나를 돌보는 기분 좋은 시간.')]):
 y=316+i*114;b.rule(48,y,1104);b.text(65,y+57,f'0{i+1}',29,G);b.text(150,y+36,title,11,F,True);b.text(150,y+75,copy,25,F);b.rect(961,y+34,171,39,'#E2E8DC',19);b.text(989,y+59,'제품 준비 중',13,F)
b.text(48,711,'판매 시작 시: 실제 상품 사진 · 가격 · 배송 · 표시사항 · 확인된 구매 링크를 연결합니다.',13,G)
b=page('파트너십·문의 / 정보의 밀도 조절.','PARTNERSHIP & CONTACT','제휴 메시지는 크게, 연락 가능 여부는 정확하게. 문의 채널이 없으면 가짜 폼을 만들지 않습니다.')
b.rect(48,186,536,510,W,10);b.lines(75,264,['From your','expertise,','to everyday.'],44,F,False,56);b.text(75,476,'좋은 제품을, 더 가까이.',25,F);b.lines(75,522,['제품·공급 조건 → 운영 방식 → 협업 범위','각자의 강점을 고객의 일상으로 연결합니다.'],13,G,False,32);b.text(75,654,'제휴 문의 채널 준비 중 / 실제 접수 시 활성화',12,G)
b.rect(613,186,539,510,'#E2E8DC',10);b.text(639,239,'궁금한 점이 있으신가요?',29,F);b.text(639,294,'문의 채널을 준비하고 있습니다.',16,G)
for i,t in enumerate(['어떤 제품을 다루나요?','지금 제품을 구매할 수 있나요?','상품 공급이나 제휴를 제안하고 싶어요.','사진 속 제품이 판매 상품인가요?']):
 y=348+i*68;b.rule(639,y,483);b.text(639,y+40,t,15,F);b.text(1091,y+40,'＋',19,F)
b=page('사용하는 순간까지 검수합니다.','INTERACTION & QA','디자인 결과와 실제 동작을 함께 확인합니다. 정적 검사만으로 브라우저 검수를 대신하지 않습니다.')
b.card(48,187,538,249,'SLIDESHOW',['독립된 사진 3장 / 순서와 캡션 표시','6.5초 자동 전환 / 650ms 전환','이전·다음·일시정지 / 비활성 탭에서는 정지','hover·키보드 focus 시 자동 전환 정지','움직임 줄이기 설정에서는 수동'])
b.card(612,187,540,249,'RESPONSIVE',['320 / 390 / 768 / 1440px','화면 너비보다 큰 요소 없음','핵심 피사체·한글 줄바꿈 확인','메뉴·FAQ·앵커 링크 검수','이미지 로딩·대체 텍스트 확인'])
b.rect(48,469,1104,224,F,12);b.lines(75,517,['구현 기준 파일','assets/editorial.css · assets/editorial.js · 6개 HTML 페이지','사진 출처와 용도: assets/EDITORIAL_SOURCES.md','검수·코드·실제 배포 결과: HQ 작업 기록에서 확인'],20,W,False,44)
b=page('HQ / 기준에서 배포까지 연결.','DESIGN OFFICE','홈페이지 디자인실이 마스터·사진·결정·수정 요청을 관리합니다.')
b.card(48,185,350,241,'결정',['사용자 피드백을 결정으로 기록','DM-2.0 사진 반복 기준 폐기','DM-3.1 장면 중심 방향 채택','사진 원본과 배치 역할 등록'])
b.card(425,185,350,241,'실행',['HQ 요청 → ChatGPT Work 구현','마스터·HTML·CSS·이미지를 연결','기존 커머스·HQ 브랜치 보존','무인 AI 실행으로 표시하지 않음'])
b.card(801,185,351,241,'검수와 배포',['PC·모바일 실제 화면 확인','빌드·파일·링크·동작 확인','운영 도메인에서 반영 재확인','작업·결정·산출물·커밋 기록'])
b.rect(48,466,1104,228,W,12);b.lines(75,511,['소유 부서: 홈페이지 디자인실 (website_design)','HQ 주소: https://biotrix-hq.vercel.app/design','공개 홈페이지: https://biotrix.co.kr','검수 중과 배포 완료를 구분해 표시하며, 변경 이력을 남깁니다.'],20,F,False,45)
b=page('편집 파일과 사용 범위.','HANDOFF','DM-3.1 / 원본·코드·기록이 같은 버전을 가리키도록 관리합니다.')
b.card(48,185,537,291,'DELIVERABLES',['PDF: 14개 디자인 보드 / 검색 가능한 텍스트','SVG: 편집 가능한 벡터와 텍스트','AI: 벡터 PDF 기반 Illustrator 호환본','ZIP: SVG 보드·이미지·토큰·출처·사용 안내','개별 보드는 공통 이미지 파일을 참조','홈페이지 실행 기준은 같은 버전의 코드'])
b.card(612,185,540,291,'FORMAT & PROVENANCE',['AI 호환본은 네이티브 Adobe AI 저장이 아님','Illustrator 앱에서 실제 열기 검수 미실시','사진은 래스터, 글자와 도형은 벡터','생성 사진을 실제 상품·시설의 증거로 쓰지 않음','원본을 반복 크롭하여 새 사진으로 세지 않음','사진 프롬프트·원본·사용 위치를 기록'])
b.rect(48,515,1104,179,F,12);b.lines(76,563,['이 마스터는 사진 교체만을 위한 문서가 아닙니다.','화면의 구조, 읽는 순서, 사진의 역할과 실제 동작까지 함께 정의합니다.','배포 완료 여부와 남은 운영 항목은 HQ의 최신 기록을 기준으로 확인합니다.'],20,W,False,43)
# Render identical primitives into PDF and editable SVG.
BPATH='M15 7H44C61 7 70 15 70 28C70 37 65 43 57 47C67 50 74 57 74 69C74 83 64 92 45 92H15Z'
CUTS=['M25 18C32 27 41 31 50 35C58 39 62 44 62 49C54 45 47 45 39 41C32 37 27 29 25 18Z','M25 80C27 67 31 57 40 51C46 47 53 46 62 49C52 53 45 61 38 70C33 76 29 79 25 80Z']
def render(c,b,ox=0,oy=0,H=800):
 c.saveState();c.translate(ox,H-oy);c.scale(1,-1)
 for typ,*a in b.ops:
  if typ=='rect':
   x,y,w,h,col,r,stroke=a;c.setFillColor(HexColor(col));c.setStrokeColor(HexColor(stroke or col));c.setLineWidth(.7);c.roundRect(x,y,w,h,r,fill=1,stroke=bool(stroke))
  elif typ=='text':
   x,y,t,size,col,bold=a;c.saveState();c.translate(x,y);c.scale(1,-1);c.setFillColor(HexColor(col));c.setFont('Bold' if bold else 'Regular',size);c.drawString(0,0,t);c.restoreState()
  elif typ=='photo':
   x,y,w,h,key=a;c.saveState();p=c.beginPath();p.rect(x,y,w,h);c.clipPath(p,stroke=0,fill=0);sc=max(w/1536,h/1024);dw=1536*sc;dh=1024*sc;pos=.75 if key=='wellness' else .65 if key=='food' else .5;dx=x+(w-dw)*pos;dy=y+(h-dh)/2;c.translate(dx,dy+dh);c.scale(1,-1);c.drawImage(str(photos[key]),0,0,dw,dh);c.restoreState()
  elif typ=='logo':
   x,y,s,rev,word=a;c.saveState();c.translate(x,y);c.scale(s,s)
   for path,col in [(BPATH,W if rev else F)]+[(cut,F if rev else W) for cut in CUTS]:
    pen=ReportLabPen(None);parse_path(path,pen);pen.path.fillColor=HexColor(col);pen.path.strokeColor=None;pen.path.fillMode=0;d=Drawing(72,78);d.add(pen.path);renderPDF.draw(d,c,0,0)
   if word:
    c.saveState();c.translate(82,50);c.scale(1,-1);c.setFillColor(HexColor(W if rev else K));c.setFont('Bold',35);c.drawString(0,0,'BIOTRIX');c.restoreState()
   c.restoreState()
 c.restoreState()
def esc(t):return html.escape(str(t),quote=True)
def svg_ops(b):
 out=[]
 for n,(typ,*a) in enumerate(b.ops):
  if typ=='rect':
   x,y,w,h,col,r,stroke=a;out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{col}" stroke="{stroke or "none"}"/>')
  elif typ=='text':
   x,y,t,size,col,bold=a;out.append(f'<text x="{x}" y="{y}" font-family="Noto Sans KR" font-weight="{700 if bold else 400}" font-size="{size}" fill="{col}">{esc(t)}</text>')
  elif typ=='photo':
   x,y,w,h,key=a;sc=max(w/1536,h/1024);dw=1536*sc;dh=1024*sc;pos=.75 if key=='wellness' else .65 if key=='food' else .5;dx=x+(w-dw)*pos;dy=y+(h-dh)/2;cid=f'clip-{boards.index(b)}-{n}';out.append(f'<defs><clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath></defs><g clip-path="url(#{cid})"><use xlink:href="#photo-{key}" x="{dx}" y="{dy}" width="{dw}" height="{dh}"/></g>')
  else:
   x,y,s,rev,word=a;out.append(f'<g transform="translate({x} {y}) scale({s})"><path d="{BPATH}" fill="{W if rev else F}"/>'+''.join(f'<path d="{cut}" fill="{F if rev else W}"/>' for cut in CUTS))
   if word:out.append(f'<text x="82" y="50" font-family="Noto Sans KR" font-weight="700" font-size="35" fill="{W if rev else K}">BIOTRIX</text>')
   out.append('</g>')
 return ''.join(out)
def svgdoc(body,w,h,embed=True):
 defs=''.join(f'<symbol id="photo-{key}" viewBox="0 0 1536 1024"><image width="1536" height="1024" xlink:href="'+(('data:image/jpeg;base64,'+PHOTO64S[key]) if embed else '../editorial-'+key+'.jpg')+'"/></symbol>' for key in photos)
 return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>BIOTRIX DM-3.1</title><defs>{defs}</defs>{body}</svg>'
pdf=OUT/'BIOTRIX_Design_Master_v3.1.pdf';c=canvas.Canvas(str(pdf),pagesize=(1200,800));c.setTitle('BIOTRIX DM-3.1 Editorial Everyday');c.setAuthor('BIOTRIX HQ Design Office')
for i,b in enumerate(boards):render(c,b);c.showPage();(OUT/'boards'/f'{i+1:02}.svg').write_text(svgdoc(svg_ops(b),1200,800,False))
c.save();ai=OUT/'BIOTRIX_Design_Master_v3.1.ai';c=canvas.Canvas(str(ai),pagesize=(3680,4112));c.setTitle('BIOTRIX DM-3.1 - PDF-based Illustrator compatibility, not native AI');groups=[]
for i,b in enumerate(boards):
 x=i%3*1240;y=i//3*828;render(c,b,x,y,4112);groups.append(f'<g id="board-{i+1:02}" transform="translate({x} {y})">{svg_ops(b)}</g>')
c.save();(OUT/'BIOTRIX_Design_Master_v3.1.svg').write_text(svgdoc(''.join(groups),3680,4112))
(OUT/'README.md').write_text('''# BIOTRIX DM-3.1 / Editorial Everyday

14 design boards owned by HQ Website Design Office. This replaces the repetitive DM-2.0 triptych direction.

Four separate generated scenes: food table, lived-in morning, beauty materials, orchard landscape. Each image is used once on the homepage. No generated image depicts an actual BIOTRIX product, person, facility or supplier.

PDF is the review master. SVG is the editable source; install Noto Sans KR from https://github.com/google/fonts/tree/main/ofl/notosanskr (SIL OFL). Main SVG embeds photos; boards/ SVGs refer to ../editorial-*.jpg. Keep the folder structure.

The .ai file is a PDF-based Illustrator exchange copy, NOT a native Adobe Illustrator save. It contains one vector canvas, no proprietary Illustrator layers/artboards. Adobe Illustrator app testing was unavailable. Use SVG or import the PDF then Save As native AI in Illustrator.

The source ZIP includes editable SVG, individual boards, images, implementation CSS/JS and provenance. PDF and AI are separate downloads to keep the package compact. Production status is recorded in HQ, not inferred from this file.
''')
for f in ['editorial.css','editorial.js','EDITORIAL_SOURCES.md']:
 shutil.copy(ROOT.parent/'biotrix-editorial/assets'/f,OUT/f)
shutil.copy(ROOT/'fonts/OFL.txt',OUT/'OFL.txt')
with zipfile.ZipFile(OUT/'BIOTRIX_Design_Source_v3.1.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(OUT.rglob('*')):
  if f.is_file() and f.suffix not in ['.zip','.pdf','.ai','.webp','.png']:z.write(f,'BIOTRIX_DM3.1/'+str(f.relative_to(OUT)))
print(json.dumps({'pages':len(boards),'files':{p.name:p.stat().st_size for p in OUT.iterdir() if p.is_file()}},ensure_ascii=False))
