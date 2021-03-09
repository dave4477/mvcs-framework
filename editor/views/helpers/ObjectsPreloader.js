import ObjectLoaders from './ObjectLoaders.js';
import { GLTFLoader } from './../../libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';
import * as THREE from './../../libs/three.module.js';

let objects = {};
let objectsToLoad = [];

export default class ObjectsPreloader extends fw.core.viewCore {
    constructor(level) {
        super(Constants.views.OBJECTS_PRELOADER);
        this.objectLoader = new ObjectLoaders();
        this.level = level;
        this.numToLoad = 0;
        this.loaded = 0;
        this.textureLoader = new THREE.TextureLoader();
    }

    preload(data) {
        let urls = [];

        let preload = data.preload;


        for (let i = 0; i < preload.length; i++) {
            const entity = preload[i];
            if (entity.hasOwnProperty("asset") && urls.indexOf(entity.asset) < 0) {
                urls.push(entity.asset);
                objectsToLoad.push({type:entity.type, asset:entity.asset});
            }
        }
        this.numToLoad = objectsToLoad.length;
        this.preloadFileType(objectsToLoad);

    }

    preloadFileType(list) {
        for (let i = 0; i < list.length; i++) {
            let entity = list[i];
            let asset = entity.asset;
            const name = entity.type;
            const assetStr = asset.toLowerCase();
            if (assetStr.indexOf(".fbx") > -1) {
                if (!objects[name]) {
                    objects[name] = null;
                    this.preloadFBX(name, entity.asset);
                }
            } else if (assetStr.indexOf(".glb") > -1) {
                if (!objects[name]) {
                    objects[name] = null;
                    this.preloadGLTF(name, entity.asset);
                }
            } else if (assetStr.indexOf(".jpg") > -1 || assetStr.indexOf(".png") >-1) {
                if (!objects[name]) {
                    objects[name] = null;
                    this.preloadImage(name, entity.asset);
                }
            }
        }
    }

    static getCache() {
        return objects;
    }

    checkComplete() {
        this.loaded ++;
        if (this.loaded == this.numToLoad) {
            this.dispatchToContext(Constants.events.SWITCH_STATE, "game");
        }
    };
    preloadFBX(name, url) {
        this.objectLoader.loadFBX(url).then((loaded) => {
            objects[name] = loaded;
            this.checkComplete();
        });
    }


    preloadGLTF(name, url) {
        const gltfloader = new GLTFLoader();
        gltfloader.load(url, (loaded) => {
            objects[name] = loaded;
            this.checkComplete();
        });
    }

    preloadImage(name, url) {
        this.textureLoader.load(url, (loaded) => {
            objects[name] = loaded;
            this.checkComplete();
        })
    }
}