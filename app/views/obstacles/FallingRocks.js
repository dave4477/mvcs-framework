import * as THREE from './../../../app/libs/three.module.js';
import Rock from './Rock.js';
import Constants from './../../Constants.js';

export default class FallingRocks extends fw.core.viewCore {
    constructor(x, y, scene, interval = 1500) {

        super("FallingRocks");

        this._rocks = [];
        this._x = x;
        this._y = y;
        this.scene = scene;
        this._rockCount = 0;
        this._interval = interval;
        this._timer = null;

        this.addContextListener(Constants.events.SIMULATION_PAUSED, this.pause);
        this.addContextListener(Constants.events.SIMULATION_RESUMED, this.resume);
    }


    create() {
        this._timer = setTimeout( () => {

            let rockToRecycle = null;
            for (let i = 0; i < this._rocks.length; i++) {
                if (this._rocks[i].userData.canRecycle) {
                    rockToRecycle = this._rocks[i];
                    this.create();
                    break;
                }
            }
            if (rockToRecycle) {
                this.recycleRock(rockToRecycle);
            } else {
                const rockFactory = new Rock(this.loader);
                const rock = rockFactory.create();
                rock.position.set( this._x, this._y, 0);
                this.scene.add(rock);
                this._rocks.push(rock);
                this.moveRock(rock);

                this._rockCount ++;
                this.create();
            }

        }, this._interval);
    }

    pause() {
        console.log("clearing", this);
        clearTimeout(this._timer);
    }

    resume() {
        this.create();
    }
    recycleRock(rock) {
        rock.userData.canRecycle = false;
        rock.__dirtyPosition = true;
        rock.__dirtyRotation = true;
        rock.visible = true;
        rock.setAngularVelocity(new THREE.Vector3(0,0,0));

        rock.rotation.set(0,0,0);
        rock.position.set( this._x, this._y, 0);
        this.moveRock(rock);
    }

    moveRock(rock) {
        rock.setAngularVelocity(new THREE.Vector3(0, 0, 10));
        rock.setLinearVelocity(new THREE.Vector3(-10, 0, 0));
        //rock.applyCentralImpulse(new THREE.Vector3(-250, 0, 0));
    }

}