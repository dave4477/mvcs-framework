import * as THREE from './../../libs/three.module.js';
import Rock from './Rock.js';
import Constants from './../../Constants.js';

let timer = null;

export default class FallingRocks extends fw.core.viewCore {
    constructor(x, y, scene, interval = 1500) {

        super(Constants.views.FALLING_ROCKS);

        this._rocks = [];
        this._x = x;
        this._y = y;
        this.scene = scene;
        this._interval = interval;
        this._active = true;
        this._justStarted = true;
        this.loader = new THREE.TextureLoader();
        this.loader.load( 'images/rock.jpg', (texture) =>{
           this.texture = texture;
        });

        this.addContextListener(Constants.events.SIMULATION_PAUSED, this.pause);
        this.addContextListener(Constants.events.SIMULATION_RESUMED, this.resume);
    }
    
    create() {
        if (!this.scene) {
            return;
        }
        if (!this._active) {
            clearTimeout(timer);
            return;
        }
        let interval = this._interval;
        if (this._justStarted) {
            this._justStarted = false;
            interval = 1;
        }

        timer = setTimeout( () => {

            let rockToRecycle = null;
            for (let i = 0; i < this._rocks.length; i++) {
                if (this._rocks[i].instance.userData.canRecycle) {
                    rockToRecycle = this._rocks[i].instance;
                    this.create();
                    break;
                }
            }
            if (rockToRecycle) {
                this.recycleRock(rockToRecycle);
            } else {
                const rockFactory = new Rock();
                const rock = rockFactory.create();
                rock.instance.position.set( this._x, this._y, 0);
                this.scene.add(rock.instance);
                this._rocks.push(rock);
                this.moveRock(rock.instance);
                this.create();
            }

        }, interval);
    }

    setActive(value) {
        this._active = value;
        this._justStarted = value;
    }

    destroy() {
        console.log("Destroying timer");
        clearTimeout(timer);
        timer = null;
        this.scene = null;
        for (let i = 0; i < this._rocks.length; i++) {
            this._rocks[i].destroy();
        }
        this._rocks = [];
        this.texture.dispose();
        this.loader = null;
        this.removeContextListener(Constants.events.SIMULATION_PAUSED, this.pause);
        this.removeContextListener(Constants.events.SIMULATION_RESUMED, this.resume);
        this.removeView();
    }
    
    pause() {
        console.log("clearing", this);
        clearTimeout(timer);
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
        //instance.applyCentralImpulse(new THREE.Vector3(-250, 0, 0));
    }
}