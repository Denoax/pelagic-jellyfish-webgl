import * as THREE from "three/webgpu";
import {pass, mrt, output, float, vec4, Fn, clamp, vec3} from "three/tsl";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

import { Lights } from "./lights";
import { conf } from "./conf";
import { VerletPhysics } from "./physics/verletPhysics";
import { VertexVisualizer } from "./physics/vertexVisualizer";
import {SpringVisualizer} from "./physics/springVisualizer";
import {Medusa} from "./medusa";
import {MedusaVerletBridge} from "./medusaVerletBridge";
import {Background} from "./background";
import {Plankton} from "./plankton";
import {Godrays} from "./godrays";

class App {
    renderer = null;

    camera = null;

    scene = null;

    controls = null;

    lights = null;

    stats = null;

    physics = null;

    vertexVisualizer = null;

    springVisualizer = null;

    frameNum = 0;

    simulationEnabled = true;

    constructor(renderer, { jellyfishCount = 10, presentationOnly = false } = {}){
        console.time("firstFrame");
        this.renderer = renderer;
        this.jellyfishCount = jellyfishCount;
        this.presentationOnly = presentationOnly;
    }

    async init(progressCallback) {
        conf.init();
        await this.renderer.init();
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.01, 30);
        this.camera.position.set(0, 0, 15);
        this.camera.lookAt(0, 0, 0);
        this.camera.updateProjectionMatrix();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minPolarAngle = Math.PI * 0.25;
        this.controls.maxPolarAngle = Math.PI * 0.75;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 25;
        this.controls.enablePan = false;

        await progressCallback(0.1);

        if (!this.presentationOnly) this.physics = new VerletPhysics(this.renderer);

        await progressCallback(0.3);

        this.lights = new Lights();
        this.scene.add(this.lights.object);

        this.background = new Background(this.renderer);
        this.scene.environmentNode = Background.envFunction;
        this.scene.environmentIntensity = 0.3;
        this.scene.backgroundNode = Background.fogFunction;
        this.scene.fogNode = Background.waterFog;

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        await progressCallback(0.4);

        if (!this.presentationOnly) await Medusa.initStatic(this.physics);

        await progressCallback(0.5);

        this.bridge = this.presentationOnly ? { medusae: [] } : new MedusaVerletBridge(this.physics);

        for (let i=0; i<this.jellyfishCount; i++) {
            if (this.presentationOnly) {
                // The current art uses LivingAppendages' own soft-body state.
                // Keep the director's actor interface, not a second invisible
                // animal, spring buffers and compute kernels behind each one.
                this.bridge.medusae.push({
                    transformationObject: new THREE.Object3D(),
                    bell: { object: new THREE.Object3D() },
                    arms: { object: new THREE.Object3D() },
                    tentacles: { object: new THREE.Object3D() },
                });
                continue;
            }
            const medusa = new Medusa(this.renderer, this.physics, this.bridge);
            this.scene.add(medusa.object);
            this.physics.addObject(medusa);
        }
        this.physics?.addObject(this.bridge);

        await progressCallback(0.6);

        if (this.physics) await this.physics.bake();

        await progressCallback(0.7);

        this.vertexVisualizer = this.physics ? new VertexVisualizer(this.physics) : null;
        //this.scene.add(this.vertexVisualizer.object);
        this.springVisualizer = this.physics ? new SpringVisualizer(this.physics) : { object: new THREE.Object3D() };
        this.scene.add(this.springVisualizer.object);

        await progressCallback(0.8);

        this.plankton = new Plankton();
        this.scene.add(this.plankton.object);

        await progressCallback(0.9);
        this.godrays = this.physics ? new Godrays(this.bridge) : { object: new THREE.Object3D() };
        this.scene.add(this.godrays.object);

        const scenePass = pass(this.scene, this.camera);
        scenePass.setMRT( mrt( {
            output,
            bloomIntensity: float( 0 ) // default bloom intensity
        } ) );

        const outputPass = scenePass.getTextureNode();
        const bloomIntensityPass = scenePass.getTextureNode( 'bloomIntensity' );

        const bloomPass = bloom(Fn(() => {
            const bloomIntensity = bloomIntensityPass.r;
            const charge = bloomIntensityPass.g;
            const colorMask = vec3(1.0 - charge * 0.5, 1.0 - charge, 1.0);

            return vec4(outputPass.rgb * bloomIntensity * colorMask, 1);
        })());

        const postProcessing = new THREE.PostProcessing(this.renderer);
        postProcessing.outputColorTransform = false;
        postProcessing.outputNode = Fn(() => {
            const bloomIntensity = bloomIntensityPass.r;
            const charge = bloomIntensityPass.g;

            const bloomMask = (1.0 - clamp(bloomIntensity, 0, 1)) + charge;
            const finalBloom = bloomPass.rgb * clamp(bloomMask, 0, 1);
            return vec4(outputPass.rgb + finalBloom.rgb, 1.0).renderOutput();
        })();

        this.postProcessing = postProcessing;
        this.bloomPass = bloomPass;

        this.bloomPass.threshold.value = 0.001;
        this.bloomPass.strength.value = 0.4;
        this.bloomPass.radius.value = 0.8;

        this.raycaster = new THREE.Raycaster();
        this.pointerHandler = (event) => { this.onMouseMove(event); };
        this.renderer.domElement.addEventListener("pointermove", this.pointerHandler, { passive: true });


        await progressCallback(1.0, 100);
    }

    onMouseMove(event) {
        const pointer = new THREE.Vector2();
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(pointer, this.camera);
        this.physics?.setMouseRay(this.raycaster.ray.origin, this.raycaster.ray.direction);
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    setSimulationEnabled(enabled) {
        this.simulationEnabled = enabled;
        if (!enabled) {
            this.springVisualizer.object.visible = false;
            this.godrays.object.visible = false;
        }
    }

    updatePointer() {
        this.bridge.medusae.forEach(medusa => {
            medusa.updatePointerInteraction(this.raycaster.ray);
        });
    }

    sortMedusae() {
        this.bridge.medusae.forEach(medusa => {
           medusa.distance = this.camera.position.distanceTo(medusa.transformationObject.position);
        });
        const sorted = [...this.bridge.medusae].sort((m1,m2) => m1.distance - m2.distance);
        let z = 10;
        for (let i = 0; i < sorted.length; i++) {
            const m = sorted[i];
            m.bell.geometryInside.object.renderOrder = z++;
            m.arms.object.renderOrder = z++;
            m.tentacles.object.renderOrder = z++;
            m.bell.geometryOutside.object.renderOrder = z++;
        }
    }

    async update(delta, elapsed, { interactionMode = false, renderScene = null } = {}) {
        conf.begin();
        const { runSimulation, showVerletSprings } = conf;
        this.springVisualizer.object.visible = showVerletSprings;

        conf.update();
        if (this.controls.enabled) this.controls.update(delta);
        if (!this.presentationOnly) Medusa.updateStatic();

        this.background.update(elapsed);
        this.lights.update(elapsed);

        if (this.simulationEnabled) this.updatePointer();

        if (runSimulation && this.simulationEnabled) {
            await this.physics.update(delta, elapsed);
        }
        if (this.simulationEnabled) this.sortMedusae();

        //this.renderer.render(this.scene, this.camera);

        if (interactionMode) {
            if (renderScene) await renderScene();
            else await this.renderer.renderAsync(this.scene, this.camera);
        }
        else await this.postProcessing.renderAsync();

        if (this.frameNum === 0) {
            console.timeEnd("firstFrame");
        }
        this.frameNum++
        conf.end();
    }

    dispose() {
        this.renderer.domElement.removeEventListener("pointermove", this.pointerHandler);
        this.controls?.dispose();
    }
}
export default App;
