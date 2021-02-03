import * as THREE from './../../../app/libs/three.module.js';
import { DDSLoader } from './../../../app/libs/jsm/loaders/DDSLoader.js';
import { MTLLoader } from './../../../app/libs/jsm/loaders/MTLLoader.js';
import { OBJLoader } from './../../../app/libs/jsm/loaders/OBJLoader.js';
import { FBXLoader } from './../../../app/libs/jsm/loaders/FBXLoader.js';

export default class ObjectLoaders {
    constructor() {
    }

    loadObj(url) {
        const loader = new OBJLoader();
        return new Promise((resolve, reject) => {
            loader.load(url, (loadedMesh) => {
                resolve(loadedMesh);
            });
        });
    }

    loadFBX(url) {
        return new Promise((resolve, reject) => {
            const loader = new FBXLoader();
            loader.load(url, (object) => {
                resolve(object);
            });
        });
    }

    loadObjMTL(mtlPath, mtl, objPath, obj) {
        return new Promise((resolve, reject) => {
            var manager = new THREE.LoadingManager();
            manager.addHandler(/\.dds$/i, new DDSLoader());

            new MTLLoader(manager)
                .setPath(mtlPath)
                .load(mtl, (materials) => {
                    materials.preload();

                    new OBJLoader(manager)
                        .setMaterials(materials)
                        .setPath(objPath)
                        .load(obj, (object) => {
                            resolve(object);
                        });
                });
        });
    }
}