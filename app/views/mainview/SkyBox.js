import * as THREE from './../../../app/libs/three.module.js';

export default class SkyBox {
    constructor(path, filetype) {
        this.path = path;
        this.filetype = filetype;
        this.skyBox = null;
    }

    create(container) {
        const loader = new THREE.TextureLoader();
        const imagePrefix = this.path;
        const directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
        const imageSuffix = this.filetype;
        const skyGeometry = new THREE.CubeGeometry( 1250, 1250, 1250 );

        var materialArray = [];
        for (let i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
                map: loader.load( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.BackSide
            }));
        const skyMaterial = materialArray;
        this.skyBox = new THREE.Mesh( skyGeometry, skyMaterial );

        this.skyBox.userData = {owner:this};

        container.add(this.skyBox);
    }

    destroy() {
        this.skyBox.traverse((child) => {
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
        if (this.skyBox.geometry && this.skyBox.geometry.dispose) {
            this.skyBox.geometry.dispose();
        }
        if (this.skyBox.material && this.skyBox.material.dispose) {
            this.skyBox.material.dispose();
        }
    }

    disposeGeometry(geometry) {
        if (geometry.dispose) {
            console.log("Disposing skybox geometry");
        } else if (geometry.length) {
            for (let i = 0; i < geometry.length; i++) {
                this.disposeGeometry(geometry[i]);
            }
        }

    }

    disposeMaps(material) {
        if (material.map && material.dispose) {
            console.log("disposing skybox textures");
            material.map.dispose();
        } else if (material.length) {
            for (let i = 0; i < material.length; i++) {
                this.disposeMaps(material[i]);
            }
        }
    }

    disposeMaterial(material) {
        if (material && material.dispose) {
            console.log("disposing skybox material");
            material.dispose();
        } else if (material.length) {
            for (let i = 0; i < material.length; i++) {
                this.disposeMaterial(material[i]);
            }
        }
    }
}