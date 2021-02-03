import * as THREE from './../../../app/libs/three.module.js';

export default class Box extends fw.core.viewCore {
    constructor(loader) {
        super("box");
        this.loader = loader || new THREE.TextureLoader();
        this.onCollisionHandler = this.onBoxCollision.bind(this);
        this.box = null;
    }

    create() {
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        let box;
        let material;
        material = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: this.loader.load( 'images/plywood.jpg' ) }), .9, .6 );
        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set( .5, .5 );

        box = new Physijs.BoxMesh(boxGeometry, material, 1.2);
        box.collisions = 0;
        box.name = "box";
        box.addEventListener('collision', this.onCollisionHandler);
        box.castShadow = true;
        this.box = box;
        return box;
    }

    onBoxCollision(target, linearV, angularV) {
        if (target.name == "bottomCatcher") {
            if (this.box && this.box.parent) {
                this.box.__dirtyPosition = true;
                this.box.__dirtyRotation = true;

                this.box.position.x = Math.random() * 100;
                this.box.position.y = 5;
                this.box.position.z = 0;

            }
        }
    }

}