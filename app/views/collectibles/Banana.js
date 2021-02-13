import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';

export default class Banana extends fw.core.viewCore {
    constructor(x, y) {
        super("Banana");
        this._x = x;
        this._y = y;
        this._collectible = null;
        this._object = null;
        this.points = 10;
    }
    
    create(container) {
        const objectLoader = new ObjectLoaders();
        objectLoader.loadFBX('./assets/banana/Banana.FBX').then((object) => {

            object.scale.x = 0.005;
            object.scale.y = 0.005;
            object.scale.z = 0.005;

            object.position.x = -0.05;
            //this.addShadows(object);
            this._object = object;

            const mesh = new Physijs.BoxMesh(
                new THREE.CubeGeometry( 0.3, 0.6, 0.3 ),
                Physijs.createMaterial(
                    new THREE.MeshBasicMaterial({transparent:true, color:0xFFFF00, opacity:0.0}),
                    0,
                    0
                ),
                0
            );
            //mesh.visible = DebugSettings.showRigidBody;
            mesh.add(object);

            mesh.name = "Collectible";

            mesh.userData = {
                points: 10
            };
            mesh.position.x = this._x;
            mesh.position.y = this._y;
            mesh.userData = this;
            this._collectible = mesh;
            container.add(mesh);
            //this.addViewListener('frameUpdate', this.onFrameUpdate);
        });
        
    }

    onFrameUpdate() {
        if (this._object) {
            this._object.rotation.y += 0.1;
        }
    }

    destroy() {
        this.removeViewListener('frameUpdate', this.onFrameUpdate);
        //this.removeAllViewListeners();
        this.removeAllContextListeners();
        this._collectible = null;
        this._object = null;
        console.log("destroying banana:", this._collectible, this._object);

    }

}