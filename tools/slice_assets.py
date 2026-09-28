"""Cut the approved v1 art into runtime sprites. Requires Pillow, NumPy, SciPy.
Usage: python tools/slice_assets.py --source PATH/IMMUNOFRONT_Visual_Assets_v1
"""
from pathlib import Path
import argparse,json,shutil,io
import numpy as np
from PIL import Image,ImageOps,ImageDraw
from scipy.ndimage import label,find_objects,distance_transform_edt

ROOT=Path(__file__).resolve().parents[1]
LAYOUTS=[
 dict(sheet='allies_innate',kind='characters',names=['rbc','platelet','neutrophil','plasma','macrophage','dendritic'],ys=[0,177,340,518,698,882,1086],xs=[0,382,808,1105,1448],anchors=[218,545,925,1260],feet=[174,344,516,698,882,1084]),
 dict(sheet='allies_adaptive',kind='characters',names=['nk_cell','cytotoxic_t','b_cell','helper_t','memory_b','complement'],ys=[0,285,521,769,1028,1270,1536],xs=[0,253,558,785,1024],anchors=[130,366,668,905],feet=[267,505,752,1008,1257,1503]),
 dict(sheet='enemies_basic',kind='enemies',names=['coccus','bacillus','toxin_bacteria','capsule_bacterium','flagellated_bacteria','free_virus'],ys=[0,278,503,759,995,1248,1536],xs=[0,259,520,759,1024],anchors=[142,405,644,884],feet=[261,494,735,979,1232,1501]),
 dict(sheet='enemies_advanced',kind='enemies',names=['shielded_virus','infected_cell','bacteria_alpha','bacteria_beta','virus_gamma'],ys=[0,239,459,666,884,1136],xs=[0,306,720,1025,1385],anchors=[173,565,880,1205],feet=[235,465,665,885,1110]),
 dict(sheet='bosses',kind='enemies',names=['boss_bacterial_colony','boss_capsule_titan','boss_virus_factory','boss_variant','boss_biofilm_colossus','boss_viral_core'],ys=[0,252,490,736,1013,1248,1536],xs=[0,330,715,1024],anchors=[170,560,875],feet=[237,477,725,996,1245,1502])
]

def export(im,path):
 path.parent.mkdir(parents=True,exist_ok=True)
 encoded=io.BytesIO();im.save(encoded,'WEBP',lossless=True,method=6)
 blob=encoded.getvalue()
 if not blob:raise ValueError('Empty image export: '+str(path))
 Image.open(io.BytesIO(blob)).load()
 path.write_bytes(blob)

def isolate(im,cfg):
 """Keep whole connected silhouettes, even when a limb crosses the nominal grid."""
 arr=np.array(im); alpha=arr[:,:,3]
 labels,n=label(alpha>16)
 groups=np.zeros(n+1,dtype=np.int32)
 for k,sl in enumerate(find_objects(labels),1):
  if sl is None or np.sum(labels[sl]==k)<8:continue
  cy=(sl[0].start+sl[0].stop)/2;cx=(sl[1].start+sl[1].stop)/2
  row=int(np.clip(np.searchsorted(cfg['ys'],cy)-1,0,len(cfg['names'])-1))
  col=int(np.clip(np.searchsorted(cfg['xs'],cx)-1,0,len(cfg['anchors'])-1))
  groups[k]=row*len(cfg['anchors'])+col+1
 owner=groups[labels]
 dist,near=distance_transform_edt(owner==0,return_indices=True)
 owner=np.where((owner==0)&(dist<=3)&(alpha>0),owner[tuple(near)],owner)
 result=[]
 for row in range(len(cfg['names'])):
  frames=[]
  for col in range(len(cfg['anchors'])):
   rgba=arr.copy();rgba[:,:,3]=np.where(owner==row*len(cfg['anchors'])+col+1,alpha,0)
   sprite=Image.fromarray(rgba);bbox=sprite.getbbox()
   if not bbox:raise ValueError((cfg['sheet'],row,col))
   frames.append((sprite.crop(bbox),bbox))
  result.append(frames)
 return result

def square_icon(im):
 box=im.getbbox(); im=im.crop(box)
 im.thumbnail((224,224),Image.Resampling.LANCZOS)
 out=Image.new('RGBA',(256,256));out.alpha_composite(im,((256-im.width)//2,(256-im.height)//2))
 return out

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,required=True);parser.add_argument('--qa',type=Path)
 args=parser.parse_args();source=args.source
 data={'version':'0.2.0','characters':{},'enemies':{},'effects':{},'items':{},'backgrounds':[]}
 qa=[]
 for cfg in LAYOUTS:
  im=Image.open(source/'atlases'/(cfg['sheet']+'.png')).convert('RGBA')
  groups=isolate(im,cfg)
  for row,(name,frames) in enumerate(zip(cfg['names'],groups)):
   poses=['idle','action','hurt','victory'] if cfg['kind']=='characters' else ['idle','attack','hurt','defeat']
   if cfg['sheet']=='bosses':poses=['idle','attack','hurt']
   idleheight=frames[0][1][3]-frames[0][1][1]
   # Same scale for every pose, generous shared canvas, fixed ground pivot.
   extx=max(max(abs(b[0]-cfg['anchors'][c]),abs(b[2]-cfg['anchors'][c])) for c,(_,b) in enumerate(frames))
   up=max(cfg['feet'][row]-b[1] for _,b in frames)
   down=max(b[3]-cfg['feet'][row] for _,b in frames)
   scale=min(112/extx,216/up,26/max(1,down),200/idleheight)
   meta={'pivot':[128,224],'referenceHeight':round(idleheight*scale,3),'frames':{},'source':cfg['sheet'],'sourceBoxes':{}}
   for col,(pose,(img,box)) in enumerate(zip(poses,frames)):
    w=max(1,round(img.width*scale));h=max(1,round(img.height*scale))
    x=round(128+(box[0]-cfg['anchors'][col])*scale);y=round(224+(box[1]-cfg['feet'][row])*scale)
    assert x>=0 and y>=0 and x+w<=256 and y+h<=256,(name,pose,x,y,w,h)
    out=Image.new('RGBA',(256,256));out.alpha_composite(img.resize((w,h),Image.Resampling.LANCZOS),(x,y))
    rel=f"assets/{cfg['kind']}/{name}_{pose}.webp";export(out,ROOT/rel)
    meta['frames'][pose]=rel;meta['sourceBoxes'][pose]=list(box)
    qa.append((name+' / '+pose,out.copy()))
   if cfg['sheet']=='bosses':meta['frames']['defeat']=meta['frames']['hurt']
   # Tight, centered portraits for existing unit cards and resource references.
   export(square_icon(frames[0][0]),ROOT/f"assets/{cfg['kind']}/{name}.webp")
   data[cfg['kind']][name]=meta

 items=['oxygen','nutrient','energy','health','antibody','signal','fibrin','clot','plasma_pool','tile_normal','tile_infected','tile_wound','vesicle_chest','upgrade_star','healing','research']
 im=Image.open(source/'atlases/items_props.png').convert('RGBA')
 # Item rows are slightly offset from a mathematical 4x4 grid.
 ys=[0,263,522,740,1024];xs=[0,406,770,1150,1536]
 for idx,name in enumerate(items):
  row,col=divmod(idx,4);part=im.crop((xs[col],ys[row],xs[col+1],ys[row+1]));part=square_icon(part)
  rel=f'assets/items/{name}.webp';export(part,ROOT/rel);data['items'][name]=rel
  aliases={'oxygen':'icons/oxygen','nutrient':'icons/nutrient','energy':'icons/energy','health':'icons/health','antibody':'icons/antibody','signal':'icons/signal','fibrin':'effects/clot_barrier','plasma_pool':'effects/tile_plasma','tile_normal':'effects/tile_normal','tile_infected':'effects/tile_infected','tile_wound':'effects/tile_wound'}
  if name in aliases:export(part,ROOT/('assets/'+aliases[name]+'.webp'))
  buffs={'oxygen':'buff_oxygen','clot':'buff_clot','signal':'buff_cytokine','research':'buff_analysis','antibody':'buff_complement'}
  if name in buffs:export(part,ROOT/('assets/icons/'+buffs[name]+'.webp'))
  qa.append((name,part.copy()))
 export(Image.open(ROOT/'assets/items/antibody.webp'),ROOT/'assets/effects/antibody_tag.webp')

 im=Image.open(source/'atlases/vfx.png').convert('RGBA')
 # Each keyframe shares the same canvas and scale, so bursts grow naturally.
 ys=[0,282,504,725,1024];xs=[0,384,768,1152,1536]
 for row,name in enumerate(['antibody_impact','healing','toxin','shield']):
  paths=[]
  for col in range(4):
   part=im.crop((xs[col],ys[row],xs[col+1],ys[row+1]))
   dest=Image.new('RGBA',(384,384));dest.alpha_composite(part,(0,(384-part.height)//2))
   rel=f'assets/effects/{name}_{col:02d}.webp';export(dest.resize((256,256),Image.Resampling.LANCZOS),ROOT/rel);paths.append(rel)
  data['effects'][name]={'frames':paths,'duration':0.6,'loop':False}

 for p in sorted((source/'backgrounds').glob('*.png')):
  rel=f'assets/backgrounds/{p.stem}.webp'
  bg=ImageOps.fit(Image.open(p).convert('RGB'),(1600,900),method=Image.Resampling.LANCZOS)
  encoded=io.BytesIO();bg.save(encoded,'WEBP',quality=90,method=6)
  blob=encoded.getvalue();Image.open(io.BytesIO(blob)).load();(ROOT/rel).write_bytes(blob);data['backgrounds'].append(rel)
 (ROOT/'assets/sprites.json').write_text(json.dumps(data,indent=2))
 (ROOT/'data/sprite-data.js').write_text('window.IMMUNO_SPRITES = '+json.dumps(data,separators=(',',':'))+';\n')
 if args.qa:
  args.qa.mkdir(parents=True,exist_ok=True)
  for start in range(0,len(qa),24):
   batch=qa[start:start+24];sheet=Image.new('RGB',(960,6*175),(222,232,233));draw=ImageDraw.Draw(sheet)
   for i,(name,img) in enumerate(batch):
    x=(i%4)*240;y=(i//4)*175
    preview=img.copy();preview.thumbnail((145,145));sheet.paste(preview,(x+48,y),preview)
    draw.text((x+5,y+148),name,fill=(20,35,50))
   sheet.save(args.qa/f'sprites_{start//24:02d}.png')
 print(json.dumps({'characters':len(data['characters']),'enemies':len(data['enemies']),'poses':sum(len(v['frames']) for group in ['characters','enemies'] for v in data[group].values()),'items':len(items),'effects':len(data['effects'])}))

if __name__=='__main__':main()
