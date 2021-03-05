import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';
import DebugSettings from './../../DebugSettings.js';
import RayCast from './../helpers/RayCast.js';
import Constants from './../../Constants.js';
import { GLTFLoader } from './../../../app/libs/jsm/loaders/GLTFLoader.js';

/**
 * Physics
 */
const FORCE_JUMP = 25;
const FORCE_MOVE = 0.5;
const DAMPING = 0.92;
const MASS = 1;


const DEG2RAD = Math.PI / 180;

/**
 * Animations
 */
const IDLE_ACTION_TIME = 8000;
const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];
const idleActions = ['Wave','ThumbsUp','Dance'];

/**
 * This is the character/player class representing the player.
 * This file contains defaults for physics, and collision detection for the player,
 * and handles animations. It is big and messy.
 */
export default class Character extends fw.core.viewCore {
    constructor(jumpForce = FORCE_JUMP, moveForce = FORCE_MOVE, damping = DAMPING, mass = MASS){
        super(Constants.views.CHARACTER);

        this.character = {};
        this.objectLoader = new ObjectLoaders();

        this._actions = {};
        this.previousAction = null;
        this.activeAction = null;

        this._mixer = null;
        this._keyPressed = null;
        this._rotationY = 0;
        this._rotation = { rotating: false, direction:"right"};
        this._isWalking = false;
        this._isIdle = true;
        this._isJumping = false;

        this._idleTimer = null;

        this._jumpForce = jumpForce;
        this._moveForce = moveForce;
        this._damping = damping;
        this._mass = mass;

        this.attachedObjects = {};

        this._clock = new THREE.Clock();
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
        if (!data.alive) {
            this.fadeToAction('Death', 0.5);
        }
    }

    addViewListeners() {
        this.addViewListener('UIButtonPressed', (data) => {
            this._keyPressed = data;
        });
        this.addViewListener('KeyPressed', this.setKeyPressed);
        this.addViewListener('DetachPlayerObjects', (object) => {
            this.character.mesh.applyCentralImpulse(new THREE.Vector3(0, this._jumpForce/2, 0));
            this.attachedObjects[object] = null;
            delete this.attachedObjects[object];
        })
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


    create(scene) {
        this.scene = scene;

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

            parent.name = "playerModel";
            parent.add(mesh);

            const opacity = DebugSettings.showRigidBody ? 0.2 : 0;
            const player = new Physijs.BoxMesh(
                parent.geometry,
                Physijs.createMaterial(
                    new THREE.MeshBasicMaterial({transparent:true, color:0xFFFFFF, opacity:opacity}),
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
            this.dispatchToView('ObjectLoaded', this.character);
            this.createRayCasts(player);
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


    randomIdleAction() {
        let rnd = Math.floor(Math.random() * idleActions.length);
        if (rnd == idleActions.length) {
            rnd -= 1;
        }
        const action = idleActions[rnd];
        this.fadeToAction(action, 0.5);
        setTimeout(()=>{
            this.fadeToAction('Idle', 0.5);
        },3000);
        this._idleTimer = setTimeout(this.randomIdleAction.bind(this), IDLE_ACTION_TIME);

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
        this.rayCastR = new RayCast(mesh.position, new THREE.Vector3(1, 0, 0), mesh);
        this.rayCastRT = new RayCast(mesh.position, new THREE.Vector3(1, 1, 0));
        this.rayCastRB = new RayCast(mesh.position, new THREE.Vector3(1, -1, 0));
        this.rayCastL = new RayCast(mesh.position, new THREE.Vector3(-1, 0, 0));
        this.rayCastLT = new RayCast(mesh.position, new THREE.Vector3(-1, 1, 0));
        this.rayCastLB = new RayCast(mesh.position, new THREE.Vector3(-1, -1, 0));
        this.rayCastU = new RayCast(mesh.position, new THREE.Vector3(0, 1, 0));
        this.rayCastD = new RayCast(mesh.position, new THREE.Vector3(0, -1, 0));
    }

    handlePlayerCollision(targetObject, linearVelocity, angularVelocity) {
        if (!this._isAlive) {
            return;
        }

        switch (targetObject.name) {
            case "ground":
            case "box":
            case "bridge":
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

            case "boat":
                this.attachedObjects["boat"] = targetObject;
                break;

            case "launcher":
                this._isJumping = true;
                this.character.mesh.applyCentralImpulse(new THREE.Vector3(0, targetObject.userData.launchPower, 0));
                break;

            case "spike":
            case "crusher":
            case "bear":
            case "parrot":
            case "flamingo":
            case "stork":
            case "bee":
            case "venusFlyTrap":
                if (!DebugSettings.godMode) {
                    this._isAlive = false;
                    this.dispatchToContext(Constants.events.PLAYER_DIED);
                }
                break;
            case "bottomCatcher":
                    this._isAlive = false;
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
                const intersect = intersects[i];
                if (intersect.object.name == "Collectible") {
                    if (intersect.distance < distance) {
                        if (intersect.object.parent) {
                            this.dispatchToContext(Constants.events.UPDATE_PLAYER_SCORE, {points: intersect.object.userData.points});
                            intersect.object.parent.remove(intersect.object);
                        }
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
        this.fadeToAction('Idle', 0.25);
    }

    updatePlayer() {
        this.checkRay(this.rayCastR, 1);

        this.checkRay(this.rayCastRT, 1.5);
        this.checkRay(this.rayCastRB, 1.5);

        this.checkRay(this.rayCastL, 1);

        this.checkRay(this.rayCastLT, 1.5);
        this.checkRay(this.rayCastLB, 1.5);

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

        if (!this.isJumping) {
            this._mixer.timeScale = 1;
        }
        if (this._keyPressed && this._isAlive) {
            const anyKey = Object.values(this._keyPressed).indexOf(true) > -1;

            if (!anyKey &&! this._isIdle) {
                this.fadeToAction('Idle', 0.5);
                this._isWalking = false;
                this._isIdle = true;
                this._idleTimer = setTimeout(this.randomIdleAction.bind(this), IDLE_ACTION_TIME)
            }


            if (this._keyPressed["ArrowRight"]) {
                clearTimeout(this._idleTimer);

                if (!this._isWalking &&! this.isJumping) {
                    this.fadeToAction('Running', 0.2);
                    this._isJumping = false;
                    this._isWalking = true;
                    this._isIdle = false;
                }
                player.applyCentralImpulse(new THREE.Vector3(this._moveForce, 0, 0));
                this._rotation.rotating = true;
                this._rotation.direction = "right";
            } else if (this._keyPressed["ArrowLeft"]) {
                clearTimeout(this._idleTimer);

                if (!this._isWalking &&! this.isJumping) {
                    this.fadeToAction('Running', 0.2);
                    this._isJumping = false;
                    this._isWalking = true;
                    this._isIdle = false;
                }
                player.applyCentralImpulse(new THREE.Vector3(-this._moveForce, 0, 0));
                this._rotation.rotating = true;
                this._rotation.direction = "left";

            }
            if (this._keyPressed["Space"] && !this._isJumping) {
                clearTimeout(this._idleTimer);

                if (!this.isJumping) {
                    this._mixer.timeScale = 0.6;
                    this.fadeToAction('Jump', 0);
                    this._isJumping = true;
                    this._isWalking = false;
                    this._isIdle = false;
                }
                player.applyCentralImpulse(new THREE.Vector3(0, this._jumpForce, 0));
            }
        }
        model.position.x = player.position.x;
        model.position.y = player.position.y - 0.55;
        player.position.z = 0;

        const keys = Object.keys(this.attachedObjects);
        for (let i = 0; i < keys.length; i++) {
            this.attachedObjects[keys].position.set(model.position.x, model.position.y, model.position.z);
        }
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

    drawRay(scene) {
        this.rayCastR.drawRay(scene);
        this.rayCastL.drawRay(scene);
    }
}