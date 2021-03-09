import * as THREE from './../../libs/three.module.js';

const DEG2RAD = Math.PI / 180;

export default class Grass {

    constructor(parent) {
        this._parent = parent;


        this.create();
    }

    create() {
        return;
        const width = this._parent.geometry.boundingBox.max.x * 2;
        const height = this._parent.geometry.boundingBox.max.y * 2;
        const depth = this._parent.geometry.boundingBox.max.z * 2;

        const geometry = new THREE.PlaneGeometry(width, depth);
        const texture = new THREE.CanvasTexture(this.generateTexture());
        const parent = new THREE.Mesh( new THREE.CubeGeometry( width, height, depth ), new THREE.MeshBasicMaterial({transparent:true, color:0x3333CC, opacity:0}) );

        for (let i = 0; i < 15; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.3, 0.75, ( i / 15 ) * 0.4 + 0.1),
                map: texture,
                depthTest: false,
                depthWrite: false,
                transparent: true
            });

            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.y = i * 0.20;
            mesh.rotation.x = -Math.PI / 2;

            parent.add(mesh);
        }
        parent.scale.y = 0.05;
        //parent.scale.z = 0.5;
        parent.position.y = (height / 2);
        this._parent.add(parent);

    }


    generateTexture() {
        const canvas = document.createElement( 'canvas' );
        canvas.width = 512;
        canvas.height = 512;

        const context = canvas.getContext( '2d' );

        for ( let i = 0; i < 20000; i ++ ) {
            context.fillStyle = 'hsl(0,0%,' + ( Math.random() * 50 + 50 ) + '%)';
            context.beginPath();
            context.arc( Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math.PI * 2, true );
            context.fill();
        }
        context.globalAlpha = 0.075;
        context.globalCompositeOperation = 'lighter';
        return canvas;
    }

}