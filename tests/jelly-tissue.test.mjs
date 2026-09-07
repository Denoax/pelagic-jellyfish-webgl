import test from 'node:test';
import assert from 'node:assert/strict';
import { LinearMipmapLinearFilter, NoColorSpace } from 'three/webgpu';
import { createBioluminescenceMap } from '../src/scene/materials/BioluminescenceMap.js';
import { createJellyTissue } from '../src/scene/materials/JellyTissue.js';

test('luminous tissue masks are repeatable, periodic and sparse',()=>{
  const a=createBioluminescenceMap(),b=createBioluminescenceMap();
  assert.deepEqual(a.image.data,b.image.data);
  const {width,height,data}=a.image;
  let bright=0;const cloud=new Set();
  for(let y=0;y<height;y++){
    assert.deepEqual(data.slice(y*width*4,y*width*4+4),data.slice((y*width+width-1)*4,(y*width+width-1)*4+4));
    for(let x=0;x<width;x++){
      const p=(y*width+x)*4;
      cloud.add(data[p]);if(data[p+2]>32)bright++;
      assert.equal(data[p+3],255);
    }
  }
  assert.ok(cloud.size>128,'mottling retains a soft tonal range');
  assert.ok(bright>100&&bright<width*height*.03,'cells are accents, not uniform emission');
  assert.equal(a.colorSpace,NoColorSpace);
  assert.equal(a.minFilter,LinearMipmapLinearFilter);
  assert.equal(a.generateMipmaps,true);
  a.dispose();b.dispose();
});

test('tissue owns and disposes its detail map without a transmission buffer',()=>{
  for(const membrane of [false,true]){
    const material=createJellyTissue({membrane});let disposed=false;
    material.userData.detailMap.addEventListener('dispose',()=>{disposed=true;});
    assert.equal(material.transmission,0);
    assert.equal(material.depthWrite,false);
    assert.ok(material.opacityNode&&material.emissiveNode);
    material.dispose();assert.equal(disposed,true);
  }
});
