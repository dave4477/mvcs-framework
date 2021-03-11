import * as THREE from './../../libs/three.module.js';
import { GLTFLoader } from './../../libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';
import ViewUtils from './../viewutils/ViewUtils.js';
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
        this._rotationX = 0;
        this._rotationY = -90;
        this._rotation = { rotating: false, direction:"up"};
        this._interval = null;
        this._timeout = null;
        this.mesh = null;
        this.object = null;

        this.addViewListener('frameUpdate', this.updateFrame);
    }

    create(scene) {
        this.scene = scene;
        const gltfloader = new GLTFLoader();

        gltfloader.load("./assets/Fish.glb", (gltf) => {
            const mesh = gltf.scene;

            this.object = mesh;

            const opacity = DebugSettings.showEnemies ? 0.5 : 0;

            const bMesh = new Physijs.BoxMesh(
                new THREE.CubeGeometry(0.5, 1.2, 0.5),
                Physijs.createMaterial(
                    new THREE.MeshBasicMaterial({transparent: true, opacity: opacity, color: 0xFF0000}),
                    1,
                    0
                ),
                1
            );

            bMesh.position.set(this.x, this.y, this.z);
            bMesh.name = "fish";
            bMesh.userData = {owner:this};
            mesh.rotation.set(-90 * DEG2RAD, 0, -90 * DEG2RAD);
            mesh.scale.set(0.04, 0.04, 0.04);
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            bMesh.addEventListener('ready', this.objectReady.bind(this));
            bMesh.add(mesh);
            this.scene.add(bMesh);
            this.mesh = bMesh;
        });
    }

    objectReady() {
        this._timeout = setTimeout(() =>{
            this._interval = setInterval(()=>{
                this._rotationX = -90;
                this.object.rotation.set(this._rotationX * DEG2RAD, 0, this._rotationX * DEG2RAD);
                this._rotation.direction = "up";
                this.mesh.applyCentralImpulse(new THREE.Vector3(0, this.force, 0));
            }, this.duration)
        }, this.delay);
    }


    changeDirection() {
        if (this._rotation.rotating) {
            if (this._rotation.direction == "down") {
                if (this._rotationX < 90) {
                    this._rotationX += 10;
                }
                if (this._rotationX >= 90) {
                    this._rotationX = 90;
                    this._rotation.rotating = false;
                }
                this.object.rotation.set(this._rotationX * DEG2RAD, 0, this._rotationX * DEG2RAD);
            }
        }
    }

    updateFrame(delta = 0) {
        if (this.mesh) {
            this.mesh.setAngularFactor(new THREE.Vector3(0,0,0));
            this.mesh.position.x = this.x;
            if (this.mesh.getLinearVelocity().y < 0) {
                this._rotation.direction = "down";
                this._rotation.rotating = true;
                this.changeDirection();
            }
        }
    }

    destroy() {
        this.removeViewListener('frameUpdate', this.updateFrame);
        
        clearTimeout(this._timeout);
        clearInterval(this._interval);
        this.mesh.userData.owner = null;
        this.mesh.userData = null;
        ViewUtils.destroy(this.object);
        ViewUtils.destroy(this.mesh);
        this.mesh = null;
        this.object = null;
    }
}