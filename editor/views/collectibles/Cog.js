import * as THREE from './../../libs/three.module.js';

export default class Cog extends fw.core.viewCore {
    constructor(x, y) {
        super("Cog");
        this._x = x;
        this._y = y;
        this._object = null;
        this.points = 10;
    }
    
    create(container) {
            const geometry = new THREE.TorusGeometry( 0.15, 0.1, 3, 15, 6.3 );
            const material = new THREE.MeshPhongMaterial( { color: 0xeeeefe, shininess:100 } );
            const object = new THREE.Mesh( geometry, material );
            this._object = object;
            this._object.name = "Collectible";
            this._object.userData = {points: this.points, owner:this};
            this._object.position.x = this._x;
            this._object.position.y = this._y;
            container.add(this._object);
            this.addViewListener('frameUpdate', this.onFrameUpdate);
    }

    onFrameUpdate() {
        if (this._object) {
            this._object.rotation.y += 0.1;
        }
    }

    destroy() {
        this.removeViewListener('frameUpdate', this.onFrameUpdate);
        this._object.geometry.dispose();
        this._object.material.dispose();
        this._object = null;
    }

}