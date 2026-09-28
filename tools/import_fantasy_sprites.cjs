// Mechanical atlas slicing only: generated artwork and alpha are preserved.
// Requires sharp. Original generated sheets ship with the project.
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const specs=[
 {name:'innate',rows:[0,350,620,921,1280],types:['rbc','platelet','neutrophil','macrophage'],anchors:[[168,478,797,1105],[158,464,785,1100],[139,440,785,1098],[145,438,784,1110]],feet:[320,597,882,1202]},
 {name:'specialists',rows:[0,355,630,914,1280],types:['nk_cell','cytotoxic_t','dendritic','helper_t'],anchors:[[143,447,783,1099],[139,449,785,1102],[146,449,787,1101],[144,464,788,1104]],feet:[315,623,896,1204]},
 {name:'support',rows:[0,368,645,933,1280],types:['b_cell','memory_b','plasma','complement'],anchors:[[151,440,803,1106],[148,441,793,1101],[159,456,799,1097],[168,470,803,1106]],feet:[333,632,907,1180]}
];
(async()=>{
 const overrides={},manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/sprites.json'),'utf8'));const poses=['idle','action','hurt','victory'];
 for(const spec of specs){
  const file=path.join(root,'assets/source-atlases',spec.name+'.png');const normalized=await sharp(file).resize(1280,1280).toBuffer();const {data,info}=await sharp(normalized).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(info.width!==1280||info.height!==1280)throw Error('Expected reviewed 1280px atlas');
  const alpha=(x,y)=>data[(y*info.width+x)*4+3];
  for(let r=0;r<4;r++){
   const y0=spec.rows[r],y1=spec.rows[r+1];const cuts=[0];
   for(const [lo,hi]of [[290,350],[640,718],[941,985]]){
    let best=lo,score=Infinity;
    for(let x=lo;x<=hi;x++){let sum=0;for(let y=y0;y<y1;y++)for(let dx=-1;dx<=1;dx++){let a=alpha(x+dx,y);sum+=a*a;}if(sum<score){score=sum;best=x;}}
    cuts.push(best);
   }cuts.push(1280);
   const boxes=[];
   for(let c=0;c<4;c++){
    let left=cuts[c],right=cuts[c+1]-1;
    // Locate this sprite's connected silhouette, excluding detached fragments
    // from neighboring atlas rows. This changes crop bounds, never pixel alpha.
    const width=right-left+1,height=y1-y0,seen=new Uint8Array(width*height),components=[];
    for(let yy=0;yy<height;yy++)for(let xx=0;xx<width;xx++){
      const start=yy*width+xx;if(seen[start]||alpha(left+xx,y0+yy)<=32)continue;
      const queue=[start];seen[start]=1;let minX=xx,maxX=xx,minY=yy,maxY=yy;
      for(let q=0;q<queue.length;q++){const idx=queue[q],x=idx%width,y=Math.floor(idx/width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
        for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=x+dx,ny=y+dy,ni=ny*width+nx;if(nx>=0&&nx<width&&ny>=0&&ny<height&&!seen[ni]&&alpha(left+nx,y0+ny)>32){seen[ni]=1;queue.push(ni);}}
      }components.push({size:queue.length,minX,maxX,minY,maxY});
    }
    components.sort((a,b)=>b.size-a.size);const main={...components[0]};
    for(const part of components.slice(1)){
      const dx=Math.max(0,main.minX-part.maxX,part.minX-main.maxX),dy=Math.max(0,main.minY-part.maxY,part.minY-main.maxY);
      if(part.size>14&&Math.hypot(dx,dy)<14){main.minX=Math.min(main.minX,part.minX);main.maxX=Math.max(main.maxX,part.maxX);main.minY=Math.min(main.minY,part.minY);main.maxY=Math.max(main.maxY,part.maxY);}
    }
    boxes.push({left:Math.max(left,left+main.minX-2),top:Math.max(y0,y0+main.minY-2),right:Math.min(right,left+main.maxX+2),bottom:Math.min(y1-1,y0+main.maxY+2)});
   }
   const extents=boxes.map((b,c)=>({left:spec.anchors[r][c]-b.left,right:b.right-spec.anchors[r][c],up:spec.feet[r]-b.top,down:Math.max(0,b.bottom-spec.feet[r])}));
   const scale=Math.min(100/Math.max(...extents.map(e=>e.left)),140/Math.max(...extents.map(e=>e.right)),222/Math.max(...extents.map(e=>e.up)),22/Math.max(1,...extents.map(e=>e.down)));
   const refH=(spec.feet[r]-boxes[0].top)*scale;
   for(let c=0;c<4;c++){
    const b=boxes[c],w=b.right-b.left+1,h=b.bottom-b.top+1;
    const dw=Math.max(1,Math.round(w*scale)),dh=Math.max(1,Math.round(h*scale));
    const left=Math.round(106+(b.left-spec.anchors[r][c])*scale),top=Math.round(228+(b.top-spec.feet[r])*scale);
    if(left<0||top<0||left+dw>256||top+dh>256)throw Error('Sprite crop outside canvas '+spec.types[r]);
    const sprite=await sharp(normalized).extract({left:b.left,top:b.top,width:w,height:h}).resize(dw,dh).toBuffer();
    const rel=`assets/characters/${spec.types[r]}_${poses[c]}.webp`;
    await sharp({create:{width:256,height:256,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:sprite,left,top}]).webp({lossless:true}).toFile(path.join(root,rel));
    overrides[rel]={fullW:256,fullH:256,contentH:refH,centerX:106,bottomY:228};
    if(c===0){fs.copyFileSync(path.join(root,rel),path.join(root,`assets/characters/${spec.types[r]}.webp`));overrides[`assets/characters/${spec.types[r]}.webp`]=overrides[rel];}
   }
   manifest.characters[spec.types[r]]={pivot:[106,228],referenceHeight:refH,frames:Object.fromEntries(poses.map(p=>[p,`assets/characters/${spec.types[r]}_${p}.webp`])),source:`assets/source-atlases/${spec.name}.png`,sourceCoordinateSpace:[1280,1280],sourceBoxes:Object.fromEntries(poses.map((p,c)=>[p,boxes[c]]))};
   console.log(spec.types[r], 'cuts',cuts,'body-height',refH.toFixed(1));
  }
 }
 manifest.version='0.7.0-fantasy-arsenal';fs.writeFileSync(path.join(root,'assets/sprites.json'),JSON.stringify(manifest,null,2));fs.writeFileSync(path.join(root,'data/sprite-data.js'),'window.IMMUNO_SPRITES = '+JSON.stringify(manifest)+';\n');
 fs.writeFileSync(path.join(root,'assets/sprite-anchor-overrides.json'),JSON.stringify(overrides,null,2));
})();
