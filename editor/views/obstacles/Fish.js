import * as THREE from './../../libs/three.module.js';
import { GLTFLoader } from './../../libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';
import ObjectsPreloader from './../helpers/ObjectsPreloader.js';
import DebugSettings from './../../DebugSettings.js';
const DEG2RAD = Math.PI / 180;

export default class Fish extends fw.core.viewCore {
    constructor(x, y, z, delay = 0, time = 3000, force = 40) {
        super(Constants.views.FISH);

        this.x = x;
        this.y = y;
        this.z = z;
        this.delay = delay;
        this.duration = time;
        this.force = force;
        this._rotationY = 0;
        this._rotation = { rotating: false, direction:"right"};

        this.mesh = null;
        this.object = null;

        this.clock = new THREE.Clock();

        this.addViewListener('frameUpdate', this.updateFrame);
    }

    create(scene) {
        this.scene = scene;
        const gltfloader = new GLTFLoader();

        gltfloader.load("./assets/Fish.glb", (gltf) => {
            const mesh = gltf.scene.children[0];

            this.object = mesh;

            const opacity = DebugSettings.showEnemies ? 0.5 : 0;

            const bMesh = new Physijs.BoxMesh(
                new THREE.CubeGeometry(1, 0.5, 1),
                Physijs.createMaterial(
                    new THREE.MeshBasicMaterial({transparent: true, opacity: opacity, color: 0xFF0000}),
                    1,
                    0
                ),
                1
            );


            bMesh.position.set(this.x, this.y, this.z);
            bMesh.name = "fish";

            mesh.rotation.set(0, 90 * DEG2RAD, 0);
            mesh.scale.set(0.1, 0.1, 0.1);
            mesh.position.y = -0.4;
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            bMesh.addEventListener('ready', this.objectReady.bind(this));
            bMesh.add(mesh);
            this.scene.add(bMesh);
            this.mesh = bMesh;
        });
    }

    objectReady() {
        setTimeout(() =>{
            setInterval(()=>{
                this.mesh.applyCentralImpulse(new THREE.Vector3(0, this.force, 0));
            }, this.duration)
        }, this.delay);
    }

    addTweens() {
    }

    changeDirection() {
        if (this._rotation.rotating) {
            if (this._rotation.direction == "left") {
                if (this._rotationY > -90) {
                    this._rotationY -= 10;
                }
                if (this._rotationY <= -90) {
                    this._rotationY = -90;
                    this._rotation.rotating = false;
                }
                this.object.rotation.y = this._rotationY * (DEG2RAD);
            } else if (this._rotation.direction == "right") {
                this._rotationY += 10;
                if (this._rotationY > 90) {
                    this._rotationY = 90;
                    this._rotation.rotating = false;
                }
                this.object.rotation.y = this._rotationY * DEG2RAD;
            }
        }
    }

    updateFrame(delta = 0) {
        delta = this.clock.getDelta();

        if (this.mesh) {
            this.mesh.setAngularFactor(new THREE.Vector3(0,0,0));
            this.mesh.position.x = this.x;
            this.object.rotation.y += 0.1;
        }
    }
}