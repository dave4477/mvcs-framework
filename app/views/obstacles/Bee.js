import * as THREE from './../../libs/three.module.js';
import { GLTFLoader } from './../../libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';
import ViewUtils from './../viewutils/ViewUtils.js';
import DebugSettings from './../../DebugSettings.js';
const DEG2RAD = Math.PI / 180;

export default class Bee extends fw.core.viewCore {
    constructor(x, y, z, endX, time = 2000) {
        super(Constants.views.BEE);

        this.x = x;
        this.y = y;
        this.z = z;
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

        // this.gltf = ObjectsPreloader.getCache()["bee"];
        this.addViewListener('frameUpdate', this.updateFrame);
    }

    create(scene) {
        this.mixer = new THREE.AnimationMixer(scene);
        this.scene = scene;

        const gltfloader = new GLTFLoader();
        gltfloader.load("./assets/Bee.glb", (gltf) => {
            const mesh = gltf.scene.children[0];
            const clip = gltf.animations[0];

            this.addMorph(mesh, clip, 0.1, this.x, this.y, this.z);
            // this.addTweens();
        });
    }

    addMorph(mesh, clip, speed, x, y, z, fudgeColor)  {

        this.object = mesh;


        if (fudgeColor) {
            this.object.material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25);
        }

        const opacity = DebugSettings.showEnemies ? 0.5 : 0;
        const bMesh = new Physijs.BoxMesh(
            new THREE.CubeGeometry( 0.9, 0.35, 0.9 ),
            Physijs.createMaterial(
                new THREE.MeshPhongMaterial({transparent:true, opacity:opacity, color:0xFF0000}),
                0,
                0
            ),
            0
        );

        this.mixer.clipAction( clip, this.object ).play();

        bMesh.position.set(x, y, z);
        bMesh.name = "bee";
        bMesh.speed = speed;


        this.object.rotation.y = Math.PI / 2;
        this.object.scale.set(0.0005, 0.0005, 0.0005);
        this.object.position.y = -0.5;
        this.addShadows(this.object);

        bMesh.add(this.object);
        this.scene.add(bMesh);
        this.morphs.push(bMesh);
        this.mesh = bMesh;
        bMesh.addEventListener('ready', () => {
            this.dispatchToView('BeeObjectLoaded');
        });

    }

    addShadows(object) {
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
    }


    addTweens() {
        this.tweenHover = new TWEEN.Tween({y:this.y})
            .to({y: this.y + 0.8}, 250)
            .repeat(999)
            .yoyo(true)
            .onUpdate((object) =>{
                if (this.mesh) {
                    this.mesh.position.y = object.y;
                }
            })
            .start();

        this.tweenBackward = new TWEEN.Tween({x:this.walkTo})
            .to({x: this.x}, this.time)
            .easing(TWEEN.Easing.Quadratic.Out)
            //.easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate((object) => {
                this.mesh.__dirtyPosition = true;
                this.mesh.position.x = object.x;
            })
            .delay(1000)
            .onComplete((object) => {
                this._rotation.direction = "right";
                this._rotation.rotating = true;
                // setTimeout(()=>{
                    this.tweenForward.start();
                // }, 1000);
            });

        this.tweenForward = new TWEEN.Tween({x:this.x})
            .to({x: this.walkTo}, this.time)
            .easing(TWEEN.Easing.Quadratic.Out)
            .delay(1000)
            .onUpdate((object) => {
                this.mesh.__dirtyPosition = true;
                this.mesh.position.x = object.x;
            })
            .onComplete((object) => {
                this._rotation.direction = "left";
                this._rotation.rotating = true;
                // setTimeout(()=>{
                    this.tweenBackward.start();
                // }, 1000);
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

    destroy() {
        this.removeViewListener('frameUpdate', this.updateFrame);
        TWEEN.removeAll();

        ViewUtils.destroy(this.object);
        
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.tweenBackward = null;
        this.tweenForward = null;
        this.clock = null;
        this.mesh = null;
        this.mixer = null;
        this.object = null;
        this.morphs = [];
    }

    updateFrame(delta = 0) {
        delta = this.clock.getDelta();

        if (this.mixer && this.mesh) {
            this.mixer.update(delta);
            TWEEN.update();
            this.changeDirection();
        }
    }
}