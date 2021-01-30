//import fw from './../../../../src/core/fw.js';
import * as THREE from './../../libs/three.module.js';
import { Physijs } from './../../libs/physi.js';
import SkyBox from './SkyBox.js';
import Platforms from './Platforms.js';
import Character from './Character.js';
import SnowMan from './SnowMan.js';
import Box from './Box.js';
import PlayerInput from './PlayerInput.js';

export default class MainScene extends fw.core.viewCore {
    constructor() {
        super("MAIN_SCENE");

        Physijs.scripts.worker = './libs/physijs_worker.js';
        Physijs.scripts.ammo = './ammo.js';

        this.renderer = null;
        this.scene = null;
        this.ground = null;
        this.light = null;
        this.camera = null;
        this.character = null;
        this.player = null;
        this.playerInput = null;
        this.loader = new THREE.TextureLoader();
        this._enemies = [];
        this._addViewListeners();
    }

    _addViewListeners() {
        this.addViewListener('ObjectLoaded', this.onPlayerLoaded);
        this.addViewListener('SnowManLoaded', this.onSnowManLoaded);
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
        this.addSnowMen();
        this.addSkyBox();
        this.spawnBoxes();

        window.requestAnimationFrame(() => this.render() );
        this.scene.simulate();
    }

    addSkyBox() {
        const skyBox = SkyBox.create();
        this.scene.add( skyBox );
    }

    spawnBoxes(boxCount = 1) {

        setTimeout( () => {
            for (let i = 0; i < boxCount; i++) {
                const boxFactory = new Box(this.loader);
                const box = boxFactory.create();
                box.position.set( Math.random() * 35 - 7.5, 25, Math.random() * 30 - 7.5 );
                this.scene.add(box);
            }
            const rand = Math.floor(Math.random() * 50);
            this.spawnBoxes(rand);
        }, 5000);
    }

    addSnowMen() {
        this._enemies.push(new SnowMan());
        this._enemies[this._enemies.length-1].create();
    }

    onSnowManLoaded(snowMan) {
        snowMan.position.x = 6;
        snowMan.position.y = 1;
        this.scene.add(snowMan);
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