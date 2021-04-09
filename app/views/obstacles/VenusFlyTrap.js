import * as THREE from './../../libs/three.module.js';
import { GLTFLoader } from './../../libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';
import DebugSettings from './../../DebugSettings.js';
import ViewUtils from './../viewutils/ViewUtils.js';

const DEG2RAD = Math.PI / 180;

export default class VenusFlyTrap extends fw.core.viewCore {
    constructor(x, y) {
        super(Constants.views.VENUS_FLY_TRAP);

        this.x = x;
        this.y = y;
        this._rotationY = 0;

        this.mesh = null;
        this.object = null;

        this.mixer = null;
        this.clock = new THREE.Clock();

        this.handleFrameUpdate = this.updateFrame.bind(this);
        this.levelFinish = this.destroy.bind(this);
        this.addContextListener(Constants.events.LEVEL_FINISHED, this.levelFinish);
        this.animId = window.requestAnimationFrame(this.handleFrameUpdate);
    }

    create(scene) {
        this.mixer = new THREE.AnimationMixer(scene);
        this.scene = scene;
        const gltfloader = new GLTFLoader();

        gltfloader.load("./assets/VenusFlyTrap.glb", (gltf) => {
            const mesh = gltf.scene.children[0];
            const clip = gltf.animations[0];
            this.addMorph(mesh, clip, 0.1, 0.5, this.x, this.y, this.z);
        });
    }

    addMorph(mesh, clip, speed, duration, x, y, z, fudgeColor)  {
        // mesh = mesh.clone();
        // mesh.material = mesh.material.clone();

        this.object = mesh;

        if (fudgeColor) {
            mesh.material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25);
        }

        const opacity = DebugSettings.showEnemies ? 0.5 : 0;

        const bMesh = new Physijs.BoxMesh(
            new THREE.CubeGeometry( 1, 8.5, 1 ),
            Physijs.createMaterial(
                new THREE.MeshBasicMaterial({transparent:true, opacity:opacity, color:0xFF0000}),
                0,
                0
            ),
            0
        );

        this.mixer.clipAction( clip, mesh )
            .play();

        bMesh.position.set(x, y, 0);
        bMesh.name = "venusFlyTrap";
        bMesh.speed = speed;

        mesh.rotation.y = 245 * DEG2RAD; //Math.PI / 2;
        mesh.scale.set(0.005, 0.005, 0.005);

        this.addShadows(mesh);

        bMesh.add(mesh);
        this.scene.add(bMesh);
        this.mesh = bMesh;
    }

    addShadows(object) {
        object.traverse( ( child ) => {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
    }

   updateFrame(delta = 0) {
        if (this.mixer && this.mesh) {
            delta = this.clock.getDelta();
            this.mixer.update(delta);
        }
       this.animId = window.requestAnimationFrame(this.handleFrameUpdate);
    }



    destroy() {
        window.cancelAnimationFrame(this.animId);

        if (this.object && this.mesh) {
            ViewUtils.destroy(this.object);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        this.mesh = null;
        this.object = null;
        this.scene = null;
        this.mixer = null;
        this.clock = null;
        this.handleFrameUpdate = null;
        this.levelFinish = null;
        this.removeView();
        console.log("venus destroyed");
    }
}