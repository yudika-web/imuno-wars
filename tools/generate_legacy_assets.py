from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math, random

ROOT = Path(__file__).resolve().parents[1]

# ---------- helpers ----------
def rgba(hexstr, a=255):
    h=hexstr.lstrip('#')
    return tuple(int(h[i:i+2],16) for i in (0,2,4))+(a,)

def font(size, bold=False):
    paths=[
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf'
    ]
    for p in paths:
        if Path(p).exists(): return ImageFont.truetype(p,size)
    return ImageFont.load_default()

def save(img, rel):
    p=ROOT/rel
    p.parent.mkdir(parents=True, exist_ok=True)
    img.save(p,'WEBP',lossless=True,quality=95,method=6)

def circle(draw, box, fill, outline='#17324D', width=5):
    draw.ellipse(box, fill=fill, outline=rgba(outline), width=width)

def rr(draw, box, radius, fill, outline='#17324D', width=4):
    draw.rounded_rectangle(box, radius, fill=fill, outline=rgba(outline), width=width)

def shadow_layer(size=128, offset=(3,5), blur=5):
    sh=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(sh)
    return sh,d

def sprite_base(size=128):
    return Image.new('RGBA',(size,size),(0,0,0,0))

def add_face(d, cx, cy, eye=4, mouth='smile'):
    d.ellipse((cx-18,cy-8,cx-10,cy),fill=rgba('#17324D'))
    d.ellipse((cx+10,cy-8,cx+18,cy),fill=rgba('#17324D'))
    if mouth=='smile': d.arc((cx-12,cy, cx+12,cy+16),0,180,fill=rgba('#17324D'),width=3)
    elif mouth=='frown': d.arc((cx-12,cy+6,cx+12,cy+22),180,360,fill=rgba('#17324D'),width=3)
    else: d.line((cx-8,cy+10,cx+8,cy+10),fill=rgba('#17324D'),width=3)

def add_gloss(d,box):
    x0,y0,x1,y1=box
    d.ellipse((x0+(x1-x0)*.2,y0+(y1-y0)*.12,x0+(x1-x0)*.46,y0+(y1-y0)*.34),fill=(255,255,255,90))

def unit_cell(body, nucleus=None, lobes=1, arms=False, label=None):
    im=sprite_base(); d=ImageDraw.Draw(im)
    # shadow
    d.ellipse((24,94,104,118),fill=(11,31,54,45))
    pts=[(64,16),(92,24),(108,53),(102,88),(81,104),(45,105),(22,85),(19,52),(35,25)]
    d.polygon(pts,fill=rgba(body),outline=rgba('#17324D'))
    d.line(pts+[pts[0]],fill=rgba('#17324D'),width=5,joint='curve')
    if arms:
        for a in (-1,1):
            d.line((34 if a<0 else 94,62, 9 if a<0 else 119,48),fill=rgba(body),width=13)
            d.line((34 if a<0 else 94,62, 9 if a<0 else 119,48),fill=rgba('#17324D'),width=3)
    if nucleus:
        if lobes==1:
            circle(d,(47,47,81,78),nucleus,width=4)
        else:
            angs=[-1.2,-.35,.55,1.5][:lobes]
            centers=[]
            for ang in angs:
                cx=64+16*math.cos(ang); cy=62+13*math.sin(ang)
                centers.append((cx,cy)); circle(d,(cx-13,cy-11,cx+13,cy+11),nucleus,width=3)
            for a,b in zip(centers,centers[1:]): d.line((a[0],a[1],b[0],b[1]),fill=rgba(nucleus),width=7)
    add_face(d,64,82)
    return im

# ---------- Characters ----------
# RBC
im=sprite_base(); d=ImageDraw.Draw(im); d.ellipse((18,97,110,118),fill=(0,0,0,40))
d.ellipse((20,24,108,101),fill=rgba('#E94D5B'),outline=rgba('#7A1E2A'),width=6)
d.ellipse((40,42,88,81),fill=rgba('#BA2C3E'),outline=rgba('#7A1E2A'),width=4)
d.ellipse((48,49,80,73),fill=rgba('#F1777F'))
add_gloss(d,(20,24,108,101)); add_face(d,64,87)
save(im,'assets/characters/rbc.webp')

# plasma droplet
im=sprite_base(); d=ImageDraw.Draw(im); d.ellipse((28,97,100,116),fill=(0,0,0,35))
d.polygon([(64,14),(101,69),(96,91),(80,106),(47,106),(31,91),(27,69)],fill=rgba('#F4C95D'),outline=rgba('#8A6420'))
d.line([(64,14),(101,69),(96,91),(80,106),(47,106),(31,91),(27,69),(64,14)],fill=rgba('#8A6420'),width=5)
add_face(d,64,78); d.ellipse((48,38,61,55),fill=(255,255,255,110))
save(im,'assets/characters/plasma.webp')

# platelet cluster
im=sprite_base(); d=ImageDraw.Draw(im); d.ellipse((22,100,108,118),fill=(0,0,0,35))
for cx,cy,s in [(48,64,30),(77,55,32),(76,83,29)]:
    pts=[]
    for i in range(10):
        a=i*math.pi/5; r=s/2*(1 if i%2==0 else .73); pts.append((cx+math.cos(a)*r,cy+math.sin(a)*r))
    d.polygon(pts,fill=rgba('#E2A4D6'),outline=rgba('#6E3965'))
    d.line(pts+[pts[0]],fill=rgba('#6E3965'),width=4)
add_face(d,66,71)
save(im,'assets/characters/platelet.webp')

chars={
'neutrophil':('#F2F4F7','#8C5BC2',3,False),
'macrophage':('#6DD3A0','#3366A8',1,True),
'dendritic':('#7ED6DF','#6C4BA8',1,True),
'nk_cell':('#88C0F7','#453A94',1,False),
'cytotoxic_t':('#8CE6B5','#3D599B',1,False),
'b_cell':('#9FC5FF','#4D66C1',1,False),
'helper_t':('#D8A7FF','#6B48A8',1,False),
'memory_b':('#FFD98A','#6252A6',1,False)
}
for name,(body,nuc,lobes,arms) in chars.items():
    im=unit_cell(body,nuc,lobes,arms)
    d=ImageDraw.Draw(im)
    if name=='macrophage':
        d.arc((35,34,93,95),210,330,fill=rgba('#17324D'),width=5)
        d.ellipse((92,38,111,58),fill=rgba('#9ED45A'),outline=rgba('#17324D'),width=3)
    elif name=='dendritic':
        for ang in [0,.8,1.6,2.4,3.2,4.0,4.8,5.6]:
            x=64+52*math.cos(ang); y=61+45*math.sin(ang)
            d.line((64+30*math.cos(ang),61+26*math.sin(ang),x,y),fill=rgba('#54AEB8'),width=7)
            d.ellipse((x-5,y-5,x+5,y+5),fill=rgba('#54AEB8'))
    elif name=='nk_cell':
        d.polygon([(93,42),(112,51),(93,60)],fill=rgba('#FFB347'),outline=rgba('#17324D'))
        d.line((90,51,105,51),fill=rgba('#17324D'),width=3)
    elif name=='cytotoxic_t':
        d.line((92,35,109,67),fill=rgba('#FF6A6A'),width=7); d.line((109,35,92,67),fill=rgba('#FF6A6A'),width=7)
    elif name=='b_cell':
        for x,y in [(27,36),(103,41),(101,83)]:
            d.line((x,y,x+8,y+8),fill=rgba('#FFBA4A'),width=4); d.line((x+16,y,x+8,y+8),fill=rgba('#FFBA4A'),width=4)
    elif name=='helper_t':
        d.ellipse((88,27,110,49),fill=rgba('#FFE46D'),outline=rgba('#17324D'),width=3); d.line((99,18,99,58),fill=rgba('#17324D'),width=3); d.line((84,38,114,38),fill=rgba('#17324D'),width=3)
    elif name=='memory_b':
        d.arc((89,28,112,52),40,320,fill=rgba('#FFB42E'),width=4); d.polygon([(109,27),(116,32),(108,36)],fill=rgba('#FFB42E'))
    save(im,f'assets/characters/{name}.webp')

# complement protein
im=sprite_base(); d=ImageDraw.Draw(im); d.ellipse((20,100,108,117),fill=(0,0,0,35))
for i in range(8):
    a=i*math.pi/4; x=64+32*math.cos(a); y=62+32*math.sin(a)
    circle(d,(x-12,y-12,x+12,y+12),'#F8E36D',width=3)
circle(d,(42,40,86,84),'#F0B93F',width=4); add_face(d,64,70)
save(im,'assets/characters/complement.webp')

# ---------- Enemies ----------
def bacterium(name, color, shape='coccus', face='frown', extra=None):
    im=sprite_base(); d=ImageDraw.Draw(im); d.ellipse((22,100,110,118),fill=(0,0,0,36))
    if shape=='coccus':
        for cx,cy,r in [(45,60,25),(72,50,27),(86,76,23),(52,84,22)]: circle(d,(cx-r,cy-r,cx+r,cy+r),color,width=4)
    elif shape=='bacillus':
        rr(d,(22,39,106,88),24,color,width=5)
    elif shape=='spore':
        rr(d,(24,32,104,95),28,color,width=5); circle(d,(48,48,80,80),'#F4E27A',width=3)
    if extra=='capsule':
        d.rounded_rectangle((12,25,116,103),34,outline=rgba('#A7E8F3',180),width=10)
    if extra=='flagella':
        for y in [43,55,69,82]: d.arc((92,y-17,127,y+20),270,90,fill=rgba('#17324D'),width=3)
    if extra=='toxin':
        d.polygon([(99,34),(119,42),(102,51)],fill=rgba('#D84A7F'),outline=rgba('#17324D')); d.ellipse((108,25,119,36),fill=rgba('#D84A7F'))
    if shape=='bacillus': add_face(d,63,72,mouth=face)
    else: add_face(d,65,77,mouth=face)
    save(im,f'assets/enemies/{name}.webp')

bacterium('coccus','#8CD36D','coccus')
bacterium('bacillus','#65C47C','bacillus')
bacterium('toxin_bacteria','#C783C7','bacillus',extra='toxin')
bacterium('capsule_bacterium','#62B7D1','bacillus',extra='capsule')
bacterium('flagellated_bacteria','#F4A15D','bacillus',extra='flagella')
bacterium('bacteria_alpha','#E8667D','coccus')
bacterium('bacteria_beta','#6AAAE4','bacillus')

# viruses
def virus(name,color,shield=False,star=False):
    im=sprite_base(); d=ImageDraw.Draw(im); d.ellipse((22,100,110,118),fill=(0,0,0,35))
    cx=64;cy=63
    for i in range(12):
        a=2*math.pi*i/12; x1=cx+30*math.cos(a); y1=cy+30*math.sin(a); x2=cx+50*math.cos(a); y2=cy+50*math.sin(a)
        d.line((x1,y1,x2,y2),fill=rgba('#17324D'),width=4)
        d.ellipse((x2-6,y2-6,x2+6,y2+6),fill=rgba(color),outline=rgba('#17324D'),width=2)
    circle(d,(34,33,94,93),color,width=5)
    if star:
        pts=[]
        for i in range(10):
            a=-math.pi/2+i*math.pi/5; r=15 if i%2==0 else 7; pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
        d.polygon(pts,fill=rgba('#FFE36E'),outline=rgba('#17324D'))
    add_face(d,64,76,mouth='frown')
    if shield: d.ellipse((18,17,110,109),outline=rgba('#94E7FF',190),width=8)
    save(im,f'assets/enemies/{name}.webp')
virus('free_virus','#B56BE3')
virus('shielded_virus','#6279E7',True)
virus('virus_gamma','#E969A7',False,True)

# infected cell
im=unit_cell('#F0B6B6','#9D4B8D',1,False); d=ImageDraw.Draw(im)
for x,y in [(33,33),(95,31),(102,80),(30,86)]: d.ellipse((x-5,y-5,x+5,y+5),fill=rgba('#A55AE8'),outline=rgba('#17324D'),width=2)
add_face(d,64,82,mouth='frown'); save(im,'assets/enemies/infected_cell.webp')

# Bosses large symbolically

def boss(name,base,accent,kind):
    S=192; im=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(im); d.ellipse((28,150,166,179),fill=(0,0,0,45))
    if kind=='colony':
        for cx,cy,r in [(72,88,46),(119,83,42),(96,125,43),(53,126,34)]: circle(d,(cx-r,cy-r,cx+r,cy+r),base,width=6)
    elif kind=='capsule':
        rr(d,(30,45,164,135),44,base,width=7); d.rounded_rectangle((16,29,178,150),53,outline=rgba(accent,190),width=15)
    elif kind=='factory':
        pts=[(96,28),(139,46),(163,84),(151,135),(109,157),(58,148),(28,114),(35,64)]
        d.polygon(pts,fill=rgba(base),outline=rgba('#17324D')); d.line(pts+[pts[0]],fill=rgba('#17324D'),width=7)
        for i in range(8):
            a=i*math.pi/4; x=96+70*math.cos(a); y=94+63*math.sin(a); d.line((96,94,x,y),fill=rgba(accent),width=5); d.ellipse((x-7,y-7,x+7,y+7),fill=rgba(accent),outline=rgba('#17324D'))
    elif kind=='variant':
        circle(d,(43,41,149,147),base,width=7)
        for i in range(14):
            a=i*2*math.pi/14; x1=96+51*math.cos(a);y1=94+51*math.sin(a);x2=96+78*math.cos(a);y2=94+78*math.sin(a)
            d.line((x1,y1,x2,y2),fill=rgba('#17324D'),width=5); d.polygon([(x2,y2-8),(x2+8,y2+6),(x2-8,y2+6)],fill=rgba(accent))
    elif kind=='biofilm':
        d.rounded_rectangle((24,50,168,147),42,fill=rgba(base),outline=rgba('#17324D'),width=7)
        for i in range(18):
            random.seed(i+3); x=random.randint(41,151);y=random.randint(65,132);r=random.randint(7,14);circle(d,(x-r,y-r,x+r,y+r),accent,width=2)
        d.rounded_rectangle((17,42,176,155),49,outline=rgba('#7DDBB5',170),width=13)
    elif kind=='core':
        circle(d,(38,38,154,154),base,width=7)
        for i in range(10):
            a=i*2*math.pi/10; x=96+43*math.cos(a); y=96+43*math.sin(a); d.ellipse((x-11,y-11,x+11,y+11),fill=rgba(accent),outline=rgba('#17324D'),width=3)
        d.ellipse((70,70,122,122),fill=rgba('#612C7D'),outline=rgba('#17324D'),width=5)
    add_face(d,96,112,mouth='frown')
    save(im,f'assets/enemies/{name}.webp')

boss('boss_bacterial_colony','#79C967','#D8F08C','colony')
boss('boss_capsule_titan','#5FB6D1','#BAF2FF','capsule')
boss('boss_virus_factory','#BD70DF','#F39DD1','factory')
boss('boss_variant','#D45F9E','#FFD45A','variant')
boss('boss_biofilm_colossus','#5C9F80','#8FD45F','biofilm')
boss('boss_viral_core','#7B5ED8','#E95C9B','core')

# ---------- Icons ----------
def icon_base(bg='#F5FAFF'):
    im=Image.new('RGBA',(96,96),(0,0,0,0)); d=ImageDraw.Draw(im); d.ellipse((8,10,88,90),fill=rgba(bg),outline=rgba('#17324D'),width=4); return im,d

# Resource icons
resources={
'energy':('bolt','#FFD34E'),'oxygen':('bubble','#7ED8FF'),'nutrient':('hex','#F4A261'),'signal':('wave','#B487F2'),'health':('heart','#EF5C6C')}
for name,(kind,col) in resources.items():
    im,d=icon_base()
    if kind=='bolt': d.polygon([(54,18),(31,53),(50,53),(40,79),(69,42),(50,42)],fill=rgba(col),outline=rgba('#17324D'))
    elif kind=='bubble':
        for box in [(26,30,56,60),(49,20,72,43),(49,54,73,78)]: d.ellipse(box,fill=rgba(col,190),outline=rgba('#17324D'),width=3)
    elif kind=='hex':
        pts=[(48,20),(72,34),(72,62),(48,77),(24,62),(24,34)]; d.polygon(pts,fill=rgba(col),outline=rgba('#17324D')); d.line(pts+[pts[0]],fill=rgba('#17324D'),width=4)
    elif kind=='wave':
        for r in (13,24,35): d.arc((48-r,48-r,48+r,48+r),210,330,fill=rgba(col),width=5)
        d.ellipse((43,43,53,53),fill=rgba(col))
    elif kind=='heart':
        d.polygon([(48,77),(20,48),(20,34),(31,23),(44,23),(48,31),(52,23),(65,23),(76,34),(76,48)],fill=rgba(col),outline=rgba('#17324D'))
    save(im,f'assets/icons/{name}.webp')

# antigen icons
for name,kind,col in [('antigen_circle','circle','#E85E72'),('antigen_diamond','diamond','#5F9FE4'),('antigen_triangle','triangle','#F2C94C'),('antigen_star','star','#B56BE3')]:
    im,d=icon_base('#F8FBFF')
    if kind=='circle': circle(d,(29,29,67,67),col,width=4)
    elif kind=='diamond': d.polygon([(48,22),(72,48),(48,74),(24,48)],fill=rgba(col),outline=rgba('#17324D')); d.line([(48,22),(72,48),(48,74),(24,48),(48,22)],fill=rgba('#17324D'),width=4)
    elif kind=='triangle': d.polygon([(48,20),(76,73),(20,73)],fill=rgba(col),outline=rgba('#17324D')); d.line([(48,20),(76,73),(20,73),(48,20)],fill=rgba('#17324D'),width=4)
    else:
        pts=[]
        for i in range(10):
            a=-math.pi/2+i*math.pi/5;r=29 if i%2==0 else 13;pts.append((48+r*math.cos(a),48+r*math.sin(a)))
        d.polygon(pts,fill=rgba(col),outline=rgba('#17324D'))
    save(im,f'assets/icons/{name}.webp')

# antibody
im,d=icon_base(); d.line((48,69,48,48),fill=rgba('#FFB343'),width=9); d.line((48,48,30,27),fill=rgba('#FFB343'),width=9); d.line((48,48,66,27),fill=rgba('#FFB343'),width=9); d.line((48,69,48,79),fill=rgba('#17324D'),width=4); save(im,'assets/icons/antibody.webp')

# buffs
buff_specs=[
('buff_oxygen','O2','#79D7FF','bubble'),('buff_clot','CL','#D8A0D2','clot'),('buff_cytokine','CY','#B989F1','signal'),('buff_fever','FV','#FF8C69','thermo'),('buff_complement','CP','#F3D65C','burst'),('buff_analysis','AN','#7DD7D1','scan'),('buff_inflammation','IN','#EF7066','flame')]
for name,txt,col,kind in buff_specs:
    im,d=icon_base('#F9FCFF')
    if kind=='bubble':
        d.ellipse((24,32,51,59),fill=rgba(col),outline=rgba('#17324D'),width=3); d.ellipse((49,24,70,45),fill=rgba(col),outline=rgba('#17324D'),width=3)
    elif kind=='clot':
        for cx,cy in [(34,47),(50,33),(63,50),(47,63)]:
            pts=[(cx,cy-12),(cx+11,cy-4),(cx+7,cy+10),(cx-8,cy+10),(cx-12,cy-3)]; d.polygon(pts,fill=rgba(col),outline=rgba('#17324D'))
    elif kind=='signal':
        for r in (10,20,30): d.arc((48-r,48-r,48+r,48+r),220,320,fill=rgba(col),width=5)
    elif kind=='thermo':
        d.rounded_rectangle((41,20,55,62),7,fill=rgba('#FFFFFF'),outline=rgba('#17324D'),width=3); d.ellipse((34,55,62,83),fill=rgba(col),outline=rgba('#17324D'),width=3); d.rectangle((46,31,50,66),fill=rgba(col))
    elif kind=='burst':
        pts=[]
        for i in range(16):
            a=i*math.pi/8;r=32 if i%2==0 else 17;pts.append((48+r*math.cos(a),48+r*math.sin(a)))
        d.polygon(pts,fill=rgba(col),outline=rgba('#17324D'))
    elif kind=='scan':
        d.ellipse((27,27,69,69),outline=rgba(col),width=6); d.line((58,58,77,77),fill=rgba('#17324D'),width=5); d.line((22,48,74,48),fill=rgba(col),width=3)
    elif kind=='flame':
        d.polygon([(49,18),(65,40),(58,48),(70,64),(60,80),(37,80),(25,65),(36,47),(39,30)],fill=rgba(col),outline=rgba('#17324D'))
    save(im,f'assets/icons/{name}.webp')

# generic info icons
for name,symbol,col in [('info','i','#5AA8E6'),('locked','L','#6B7A90'),('check','✓','#62C17B'),('warning','!','#F0A34E')]:
    im,d=icon_base('#F9FCFF');
    if symbol=='✓': d.line((27,50,42,66),fill=rgba(col),width=9);d.line((42,66,72,31),fill=rgba(col),width=9)
    else:
        f=font(46,True); bbox=d.textbbox((0,0),symbol,font=f); d.text((48-(bbox[2]-bbox[0])/2,46-(bbox[3]-bbox[1])/2-5),symbol,font=f,fill=rgba(col),stroke_width=1,stroke_fill=rgba('#17324D'))
    save(im,f'assets/icons/{name}.webp')

# ---------- UI ----------
# logo
im=Image.new('RGBA',(720,240),(0,0,0,0)); d=ImageDraw.Draw(im)
d.rounded_rectangle((16,24,704,216),44,fill=rgba('#102A43',235),outline=rgba('#5BD2C5'),width=7)
f1=font(82,True); f2=font(29,True)
d.text((42,45),'IMUNO WARS',font=f1,fill=rgba('#F7FBFF'),stroke_width=3,stroke_fill=rgba('#0B1E2D'))
d.text((46,145),'BATTLE IN THE BLOODSTREAM',font=f2,fill=rgba('#7FE3D1'))
# antibody emblem
d.line((640,164,640,105),fill=rgba('#FFD35B'),width=14); d.line((640,108,608,70),fill=rgba('#FFD35B'),width=14); d.line((640,108,674,70),fill=rgba('#FFD35B'),width=14)
save(im,'assets/ui/logo.webp')

ui_icons=[('play','▶','#5ED08D'),('pause','Ⅱ','#FFD15C'),('speed','≫','#61B7F3'),('restart','↻','#E98869'),('home','⌂','#7D96B3'),('next','→','#63D0C1'),('close','×','#E46C7C'),('book','?','#A881E6')]
for name,sym,col in ui_icons:
    im=Image.new('RGBA',(96,96),(0,0,0,0)); d=ImageDraw.Draw(im); rr(d,(8,8,88,88),22,'#F8FBFF',width=4); f=font(46,True); bb=d.textbbox((0,0),sym,font=f); d.text((48-(bb[2]-bb[0])/2,45-(bb[3]-bb[1])/2-4),sym,font=f,fill=rgba(col),stroke_width=1,stroke_fill=rgba('#17324D')); save(im,f'assets/ui/{name}.webp')

# ---------- Effects / tiles ----------
for name,base,pattern in [('tile_normal','#EAF3F7','normal'),('tile_wound','#FFD6D6','wound'),('tile_infected','#EAD9F9','infected'),('tile_plasma','#FFF0B3','plasma')]:
    im=Image.new('RGBA',(128,128),rgba(base)); d=ImageDraw.Draw(im); d.rounded_rectangle((4,4,124,124),14,outline=rgba('#8EA9B5',110),width=4)
    if pattern=='wound':
        d.line((20,25,55,58,36,82,68,105),fill=rgba('#C95664'),width=8); d.line((53,20,73,45,101,34),fill=rgba('#C95664'),width=6)
    elif pattern=='infected':
        for x,y in [(28,34),(91,27),(79,85),(35,92)]: d.ellipse((x-8,y-8,x+8,y+8),fill=rgba('#B271DB',120))
    elif pattern=='plasma':
        for i in range(9):
            x=18+(i*29)%95; y=18+((i*43)%91); d.ellipse((x,y,x+5,y+5),fill=rgba('#DAA532',130))
    else:
        for i in range(6): d.line((8,24+i*18,120,14+i*18),fill=rgba('#D8E6EC',90),width=2)
    save(im,f'assets/effects/{name}.webp')

# projectile / tag / hit
for name,col,kind in [('projectile','#65BDEB','dot'),('antibody_tag','#FFB348','y'),('hit','#FFFFFF','burst'),('clot_barrier','#D59BCB','wall')]:
    im=Image.new('RGBA',(96,96),(0,0,0,0)); d=ImageDraw.Draw(im)
    if kind=='dot': circle(d,(26,26,70,70),col,width=4)
    elif kind=='y': d.line((48,76,48,47),fill=rgba(col),width=10); d.line((48,48,29,25),fill=rgba(col),width=10);d.line((48,48,67,25),fill=rgba(col),width=10)
    elif kind=='burst':
        pts=[]
        for i in range(16): a=i*math.pi/8;r=34 if i%2==0 else 15;pts.append((48+r*math.cos(a),48+r*math.sin(a)))
        d.polygon(pts,fill=rgba(col,210),outline=rgba('#9BC4D5'))
    else:
        for x in [20,40,60]:
            d.ellipse((x,22,x+28,50),fill=rgba(col),outline=rgba('#17324D'),width=3);d.ellipse((x,46,x+28,74),fill=rgba(col),outline=rgba('#17324D'),width=3)
    save(im,f'assets/effects/{name}.webp')

# ---------- Backgrounds ----------
def gradient_bg(top,bottom,seed,variant):
    W,H=1600,900
    im=Image.new('RGB',(W,H)); px=im.load(); t=rgba(top)[:3]; b=rgba(bottom)[:3]
    for y in range(H):
        q=y/(H-1); c=tuple(int(t[i]*(1-q)+b[i]*q) for i in range(3))
        for x in range(W): px[x,y]=c
    d=ImageDraw.Draw(im,'RGBA'); random.seed(seed)
    # vessel curves / cells
    for i in range(18):
        x=random.randint(-100,W-100); y=random.randint(0,H); r=random.randint(40,110)
        d.ellipse((x-r,y-r,x+r,y+r),fill=(255,255,255,16),outline=(255,255,255,25),width=4)
    # organic bands
    for j in range(6):
        pts=[]
        yy=80+j*145+random.randint(-30,30)
        for x in range(-50,W+100,100): pts.append((x,yy+int(35*math.sin(x/160+j))))
        d.line(pts,fill=(120,40,60,28) if variant in (1,5) else (50,90,120,25),width=38)
    # tiny particles
    for i in range(120):
        x=random.randint(0,W); y=random.randint(0,H); r=random.randint(2,6); d.ellipse((x-r,y-r,x+r,y+r),fill=(255,255,255,35))
    return im.filter(ImageFilter.GaussianBlur(radius=0.4))

bgs=[
('level1_skin_wound','#6B2334','#B95A64',11,1),
('level2_capillary','#79384A','#D07B7D',12,2),
('level3_tissue','#4B3A6D','#A76A91',13,3),
('level4_lymphnode','#3F4772','#7C76B6',14,4),
('level5_systemic','#3E253C','#7D384F',15,5)]
for name,top,bottom,seed,var in bgs: save(gradient_bg(top,bottom,seed,var),f'assets/backgrounds/{name}.webp')

print('Assets generated.')
