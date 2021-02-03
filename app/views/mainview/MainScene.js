import * as THREE from './../../libs/three.module.js';
import { Physijs } from './../../libs/physi.js';
import SkyBox from './SkyBox.js';
import Platforms from './Platforms.js';
import Character from './Character.js';
import SnowMan from './SnowMan.js';
import Box from './Box.js';
import PlayerInput from './PlayerInput.js';
import DebugSettings from './../../DebugSettings.js';

export default class MainScene extends fw.core.viewCore {
    constructor() {
        super("MainScene");

        Physijs.scripts.worker = './libs/physijs_worker.js';
        Physijs.scripts.ammo = './ammo.js';
        // Physijs.scripts.worker = './/libs/worker.wasm.js';
        // Physijs.scripts.ammo = './../../libs/ammo.wasm.js';

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

        this._cameraY = 1.5;
        this._angle = 0;
        this._radius = 14;
        this._isPaused = false;

        this._addViewListeners();
    }

    _addViewListeners() {
        this.addViewListener('ObjectLoaded', this.onPlayerLoaded);
        this.addViewListener('SnowManLoaded', this.onSnowManLoaded);
        this.addViewListener('KeyUp', this.onPauseScene);
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
        const ambient = new THREE.AmbientLight( 0x444444 ); // soft white light
        this.scene.add( ambient );

        this.light = new THREE.DirectionalLight(0xEEEEEE);
        this.light.position.set(0, 5, 10);
        this.light.target.position.copy(this.scene.position);
        this.light.castShadow = true;

        this.scene.add(this.light);
        this.scene.add(this.light.target);

        if (DebugSettings.showLightHelper) {
            const helper = new THREE.DirectionalLightHelper(this.light, 5);
            this.scene.add(helper);

            const chelper = new THREE.CameraHelper(this.light.shadow.camera);
            this.scene.add(chelper);
        }

        this.addPlatforms();
        this.addCharacter();
        this.addSnowMen();
        this.addSkyBox();
        this.spawnBoxes();

        window.requestAnimationFrame(() => this.render() );
        this.scene.simulate();
    }

    addPlatforms() {
        Platforms.create(this.scene);
        Platforms.createBottomCatcher(this.scene);
    }

    addSkyBox() {
        const skyBox = SkyBox.create();
        this.scene.add( skyBox );
    }

    spawnBoxes(boxCount = 5) {

        setTimeout( () => {
            for (let i = 0; i < boxCount; i++) {
                const boxFactory = new Box(this.loader);
                const box = boxFactory.create();
                box.position.set( Math.random() * 100, 15, 0);
                this.scene.add(box);
            }
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
    }
    

    updateCamera() {
        const player = this.character.mesh;
        const vec3 = new THREE.Vector3(0, this._cameraY, 14);

        if (this.playerInput) {
            if (this.playerInput.pressedKeys['KeyA']) {
                vec3.x = this._radius * Math.cos(this._angle);
                vec3.z = this._radius * Math.sin(this._angle);
                this._angle += 0.01;
            } else if (this.playerInput.pressedKeys['KeyD']) {
                vec3.x = this._radius * Math.cos(this._angle);
                vec3.z = this._radius * Math.sin(this._angle);
                this._angle -= 0.01;
            } else if (this.playerInput.pressedKeys['KeyW']) {
                vec3.y = this._radius * Math.cos(this._angle);
                vec3.z = this._radius * Math.sin(this._angle);
                this._angle += 0.01;
            } else if (this.playerInput.pressedKeys['KeyX']) {
                vec3.y = this._radius * Math.cos(this._angle);
                vec3.z = this._radius * Math.sin(this._angle);
                this._angle -= 0.01;
            }
        }

        this.camera.position.copy( player.position ).add( vec3 );
        this.camera.lookAt( player.position );

        // Make character have shadow.
        this.light.position.copy(player.position).add(new THREE.Vector3(0, 15, 10));
        this.light.target.position.copy(new THREE.Vector3(player.position.x, 0, 0)).add(new THREE.Vector3(0, 5, 0));



    }

    onPauseScene(code) {
        if (code === 'KeyP') {
            if (!this._isPaused) {
                this._isPaused = true;
                this.pause();
            } else {
                this._isPaused = false;
                this.resume();
            }
        }
    }

    pause() {
        window.cancelAnimationFrame(this.render);
    }

    resume() {
        this.render();
    }

    render() {
        if (!this._isPaused) {
            this.scene.simulate(undefined, 1);

            if (this.character && this.character.model) {
                this.player.updatePlayer();
                this.updateCamera();
            }
            window.requestAnimationFrame(() => this.render());
            this.renderer.render(this.scene, this.camera);
        }
    }
}