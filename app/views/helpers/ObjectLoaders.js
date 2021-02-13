import * as THREE from '../../libs/three.module.js';
import { DDSLoader } from '../../libs/jsm/loaders/DDSLoader.js';
import { MTLLoader } from '../../libs/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '../../libs/jsm/loaders/OBJLoader.js';
import { FBXLoader } from '../../libs/jsm/loaders/FBXLoader.js';
import { TGALoader } from '../../libs/jsm/loaders/TGALoader.js';
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

    loadFBX(url, type) {

        var manager = new THREE.LoadingManager();
        // add handler for TGA textures
        if (type == "tga") {
            manager.addHandler(/\.tga$/i, new TGALoader());
        }
        return new Promise((resolve, reject) => {
            const loader = new FBXLoader(manager);
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