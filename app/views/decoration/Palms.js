import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from '../helpers/ObjectLoaders.js';

const DEG2RAD = Math.PI / 180;

const palm1Positions = [
    {posX:37, posY:-2, posZ:-6, scale:0.5, rotationY:0.6, asset:'./assets/palm01/Palm_01.fbx'},
    {posX:42, posY:-3, posZ:-8, scale:0.5, rotationY:0.6, asset:'./assets/palm01/Palm_01.fbx'},
    {posX:47, posY:-1, posZ:-4, scale:0.5, rotationY:0.6, asset:'./assets/palm01/Palm_01.fbx'},
    {posX:48, posY:-2, posZ:-6, scale:0.5, rotationY:0.6, asset:'./assets/palm01/Palm_01.fbx'},
    {posX:53, posY:-3, posZ:-8, scale:0.5, rotationY:0.6, asset:'./assets/palm01/Palm_01.fbx'},
    {posX:56, posY:-2, posZ:-6, scale:0.5, rotationY:0.6, asset:'./assets/palm01/Palm_01.fbx'},
    {posX:60, posY:-3, posZ:-8, scale:0.5, rotationY:0.6, asset:'./assets/palm01/Palm_01.fbx'}

];
const palm2Positions = [
    {posX:100, posY:-1.5, posZ:-8, scale:0.5, asset:'./assets/palm02/Palm2.fbx'},
    {posX:104, posY:-2, posZ:-8, scale:0.5, asset:'./assets/palm02/Palm2.fbx'},
    {posX:105, posY:-2, posZ:-7, scale:0.5, asset:'./assets/palm02/Palm2.fbx'},
    {posX:110, posY:-3, posZ:-10, scale:0.5, asset:'./assets/palm02/Palm2.fbx'},

    {posX:130, posY:-4, posZ:-12, scale:0.5, asset:'./assets/palm02/Palm1.fbx'},
    {posX:134, posY:-4, posZ:-10, scale:0.5, asset:'./assets/palm02/Palm1.fbx'},
    {posX:136, posY:-1.5, posZ:-8, scale:0.5, asset:'./assets/palm02/Palm2.fbx'},
    {posX:144, posY:-4, posZ:-10, scale:0.5, asset:'./assets/palm02/Palm1.fbx'},
    {posX:180, posY:-2, posZ:-8, scale:0.5, asset:'./assets/palm02/Palm2.fbx'},
    {posX:200, posY:-2, posZ:-6, scale:0.5, asset:'./assets/palm02/Palm2.fbx'}
];

const palm3Positions = [
    {posX:204, posY:-2, posZ:-6, scale:0.05, rotationY:180 * (DEG2RAD), asset:'./assets/palm03/CoconutPalm_RBX.fbx'}
];



export default class Palms extends fw.core.viewCore {
    constructor() {
        super("Palms");
        this.objectLoader = new ObjectLoaders();
        this.palms = [];
    }


    addPalms(palmArray, container) {

        for (let palm = 0; palm < palmArray.length; palm++) {
            this.objectLoader.loadFBX(palmArray[palm].asset, "tga").then((object) => {

                const scale = palmArray[palm].scale;

                object.scale.set(scale, scale, scale);

                object.position.x = palmArray[palm].posX;
                object.position.y = palmArray[palm].posY;
                object.position.z = palmArray[palm].posZ;

                object.rotation.y = palmArray[palm].rotationY || Math.random();

                container.add(object);

            });
        }

    }
    create(container) {
        this.addPalms(palm1Positions, container);
        this.addPalms(palm2Positions, container);
        //this.addPalms(palm3Positions, container);
    }
}