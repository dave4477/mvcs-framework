//import fw from './../../../../src/core/fw.js';
import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';

export default class SnowMan extends fw.core.viewCore {
    constructor() {
        super("SnowMan");
        this.objLoader = new ObjectLoaders();
    }

    create() {
        this.objLoader.loadObj('./../app/assets/snowman/snowman.obj').then( (loadedMesh) => {
            const material = new THREE.MeshLambertMaterial({color: 0xFEFEFE});

            loadedMesh.children.forEach(function (child) {
                child.material = material;
                child.geometry.computeFaceNormals();
                child.geometry.computeVertexNormals();
            });

            const bMesh = new Physijs.BoxMesh(
                new THREE.CubeGeometry( 0.5, 2, 0.5 ),
                Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({transparent:true, opacity:0.0, color:0xFFFFFF}),
                    1,
                    0.5
                ),
                10
            );
            loadedMesh.scale.set(0.5, 0.5, 0.5);
            loadedMesh.rotation.y = 1.8;
            loadedMesh.position.y = -1;
            loadedMesh.position.x = -0.8;
            loadedMesh.position.z = -0.6;
            bMesh.add(loadedMesh);
            bMesh.addEventListener('collision', (targetObject) => {
                if (targetObject.name === "bottomCatcher") {
                    bMesh.position.x = 150;
                    bMesh.position.y = 1;
                    bMesh.position.z = 0;

                }
            });
            this.dispatchToView('SnowManLoaded', bMesh);
        });
    }
}