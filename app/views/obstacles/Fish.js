import * as THREE from './../../../app/libs/three.module.js';
import { GLTFLoader } from './../../../app/libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';
import ObjectsPreloader from './../helpers/ObjectsPreloader.js';
import DebugSettings from './../../DebugSettings.js';
const DEG2RAD = Math.PI / 180;

export default class Fish extends fw.core.viewCore {
    constructor(x, y, z, endX, time = 2000) {
        super(Constants.views.FISH);

        this.x = x;
        this.y = y;
        this.z = z;
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
                new THREE.CubeGeometry(1, 1, 1),
                Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({transparent: true, opacity: opacity, color: 0xFF0000}),
                    0,
                    0
                ),
                0
            );


            bMesh.position.set(x, y, z);
            bMesh.name = "parrot";
            bMesh.speed = speed;

            mesh.rotation.y = Math.PI / 2;
            mesh.scale.set(0.025, 0.025, 0.025);

            mesh.castShadow = true;
            mesh.receiveShadow = false;

            bMesh.add(mesh);
            this.scene.add(bMesh);
            this.mesh = bMesh;
        });
    }

    addTweens() {
    }

    changeDirection() {
        if (this._rotation.rotating) {
            if (this._rotation.direction == "left") {
                if (this._rotationY > -100) {
                    this._rotationY -= 10;
                }
                if (this._rotationY <= -100) {
                    this._rotationY = -100;
                    this._rotation.rotating = false;
                }
                this.object.rotation.y = this._rotationY * (DEG2RAD);
            } else if (this._rotation.direction == "right") {
                this._rotationY += 10;
                if (this._rotationY > 80) {
                    this._rotationY = 80;
                    this._rotation.rotating = false;
                }
                this.object.rotation.y = this._rotationY * DEG2RAD;
            }
        }
    }

    updateFrame(delta = 0) {
        delta = this.clock.getDelta();

        if (this.mesh) {
            TWEEN.update();
            this.changeDirection();
        }
    }
}