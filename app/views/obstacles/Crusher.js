import * as THREE from './../../../app/libs/three.module.js';
import Constants from './../../Constants.js';

export default class Crusher extends fw.core.viewCore {
    constructor(posVec3, geomVec3, timeOffset = 0) {
        super(Constants.views.CRUSHER);
        this.direction = 1;
        this.ground = null;
        this.posVec3 = posVec3;
        this.geomVec3 = geomVec3;
        this.timeOffset = timeOffset;
    }


    create() {
        const loader = new THREE.TextureLoader();
        let texture = 'images/danger.jpg';
        const ground_material = Physijs.createMaterial( new THREE.MeshLambertMaterial({map: loader.load(texture)}), 0, 0 );
        ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
        ground_material.map.repeat.set(1, 1);

        this.ground = new Physijs.BoxMesh( new THREE.BoxGeometry(this.geomVec3.x, this.geomVec3.y, this.geomVec3.z), ground_material, 0 );
        this.ground.position.set(this.posVec3.x, this.posVec3.y, this.posVec3.z);
        this.ground.receiveShadow = false;
        this.ground.castShadow = true;
        this.ground.name = "crusher";

        setTimeout(() => {
            this.addViewListener('frameUpdate', this.moveBlock.bind(this));
        }, this.timeOffset);

        this.ground.addEventListener('collision', (targetObject) => {
            console.log("Crusher hit ", targetObject.name);
        });
        return this.ground;
    }

    moveBlock() {
        if (this.ground) {
            this.ground.__dirtyPosition = true;
            this.ground.position.y -= this.direction * 0.1; //= (this.direction * 0.1); //= this.direction * 0.1;

            if (this.ground.position.y < 1) {
                this.direction *= -1;
            } else if (this.ground.position.y > this.posVec3.y) {
                this.direction *= -1;
            }
        }
    }

}