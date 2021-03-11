import * as THREE from './../../libs/three.module.js';
import { GLTFLoader } from './../../libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';

import RayCast from './RayCast.js';

const DEG2RAD = Math.PI / 180;

export default class UFO extends fw.core.viewCore {
    constructor(x, y, z) {
        super("UFO");

        this.x = x;
        this.y = y;
        this.z = z;

        this.mesh = null;
        this.object = null;

        this.addViewListener('frameUpdate', this.onUpdateFrame);

    }

    onUpdateFrame() {
        if (this.object) {
            this.object.rotation.y --;
        }
    }

    create(scene) {
        this.scene = scene;
        const gltfloader = new GLTFLoader();

        gltfloader.load("./assets/UFO.glb", (gltf) => {
            const mesh = gltf.scene.children[0];
            this.addMorph(mesh, this.x, this.y, this.z);
        });
    }

    addMorph(mesh, x, y, z) {
        this.object = mesh;


        const bMesh = new Physijs.BoxMesh(
            new THREE.CubeGeometry(8, 0.4, 1),
            Physijs.createMaterial(
                new THREE.MeshBasicMaterial({transparent: true, color: 0xFFFFFF, opacity: 0}),
                0,
                0
            ),
            0
        );
        bMesh.position.set(x, y - 0.4, z);
        bMesh.name = "finish";

        // mesh.rotation.y = Math.PI / 2;
        mesh.scale.set(0.08, 0.08, 0.08 );
        mesh.castShadow = true;
        mesh.receiveShadow = false;

        bMesh.add(mesh);
        this.scene.add(bMesh);
        this.mesh = bMesh;

        this.rayCastL = new RayCast(bMesh.position, new THREE.Vector3(-1, 0, 0));
        this.rayCastR = new RayCast(bMesh.position, new THREE.Vector3(1, 0, 0));
    }
}