import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';

const DEG2RAD = Math.PI / 180;

export default class Palms extends fw.core.viewCore {
    constructor() {
        super("Palms");
        this.objectLoader = new ObjectLoaders();
    }


    addPalms(palmArray, container) {

        for (let palm = 0; palm < palmArray.length; palm++) {
            this.objectLoader.loadFBX(palmArray[palm].asset, "tga").then((object) => {

                const scale = palmArray[palm].scale;

                object.scale.set(scale, scale, scale);

                object.position.x = palmArray[palm].x;
                object.position.y = palmArray[palm].y;
                object.position.z = palmArray[palm].z;

                object.rotation.y = palmArray[palm].rotationY || Math.random();

                container.add(object);

            });
        }

    }
    create(container, array) {
        this.addPalms(array, container);
    }
}