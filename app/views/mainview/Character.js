import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';
import DebugSettings from './../../DebugSettings.js';
import RayCast from './../helpers/RayCast.js';
import Constants from './../../Constants.js';
const FORCE_JUMP = 25;
const FORCE_MOVE = 0.5;
const DAMPING = 0.92;
const MASS = 1;

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export default class Character extends fw.core.viewCore {
    constructor(jumpForce = FORCE_JUMP, moveForce = FORCE_MOVE, damping = DAMPING, mass = MASS){
        super(Constants.views.CHARACTER);

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
        this._action = null;
        this._isPaused = false;
        this.addContextListeners();
        this.addViewListeners();
    }

    addContextListeners() {
        this.addContextListener(Constants.events.SIMULATION_PAUSED, this.pause);
        this.addContextListener(Constants.events.SIMULATION_RESUMED, this.resume);
    }

    addViewListeners() {
        this.addViewListener('UIButtonPressed', (data) => {
            this._keyPressed = data;
        });
        this.addViewListener('KeyPressed', this.setKeyPressed);
    }

    pause() {
        this._isPaused = true;
    }

    resume() {
        this._isPaused = false;
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
            object.position.y = -0.28;
            this.addShadows(object);

            this._mixer = new THREE.AnimationMixer( object );
            this._action = this._mixer.clipAction( object.animations[ 0 ] );
            this.animatePlayer();

            const parent = new THREE.Mesh( new THREE.CubeGeometry( 1, 1.7, 1 ), new THREE.MeshBasicMaterial({transparent:true, color:0x3333CC, opacity:0}) );
            parent.add(object);

            const opacity = DebugSettings.showRigidBody ? 0.2 : 0;
            const mesh = new Physijs.BoxMesh(
                parent.geometry,
                Physijs.createMaterial(
                    new THREE.MeshBasicMaterial({transparent:true, color:0xFF0000, opacity:opacity}),
                    0.2,
                    0
                ),
                this._mass
            );
            mesh.visible = DebugSettings.showRigidBody;

            mesh.position.set(0,0,0);
            mesh.collisions = 0;
            mesh.name = "player";
            // mesh.setCcdMotionThreshold( 1 );
            // mesh.setCcdSweptSphereRadius( 0.5 );

            this.createRayCasts(mesh);

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

    createRayCasts(mesh) {
        this.rayCastR = new RayCast(mesh.position, new THREE.Vector3(1, 0, 0));
        this.rayCastL = new RayCast(mesh.position, new THREE.Vector3(-1, 0, 0));
        this.rayCastU = new RayCast(mesh.position, new THREE.Vector3(0, 1, 0));
        this.rayCastD = new RayCast(mesh.position, new THREE.Vector3(0, -1, 0));
    }

    handlePlayerCollision(targetObject, linearVelocity, angularVelocity) {
        //console.log(`collided with:`, targetObject, ` linearV: ${linearVelocity} angularV: ${angularVelocity}`);
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

                    setTimeout(() => {
                        targetObject.__dirtyPosition = true;
                        targetObject.__dirtyRotation = true;
                        targetObject.mass = 0;
                        targetObject.position.y = targetVec.y;
                        targetObject.position.x = targetVec.x;
                        targetObject.position.z = targetVec.z;
                    }, 3000);
                }, 650);

                break;

            case "launcher":
                this._isJumping = true;
                this.character.mesh.applyCentralImpulse(new THREE.Vector3(0, targetObject.userData.launchPower, 0));
                break;

            case "spike":
                // if (targetObject.userData.isDeadly) {
                //     this.dispatchToContext(Constants.events.PLAYER_DIED);
                // }
                break;
            case "crusher":
            case "bear":
            case "bottomCatcher":
                this.dispatchToContext(Constants.events.PLAYER_DIED);
                break;
        }
    }

    respawn() {
        this.character.mesh.__dirtyPosition = true;
        this.character.mesh.position.y = 4;
        this.character.mesh.position.x = 0;
        this.character.mesh.position.z = 0;
    }

    checkRay(rc) {
        if (this.character.mesh) {
            const scene = this.character.mesh.parent;
            const intersects = rc.intersectObjects(scene.children);

            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.name == "Collectible") {
                    if (intersects[i].distance < 1) {
                        intersects[i].object.parent.remove(intersects[i].object);
                    }
                }
            }

        }
    }
    updatePlayer() {

        this.checkRay(this.rayCastR);
        this.checkRay(this.rayCastL);
        this.checkRay(this.rayCastU);
        this.checkRay(this.rayCastD);

        this.updatePlayerPosition();
        this.updatePlayerRotation();
        this.updatePlayerAnimation();
    }

    animatePlayer() {
        this._action.play();
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