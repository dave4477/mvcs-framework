import fw from './../../../../src/core/fw.js';
import * as THREE from './../../../libs/three.module.js';
import { Physijs } from './../../../libs/physi.js';

import Platforms from './Platforms.js';
import Character from './Character.js';
import PlayerInput from './PlayerInput.js';

export default class MainScene extends fw.core.viewCore {
    constructor() {
        super("MAIN_SCENE");

        Physijs.scripts.worker = './libs/physijs_worker.js';
        Physijs.scripts.ammo = './ammo.js';

        this._boxes = [];
        this.loader = null;
        this.renderer = null;
        this.scene = null;
        this.ground = null;
        this.light = null;
        this.camera = null;
        this.numBoxes = null;
        this.character = null;
        this.player = null;
        this.playerInput = null;
        this.loader = new THREE.TextureLoader();
        
        this._addViewListeners();
    }

    _addViewListeners() {
        this.addViewListener('ObjectLoaded', this.onPlayerLoaded);
    }

    createRenderer() {
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(1280, 720);
        renderer.shadowMap.enabled = true;
        renderer.shadowMapSoft = true;
        return renderer;
    }

    initScene() {
        this.renderer = this.createRenderer();

        const viewport = document.getElementById( 'viewport' );
        if (viewport.childElementCount) {
            viewport.innerHTML = "";
        }
        viewport.appendChild( this.renderer.domElement );

        this.scene = new Physijs.Scene;
        this.scene.setGravity(new THREE.Vector3(0, -50, 0));
        this.scene.addEventListener('update', ()=> {
            this.scene.simulate(undefined, 1);
        });

        this.camera = new THREE.PerspectiveCamera(
            35,
            1280 / 720,
            1,
            1000
        );
        this.camera.position.set( 0, 1, 20 );
        this.camera.lookAt( this.scene.position );
        this.scene.add( this.camera );

        // Light
        this.light = new THREE.DirectionalLight(0xFFFFFF);
        this.light.position.set(-10, 6, 10);
        this.light.target.position.copy(this.scene.position);
        this.light.castShadow = true;
        this.scene.add(this.light);


        Platforms.create(this.scene);
        Platforms.createBottomCatcher(this.scene);
        this.addCharacter();
        this.addSkyBox();


        window.requestAnimationFrame(() => this.render() );
        this.scene.simulate();
    }

    addSkyBox() {
        var imagePrefix = "images/dawnmountain-";
        var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
        var imageSuffix = ".png";
        var skyGeometry = new THREE.CubeGeometry( 500, 500, 500 );

        var materialArray = [];
        for (var i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
                map: this.loader.load( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.BackSide
            }));
        var skyMaterial = materialArray;
        var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        this.scene.add( skyBox );

    }
    spawnBoxes(numBoxes) {
        this.numBoxes = numBoxes;
        this.spawnBox();
    }

    spawnBox(boxCount = 0) {
        const box_geometry = new THREE.BoxGeometry(1, 1, 1);
        this.createBox(box_geometry, boxCount);
    }

    createBox(box_geometry, boxCount = 0) {
        var box, material;

        material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: this.loader.load( 'images/plywood.jpg' ) }),
            .6, // medium friction
            .6 // low restitution
        );
        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set( .5, .5 );

        box = new Physijs.BoxMesh(
            box_geometry,
            material,
            1
        );
        box.collisions = 0;
        box.position.set(
            Math.random() * 35 - 7.5,
            25,
            Math.random() * 30 - 7.5
        );
        box.name = "box";
        box.castShadow = true;
        this._boxes.push(box);

        if (boxCount < this.numBoxes) {
            this.scene.add( box );
            this.spawnBox(++boxCount)
        }
    }

    addCharacter() {
        this.player = new Character();
        this.player.create();
    }

    onPlayerLoaded(data) {
        this.character = data;
        this.character.mesh.position.y = 4;
        this.scene.add( this.character.mesh);
        this.scene.add( this.character.model);
        this.playerInput = new PlayerInput(this.player);
        this.playerInput.addKeyListeners();
    }
    

    updateCamera() {
        const player = this.character.mesh;
        this.camera.position.copy( player.position ).add( new THREE.Vector3( 0, 1.5, 14 ) );
        this.camera.lookAt( player.position );
    }

    render() {
        if (this.character && this.character.model) {
            this.player.updatePlayer();
            this.updateCamera();
        }
        window.requestAnimationFrame(() => this.render() );
        this.renderer.render( this.scene, this.camera );
    };
}