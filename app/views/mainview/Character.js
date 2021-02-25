import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';
import DebugSettings from './../../DebugSettings.js';
import RayCast from './../helpers/RayCast.js';
import Constants from './../../Constants.js';
import { GLTFLoader } from './../../../app/libs/jsm/loaders/GLTFLoader.js';

const FORCE_JUMP = 25;
const FORCE_MOVE = 0.5;
const DAMPING = 0.92;
const MASS = 1;

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];

export default class Character extends fw.core.viewCore {
    constructor(jumpForce = FORCE_JUMP, moveForce = FORCE_MOVE, damping = DAMPING, mass = MASS){
        super(Constants.views.CHARACTER);

        this.character = {};
        this.objectLoader = new ObjectLoaders();

        this._actions = {};
        this.previousAction = null;
        this.activeAction = null;

        this.isWalking = false;
        this.isIdle = true;


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
        this._isAlive = true;
        this.addContextListeners();
        this.addViewListeners();
    }

    addContextListeners() {
        this.addContextListener(Constants.events.SIMULATION_PAUSED, this.pause);
        this.addContextListener(Constants.events.SIMULATION_RESUMED, this.resume);
        this.addContextListener(Constants.events.PLAYER_MODEL_UPDATED, this.playerUpdated);
    }

    playerUpdated(data) {
        this._isAlive = data.alive;
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
        const gltfloader = new GLTFLoader();

        gltfloader.load("./assets/RobotExpressive.glb", (gltf) => {
            const mesh = gltf.scene.children[0];
            const clip = gltf.animations[0];
            const parent = new THREE.Mesh( new THREE.CubeGeometry( 1, 1.7, 1 ), new THREE.MeshBasicMaterial({transparent:true, color:0x00FF00, opacity:0}) );
            mesh.rotation.y = 65 * DEG2RAD;
            mesh.scale.x = 0.4;
            mesh.scale.y = 0.4;
            mesh.scale.z = 0.4;
            mesh.position.y = -0.32;
            this.addShadows(mesh);


            parent.add(mesh);

            const opacity = DebugSettings.showRigidBody ? 0.2 : 0;
            const player = new Physijs.BoxMesh(
                parent.geometry,
                Physijs.createMaterial(
                    new THREE.MeshBasicMaterial({transparent:true, color:0xFF0000, opacity:opacity}),
                    0.2,
                    0
                ),
                this._mass
            );
            player.visible = DebugSettings.showRigidBody;

            player.position.set(0,0,0);
            player.collisions = 0;
            player.name = "player";

            this._mixer = new THREE.AnimationMixer( mesh );

            const animations = gltf.animations;

            for ( let i = 0; i < animations.length; i ++ ) {

                const clip = animations[i];
                const action = this._mixer.clipAction(clip);
                this._actions[clip.name] = action;

                if ( emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4 ) {

                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;

                }
            }
            this.activeAction = this._actions[ 'Idle' ];
            this.activeAction.play();

            player.addEventListener('collision', this.handlePlayerCollision.bind(this));
            player.setAngularFactor(new THREE.Vector3(0,0,0));
            this.character = { model: parent, mesh: player };
            this.createRayCasts(player);
            this.dispatchToView('ObjectLoaded', this.character);

        });
    }

    fadeToAction( name, duration = 0.5 ) {

        this.previousAction = this.activeAction;
        this.activeAction = this._actions[ name ];

        if ( this.previousAction !== this.activeAction ) {

            this.previousAction.fadeOut( duration );

        }

        this.activeAction
            .reset()
            .setEffectiveTimeScale( 1 )
            .setEffectiveWeight( 1 )
            .fadeIn( duration )
            .play();
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
        this.rayCastRT = new RayCast(mesh.position, new THREE.Vector3(1, 1, 0));
        this.rayCastRB = new RayCast(mesh.position, new THREE.Vector3(1, -1, 0));
        this.rayCastL = new RayCast(mesh.position, new THREE.Vector3(-1, 0, 0));
        this.rayCastLT = new RayCast(mesh.position, new THREE.Vector3(-1, 1, 0));
        this.rayCastLB = new RayCast(mesh.position, new THREE.Vector3(-1, -1, 0));
        this.rayCastU = new RayCast(mesh.position, new THREE.Vector3(0, 1, 0));
        this.rayCastD = new RayCast(mesh.position, new THREE.Vector3(0, -1, 0));
    }

    handlePlayerCollision(targetObject, linearVelocity, angularVelocity) {
        //console.log(`collided with:`, targetObject, ` linearV: ${linearVelocity} angularV: ${angularVelocity}`);
        if (!this._isAlive) {
            return;
        }

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
                }, 100);

                break;

            case "launcher":
                this._isJumping = true;
                this.character.mesh.applyCentralImpulse(new THREE.Vector3(0, targetObject.userData.launchPower, 0));
                break;

            case "spike":
                if (targetObject.userData.isDeadly) {
                    this.dispatchToContext(Constants.events.PLAYER_DIED);
                }
                break;
            case "crusher":
            case "bear":
            case "parrot":
            case "flamingo":
            case "stork":
            case "bottomCatcher":
                this.dispatchToContext(Constants.events.PLAYER_DIED);
                break;
            
            case "finish":
                this.dispatchToContext(Constants.events.LEVEL_FINISHED, 1);
        }
    }

    checkRay(rc, distance) {
        if (this.character.mesh && this.character.mesh.parent) {
            const scene = this.character.mesh.parent;
            const intersects = rc.intersectObjects(scene.children);

            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.name == "Collectible") {
                    if (intersects[i].distance < distance) {
                        this.dispatchToContext(Constants.events.UPDATE_PLAYER_SCORE, {points: intersects[i].object.userData.points});
                        intersects[i].object.parent.remove(intersects[i].object);
                    }
                }
            }

        }
    }

    respawn(x, y) {
        this.character.mesh.__dirtyPosition = true;
        this.character.mesh.position.x = x;
        this.character.mesh.position.y = y;
        this.character.mesh.position.z = 0;
    }

    updatePlayer() {
        this.checkRay(this.rayCastR, 1.2);

        this.checkRay(this.rayCastRT, 1.2);
        this.checkRay(this.rayCastRB, 1.2);

        this.checkRay(this.rayCastL, 1.2);

        this.checkRay(this.rayCastLT, 1.2);
        this.checkRay(this.rayCastLB, 1.2);

        this.checkRay(this.rayCastU, 1.5);
        this.checkRay(this.rayCastD, 1.5);

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


        if (this._keyPressed && this._isAlive) {
            const anyKey = Object.values(this._keyPressed).indexOf(true) > -1;

            if (!anyKey &&! this.isIdle) {
                this.fadeToAction('Idle', 0.5);
                this.isWalking = false;
                this.isIdle = true;
            }


            if (this._keyPressed["ArrowRight"]) {
                if (!this.isWalking &&! this.isJumping) {
                    this.fadeToAction('Running', 0.2);
                    this._isJumping = false;
                    this.isWalking = true;
                    this.isIdle = false;
                }
                player.applyCentralImpulse(new THREE.Vector3(this._moveForce, 0, 0));
                this._rotation.rotating = true;
                this._rotation.direction = "right";
            } else if (this._keyPressed["ArrowLeft"]) { // == "ArrowLeft") {
                if (!this.isWalking &&! this.isJumping) {
                    this.fadeToAction('Running', 0.2);
                    this._isJumping = false;
                    this.isWalking = true;
                    this.isIdle = false;
                }
                player.applyCentralImpulse(new THREE.Vector3(-this._moveForce, 0, 0));
                this._rotation.rotating = true;
                this._rotation.direction = "left";

            }
            if (this._keyPressed["Space"] && !this._isJumping) {
                if (!this.isJumping) {
                    this.fadeToAction('Jump', 0.1);
                    this._isJumping = true;
                    this.isWalking = false;
                    this.isIdle = false;
                }
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