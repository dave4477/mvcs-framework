import * as THREE from './../../../app/libs/three.module.js';
import { GLTFLoader } from './../../../app/libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';

const DEG2RAD = Math.PI / 180;

export default class LevelFinish extends fw.core.viewCore {
    constructor(x, y, z, scale, rotationY, model) {
        super(Constants.views.LEVEL_FINISH);

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
                    new THREE.MeshPhongMaterial({transparent:true, opacity:0, color:0xFFFFFF}),
                    0,
                    0
                ),
                0
            );

            bMesh.position.set(this.x, this.y +3, this.z);
            bMesh.name = "finish";
            bMesh.add(mesh);

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

}