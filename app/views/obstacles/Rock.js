import * as THREE from './../../../app/libs/three.module.js';
import Constants from './../../Constants.js';

export default class Rock extends fw.core.viewCore {
    constructor(loader) {
        super(Constants.views.ROCK);
        
        this.loader = loader || new THREE.TextureLoader();
        this.onCollisionHandler = this.onBoxCollision.bind(this);
        this.updateFrameHandler = this.onUpdateFrame.bind(this);
        this.instance = null;
        this.addViewListener('frameUpdate', this.updateFrameHandler);
    }

    create() {
        const boxGeometry =new THREE.SphereGeometry(1, 8, 8, 0);
        //const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        let material;
        material = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: this.loader.load( 'images/rock.jpg' ) }), .9, .4 );
        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set( .5, .5 );

        this.instance = new Physijs.SphereMesh(boxGeometry, material, 50);
        this.instance.collisions = 0;
        this.instance.name = "instance";
        this.instance.addEventListener('collision', this.onCollisionHandler);
        this.instance.castShadow = true;
        this.instance.userData = {canRecycle: false, creator:this};
        return this;
    }

    onBoxCollision(target, linearV, angularV) {
        if (target.name == "bottomCatcher") {
            if (this.instance && this.instance.parent) {
                this.instance.__dirtyPosition = true;
                this.instance.__dirtyRotation = true;
                this.instance.collisions = 0;
                this.instance.visible = false;
                this.instance.setAngularVelocity(new THREE.Vector3(0,0,0));
                this.instance.setAngularVelocity(new THREE.Vector3(0,0,0));
                this.instance.userData.canRecycle = true;
            }
        } else if (target.name == "ground") {
            // this.instance.applyCentralImpulse(new THREE.Vector3(-10, 0, 0));
            // this.instance.setAngularVelocity(new THREE.Vector3(0, 0, 10));

        }
    }

    destroy() {
        this.removeViewListener('frameUpdate', this.updateFrameHandler);
        this.instance.removeEventListener('collision', this.onCollisionHandler);
        this.updateFrameHandler = null;
        this.onCollisionHandler = null;
        this.instance = null;

    }
    onUpdateFrame() {
        if (this.instance) {
            this.instance.position.z = 0;
        }
    }

}