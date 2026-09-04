import * as THREE from "three/webgpu";

export class Lights {
    static lightDir = new THREE.Vector3(0, 300, 0).multiplyScalar(-1).normalize();

    constructor() {
        this.object = new THREE.Object3D();

        const light = new THREE.DirectionalLight( 0xbde9ff, 0.82);
        light.position.set(100, 300, 0);
        this.object.add(light);

        this.ambientLight = new THREE.HemisphereLight( 0x9edfff, new THREE.Color(.02, .12, .32), 0.52 );
        this.object.add(this.ambientLight);
    }

    update(elapsed) {

    }
}
