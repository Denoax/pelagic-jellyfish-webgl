import * as THREE from 'three/webgpu';

// Original, seeded tissue masks, not a photograph or additional geometry.
// R: soft mesoglea mottling; G: sparse branching canals; B: luminous cells.
// A small mipmapped data texture keeps the cells soft at medium/far distances.
export function createBioluminescenceMap() {
  const width=512,height=256,data=new Uint8Array(width*height*4),tau=Math.PI*2;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const u=x/(width-1),v=y/(height-1),a=u*tau;
    const cloud=.5+(Math.sin(a*3+v*13)+Math.cos(a*7-v*19)+Math.sin(a*11+v*31))/6;
    const warp=Math.sin(v*17.3)*.09+Math.sin(v*39.1)*.025;
    const canal=Math.max(0,Math.cos(a*8+warp*8))**22;
    const branch=Math.max(0,Math.cos(a*16+v*23+Math.sin(a*8)*.8))**32;
    const mask=Math.sin(Math.PI*v)**.7;
    const offset=(y*width+x)*4;
    data[offset]=Math.round(cloud*255);
    data[offset+1]=Math.round(Math.min(1,canal*.7+branch*.22)*mask*255);
    data[offset+3]=255;
  }
  let seed=1709;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<112;i++){
    const cx=random()*(width-1),cy=(.18+random()*.74)*(height-1);
    const rx=1.2+random()*1.7,ry=.9+random()*1.1,energy=.35+random()*.65;
    for(let y=Math.floor(cy-ry*3);y<=Math.ceil(cy+ry*3);y++)for(let dx=-Math.ceil(rx*3);dx<=Math.ceil(rx*3);dx++){
      if(y<0||y>=height)continue;
      const x=Math.round(cx)+dx,wrapped=((x%(width-1))+(width-1))%(width-1);
      const distance=((x-cx)/rx)**2+((y-cy)/ry)**2;
      const offset=(y*width+wrapped)*4+2;
      data[offset]=Math.max(data[offset],Math.round(Math.exp(-distance*1.6)*energy*255));
    }
  }
  // Same texel values at the split anatomical seam, including the sparse cells.
  for(let y=0;y<height;y++)data.set(data.subarray(y*width*4,y*width*4+4),(y*width+width-1)*4);
  const map=new THREE.DataTexture(data,width,height,THREE.RGBAFormat);
  map.name='original-bioluminescent-tissue-masks';
  map.colorSpace=THREE.NoColorSpace;
  map.wrapS=THREE.RepeatWrapping;
  map.generateMipmaps=true;
  map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;
  map.needsUpdate=true;
  return map;
}
