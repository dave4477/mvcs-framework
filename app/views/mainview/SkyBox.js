import * as THREE from './../../../app/libs/three.module.js';

export default class SkyBox {
    constructor() {
    }

    static create() {
        const loader = new THREE.TextureLoader();
        const imagePrefix = "images/dawnmountain-";
        const directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
        const imageSuffix = ".png";
        const skyGeometry = new THREE.CubeGeometry( 500, 500, 500 );

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