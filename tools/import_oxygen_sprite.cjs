// Slice the reviewed 2x2 oxygen atlas; keep generated alpha and stable body scale.
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
(async()=>{
 const file=path.join(root,'assets/source-atlases/erythrocyte-oxygen.png');const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(info.width!==1536||info.height!==1024)throw Error('Expected reviewed atlas dimensions');
 const poses=['idle','action','hurt','victory'],anchors=[368,1134,351,1125],feet=[496,499,940,952],boxes=[];
 for(let n=0;n<4;n++){const x0=(n%2)*768,y0=Math.floor(n/2)*512;let left=x0+768,top=y0+512,right=x0,bottom=y0;
  for(let y=y0;y<y0+512;y++)for(let x=x0;x<x0+768;x++)if(data[(y*1536+x)*4+3]>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  boxes.push({left:Math.max(x0,left-2),top:Math.max(y0,top-2),right:Math.min(x0+767,right+2),bottom:Math.min(y0+511,bottom+2)});
 }
 const scale=Math.min(...boxes.map((b,n)=>Math.min(100/(anchors[n]-b.left),142/(b.right-anchors[n]),222/(feet[n]-b.top),22/Math.max(1,b.bottom-feet[n]))));
 const referenceHeight=(feet[0]-boxes[0].top)*scale,overrides=JSON.parse(fs.readFileSync(path.join(root,'assets/sprite-anchor-overrides.json')));
 for(let n=0;n<4;n++){
  const b=boxes[n],width=b.right-b.left+1,height=b.bottom-b.top+1;
  const sprite=await sharp(file).extract({left:b.left,top:b.top,width,height}).resize(Math.round(width*scale),Math.round(height*scale)).toBuffer();
  const rel=`assets/characters/rbc_${poses[n]}.webp`;
  await sharp({create:{width:256,height:256,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:sprite,left:Math.round(106+(b.left-anchors[n])*scale),top:Math.round(228+(b.top-feet[n])*scale)}]).webp({lossless:true}).toFile(path.join(root,rel));
  overrides[rel]={fullW:256,fullH:256,contentH:referenceHeight,centerX:106,bottomY:228};
 }
 fs.copyFileSync(path.join(root,'assets/characters/rbc_idle.webp'),path.join(root,'assets/characters/rbc.webp'));overrides['assets/characters/rbc.webp']=overrides['assets/characters/rbc_idle.webp'];
 fs.writeFileSync(path.join(root,'assets/sprite-anchor-overrides.json'),JSON.stringify(overrides,null,2));
 const meta=JSON.parse(fs.readFileSync(path.join(root,'assets/sprites.json')));meta.version='0.8.0-oxygen-sfx';meta.characters.rbc={pivot:[106,228],referenceHeight,frames:Object.fromEntries(poses.map(p=>[p,`assets/characters/rbc_${p}.webp`])),source:'assets/source-atlases/erythrocyte-oxygen.png',sourceCoordinateSpace:[1536,1024],sourceBoxes:Object.fromEntries(poses.map((p,n)=>[p,boxes[n]]))};
 fs.writeFileSync(path.join(root,'assets/sprites.json'),JSON.stringify(meta,null,2));fs.writeFileSync(path.join(root,'data/sprite-data.js'),'window.IMMUNO_SPRITES = '+JSON.stringify(meta)+';\n');console.log({poses:4,referenceHeight});
})();
