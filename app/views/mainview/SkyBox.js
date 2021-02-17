import * as THREE from './../../../app/libs/three.module.js';

export default class SkyBox {
    constructor() {
    }

    static create(path) {
        const loader = new THREE.TextureLoader();
        const imagePrefix = path;
        const directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
        const imageSuffix = ".png";
        const skyGeometry = new THREE.CubeGeometry( 1250, 1250, 1250 );

        var materialArray = [];
        for (let i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
                map: loader.load( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.BackSide
            }));
        const skyMaterial = materialArray;
        var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        return skyBox;
    }
}