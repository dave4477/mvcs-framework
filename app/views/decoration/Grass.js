import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';
import { GLTFLoader } from './../../../app/libs/jsm/loaders/GLTFLoader.js';

const DEG2RAD = Math.PI / 180;

export default class Grass extends fw.core.viewCore {
    constructor() {
        super("Grass");
        this.objectLoader = new ObjectLoaders();
    }

    add(grassArray, container) {
        const gltfloader = new GLTFLoader();

        for (let i = 0; i < grassArray.length; i++) {

            gltfloader.load(grassArray[i].asset, (gltf) => {
                const object = gltf.scene.children[0];

                const scale = grassArray[i].scale;

                object.scale.set(scale, scale, scale);

                object.position.x = grassArray[i].x;
                object.position.y = grassArray[i].y;
                object.position.z = grassArray[i].z;
                object.rotation.y = grassArray[i].rotationY || Math.random();
                this.addShadows(object);
                container.add(object);
            });
        }
    }

    addShadows(object) {
        object.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                //child.receiveShadow = true;

            }

        } );
    }

    create(container, array) {
        this.add(array, container);
    }
}