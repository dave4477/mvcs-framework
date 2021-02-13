import * as THREE from './../../../app/libs/three.module.js';
import Spikes from './Spikes.js';

export default class RisingSpikes extends fw.core.viewCore {
    constructor(container) {
        super("RisingSpikes");

        this._spikes = [];
        this._container = container;
        this._parent = null;

    }

    create(x, y, amount) {
        let orgX = 0;
        var spikeX = 0;


        this._parent = new Physijs.BoxMesh(
            new THREE.CubeGeometry( amount / 2, 2, 1 ),
            Physijs.createMaterial(
                new THREE.MeshPhongMaterial({transparent:true, opacity:0.5, color:0xFFFFFF}),
                0,
                0
            ),
            0
        );

        this._parent.position.x = x;
        this._parent.position.y = y;

        for (let i = 0; i < amount; i++) {

            spikeX = orgX + (i * 0.5);

            const spike = new Spikes().create(spikeX, y);
            this._spikes.push(spike);
            this._parent.add(spike);
        }
        this._container.add(this._parent);

        this.addTweens();
        this.addViewListener('frameUpdate', this.moveSpikes);
    }

    addTweens() {
        for (let i = 0; i < this._spikes.length; i++) {
            var t = new TWEEN.Tween({y:0})
                .to({y: -2}, 3000)
                .repeat(Infinity)
                .yoyo(true)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate((object) => {
                    this._spikes[i].__dirtyPosition = true;

                    this._spikes[i].position.y = object.y;
                    //this._spikes[i]._physijs.position.y = object.y;
                    if (this._spikes[i].position.y < -0.5) {
                        this._spikes[i].userData.isDeadly = false;
                    } else {
                        this._spikes[i].userData.isDeadly = true;
                    }

                })
                .start();
        }
    }
    moveSpikes() {
        TWEEN.update();
    }
}