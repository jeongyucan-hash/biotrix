from pathlib import Path
import html, json, base64, shutil, zipfile, hashlib
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as RLFont
from reportlab.lib.colors import HexColor
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.reportLabPen import ReportLabPen
from functools import lru_cache
ROOT=Path(__file__).parent; OUT=ROOT/'output'; OUT.mkdir(exist_ok=True)
for weight,name in [(400,'Regular'),(700,'Bold')]:
    fp=ROOT/'fonts'/f'NotoSansKR-{name}.ttf'
    if not fp.exists(): instantiateVariableFont(TTFont(ROOT/'fonts/NotoSansKR.ttf'),{'wght':weight},inplace=True).save(fp)
    pdfmetrics.registerFont(RLFont(name,str(fp)))
F='#173F35'; I='#F6F4EE'; S='#A8B59F'; K='#202A25'; G='#647068'; L='#DFE2D8'; W='#FFFFFF'; M='#EAEDE5'
# Compression only; the generated image composition is preserved.
im=Image.open(OUT/'brand-triptych.png').convert('RGB'); im.save(OUT/'brand-triptych.jpg',quality=88,optimize=True)
PHOTO=OUT/'brand-triptych.jpg'; PHOTO64=base64.b64encode(PHOTO.read_bytes()).decode()
font=TTFont(ROOT/'fonts/NotoSansKR-Bold.ttf'); glyphs=font.getGlyphSet(); cmap=font.getBestCmap(); upm=font['head'].unitsPerEm
class Board:
 def __init__(self,title,section): self.title=title;self.section=section;self.ops=[]
 def rect(self,x,y,w,h,fill=W,r=0,stroke=None): self.ops.append(('rect',x,y,w,h,fill,r,stroke))
 def text(self,x,y,t,size=18,color=K,bold=False): self.ops.append(('text',x,y,str(t),size,color,bold))
 def lines(self,x,y,lines,size=18,color=K,bold=False,leading=None):
  for i,t in enumerate(lines): self.text(x,y+i*(leading or size*1.65),t,size,color,bold)
 def rule(self,x,y,w,color=L): self.rect(x,y,w,1,color)
 def photo(self,x,y,w,h,panel=None): self.ops.append(('photo',x,y,w,h,panel))
 def logo(self,x,y,scale=1,reverse=False,word=True): self.ops.append(('logo',x,y,scale,reverse,word))
 def button(self,x,y,t,w=140,primary=True):
  self.rect(x,y,w,42,F if primary else W,21,L if not primary else None);self.text(x+19,y+27,t,13,W if primary else F,True)
 def header(self,n):
  self.rect(0,0,1200,800,I);self.text(48,37,'BIOTRIX / DESIGN OFFICE',12,F,True);self.text(855,37,f'DM-2.0   /   {self.section}',11,G);self.rule(48,56,1104)
  self.text(48,111,self.title,34,F,True);self.text(48,773,'HQ 디자인실 · 2026.09.28 · 디자인 기준 / 운영 사이트 반영 여부는 HQ 배포 기록 참조',10,G);self.text(1110,773,f'{n:02}',12,F,True)
 def note(self,t): self.text(48,143,t,14,G)
 def card(self,x,y,w,h,label,body):
  self.rect(x,y,w,h,W,12);self.text(x+22,y+35,label,19,F,True);self.lines(x+22,y+70,body,14,G)
boards=[]
def page(title,section,note=''):
 b=Board(title,section);boards.append(b);b.header(len(boards));
 if note:b.note(note)
 return b
# 01
b=page('일상에 가까운 좋은 선택.','MASTER','브랜드부터 화면, 사진, 운영 방식까지 하나의 기준으로 연결합니다.')
b.photo(610,178,542,500);b.text(48,244,'Quiet',78,F,True);b.text(48,331,'Nature.',78,F,True)
b.lines(50,402,['먹고, 돌보고, 가꾸는 일상.','더 좋은 선택을 쉽게 만듭니다.'],25,F,True)
b.text(50,510,'FOOD  /  DAILY WELLNESS  /  BEAUTY',12,G,True);b.button(48,551,'브랜드 알아보기',180)
b.lines(50,654,['마스터 버전 2.0','소유 부서  HQ 홈페이지 디자인실'],13,G)
#02
b=page('디자인은 HQ에서 결정합니다.','GOVERNANCE','디자인실은 한 부서입니다. 아래 다섯 역할은 업무 책임이며 별도의 무인 AI 실행기가 아닙니다.')
roles=[('01 디자인 총괄',['방향·우선순위·마스터 버전 관리','결정의 이유와 적용 범위 기록']),('02 브랜드·사진',['로고·팔레트·서체·촬영 기준','이미지 출처와 사용 범위 관리']),('03 UX·UI',['고객 동선·화면·카피 설계','모바일과 빈 상태까지 정의']),('04 프런트엔드',['마스터를 코드로 구현','자산·성능·접근성 점검']),('05 품질 검수',['PC·모바일·키보드 검수','실제 도메인과 결과 대조'])]
for i,(t,v) in enumerate(roles):b.card(48+(i%3)*373,185+(i//3)*172,352,150,t,v)
b.card(794,357,358,150,'운영 방식',['HQ 접수 → Work 실행 → HQ 기록','자동 실행 여부를 구분해 표시'])
b.rect(48,548,1104,149,F,12);b.lines(73,584,['요청 → 기준 결정 → 마스터 제작 → 구현 → 검수 → 배포 확인','모든 변경은 결정 ID · 마스터 버전 · 작업 ID · 커밋 · 실제 주소로 연결합니다.','추가 확인은 실제 사업 정보나 비용·권한이 필요한 경우에만 요청합니다.'],18,W,False,37)
#03
b=page('작게 보여도 선명한 브랜드.','IDENTITY','기존 B 심볼을 유지하고, 과한 광택 대신 두 가지 평면 색으로 정돈합니다.')
b.rect(48,182,700,276,W,12);b.logo(85,239,2.0);b.text(83,423,'PRIMARY / Forest + Sage',13,G)
b.rect(775,182,377,276,F,12);b.logo(812,237,1.8,True,False);b.text(812,422,'REVERSE / White',13,W)
b.card(48,487,352,211,'여백과 최소 크기',['심볼 높이의 1/2을 보호 여백으로 확보','헤더 심볼 32px / 모바일 28px','워드마크 최소 폭 120px','파비콘은 단색 심볼만 사용'])
b.card(424,487,352,211,'일관된 사용',['밝은 배경: Forest 심볼 + 텍스트','어두운 배경: White 단색','가로형 로고를 기본으로 사용','SVG를 원본으로 유지'])
b.card(800,487,352,211,'금지 사항',['늘리기·기울이기·임의 색상 변경','사진 위에 보호 배경 없이 배치','작은 크기에서 금속광·그림자 사용','심볼의 일부가 잘리는 크롭'])
#04
b=page('색과 글자, 여백의 기본값.','FOUNDATIONS','본문은 읽기 쉽게, 화면은 차분하게. 브랜드 색은 행동과 핵심 정보에만 사용합니다.')
for i,(name,color) in enumerate([('Forest',F),('Ivory',I),('Sage',S),('Ink',K),('Stone',L)]):
 x=48+i*224;b.rect(x,184,208,117,color,10,L);b.text(x,330,name,18,F,True);b.text(x,356,color,13,G)
b.text(48,416,'Noto Sans KR',33,F,True);b.lines(48,462,['일상에 가까운 좋은 선택.','먹고, 돌보고, 가꾸는 일상.'],24,K,False,39)
b.lines(48,563,['H1 56/68 → 모바일 36/46','H2 36/48 → 모바일 28/38','본문 18/30 → 모바일 16/27','캡션 13/20 · 버튼 15/22'],16,G)
b.card(628,402,524,295,'LAYOUT TOKENS',['최대 콘텐츠 폭 1280px · 데스크톱 좌우 64px','태블릿 32px · 모바일 20px','12열 / 8열 / 4열 그리드','간격: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96','버튼 높이 48px · 터치 영역 최소 44px','기본 모서리 16px · 버튼 999px','본문 대비 4.5:1 이상 / 포커스 윤곽 2px'])
#05
b=page('사진은 같은 장면의 언어로.','ART DIRECTION','새 생성 이미지 세트는 브랜드 무드용입니다. 실제 BIOTRIX 상품·공급자·시설 사진이 아닙니다.')
b.photo(48,182,672,448);b.lines(760,207,['따뜻한 아이보리 배경','좌상단의 부드러운 자연광','실물 전체가 보이는 중간 거리','피사체 주변에 충분한 여백'],19,F,True,42)
b.lines(760,421,['식품: 원물과 질감','건강: 물과 일상의 습관','뷰티: 무상표 패키지와 촉감'],16,G,False,33)
b.lines(760,552,['문구는 사진 밖에 배치','알약·의료 이미지를 장식으로 사용하지 않음','실판매 시 검증된 상품 사진으로 교체'],13,G,False,27)
b.text(48,669,'파일: brand-triptych.jpg  /  원본 1536 × 1024  /  AI 생성 · 2026.09.28',13,G)
b.text(48,698,'기존 스톡 사진은 신규 마스터에서 제외. 동일 비율 안에서도 제품·핵심 피사체가 잘리지 않도록 검수.',13,G)
#06
b=page('반복해서 쓰는 화면 요소.','COMPONENTS','버튼과 카드, 폼을 새로 만들 때마다 해석하지 않도록 상태까지 정의합니다.')
b.text(48,193,'BUTTONS',12,G,True);b.button(48,219,'제품 살펴보기',166);b.button(235,219,'브랜드 알아보기',172,False);b.rect(429,219,166,42,L,21);b.text(450,246,'준비 중',13,G,True)
b.text(48,306,'CATEGORY CARD',12,G,True)
for i,(t,d) in enumerate([('식품','제철의 맛을 가까이'),('건강','매일의 습관을 가볍게'),('뷰티','나를 돌보는 시간')]):
 x=48+i*185;b.rect(x,328,166,238,W,12);b.photo(x+10,338,146,142,i);b.text(x+13,511,t,19,F,True);b.text(x+13,543,d,11,G)
b.card(653,182,499,176,'NAVIGATION',['브랜드 소개 / 사업 분야 / 제품 / 파트너십 / 문의','현재 메뉴는 색+밑줄로 표시','모바일: 메뉴 열기 → 선택 / Escape로 닫기'])
b.rect(653,383,499,230,W,12);b.text(675,417,'문의 유형',14,F,True);b.rect(675,435,454,44,I,7,L);b.text(690,463,'선택해 주세요',14,G);b.text(675,514,'오류: 이메일 주소를 확인해 주세요.',14,'#9A3932');b.text(675,552,'성공: 접수 번호와 다음 절차를 표시합니다.',14,F);b.text(675,585,'수신 채널 미설정 상태에서는 폼을 노출하지 않습니다.',12,G)
b.lines(48,645,['상태: 기본 · hover · focus · pressed · loading · disabled · success · error','키보드 포커스는 2px 녹색 윤곽, 비활성은 버튼 속성과 안내 문구를 함께 적용.'],15,G)
# shared miniature page helpers

def nav(b,x,y,w):
 b.rect(x,y,w,46,W);b.logo(x+18,y+10,.36)
 b.text(x+w-329,y+29,'브랜드 소개    사업 분야    제품    파트너십    문의',8,G)
def footer(b,x,y,w):
 b.rect(x,y,w,70,F);b.text(x+20,y+27,'BIOTRIX',15,W,True);b.text(x+20,y+49,'일상에 가까운 좋은 선택.',9,W);b.text(x+w-189,y+48,'브랜드 소개  ·  제품  ·  문의',8,W)
def mock_start(b,x,y,w): b.rect(x-1,y-1,w+2,512,L,9);b.rect(x,y,w,510,W,8);nav(b,x,y,w)
def phone(b,x,y,title,subtitle,panel=0):
 b.rect(x,y,236,530,K,24);b.rect(x+6,y+6,224,518,I,20);b.logo(x+20,y+24,.4);b.text(x+198,y+43,'≡',19,F)
 b.text(x+21,y+107,title,23,F,True);b.text(x+21,y+143,subtitle,11,G);b.photo(x+20,y+181,196,231,panel);b.button(x+20,y+441,'자세히 보기',146)
#07
b=page('홈 / Desktop','PAGE 01','상단에서 브랜드와 세 분야를 이해하고, 관심 분야로 바로 이동합니다. 사진은 우측 전용 영역에서 전환됩니다.')
mock_start(b,48,183,820);b.rect(48,229,820,241,I);b.text(73,281,'일상에 가까운',31,F,True);b.text(73,324,'좋은 선택.',31,F,True);b.text(74,358,'먹고, 돌보고, 가꾸는 일상.',12,G);b.button(74,392,'분야 살펴보기',143);b.photo(454,245,393,209);b.text(743,465,'01 / 03   Ⅱ  →',10,F)
b.text(73,504,'세 가지 일상, 하나의 기준.',19,F,True)
for i,t in enumerate(['식품','건강','뷰티']):
 x=73+i*253;b.rect(x,523,234,85,I,8);b.text(x+15,549,t,17,F,True);b.text(x+15,580,['제철의 맛을 가까이','매일의 습관을 가볍게','나를 돌보는 시간'][i],10,G)
footer(b,48,623,820)
b.lines(905,214,['01 브랜드','정체성과 행동을 짧게','02 사진 슬라이드','6.5초 / 수동·일시정지','03 세 분야','분야별 정확한 링크','04 브랜드 이야기','핵심 기준 세 가지','05 파트너십','문의 가능 상태 반영','06 푸터','확인된 사업 정보만'],13,G,False,34)
#08
b=page('홈 / Mobile','PAGE 01 · RESPONSIVE','모바일은 문구 아래에 사진을 배치합니다. 한 화면에 모든 정보를 억지로 넣지 않습니다.')
phone(b,48,184,'일상에 가까운','먹고, 돌보고, 가꾸는 일상.',0)
phone(b,315,184,'매일의 습관을','나에게 맞는 작은 선택.',1)
phone(b,582,184,'나를 돌보는 시간','편안하게 이어가는 일상.',2)
b.lines(867,216,['390px 기준','좌우 여백 20px','본문 16px / 행간 27px','사진 4:5 영역','문구와 사진 겹침 없음','스와이프는 보조 기능','명시적 이전·다음 제공','포커스 시 자동 전환 정지','줄바꿈: 단어 단위 유지'],15,G,False,43)
#09
b=page('브랜드 소개','PAGE 02','과장된 기업 소개보다 우리가 어떤 선택을 돕는지부터 말합니다.')
mock_start(b,48,183,750);b.text(76,285,'매일의 선택에,',32,F,True);b.text(76,332,'분명한 기준을.',32,F,True);b.lines(77,378,['BIOTRIX는 먹고, 돌보고, 가꾸는 일상에서','더 나은 선택을 돕는 브랜드를 만들어갑니다.'],13,G)
b.photo(474,247,298,200)
for i,(t,d) in enumerate([('가까이','일상에서 자주 쓰는 것부터'),('명확하게','필요한 정보를 알기 쉽게'),('꾸준히','한 번의 구매보다 오래 갈 관계')]):
 x=77+i*230;b.rect(x,485,214,116,I,8);b.text(x+15,522,t,21,F,True);b.text(x+15,562,d,10,G)
footer(b,48,623,750);b.card(833,183,319,228,'이 페이지의 역할',['브랜드의 관점과 세 분야 소개','인증·연혁·성과는 근거 있을 때만','브랜드 문구는 2~3문장으로 유지'])
b.card(833,437,319,256,'모바일 순서',['제목 → 짧은 소개 → 브랜드 사진','선택의 기준 3개를 세로로 배치','사업 분야 링크 → 푸터','숫자·실적을 임의로 만들지 않음'])
#10
b=page('사업 분야','PAGE 03','카테고리마다 같은 구조를 사용하고, 사진·제목·설명을 한 묶음으로 읽게 합니다.')
mock_start(b,48,183,810);b.text(75,278,'먹고, 돌보고, 가꾸는 일상.',29,F,True)
for i,(t,d) in enumerate([('식품','제철의 맛을 가까이'),('건강','매일의 습관을 가볍게'),('뷰티','나를 돌보는 시간')]):
 x=75+i*254;b.photo(x,312,236,196,i);b.text(x,542,t,23,F,True);b.text(x,574,d,12,G);b.text(x,606,'분야 살펴보기 →',11,F)
footer(b,48,623,810);b.lines(903,215,['항상 같은 순서','식품 → 건강 → 뷰티','이미지 비율 통일','동일한 조명·배경·거리','고정된 세 가지 설명','카테고리마다 한 문장','세부 제품과 구분','무드 사진은 상품이 아님'],15,G,False,43)
#11
b=page('제품 / 출시 전과 판매 중','PAGE 04','실제 상품 데이터가 없는 상태를 정직하게 디자인하고, 구매 가능해지면 같은 컴포넌트를 확장합니다.')
mock_start(b,48,183,730);b.text(76,280,'어떤 일상을 찾고 있나요?',29,F,True);b.text(78,322,'전체     식품     건강     뷰티',13,F)
b.rect(76,349,674,193,I,12);b.text(99,399,'새로운 제품을 준비하고 있습니다.',24,F,True);b.lines(99,438,['소개할 제품이 준비되면 이곳에서 만나보세요.','판매 중인 상품과 구매처는 확인 후 안내합니다.'],14,G);b.button(99,483,'브랜드 알아보기',164,False)
footer(b,48,623,730);b.card(812,183,340,241,'판매 전',['실제 상품처럼 보이는 임시 카드 금지','품절 / 출시 전 / 판매 중 구분','비어 있는 장바구니 버튼 노출 금지','대체 동선: 브랜드 / 사업 분야'])
b.card(812,450,340,244,'판매 시작 후',['검증된 상품 사진 · 이름 · 규격','가격 · 배송 · 판매처 정보 연결','카테고리 필터와 상세 페이지','효능·인증·후기는 확인된 자료만'])
#12
b=page('파트너십과 문의','PAGES 05–06','연락할 수 있는 상태와 아직 준비 중인 상태를 구분합니다.')
for x,title,headline,lines in [(48,'파트너십','좋은 제품을, 더 가까이.',['생산자와 브랜드의 강점을','고객의 일상으로 연결합니다.']),(611,'문의','무엇을 도와드릴까요?',['제품·판매·제휴 문의를','한곳에서 안내합니다.'])]:
 b.rect(x,183,541,510,W,12);b.text(x+25,218,title,13,G);b.text(x+25,281,headline,28,F,True);b.lines(x+25,326,lines,16,G);b.rule(x+25,394,491)
 if x==48:
  b.lines(x+25,430,['01  취급 품목과 공급 조건','02  유통 채널과 운영 방식','03  자료 확인과 제휴 검토'],17,F,False,52);b.text(x+25,646,'문의 채널이 연결되면 제안서 접수 동선을 활성화합니다.',11,G)
 else:
  b.rect(x+25,422,491,124,I,9);b.text(x+45,463,'문의 채널을 준비하고 있습니다.',20,F,True);b.text(x+45,503,'연락 방법이 확정되면 이곳에 안내합니다.',13,G);b.text(x+25,590,'FAQ: 제품 구매 / 공급·제휴 / 브랜드 정보',14,F);b.text(x+25,646,'이메일·전화·응답 시간은 실제 운영 정보만 표시합니다.',11,G)
#13
b=page('커머스 / 구매 흐름의 공통 기준','COMMERCE','기존 커머스 기능은 유지하며 시각 기준을 통일합니다. 아래 금액·상품명은 입력 구조이며 판매 정보가 아닙니다.')
for i,(t,ls) in enumerate([('목록',['카테고리 / 정렬 / 검색','사진 4:5 · 품절 표시','상품명 → 규격 → 판매가']),('상세',['상품 사진 → 핵심 정보','옵션 → 배송 → 구매','원재료·표시사항·판매자 정보']),('장바구니',['옵션·수량·가격 재확인','배송비 → 결제 예정 금액','가격 변경·품절은 결제 전 안내']),('결제·완료',['구매 정보 및 동의','결제 처리 중 중복 요청 방지','성공은 주문번호, 실패는 재시도'])]):
 x=48+i*280;b.rect(x,188,261,360,W,12);b.text(x+20,230,f'0{i+1}  {t}',21,F,True);b.rect(x+20,255,221,98,M,8);b.text(x+37,307,'실제 상품·주문 데이터',13,G);b.lines(x+20,393,ls,12,G,False,38)
b.rect(48,582,1104,112,F,12);b.lines(73,620,['예외 상태도 완성된 화면입니다.','검색 결과 없음 · 재고 부족 · 판매 종료 · 결제 취소 · 네트워크 오류 · 로그인 필요'],19,W,False,38)
#14
b=page('HQ / 홈페이지 디자인실','OPERATIONS UI','기준, 결정, 파일, 수정 요청, 검수 결과를 한 화면에서 관리합니다.')
b.rect(48,183,1104,510,W,12);b.rect(48,183,192,510,F,12);b.text(68,218,'BIOTRIX HQ',18,W,True);b.lines(68,275,['사이트 통합 관리','홈페이지 디자인실','작업 기록','업무 실행·검수','지식·결정 기록'],14,W,False,45)
b.text(265,228,'홈페이지 디자인실',28,F,True);b.text(265,262,'DM-2.0 / Quiet Nature',14,G)
for i,(t,v) in enumerate([('디자인 기준','팔레트·사진·레이아웃'),('마스터 파일','PDF · AI 호환 · SVG'),('수정 요청','요청 내용 + 완료 기준')]):
 x=265+i*289;b.rect(x,290,269,129,I,9);b.text(x+18,326,t,19,F,True);b.text(x+18,364,v,12,G)
b.text(265,463,'결정 기록',20,F,True);b.rule(265,481,850);b.lines(265,514,['DM-2.0  사진과 문구 영역 분리 / 동일한 사진 세트 사용','결정 이유와 적용 범위를 남기고 기존 기록은 덮어쓰지 않습니다.','업무 접수 → ChatGPT Work 실행 → 결과·검수·배포 근거 저장'],14,G,False,44)
b.text(265,664,'등록만으로 AI가 무인 실행되지는 않습니다. 작업 실행 상태와 배포 상태를 별도로 확인합니다.',11,G)
#15
b=page('반응형과 동작도 디자인입니다.','INTERACTION','화면 크기와 입력 방식이 달라져도 같은 정보를 이해하고 사용할 수 있어야 합니다.')
for i,(t,ls) in enumerate([('1440 / Desktop',['최대 폭 1280 · 여백 64','12열 · 카드 3열','히어로: 문구 / 사진 45:55']),('768 / Tablet',['여백 32 · 8열','카드 2열 또는 3열','헤더: 메뉴 길이 따라 접기']),('390 / Mobile',['여백 20 · 4열','문구 → 사진 순서','카드 1열 · CTA 전체 폭'])]):b.card(48+i*374,187,354,227,t,ls)
b.card(48,444,539,251,'SLIDESHOW',['6.5초 간격 · 전환 500ms · 사진 영역만 전환','일시정지 / 이전 / 다음 / 현재 순서 표시','탭 비활성·hover·focus에서 정지','움직임 줄이기 설정이면 자동 전환 끄기','첫 이미지 우선 로딩 · 나머지는 지연 로딩'])
b.card(612,444,540,251,'RELEASE CHECK',['320 / 390 / 768 / 1440 폭 검수','키보드 순서·포커스·메뉴 닫힘 확인','모든 링크·폼·빈 상태·오류 상태 확인','사진 왜곡·잘림·글자 겹침 없음','실제 도메인 스크린샷·커밋·마스터 버전 기록'])
#16
b=page('문구는 고객의 말에 가깝게.','CONTENT','운영 사정과 기술 설명을 홈페이지의 주인공으로 만들지 않습니다.')
rows=[('홈','일상에 가까운 좋은 선택.','분야 살펴보기'),('브랜드','매일의 선택에, 분명한 기준을.','브랜드 알아보기'),('사업 분야','먹고, 돌보고, 가꾸는 일상.','분야 살펴보기'),('제품','어떤 일상을 찾고 있나요?','제품 살펴보기'),('파트너십','좋은 제품을, 더 가까이.','제휴 안내 보기'),('문의','무엇을 도와드릴까요?','자주 묻는 질문')]
b.rect(48,186,1104,44,F,6)
for x,t in [(65,'페이지'),(249,'주요 문구'),(903,'행동 문구')]:b.text(x,215,t,14,W,True)
for i,(p,h,c) in enumerate(rows):
 y=235+i*62;b.rect(48,y,1104,56,W if i%2==0 else M,5);b.text(65,y+35,p,15,F,True);b.text(249,y+35,h,17,K);b.text(903,y+35,c,14,F)
b.lines(48,649,['기술 용어·장황한 설명·입증하지 못한 최상급은 줄입니다.','고객이 다음에 할 수 있는 행동을 먼저 보여주고, 필요한 설명은 그 옆에 둡니다.'],16,G)
#17
b=page('파일과 자산을 잃지 않는 구조.','HANDOFF','HQ에서 최신 마스터와 사용 범위를 확인하고, 수정한 이유를 다음 작업에 넘깁니다.')
b.card(48,187,535,268,'DELIVERABLES',['BIOTRIX_Design_Master_v2.pdf / 전체 18페이지','BIOTRIX_Design_Master_v2.ai / PDF 기반 호환본','BIOTRIX_Design_Master_v2.svg / 편집 원본','boards/*.svg / 페이지별 편집 원본','brand-triptych.jpg / 브랜드 무드 이미지','tokens.json · asset-manifest.json · README.md'])
b.card(610,187,542,268,'AI 파일의 정확한 범위',['.ai 파일은 벡터 PDF 기반의 Illustrator 호환본','최신 Adobe 네이티브 AI 저장 파일은 아님','원본 레이어·효과·다중 아트보드 보존 미보증','Illustrator 앱에서의 실제 열기 검수는 미실시','SVG와 PDF를 함께 제공해 편집·검토 가능','최종 네이티브 AI는 Illustrator에서 다시 저장'])
b.card(48,483,535,211,'ASSET CONTROL',['사진은 AI 생성 / 실제 상품 표시 금지','텍스트·도형은 벡터 / 사진은 래스터','폰트: Noto Sans KR / SIL Open Font License','원본·결정·버전·적용 사이트를 함께 기록'])
b.card(610,483,542,211,'RELEASE CONTROL',['마스터 완성은 홈페이지 재배포와 다릅니다.','HQ 디자인실 화면 배포 여부는 따로 기록','브랜드 사이트는 마스터 기준 구현·검수 후 반영','서로 다른 사이트·브랜치를 덮어쓰지 않습니다.'])
#18
b=page('완성의 기준은 일관성입니다.','ACCEPTANCE','예쁜 첫 화면 하나가 아니라, 다음 화면과 다음 변경에서도 유지되는 기준을 만듭니다.')
checks=[('브랜드','로고·색·서체·여백이 모든 화면에서 일치'),('사진','비율·조명·주제·표시 범위가 명확'),('내용','고객이 무엇을 보고 어디로 갈지 이해'),('동작','메뉴·버튼·슬라이드·폼 상태가 실제로 작동'),('반응형','320px부터 데스크톱까지 겹침·잘림 없음'),('운영','HQ 결정·마스터·구현·검수·배포 기록 연결')]
for i,(t,d) in enumerate(checks):
 y=187+i*75;b.rect(48,y,1104,62,W,9);b.text(69,y+39,f'0{i+1}',18,F,True);b.text(134,y+39,t,19,F,True);b.text(330,y+39,d,18,G)
b.text(48,696,'홈페이지 디자인의 기준점: HQ 홈페이지 디자인실 / DM-2.0',20,F,True)

# Native SVG groups and searchable PDF. No screenshot rasterisation of UI.
def escape(t):return html.escape(str(t),quote=True)
BPATH='M10 4h25c14 0 23 7 23 18 0 7-4 12-10 15 8 3 12 8 12 16 0 11-9 18-24 18H10V4Zm14 13v15h10c7 0 11-3 11-8 0-4-4-7-11-7H24Zm0 27v14h12c7 0 11-3 11-7s-4-7-11-7H24Z'
RPATH='M10 5c7 5 15 11 23 18 7 6 14 10 23 12-7 2-13 5-19 9-10 7-18 16-27 26V52c9-10 18-17 27-22C27 23 18 18 10 16V5Z'
from fontTools.svgLib.path import parse_path
from reportlab.graphics.shapes import Path as RLPath
from reportlab.graphics import renderPDF
from reportlab.graphics.shapes import Drawing

def render(c,b,ox=0,oy=0,H=800):
 c.saveState();c.translate(ox,H-oy);c.scale(1,-1)
 # ReportLab text/images are flipped back locally.
 for op in b.ops:
  typ,*a=op
  if typ=='rect':
   x,y,w,h,col,r,stroke=a;c.setFillColor(HexColor(col));c.setStrokeColor(HexColor(stroke or col));c.setLineWidth(.7);c.roundRect(x,y,w,h,r,fill=1,stroke=bool(stroke))
  elif typ=='text':
   x,y,t,size,col,bold=a;c.saveState();c.translate(x,y);c.scale(1,-1);c.setFillColor(HexColor(col));c.setFont('Bold' if bold else 'Regular',size);c.drawString(0,0,t);c.restoreState()
  elif typ=='photo':
   x,y,w,h,panel=a;c.saveState();p=c.beginPath();p.rect(x,y,w,h);c.clipPath(p,stroke=0,fill=0)
   # All image placement uses native clipping; source image is unchanged.
   if panel is None: iw,ih=1536,1024; px=0
   else: iw,ih=512,1024;px=panel*512
   scale=max(w/iw,h/ih);drawW=1536*scale;drawH=1024*scale
   dx=x+(w-iw*scale)/2-px*scale;dy=y+(h-drawH)/2
   c.translate(dx,dy+drawH);c.scale(1,-1);c.drawImage(str(PHOTO),0,0,width=drawW,height=drawH);c.restoreState()
  elif typ=='logo':
   x,y,s,rev,word=a;c.saveState();c.translate(x,y);c.scale(s,s)
   for path,col in [(BPATH,W if rev else F),(RPATH,W if rev else S)]:
    pen=ReportLabPen(None);parse_path(path,pen);pen.path.fillColor=HexColor(col);pen.path.strokeColor=None;pen.path.fillMode=0;d=Drawing(72,78);d.add(pen.path);renderPDF.draw(d,c,0,0)
   if word:
    c.saveState();c.translate(82,50);c.scale(1,-1);c.setFillColor(HexColor(W if rev else K));c.setFont('Bold',35);c.drawString(0,0,'BIOTRIX');c.restoreState()
   c.restoreState()
 c.restoreState()

def svg_ops(b):
 out=[]
 for n,op in enumerate(b.ops):
  typ,*a=op
  if typ=='rect':
   x,y,w,h,col,r,stroke=a;out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{col}" stroke="{stroke or "none"}"/>')
  elif typ=='text':
   x,y,t,size,col,bold=a;out.append(f'<text x="{x}" y="{y}" font-family="Noto Sans KR" font-weight="{700 if bold else 400}" font-size="{size}" fill="{col}">{escape(t)}</text>')
  elif typ=='photo':
   x,y,w,h,panel=a;iw=1536 if panel is None else 512;px=0 if panel is None else panel*512;sc=max(w/iw,h/1024);dw=1536*sc;dh=1024*sc;dx=x+(w-iw*sc)/2-px*sc;dy=y+(h-dh)/2;cid=f'clip-{boards.index(b)}-{n}'
   out.append(f'<defs><clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath></defs><g clip-path="url(#{cid})"><use xlink:href="#brand-photo" x="{dx}" y="{dy}" width="{dw}" height="{dh}"/></g>')
  else:
   x,y,s,rev,word=a;out.append(f'<g transform="translate({x} {y}) scale({s})"><path d="{BPATH}" fill="{W if rev else F}" fill-rule="evenodd"/><path d="{RPATH}" fill="{W if rev else S}"/>')
   if word:out.append(f'<text x="82" y="50" font-family="Noto Sans KR" font-weight="700" font-size="35" fill="{W if rev else K}">BIOTRIX</text>')
   out.append('</g>')
 return ''.join(out)

def svg_document(body,w,h):return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>BIOTRIX Design Master 2.0</title><defs><symbol id="brand-photo" viewBox="0 0 1536 1024"><image width="1536" height="1024" xlink:href="data:image/jpeg;base64,{PHOTO64}"/></symbol></defs>{body}</svg>'
PDF=OUT/'BIOTRIX_Design_Master_v2.pdf';c=canvas.Canvas(str(PDF),pagesize=(1200,800));c.setTitle('BIOTRIX Design Master v2.0');c.setAuthor('BIOTRIX HQ Design Office');c.setSubject('Design master; generated brand mood images, not real product photography')
(OUT/'boards').mkdir(exist_ok=True)
for i,b in enumerate(boards):
 render(c,b);c.showPage();(OUT/'boards'/f'{i+1:02d}.svg').write_text(svg_document(svg_ops(b),1200,800))
c.save()
# Compatibility file is explicitly PDF-based, not an Adobe native AI export.
AI=OUT/'BIOTRIX_Design_Master_v2.ai';c=canvas.Canvas(str(AI),pagesize=(3680,4940));c.setTitle('BIOTRIX DM-2.0 - PDF-based Illustrator compatibility copy');c.setAuthor('BIOTRIX HQ Design Office');c.setSubject('Not native Illustrator AI. 18 grouped visual boards; open/import in Illustrator; use SVG sources for editing. Adobe app verification not performed.')
allsvg=[]
for i,b in enumerate(boards):
 x=(i%3)*1240;y=(i//3)*828;render(c,b,x,y,4940);allsvg.append(f'<g id="board-{i+1:02}" data-title="{escape(b.title)}" transform="translate({x} {y})">{svg_ops(b)}</g>')
c.save();(OUT/'BIOTRIX_Design_Master_v2.svg').write_text(svg_document(''.join(allsvg),3680,4940))
logo=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 78"><path d="{BPATH}" fill="{F}" fill-rule="evenodd"/><path d="{RPATH}" fill="{S}"/></svg>'
(OUT/'biotrix-symbol-flat.svg').write_text(logo)
tokens={'version':'2.0','colors':{'forest':F,'ivory':I,'sage':S,'ink':K,'muted':G,'stone':L},'font':{'family':'Noto Sans KR','h1':[56,68],'h1Mobile':[36,46],'body':[18,30],'bodyMobile':[16,27]},'layout':{'maxWidth':1280,'paddingDesktop':64,'paddingTablet':32,'paddingMobile':20},'spacing':[4,8,12,16,24,32,48,64,96],'slideshow':{'intervalMs':6500,'transitionMs':500,'reducedMotion':'manual','pauseOn':['hover','focus','hidden']},'department':'website_design'}
(OUT/'tokens.json').write_text(json.dumps(tokens,ensure_ascii=False,indent=2))
manifest={'version':'2.0','department':'website_design','generated_photo':{'file':'brand-triptych.jpg','source':'OpenAI built-in image generation','created':'2026-09-28','dimensions':[1536,1024],'use':'brand mood only; not real products/facilities/suppliers','prompt':'Premium editorial triptych: pears, water/linen/botanical sprig, unlabeled frosted cosmetic bottle; warm ivory stone; consistent soft daylight; no text/brands.','panels':['food','daily wellness','beauty']},'ai_format':'PDF-based Illustrator compatibility copy; NOT Adobe native AI export; Adobe app not tested','master_pages':[{'number':i+1,'title':b.title,'section':b.section} for i,b in enumerate(boards)]}
(OUT/'asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(OUT/'README.md').write_text('''# BIOTRIX Design Master 2.0

Owner: HQ 홈페이지 디자인실 / website_design

## Files
- PDF: 18-page visual design master, searchable text and vector graphics.
- AI: **PDF-based Illustrator compatibility copy, not a native Adobe Illustrator save.** The file contains one large canvas with 18 boards. It does not contain Illustrator proprietary edit data, native layers or native multi-artboard metadata. Adobe Illustrator application testing was not available. Open/import the PDF-based file in Illustrator, then Save As native AI if required. Renaming the extension alone does not make it a native AI file.
- SVG: true editable vector master, grouped by board. Individual pages in boards/. Text remains live; install Noto Sans KR to edit it. Embedded images make the SVG self-contained.
- Photos: brand-triptych.png is the original AI-generated mood image. JPG is a compressed delivery version, composition unchanged. Not actual products, facilities or suppliers.
- tokens.json: implementation values; asset-manifest.json: provenance and page index.
- biotrix-symbol-flat.svg: flat vector symbol preserving the existing B construction.

## Fonts
Noto Sans KR Regular and Bold, SIL Open Font License.
Official font source: https://github.com/google/fonts/tree/main/ofl/notosanskr
See OFL.txt. The PDFs embed font subsets. SVG editing needs the full installed font.

## Scope and release
The master defines public brand pages, mobile, commerce visual conventions and HQ design-office UI. Existing commerce behaviour is preserved. This master is not evidence of a brand website redeployment. HQ release and brand-site implementation are separately recorded in HQ.

HQ stores decisions, revision requests and release evidence. ChatGPT Work executes tasks; no unattended AI runtime is claimed.

## Final AI native step
Native AI export requires Adobe Illustrator. The supplied .ai is explicitly a PDF-compatible exchange copy; the SVG is the authoritative editable source for this delivery.
''')
shutil.copy(ROOT/'fonts/OFL.txt',OUT/'OFL.txt')
print(json.dumps({'pages':len(boards),'pdf_bytes':PDF.stat().st_size,'ai_bytes':AI.stat().st_size,'svg_bytes':(OUT/'BIOTRIX_Design_Master_v2.svg').stat().st_size}))
