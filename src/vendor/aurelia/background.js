import * as THREE from "three/webgpu";
import {
    Fn,
    vec3,
    screenUV,
    positionWorld,
    cameraPosition,
    float,
    normalWorld,
    time,
    sin,
    dot,
    positionView,
    triNoise3D,
    min,
    smoothstep,
    vec2,
    mod,
    mat3,
    If,
    uniform,
    Loop,
    mix
} from "three/tsl";
import {Lights} from "./lights";

const hash23 = /*@__PURE__*/ Fn( ( [ uv ] ) => {
    const a = 12.9898, b = 78.233, c = vec3(43758.5453, 43758.1947, 43758.42037);
    const dt = dot(uv.xy, vec2(a, b));
    const sinsn = sin(mod( dt, Math.PI )).toVar();
    return c.mul(sinsn).fract();
} );

export class Background {
    static lightDir = uniform(Lights.lightDir);
    static pointer = uniform(new THREE.Vector2(0.5, 0.5));
    static current = uniform(new THREE.Vector2());
    static currentStrength = uniform(0);
    static depth = uniform(0);

    static fogFunction = Fn(() => {
        const rayDir = positionWorld.xyz.sub(cameraPosition.xyz).normalize();
        const value = float(0).toVar();
        const uvRay = vec3(rayDir.xz.normalize().mul(3), 0.0).toVar();
        const initialRayOffset = mix(rayDir.xz, uvRay.xy, 0.5);
        const p = vec3(cameraPosition.xz.add(initialRayOffset.mul(3.0)), rayDir.y.mul(2)).toVar();
        p.x.addAssign(Background.current.x.mul(Background.currentStrength).mul(0.8));
        p.y.addAssign(Background.current.y.mul(Background.currentStrength).mul(0.8));
        const factor = 0.005;
        p.mulAssign(factor);
        uvRay.mulAssign(factor);
        Loop(5, () => {
            const noise = triNoise3D(p, 0.2, time);
            value.addAssign(noise);
            p.addAssign(uvRay);
        });
        value.divAssign(5);
        value.mulAssign(1.3);

        const y = rayDir.y.mul(0.5).add(0.5);
        const colorTop = mix(vec3(.012, .085, .22), vec3(.001, .009, .032), Background.depth);
        const color = colorTop.mul(y).mul(value).toVar();

        const shaftA = sin(screenUV.x.mul(18).add(screenUV.y.mul(3)).add(time.mul(0.07))).mul(0.5).add(0.5).pow(14);
        const shaftB = sin(screenUV.x.mul(11).sub(screenUV.y.mul(2)).sub(time.mul(0.045))).mul(0.5).add(0.5).pow(18);
        const shaftFade = screenUV.y.oneMinus().pow(2).mul(Background.depth.oneMinus());
        color.addAssign(vec3(0.04, 0.18, 0.36).mul(shaftA.add(shaftB)).mul(shaftFade).mul(0.12));

        const dither = hash23(screenUV).sub(0.5).mul(1.0/255);
        color.xyz.addAssign(dither);
        return color;
    })();

    static getFog = Fn(() => {
        const projectedZ = positionView.z.mul(-1);
        const fog = smoothstep(Background.fogNear, Background.fogFar, projectedZ).oneMinus();
        return fog;
    })().toVar("fog");

    static envFunction = Fn(() => {
        const up = normalWorld.y.max(0.0);
        const lightIntensity = float(0.0).toVar();
        If(up.greaterThan(0.0), () => {
            const matrix = mat3(-2/3,-1/3,2/3, 3/3,-2/3,1/3, 1/3,2/3,2/3);
            const water = vec3(positionWorld.xz.mul(1.5), time.mul(0.5)).toVar();
            //water.x.sub(positionWorld.y);
            //water.addAssign(sin(time.mul(0.2)));
            water.assign(matrix.mul(water));
            const a = vec3(0.5).sub(water.fract()).length().toVar();
            water.assign(matrix.mul(water));
            a.assign(min(a,vec3(0.5).sub(water.fract()).length()));
            //water.assign(matrix.mul(water));
            //a.assign(min(a,vec3(0.5).sub(water.fract()).length()));

            lightIntensity.assign(up.mul(a.add(0.4).pow(8.0).mul(4.0).max(0.0)));
        });

        return vec3(1).mul(lightIntensity);
    })().toVar("waterEnvironment");

    static fogNear = 12;
    static fogFar = 30;

    constructor(renderer) {

    }

    update(elapsed) {

    }
}
