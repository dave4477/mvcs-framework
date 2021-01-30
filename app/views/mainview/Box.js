import * as THREE from './../../../app/libs/three.module.js';

export default class Box {
    constructor(loader) {
        this.loader = loader || new THREE.TextureLoader();
        this.onCollisionHandler = this.onBoxCollision.bind(this);
        this.box = null;
    }

    create() {
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        let box;
        let material;
        material = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: this.loader.load( 'images/plywood.jpg' ) }), .6, .6 );
        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set( .5, .5 );

        box = new Physijs.BoxMesh(boxGeometry, material, 1);
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
                console.log("removing box");
                this.box.removeEventListener('collision', this.onCollisionHandler);
                this.box.parent.remove(this.box);
                this.box.__dirtyPosition = true;
                this.box.__dirtyRotation = true;
                this.box = null;
            }
        }
    }

}