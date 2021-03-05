import { Water } from './../../../app/libs/jsm/objects/Water.js';
import * as THREE from './../../../app/libs/three.module.js';

export default class WaterPlane extends fw.core.viewCore {
    constructor(scene, y) {
        super("WaterPlane");

        this.scene = scene;
        this.y = y;
        this.water = null;
    }
    
    create(width = 10000, height = 10000) {
        // Water

        const waterGeometry = new THREE.PlaneGeometry( width, height );

        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( 'images/waternormals.jpg', function ( texture ) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                } ),
                alpha: 1.0,
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            }
        );

        this.water.rotation.x = - Math.PI / 2;
        this.water.position.y = this.y;
        this.scene.add( this.water );
        this.addTween();
        this.addViewListener('frameUpdate', this.updateFrame);
    }

    addTween() {
        var fromY = this.water.position.y;
        var toY = fromY + 0.1;

        new TWEEN.Tween({y:fromY})
            .to({y: toY}, 2000)
            //.easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate((object) => {
                this.water.position.y = object.y;
            })
            .repeat(Infinity)
            .yoyo(true)
            .start();
    }

    destroy() {
        this.removeViewListener('frameUpdate', this.updateFrame);
        this.scene = null;
        this.water = null;
    }
    updateFrame() {
        this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
        TWEEN.update();
    }
}