import * as THREE from './../../libs/three.module.js';
import { Physijs } from './../../libs/physi.js';
import Constants from './../../Constants.js';
import SkyBox from './SkyBox.js';
import Platforms from './Platforms.js';
import Character from './Character.js';
import SnowMan from './SnowMan.js';
import Banana from './../collectibles/Banana.js';
import FallingRocks from './../obstacles/FallingRocks.js';
import Palms from './../decoration/Palms.js';
import PlayerInput from './PlayerInput.js';
import DebugSettings from './../../DebugSettings.js';
import Collectibles from './../collectibles/Collectibles.js';
import Spikes from './../obstacles/Spikes.js';
import RisingSpikes from './../obstacles/RisingSpikes.js';
import Crusher from './../obstacles/Crusher.js';
import Launcher from './../interaction/Launcher.js';
import Bear from './../obstacles/Bear.js';

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

        this._cameraY = 1.5;
        this._cameraTween = null;

        this._angle = 0;
        this._radius = 14;
        this._isPaused = false;
        this._playerData = {isAlive:true, score:0};

        this._fallingRocks = null;

        this._addViewListeners();
        this._addContextListeners();
    }

    _addViewListeners() {
        this.addViewListener('ObjectLoaded', this.onPlayerLoaded);
        this.addViewListener('SnowManLoaded', this.onSnowManLoaded);
        this.addViewListener('KeyUp', this.onPauseScene);
    }

    _addContextListeners() {
        this.addContextListener(Constants.events.PLAYER_MODEL_UPDATED, this.onPlayerUpdated);
    }

    onPlayerUpdated(e) {
        if (e) {
            this._playerData = e;

            if (!e.isAlive) {
                const vec3 = new THREE.Vector3(0, this._cameraY, 14);
                // Create a tween for position first
                var tweenObj = {x:this.camera.position.x, y:this.camera.position.y};
                this._cameraTween = new TWEEN.Tween(tweenObj)
                    .to({x: 0, y:4}, 2000)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate((object) => {
                        this.camera.position.copy(new THREE.Vector3(object.x, object.y, 0)).add(vec3);
                        this.camera.lookAt(new THREE.Vector3(object.x, object.y, 0));
                    })
                    .onComplete(() => {
                        this.player.respawn();
                        this._playerData.isAlive = true;
                    })
                    .start();
            }
        }
    }

    createRenderer() {
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
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

        const camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        const camera2 = new THREE.OrthographicCamera(-10,10,10,-10, 0.1, 1500);

        this.camera = camera1;

        this.camera.position.set( 0, 1, 20 );
        this.camera.lookAt( this.scene.position );
        this.scene.add( this.camera );

        // Light
        const ambient = new THREE.AmbientLight( 0x666666 ); // soft white light
        this.scene.add( ambient );

        this.light = new THREE.DirectionalLight(0xEEEEEE);
        this.light.position.set(0, 5, 10);
        this.light.target.position.copy(this.scene.position);
        this.light.castShadow = true;
        this.light.shadow.camera = new THREE.OrthographicCamera( -10, 10, 10, -10, 0.5, 1000 );

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
        this.addPalms();
        this.addSpikes();
        // this.addRisingSpikes();
        this.addCollectibles();
        this.spawnRocks();
        this.addCrushers();
        this.addLaunchers();
        this.addBears();

        window.requestAnimationFrame(() => this.render() );
        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this), false);

        this.scene.simulate();
    }

    handleVisibilityChange(e) {
        console.log("visibility changed to:", e);
        if (document.visibilityState == "hidden") {
            this.pause();
        } else {
            this.resume();
            setTimeout(()=>{
                this.pause();
                setTimeout(()=>{
                    this.resume();
                }, 100);
            }, 100);
        }
    }

    addPlatforms() {
        Platforms.create(this.scene);
        Platforms.createBottomCatcher(this.scene);
    }

    addPalms() {
        const palms = new Palms();
        palms.create(this.scene);
    }

    addSpikes() {
        this.scene.add(new Spikes().create(45, 0));
        this.scene.add(new Spikes().create(46, 0));
        this.scene.add(new Spikes().create(47, 0));
        this.scene.add(new Spikes().create(48, 0));

        this.scene.add(new Spikes().create(170, 0));
        this.scene.add(new Spikes().create(171, 0));
        this.scene.add(new Spikes().create(172, 0));
        this.scene.add(new Spikes().create(173, 0));

        this.scene.add(new Spikes().create(178, 0));

        this.scene.add(new Spikes().create(183, 0));
        this.scene.add(new Spikes().create(184, 0));
        this.scene.add(new Spikes().create(185, 0));

    }

    addRisingSpikes() {
        var risingSpikes = new RisingSpikes(this.scene);
        risingSpikes.create(200, 0, 10);
    }
    addCrushers() {
        this.scene.add(new Crusher(new THREE.Vector3(110, 5, 0), new THREE.Vector3(2,2,8), 0).create());
        this.scene.add(new Crusher(new THREE.Vector3(116, 5, 0), new THREE.Vector3(2,2,8), 1500).create());
        this.scene.add(new Crusher(new THREE.Vector3(122, 5, 0), new THREE.Vector3(2,2,8), 0).create());
        // this.scene.add(new Crusher(new THREE.Vector3(128, 5, 0), new THREE.Vector3(2,2,8), 3000).create());
    }

    addLaunchers() {
        this.scene.add(new Launcher().create(new THREE.Vector3(236, 4, 0), new THREE.Vector3(2,1,2), 60));

    }

    addBears() {
        new Bear(200, 0, 215, 2000).create(this.scene);
        new Bear(136, 15, 146, 1000).create(this.scene);
    }

    addCollectibles() {
        for (let i = 0; i < Collectibles.length; i++) {
            const x = Collectibles[i].x;
            const y = Collectibles[i].y;
            const banana = new Banana(x, y);
            banana.create(this.scene);
        }
    }

    addSkyBox() {
        const skyBox = SkyBox.create();
        this.scene.add( skyBox );
    }

    spawnRocks() {
        this._fallingRocks = new FallingRocks(28, 10, this.scene);
        this._fallingRocks.create();
    }


    addSnowMen() {
        new SnowMan().create();
    }

    onSnowManLoaded(snowMan) {
        snowMan.position.x = 150;
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
        this.character.mesh.position.x = 190;
        this.scene.add( this.character.mesh);
        this.scene.add( this.character.model);
        this.playerInput = new PlayerInput(this.player);
    }
    

    updateCamera() {
        if (this.camera && this._playerData.isAlive) {
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

            this.camera.position.copy(player.position).add(vec3);
            this.camera.lookAt(player.position);

            // Make character have shadow.
            this.light.position.copy(player.position).add(new THREE.Vector3(0, 10, -10));
            this.light.target.position.copy(new THREE.Vector3(player.position.x, 0, 0)).add(new THREE.Vector3(0, 5, 0));

        }
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
        this._isPaused = true;
        window.cancelAnimationFrame(this.render);
        this.dispatchToContext(Constants.events.PAUSE_SIMULATION);
    }

    resume() {
        this._isPaused = false;
        this.render();
        this.dispatchToContext(Constants.events.RESUME_SIMULATION);
    }

    render() {
        if (!this._isPaused) {
            this.scene.simulate(undefined, 1);

            this.dispatchToView('frameUpdate');

            if (this.character && this.character.model && this._playerData.isAlive) {
                this.player.updatePlayer();
                this.updateCamera();
            }
            if (this._cameraTween) {
                TWEEN.update();
            }
            window.requestAnimationFrame(() => this.render());
            this.renderer.render(this.scene, this.camera);
        }
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.camera.updateProjectionMatrix();
    }
}