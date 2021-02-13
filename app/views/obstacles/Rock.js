import * as THREE from './../../../app/libs/three.module.js';
import Constants from './../../Constants.js';

export default class Rock extends fw.core.viewCore {
    constructor(loader) {
        super(Constants.views.ROCK);
        
        this.loader = loader || new THREE.TextureLoader();
        this.onCollisionHandler = this.onBoxCollision.bind(this);
        this.updateFrameHandler = this.onUpdateFrame.bind(this);
        this.rock = null;
        this.addViewListener('frameUpdate', this.updateFrameHandler);
    }

    create() {
        const boxGeometry =new THREE.SphereGeometry(1, 8, 8, 0);
        //const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        let material;
        material = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: this.loader.load( 'images/rock.jpg' ) }), .9, .4 );
        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set( .5, .5 );

        this.rock = new Physijs.SphereMesh(boxGeometry, material, 50);
        this.rock.collisions = 0;
        this.rock.name = "rock";
        this.rock.addEventListener('collision', this.onCollisionHandler);
        this.rock.castShadow = true;
        this.rock.userData = {canRecycle: false};
        return this.rock;
    }

    onBoxCollision(target, linearV, angularV) {
        if (target.name == "bottomCatcher") {
            if (this.rock && this.rock.parent) {
                this.rock.__dirtyPosition = true;
                this.rock.__dirtyRotation = true;
                this.rock.collisions = 0;
                this.rock.visible = false;
                this.rock.setAngularVelocity(new THREE.Vector3(0,0,0));
                this.rock.setAngularVelocity(new THREE.Vector3(0,0,0));
                this.rock.userData.canRecycle = true;
            }
        } else if (target.name == "ground") {
            // this.rock.applyCentralImpulse(new THREE.Vector3(-10, 0, 0));
            // this.rock.setAngularVelocity(new THREE.Vector3(0, 0, 10));

        }
    }

    onUpdateFrame() {
        if (this.rock) {
            this.rock.position.z = 0;
        }
    }

}