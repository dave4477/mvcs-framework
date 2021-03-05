import * as THREE from './../../../app/libs/three.module.js';
import Constants from './../../Constants.js';
import ObjectsPreloader from './../helpers/ObjectsPreloader.js';

export default class Crate extends fw.core.viewCore {
    constructor(x, y) {
        super("Crate");
        this.texture = ObjectsPreloader.getCache()["Crate"].clone();
        this.texture.needsUpdate = true;
        this.x = x;
        this.y = y;
        this.instance = null;
        this.updateFrameHandler = this.onUpdateFrame.bind(this);
        this.addViewListener('frameUpdate', this.updateFrameHandler);
        this.addContextListener(Constants.events.PLAYER_MODEL_UPDATED, this.onPlayerUpdated);

    }

    onPlayerUpdated(e) {
        if (e) {
            this._playerData = e;
            // Player died, tween the camera back to spawning point.
            if (!e.alive) {
                setTimeout(()=>{
                    this.instance.__dirtyPosition = true;
                    this.instance.position.x = this.x;
                    this.instance.position.y = this.y;
                }, 2000);

            }
        }
    }

    create(container) {
        const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
        let material;
        material = Physijs.createMaterial(new THREE.MeshPhongMaterial({map: this.texture, shininess:100}), 0, 0);
        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set(.5, .5);

        this.instance = new Physijs.BoxMesh(boxGeometry, material, 0.8);
        this.instance.collisions = 0;
        this.instance.name = "box";
        this.instance.castShadow = true;
        this.instance.position.set(this.x, this.y, 0);
        this.instance.userData = {owner:this};
        container.add(this.instance);
    }

    destroy() {
        this.instance.userData = null;
        this.instance.geometry.dispose();
        this.instance.material.map.dispose();
        this.instance.material.dispose();
        this.texture.dispose();
        this.texture = null;
        this.instance = null;

    }

    onUpdateFrame() {

        if (this.instance) {
            this.instance.setDamping(0.8, 0.5);
            //this.instance.setAngularVelocity(new THREE.Vector3(0, 0, 0));
            //this.instance.setAngularFactor(new THREE.Vector3(0, 0, 0));

            this.instance.position.z = 0;
            this.instance.rotation.y = 0;
        }
    }
}