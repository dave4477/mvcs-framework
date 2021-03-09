import * as THREE from './../../libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';
import Constants from './../../Constants.js';

const DEG2RAD = Math.PI / 180;

export default class Bridge {
    constructor(x, y, z) {
        this.object = null;
        this.mesh = null;
        this.objectLoader = new ObjectLoaders();

        this.x = x;
        this.y = y;
        this.z = z;
    }

    create(container) {
        this.objectLoader.loadFBX('./assets/bridge/bridge.fbx').then((object) => {

            const scale = 0.012;

            object.scale.set(scale, scale, scale);

            this.object = object;

            // this.addShadows(object);

            const mesh = new Physijs.BoxMesh(
                new THREE.CubeGeometry( 8, 0.5, 2 ),
                Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({transparent:true, opacity:0, color:0xFFFFFF}),
                    0.8,
                    0
                ),
                0
            );
            mesh.position.x = this.x;
            mesh.position.y = this.y;
            mesh.position.z = 0;
            mesh.add(object);
            mesh.name = "bridge";
            this.mesh = mesh;

            container.add(mesh);
        });
    }

}