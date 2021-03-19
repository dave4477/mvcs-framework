import * as THREE from './../../libs/three.module.js';
import ObjectsPreloader from './../helpers/ObjectsPreloader.js';
import Constants from './../../Constants.js';
import ViewUtils from './../viewutils/ViewUtils.js';
import Spikes from './Spikes.js';

const DEG2RAD = Math.PI / 180;

export default class RotatingSpikes extends fw.core.viewCore {
    constructor(posVec3, geomVec3, spikes, time = 3000) {
        super(Constants.views.FISH);

        this.posVec3 = posVec3;
        this.geomVec3 = geomVec3;
        this.spikes = spikes;
        this.spikeObjects = [];

        this.scene = null;
        this.mesh = null;

        this.duration = time;

        this._rotationX = 0;

        this.addViewListener('frameUpdate', this.updateFrame);
    }

    create(scene) {
        this.scene = scene;

        let texture = ObjectsPreloader.getCache()["Platform01"];
        const ground_material = Physijs.createMaterial( new THREE.MeshLambertMaterial({map: texture}), 0, 0 );
        ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
        ground_material.map.repeat.set(1, 1);

        this.mesh = new Physijs.BoxMesh( new THREE.BoxGeometry(this.geomVec3.x, this.geomVec3.y, this.geomVec3.z), ground_material, 0 );
        this.mesh.position.set(this.posVec3.x, this.posVec3.y, this.posVec3.z);
        this.mesh.receiveShadow = true;
        this.mesh.name = "ground";
        this.mesh.userData = {
            owner: this
        };


        for (let i = 0; i < this.spikes.length; i++) {
            const spikeX = this.spikes[i].x - (this.geomVec3.x / 2);
            const spikeY = this.spikes[i].y + (this.geomVec3.y / 2);

            const spikeObj = new Spikes().create(spikeX, spikeY, 0, this.spikes[i].rotation, 0.25);
            spikeObj.addEventListener('collision', (targetObj) => {
                alert(targetObj.name);
            });
            this.mesh.add(spikeObj);
        }
        this.scene.add(this.mesh);
        this.addTween();
    }

    addTween() {
        new TWEEN.Tween({x:this._rotationX})
            .to({x: this._rotationX +90}, 1000)
            .delay(2000)
            .onUpdate((object) => {
                this.mesh.__dirtyRotation = true;
                this.mesh.rotation.x = object.x * DEG2RAD;

            })
            .onComplete((object) => {
                this._rotationX += 90;
                this.addTween();
            }).start();

    }

    updateFrame(delta = 0) {
        if (this.mesh) {
            TWEEN.update();
        }
    }

    destroy() {
        this.removeViewListener('frameUpdate', this.updateFrame);

        this.mesh.userData.owner = null;
        this.mesh.userData = null;

        ViewUtils.destroy(this.mesh);

        this.scene = null;
        this.mesh = null;
    }
}