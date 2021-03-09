import * as THREE from './../../libs/three.module.js';
import { GLTFLoader } from './../../libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';

const DEG2RAD = Math.PI / 180;

export default class LevelFinish extends fw.core.viewCore {
    constructor(x, y, z, scale, rotationY, model) {
        super(Constants.views.LEVEL_FINISH);

        this.object = null;
        this.mesh = null;
        this.x = x;
        this.y = y;
        this.z = z;
        this.scale = scale;
        this.rotationY = rotationY;
        this.model = model;
    }

    create(scene) {
        this.scene = scene;
        const gltfloader = new GLTFLoader();

        gltfloader.load(this.model, (gltf) => {
            console.log("GLTF:", gltf);
            const mesh = gltf.scene.children[0];
            this.object = mesh;
            mesh.position.y -= 3;
            mesh.position.x -= 0.5;
            mesh.rotation.y = this.rotationY * DEG2RAD; //Math.PI / 2;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.scale.set(this.scale, this.scale, this.scale);

            this.addShadows(mesh);
            const bMesh = new Physijs.BoxMesh(
                new THREE.CubeGeometry(1, 5, 1),
                Physijs.createMaterial(
                    new THREE.MeshBasicMaterial({transparent:true, opacity:0, color:0xFFFFFF}),
                    0,
                    0
                ),
                0
            );

            bMesh.position.set(this.x, this.y +3, this.z);
            bMesh.name = "finish";
            bMesh.userData = {owner:this};
            bMesh.add(mesh);
            this.mesh = bMesh;
            this.scene.add(bMesh);
        });
    }

    addShadows(object) {
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
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
        if (this.object) {
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
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}