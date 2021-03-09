import ObjectLoaders from '../helpers/ObjectLoaders.js';

const DEG2RAD = Math.PI / 180;

export default class Palms extends fw.core.viewCore {
    constructor() {
        super("Palms");
        this.object = null;
        this.objectLoader = new ObjectLoaders();
    }


    addPalms(palmArray, container) {

        for (let palm = 0; palm < palmArray.length; palm++) {
            this.objectLoader.loadFBX(palmArray[palm].asset, "tga").then((object) => {

                const scale = palmArray[palm].scale;

                this.object = object;
                object.scale.set(scale, scale, scale);

                object.position.x = palmArray[palm].x;
                object.position.y = palmArray[palm].y;
                object.position.z = palmArray[palm].z;

                object.rotation.y = palmArray[palm].rotationY || Math.random();

                object.userData = {owner:this};
                container.add(object);

            });
        }

    }
    create(container, array) {
        this.addPalms(array, container);
    }


    disposeGeometry(geometry) {
        if (geometry.dispose) {
        } else if (geometry.length) {
            for (let i = 0; i < geometry.length; i++) {
                this.disposeGeometry(geometry[i]);
            }
        }

    }

    disposeMaps(material) {
        if (material.map && material.dispose) {
            material.map.dispose();
        } else if (material.length) {
            for (let i = 0; i < material.length; i++) {
                this.disposeMaps(material[i]);
            }
        }
    }

    disposeMaterial(material) {
        if (material && material.dispose) {
            material.dispose();
        } else if (material.length) {
            for (let i = 0; i < material.length; i++) {
                this.disposeMaterial(material[i]);
            }
        }
    }

    destroy() {
        this.object.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) {
                    this.disposeGeometry(child.geometry);
                }
                if (child.material) {
                    this.disposeMaps(child.material);
                    this.disposeMaterial(child.material);
                }
            }
        });
        if (this.object.geometry && this.object.geometry.dispose) {
            this.object.geometry.dispose();
        }
        if (this.object.material && this.object.material.dispose) {
            this.object.material.dispose();
        }
    }
}