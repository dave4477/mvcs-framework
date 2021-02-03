import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from './ObjectLoaders.js';
import DebugSettings from './../../DebugSettings.js';

const FORCE_JUMP = 25;
const FORCE_MOVE = 0.8;
const DAMPING = 0.92;
const MASS = 1;

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export default class Character extends fw.core.viewCore {
    constructor(jumpForce = FORCE_JUMP, moveForce = FORCE_MOVE, damping = DAMPING, mass = MASS){
        super("Character");

        this.character = {};
        this.objectLoader = new ObjectLoaders();

        this._jumpForce = jumpForce;
        this._moveForce = moveForce;
        this._damping = damping;
        this._mass = mass;
        this._keyPressed = null;
        this._isJumping = false;
        this._rotationY = 0;
        this._rotation = { rotating: false, direction:"right"};
        this._mixer = null;
        this._clock = new THREE.Clock();
        this.addViewListeners();
    }

    addViewListeners() {
        this.addViewListener('UIButtonPressed', (data) => {
            this._keyPressed = data;
        });
        this.addViewListener('KeyPressed', this.setKeyPressed);
    }

    setKeyPressed(value) {
        this._keyPressed = value;
    }

    set keyPressed(value) {
        this._keyPressed = value;
    }

    // Have some setters for the physics, so we can change them on-the-fly.
    set isJumping(value) {
        this._isJumping = value;
    }

    get isJumping() {
        return this._isJumping;
    }

    set jumpForce(value) {
        this._jumpForce = value;
    }

    set mass(value) {
        this._mass = value;
    }

    set moveForce(value) {
        this._moveForce = value;
    }

    set damping(value) {
        this._damping = value;
    }
    
    create() {
        this.objectLoader.loadFBX('./assets/monkey/Monkey_animated/monkey.FBX').then((object) => {

            object.rotation.y = 96.5;
            object.scale.x = 0.01;
            object.scale.y = 0.01;
            object.scale.z = 0.01;
            object.position.y = 0.1;
            this.addShadows(object);

            this._mixer = new THREE.AnimationMixer( object );
            const action = this._mixer.clipAction( object.animations[ 0 ] );
            action.play();

            const parent = new THREE.Mesh( new THREE.CubeGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial({transparent:true, color:0x3333CC, opacity:0}) );
            parent.add(object);
            
            const mesh = new Physijs.BoxMesh(
                parent.geometry,
                Physijs.createMaterial(
                    new THREE.MeshBasicMaterial({color:0xFF0000}),
                    0.2,
                    0.2
                ),
                this._mass
            );
            mesh.visible = DebugSettings.showRigidBody;

            mesh.position.y = 0;
            mesh.position.x = 0;
            mesh.position.z = 0;

            mesh.addEventListener('collision', this.handlePlayerCollision.bind(this));
            mesh.setAngularFactor(new THREE.Vector3(0,0,0));
            this.character = { model: parent, mesh: mesh };
            this.dispatchToView('ObjectLoaded', this.character);
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
    createA() {
        // const path = './assets/';
        // const mtl = 'fat_cat_obj.mtl';
        // const obj = 'fat_cat_obj.obj';

        const path = './assets/bird/';
        const mtl = '12248_Bird_v1_L2.mtl';
        const obj = '12248_Bird_v1_L2.obj';

        this.objectLoader.loadObjMTL(path, mtl, path, obj).then((object) => {

            object.rotation.x = -90 * DEG2RAD;
            object.rotation.z = 90 * DEG2RAD;

            this.addShadows(object);

            //object.rotation.y = 96.5;
            const parent = new THREE.Mesh( new THREE.CubeGeometry( 1, 1.2, 1 ), new THREE.MeshBasicMaterial({color:0xCC3333}) );
            parent.position.y = 0.5;
            parent.position.x = 0;
            parent.position.z = 0;
            parent.scale.x = 0.02;
            parent.scale.y = 0.02;
            parent.scale.z = 0.02;
            parent.add(object);

            const mesh = new Physijs.BoxMesh(
                parent.geometry,
                Physijs.createMaterial(
                    new THREE.MeshBasicMaterial({color:0xCC3333}),
                    0.2,
                    0.2
                ),
                this._mass
            );
            mesh.visible = SHOW_RIGID_BODY;

            mesh.position.y = 0.4;
            mesh.position.x = 0;
            mesh.position.z = 0;

            mesh.addEventListener('collision', this.handlePlayerCollision.bind(this));
            mesh.setAngularFactor(new THREE.Vector3(0,0,0));
            this.character = { model: parent, mesh: mesh };
            this.dispatchToView('ObjectLoaded', this.character);
        });
    }

    handlePlayerCollision(targetObject, linearVelocity, angularVelocity) {
        //console.log(`collided with:  ${targetObject} linearV: ${linearVelocity} angularV: ${angularVelocity}`);
        switch (targetObject.name) {
            case "ground":
            case "box":
                this._isJumping = false;
                break;

            case "ground-falling":
                const targetVec = targetObject.position.clone();
                this._isJumping = false;
                setTimeout(() => {
                    targetObject.mass = 1;
                }, 750);
                setTimeout(() => {
                    targetObject.__dirtyPosition = true;
                    targetObject.__dirtyRotation = true;

                    targetObject.mass = 0;
                    targetObject.position.set(targetVec);
                    targetObject.rotation.set(new THREE.Vector3(0,0,0));
                }, 3000);
                break;

            case "bottomCatcher":
                this.character.mesh.__dirtyPosition = true;
                this.character.mesh.position.y = 4;
                this.character.mesh.position.x = 0;
                this.character.mesh.position.z = 0;
                break;
        }
    }

    updatePlayer() {
        this.updatePlayerPosition();
        this.updatePlayerRotation();
        this.updatePlayerAnimation();
    }

    updatePlayerPosition() {
        const linearDamping = this._damping;
        const player = this.character.mesh;
        const model = this.character.model;

        player.setDamping(linearDamping, 0);
        player.setAngularVelocity(new THREE.Vector3(0, 0, 0));
        player.setAngularFactor(new THREE.Vector3(0, 0, 0));

        if (this._keyPressed) {
            if (this._keyPressed["ArrowRight"]) {
                player.applyCentralImpulse(new THREE.Vector3(this._moveForce, 0, 0));
                this._rotation.rotating = true;
                this._rotation.direction = "right";
            } else if (this._keyPressed["ArrowLeft"]) { // == "ArrowLeft") {
                player.applyCentralImpulse(new THREE.Vector3(-this._moveForce, 0, 0));
                this._rotation.rotating = true;
                this._rotation.direction = "left";

            }
            if (this._keyPressed["Space"] && !this._isJumping) {
                this._isJumping = true;
                player.applyCentralImpulse(new THREE.Vector3(0, this._jumpForce, 0));
            }
        }
        model.position.x = player.position.x;
        model.position.y = player.position.y - 0.55;
        player.position.z = 0;
    }

    updatePlayerRotation() {
        if (this._rotation.rotating) {
            if (this._rotation.direction == "left") {
                this._rotationY -= 20;
                if (this._rotationY < -180) {
                    this._rotationY = -180;
                    this._rotation.rotating = false;
                }
                this.character.model.rotation.y = this._rotationY * (DEG2RAD);
            } else if (this._rotation.direction == "right") {
                if (this._rotationY < 0) {
                    this._rotationY += 20;
                }
                if (this._rotationY >= 0) {
                    this._rotationY = 0;
                    this._rotation.rotating = false;
                }
                this.character.model.rotation.y = this._rotationY * DEG2RAD;
            }
        }

    }

    updatePlayerAnimation() {
        const delta = this._clock.getDelta();

        if ( this._mixer ) this._mixer.update( delta );
    }
}