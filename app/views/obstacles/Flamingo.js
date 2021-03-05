import * as THREE from './../../../app/libs/three.module.js';
import { GLTFLoader } from './../../../app/libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';
import DebugSettings from './../../DebugSettings.js';
const DEG2RAD = Math.PI / 180;

export default class Flamingo extends fw.core.viewCore {
    constructor(x, y, endX, time = 2000) {
        super(Constants.views.FLAMINGO);

        this.x = x;
        this.y = y;
        this.time = time;
        this.walkTo = endX;
        this.tweenForward = null;
        this.tweenBackward = null;
        this._rotationY = 0;
        this._rotation = { rotating: false, direction:"right"};

        this.mesh = null;
        this.object = null;

        this.mixer = null;
        this.morphs = [];
        this.clock = new THREE.Clock();

        this.addViewListener('frameUpdate', this.updateFrame);
    }

    create(scene) {
        this.mixer = new THREE.AnimationMixer(scene);
        this.scene = scene;
        const gltfloader = new GLTFLoader();

        gltfloader.load("./assets/Flamingo.glb", (gltf) => {
            const mesh = gltf.scene.children[0];
            const clip = gltf.animations[0];
            this.addMorph(mesh, clip, 0.1, 0.5, this.x, this.y, this.z);
            this.addTweens();
        });
    }

    addMorph(mesh, clip, speed, duration, x, y, z, fudgeColor)  {
        mesh = mesh.clone();
        mesh.material = mesh.material.clone();

        this.object = mesh;

        if (fudgeColor) {
            mesh.material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25);
        }

        const opacity = DebugSettings.showEnemies ? 0.5 : 0;
        
        const bMesh = new Physijs.BoxMesh(
            new THREE.CubeGeometry( 3.4, 0.6, 1 ),
            Physijs.createMaterial(
                new THREE.MeshPhongMaterial({transparent:true, opacity:opacity, color:0xFF0000}),
                0,
                0
            ),
            0
        );

        this.mixer.clipAction( clip, mesh )
            .setDuration( duration )
            .startAt( - duration * Math.random() )
            .play();

        bMesh.position.set(x, y, 0);
        bMesh.name = "flamingo";
        bMesh.speed = speed;
        bMesh.userData = {owner:this};
        mesh.rotation.y = Math.PI / 2;
        mesh.scale.set(0.02, 0.02, 0.02);

        mesh.castShadow = true;
        mesh.receiveShadow = false;

        bMesh.add(mesh);
        this.scene.add(bMesh);
        this.morphs.push(bMesh);
        this.mesh = bMesh;
    }


    addTweens() {
        this.tweenBackward = new TWEEN.Tween({x:this.walkTo})
            .to({x: this.x}, this.time)
            //.easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate((object) => {
                this.mesh.__dirtyPosition = true;
                this.mesh.position.x = object.x;
            })
            .onComplete((object) => {
                this._rotation.direction = "right";
                this._rotation.rotating = true;
                this.tweenForward.start();
            });

        this.tweenForward = new TWEEN.Tween({x:this.x})
            .to({x: this.walkTo}, this.time)
            // .repeat(Infinity)
            // .yoyo(true)
            //.easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate((object) => {
                this.mesh.__dirtyPosition = true;
                this.mesh.position.x = object.x;
            })
            .onComplete((object) => {
                this._rotation.direction = "left";
                this._rotation.rotating = true;
                this.tweenBackward.start();
            })
            .start();
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

        if (this.mixer && this.mesh) {
            this.mixer.update(delta);
            TWEEN.update();
            this.changeDirection();
        }
    }

    destroy() {
        this.removeViewListener('frameUpdate', this.updateFrame);
        TWEEN.removeAll();

        this.object.traverse( function ( child ) {
            if ( child.isMesh ) {
                if (child.geometry && child.geometry.dispose) {
                    child.geometry.dispose();
                }
                if (child.material && child.material.dispose) {
                    if (child.material.map && child.material.map.dispose) {
                        child.material.map.dispose();
                    }
                    child.material.dispose();
                }
            }
        } );
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh.userData = null;
        this.mesh = null;
        this.object = null;
        this.scene = null;
        this.mixer = null;
        this.morphs = [];
        this.clock = null;
        this.tweenBackward = null;
        this.tweenForward = null;
    }
}