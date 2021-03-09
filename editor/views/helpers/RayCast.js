import * as THREE from './../../libs/three.module.js';

export default class RayCast {
    constructor(origin, direction, scene = null, near = 0, far = 10) {
        direction = direction.normalize();
        this.raycaster = new THREE.Raycaster(origin, direction, near, far);

        // if (scene) {
        //     var distance = far;
        //
        //     var pointB = new THREE.Vector3();
        //     pointB.addVectors(origin, direction.multiplyScalar(distance));
        //
        //     var geometry = new THREE.Geometry();
        //     geometry.vertices.push(origin);
        //     geometry.vertices.push(pointB);
        //
        //     console.log(origin, pointB);
        //
        //     var material = new THREE.LineBasicMaterial({color: 0xffffff});
        //     var line = new THREE.Line(geometry, material);
        //     scene.add(line);
        // }
        return this.raycaster;
    }


    changeDirection(direction) {
        switch (direction) {
            case 1:
                this.raycaster.ray.direction = new THREE.Vector3(1,0,0);
                break;

            case -1:
                this.raycaster.ray.direction = new THREE.Vector3(-1,0,0);
                break;
        }
    }
}