import * as THREE from './../../libs/three.module.js';
import ObjectsPreloader from './../helpers/ObjectsPreloader.js';
import Constants from './../../Constants.js';
import ViewUtils from './../viewutils/ViewUtils.js';
import Spikes from './Spikes.js';

const DEG2RAD = Math.PI / 180;

export default class RotatingSpikes extends fw.core.viewCore {
    constructor(posVec3, geomVec3, spikes, idleTimeMs = 1000) {
        super(Constants.views.ROTATING_PLATFORM);

        this.posVec3 = posVec3;
        this.geomVec3 = geomVec3;
        this.spikes = spikes;
        this.spikeObjects = [];

        this.scene = null;
        this.mesh = null;
        this.idleTimeMs = idleTimeMs;

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
        this.mesh.castShadow = true;
        this.mesh.name = "ground";
        this.mesh.userData = {
            owner: this
        };

        const containerMaterial = Physijs.createMaterial( new THREE.MeshLambertMaterial({transparent:true, color:0xFF0000, opacity:0.5}), 0, 0 );
        this.containerMesh = new Physijs.BoxMesh( new THREE.BoxGeometry(this.geomVec3.x-0.2, 0.1, 0.1), containerMaterial, 0 );
        this.containerMesh.position.set(this.posVec3.x, this.posVec3.y, this.posVec3.z);
        this.containerMesh.name = "spike";

        for (let i = 0; i < this.spikes.length; i++) {
            let spikeX = this.spikes[i].x;
            let spikeY = this.spikes[i].y;
            let spikeZ = this.spikes[i].z;

            if (this.spikes[i].rotation === 0) {
                spikeY += (this.mesh.geometry.boundingBox.max.y + 0.2);
            } else if (Math.abs(this.spikes[i].rotation) === 180) {
                spikeY -= (this.mesh.geometry.boundingBox.max.y + 0.2);
            } else if (this.spikes[i].rotation === 90) {
                spikeZ += (this.mesh.geometry.boundingBox.max.z + 0.2);
            } else if (this.spikes[i].rotation === -90) {
                spikeZ -= (this.mesh.geometry.boundingBox.max.z + 0.2);
            }

            const spikeObj = new Spikes().create(spikeX, spikeY, spikeZ, this.spikes[i].rotation, 0.25);
            this.spikeObjects.push(spikeObj);
            this.containerMesh.add(spikeObj);
        }
        this.scene.add(this.mesh);
        this.scene.add(this.containerMesh);
        this.addTween();
    }

    addTween() {
        new TWEEN.Tween({x:this._rotationX})
            .to({x: this._rotationX +90}, 400)
            .delay(this.idleTimeMs)
            .onUpdate((object) => {
                this.mesh.__dirtyRotation = true;
                this.mesh.rotation.x = object.x * DEG2RAD;

                this.containerMesh.__dirtyRotation = true;
                this.containerMesh.rotation.x = object.x * DEG2RAD;

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