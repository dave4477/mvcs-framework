import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';
import Constants from './../../Constants.js';
const DEG2RAD = Math.PI / 180;



export default class Bear extends fw.core.viewCore {
    constructor(x, y, walkTo, time = 2000) {
        super(Constants.views.BEAR);
        this.mesh = null;
        this.object = null;
        this.x = x;
        this.y = y;
        this.time = time;
        this.walkTo = walkTo;
        this.objectLoader = new ObjectLoaders();
        this.tweenForward = null;
        this.tweenBackward = null;
        this._rotationY = 0;
        this._rotation = { rotating: false, direction:"right"};

    }

    create(container) {
        this.objectLoader.loadFBX('./assets/bear/Bear_Big.fbx').then((object) => {

            const scale = 0.012;

            object.scale.set(scale, scale, scale);
            object.position.y = -1.3;
            object.rotation.y = 0;

            this.object = object;

            this.addShadows(object);

            const mesh = new Physijs.BoxMesh(
                new THREE.CubeGeometry( 1, 2.7, 1 ),
                Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({transparent:true, opacity:0.0, color:0xFF0000}),
                    1,
                    0.5
                ),
                0
            );
            mesh.position.x = this.x;
            mesh.position.y = this.y + 1;
            mesh.position.z = 0;
            mesh.add(object);
            mesh.name = "bear";
            this.mesh = mesh;

            container.add(mesh);

            this.addTweens();
            this.addViewListener('frameUpdate', this.frameUpdate);
        });
    }

    addTweens() {
        this.tweenBackward = new TWEEN.Tween({x:this.walkTo})
            .to({x: this.x}, this.time)
            .easing(TWEEN.Easing.Quadratic.Out)
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
            .easing(TWEEN.Easing.Quadratic.Out)
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

    rotateBear() {
        if (this._rotation.rotating) {
            if (this._rotation.direction == "left") {
                if (this._rotationY < 0) {
                    this._rotationY += 10;
                }
                if (this._rotationY >= 0) {
                    this._rotationY = 0;
                    this._rotation.rotating = false;
                }
                this.object.rotation.y = this._rotationY * (DEG2RAD);
            } else if (this._rotation.direction == "right") {
                this._rotationY -= 10;
                if (this._rotationY < -180) {
                    this._rotationY = -180;
                    this._rotation.rotating = false;
                }
                this.object.rotation.y = this._rotationY * DEG2RAD;
            }
        }
    }

    addShadows(object) {
        object.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );
    }

    frameUpdate() {
        TWEEN.update();
        this.rotateBear();
    }
}