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
    mix, output, vec4
} from "three/tsl";
import {Lights} from "./lights.js";

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

    // The background and submerged fragments share one directional radiance.
    // No unrelated mesh-edge color, and no expensive raymarch at every pixel.
    static waterRadiance = Fn(([ray]) => {
        const up = ray.y.mul(0.5).add(0.5).clamp(0, 1);
        const surface = mix(vec3(0.003, 0.023, 0.050), vec3(0.001, 0.008, 0.015), Background.depth);
        const water = surface.mul(up.pow(1.6).mul(0.85).add(0.15)).toVar();
        const shaft = sin(ray.x.mul(26).add(ray.z.mul(12)).add(time.mul(0.035)))
            .mul(0.5).add(0.5).pow(24);
        water.addAssign(vec3(0.006, 0.027, 0.040).mul(shaft).mul(up.pow(5))
            .mul(Background.depth.oneMinus()).mul(0.28));
        return water;
    });

    static fogFunction = Fn(() => {
        const ray = positionWorld.sub(cameraPosition).normalize();
        return Background.waterRadiance(ray).add(hash23(screenUV).sub(0.5).mul(0.00018));
    })();

    static waterFog = Fn(() => {
        const ray = positionWorld.sub(cameraPosition);
        const distance = ray.length().sub(12).max(0);
        const extinction = vec3(0.11, 0.078, 0.060).mul(mix(0.5, 1.0, Background.depth));
        const transmission = extinction.mul(distance.pow(1.5)).negate().exp();
        // Capture Output before the material assigns its final Output again.
        // An inline reference would evaluate absorption a second time.
        return vec4(mix(Background.waterRadiance(ray.normalize()), output.rgb, transmission), output.a).toVar();
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
