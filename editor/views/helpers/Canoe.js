import * as THREE from './../../libs/three.module.js';
import { GLTFLoader } from './../../libs/jsm/loaders/GLTFLoader.js';
import Constants from './../../Constants.js';
import ObjectsPreloader from './../helpers/ObjectsPreloader.js';
import RayCast from './RayCast.js';

const DEG2RAD = Math.PI / 180;

export default class Canoe extends fw.core.viewCore {
    constructor(x, y, z) {
        super("Canoe");

        this.x = x;
        this.y = y;
        this.z = z;

        this.mesh = null;
        this.object = null;

        this.clock = new THREE.Clock();
        this.addViewListener('frameUpdate', this.updateFrame);
        this.addContextListener(Constants.events.PLAYER_MODEL_UPDATED, this.onPlayerUpdated);

    }

    onPlayerUpdated(e) {
        if (e) {
            this._playerData = e;
            // Player died, tween the camera back to spawning point.
            if (!e.alive) {
                this.dispatchToView('DetachPlayerObjects', 'boat');
                
                setTimeout(()=>{
                    this.mesh.__dirtyPosition = true;
                    this.mesh.position.x = this.x;
                }, 2000);

            }
        }
    }

    create(scene) {
        this.scene = scene;
        const gltfloader = new GLTFLoader();

        gltfloader.load("./assets/Canoe.glb", (gltf) => {
            const mesh = gltf.scene.children[0];
            this.addMorph(mesh, this.x, this.y, this.z);
            this.addTweens();
        });
    }

    addMorph(mesh, x, y, z)  {
        this.object = mesh;


        const bMesh = new Physijs.BoxMesh(
            new THREE.CubeGeometry( 8, 0.4, 1 ),
            Physijs.createMaterial(
                new THREE.MeshBasicMaterial({transparent:true, color:0xFFFFFF, opacity:0}),
                0,
                0
            ),
            0
        );
        bMesh.position.set(x, y -0.4, z);
        bMesh.name = "boat";

        // mesh.rotation.y = Math.PI / 2;
        mesh.scale.set(0.16, 0.16, 0.16);
        mesh.castShadow = true;
        mesh.receiveShadow = false;

        bMesh.add(mesh);
        this.scene.add(bMesh);
        this.mesh = bMesh;

        this.rayCastL = new RayCast(bMesh.position, new THREE.Vector3(-1, 0, 0));
        this.rayCastR = new RayCast(bMesh.position, new THREE.Vector3(1, 0, 0));
    }

    addTweens() {
        new TWEEN.Tween({y:this.y})
            .to({y: this.y + 0.2}, 750)
            //.easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate((object) => {
                this.mesh.__dirtyPosition = true;
                this.mesh.position.y = object.y;
            })
            .repeat(Infinity)
            .yoyo(true)
            .start();

    }

    updateFrame(delta = 0) {
        delta = this.clock.getDelta();

        if (this.mesh) {
            TWEEN.update();

            this.checkRay(this.rayCastL, 4, this.scene);
            this.checkRay(this.rayCastR, 4, this.scene);
        }
    }

    checkRay(rc, distance) {
        if (this.object && this.mesh.parent) {
            const scene = this.mesh.parent;
            const intersects = rc.intersectObjects(scene.children);

            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.name == "ground") {
                    if (intersects[i].distance < distance) {
                        // Check whether we are going left or right
                        if (rc.ray.direction.x < 0) {
                            this.mesh.position.x += (distance - intersects[i].distance);
                        } else if (rc.ray.direction.x > 0) {
                            this.mesh.position.x -= (distance - intersects[i].distance);
                        }
                        this.dispatchToView('DetachPlayerObjects', 'boat');
                    }
                }
            }

        }
    }
}