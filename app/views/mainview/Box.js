import * as THREE from './../../../app/libs/three.module.js';

export default class Box extends fw.core.viewCore {
    constructor(loader) {
        super("box");
        this.loader = loader || new THREE.TextureLoader();
        this.onCollisionHandler = this.onBoxCollision.bind(this);
        this.box = null;
    }

    create() {
        const boxGeometry =new THREE.SphereGeometry(0.5, 8, 8, 0);
        //const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        let box;
        let material;
        material = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: this.loader.load( 'images/instance.jpg' ) }), .9, .4 );
        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set( .5, .5 );

        box = new Physijs.SphereMesh(boxGeometry, material, 0.5);
        //box = new Physijs.BoxMesh(boxGeometry, material, 0.5);
        box.collisions = 0;
        box.name = "box";
        box.addEventListener('collision', this.onCollisionHandler);
        box.castShadow = true;

        // This is expensive.
        // box.setCcdMotionThreshold( 0.5 );
        // box.setCcdSweptSphereRadius( 0.1 );

        this.box = box;
        return box;
    }

    onBoxCollision(target, linearV, angularV) {
        if (target.name == "bottomCatcher") {
            if (this.box && this.box.parent) {
                this.box.__dirtyPosition = true;
                this.box.__dirtyRotation = true;
                this.box.collisions = 0;
                this.box.applyCentralImpulse(new THREE.Vector3(-2, 0, 0));
                this.box.setAngularVelocity(new THREE.Vector3(0, 0, 10));


                this.box.rotation.set(0,0,0);

                this.box.position.set( 10, 5, 0);


            }
        }
    }

}