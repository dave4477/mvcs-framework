import fw from './../../../../src/core/fw.js';
import * as THREE from './../../../libs/three.module.js';

import { DDSLoader } from './../../../libs/jsm/loaders/DDSLoader.js';
import { MTLLoader } from './../../../libs/jsm/loaders/MTLLoader.js';
import { OBJLoader } from './../../../libs/jsm/loaders/OBJLoader.js';

const SHOW_RIGID_BODY = false;

const FORCE_JUMP = 25;
const FORCE_MOVE = 0.8;
const DAMPING = 0.92;
const MASS = 1;

export default class Character extends fw.core.viewCore {
    constructor(jumpForce = FORCE_JUMP, moveForce = FORCE_MOVE, damping = DAMPING, mass = MASS){
        super();

        this.character = {};

        this._jumpForce = jumpForce;
        this._moveForce = moveForce;
        this._damping = damping;
        this._mass = mass;
        this._keyPressed = null;
        this._isJumping = false;
    }

    set keyPressed(value) {
        this._keyPressed = value;
    }

    // Have some setters for the physics, so we can change them on-the-fly.
    set isJumping(value) {
        this._isJumping = value;
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
        var manager = new THREE.LoadingManager();
        manager.addHandler( /\.dds$/i, new DDSLoader() );

        new MTLLoader( manager )
            .setPath( './assets/' )
            .load( 'fat_cat_obj.mtl', ( materials ) => {

                materials.preload();

                new OBJLoader( manager )
                    .setMaterials( materials )
                    .setPath( './assets/' )
                    .load( 'fat_cat_obj.obj', ( object ) => {
                        object.rotation.y = 96.5;
                        const parent = new THREE.Mesh( new THREE.CubeGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial({color:0xCC3333}) );
                        parent.position.y = 0.5;
                        parent.position.x = 0;
                        parent.position.z = 0;
                        parent.scale.x = 0.05;
                        parent.scale.y = 0.05;
                        parent.scale.z = 0.05;
                        parent.add(object);

                        var mesh = new Physijs.BoxMesh(
                            parent.geometry,
                            Physijs.createMaterial(
                                new THREE.MeshBasicMaterial({color:0xCC3333}),
                                0.2,
                                0.5
                            ),
                            this._mass
                        );
                        mesh.visible = SHOW_RIGID_BODY;

                        mesh.position.y = 0.4;
                        mesh.position.x = 0;
                        mesh.position.z = 0;

                        // var floorMesh = new Physijs.BoxMesh(
                        //     new THREE.CubeGeometry( 0.8, 0.2, 0.8 ),
                        //     Physijs.createMaterial(
                        //         new THREE.MeshBasicMaterial({color:0x333366}),
                        //         0.2,
                        //         0.5
                        //     ),
                        //     1
                        // );
                        // floorMesh.position.y = -0.6;
                        // floorMesh.visible = SHOW_RIGID_BODY;
                        // // mesh.add(floorMesh);
                        // floorMesh.addEventListener('collision', this.handlePlayerCollision.bind(this));
                        mesh.addEventListener('collision', this.handlePlayerCollision.bind(this));
                        mesh.setAngularFactor(new THREE.Vector3(0,0,0));
                        this.character = { model: parent, mesh: mesh };
                        this.dispatchToView('ObjectLoaded', this.character);

                    }, null, null);
            });
    }

    handlePlayerCollision(collidedWith, linearVelocity, angularVelocity) {
        console.log(`collided with:  ${collidedWith} linearV: ${linearVelocity} angularV: ${angularVelocity}`);
        switch (collidedWith.name) {
            case "ground":
            case "box":
                this._isJumping = false;
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
        const linearDamping = this._damping;
        const player = this.character.mesh;
        const model = this.character.model;

        player.setDamping(linearDamping, 0);
        player.setAngularVelocity(new THREE.Vector3(0,0,0));
        player.setAngularFactor(new THREE.Vector3(0,0,0));

        if (this._keyPressed == "ArrowRight") {
            player.applyCentralImpulse(new THREE.Vector3(this._moveForce, 0, 0));
            this.character.model.rotation.y = 119.5;
        } else if (this._keyPressed == "ArrowLeft") {
            player.applyCentralImpulse(new THREE.Vector3(-this._moveForce, 0, 0));
            this.character.model.rotation.y = -96.5;
        } else if (this._keyPressed == "Space" &&! this._isJumping) {
            this._isJumping = true;
            player.applyCentralImpulse(new THREE.Vector3(0, this._jumpForce, 0));
        }
        model.position.x = player.position.x;
        model.position.y = player.position.y - 0.15;
    }
}