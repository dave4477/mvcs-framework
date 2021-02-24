import * as THREE from './../../libs/three.module.js';
import { Physijs } from './../../libs/physi.js';
import Constants from './../../Constants.js';
import Character from './Character.js';
import PlayerInput from './PlayerInput.js';
import DebugSettings from './../../DebugSettings.js';
import LevelParser from './../parsers/LevelParser.js';

export default class MainScene extends fw.core.viewCore {
    constructor() {
        super(Constants.views.MAIN_SCENE);

        Physijs.scripts.worker = './libs/physijs_worker.js';
        Physijs.scripts.ammo = './ammo.js';

        this.levelParser = null;
        this.renderer = null;
        this.scene = null;
        this.ground = null;
        this.light = null;
        this.camera = null;
        this.character = null;
        this.player = null;
        this.playerInput = null;

        this._cameraY = 1.5;
        this._cameraTween = null;
        this._angle = 0;
        this._radius = 14;
        this._isPaused = false;

        this._startX = 0;
        this._startY = 0;
        this._panTo = {x:0, y:0, z:0};

        this._secondsLeft = 0;
        this._addViewListeners();
        this._addContextListeners();
    }

    _addViewListeners() {
        this.addViewListener('ObjectLoaded', this.onPlayerLoaded);
        this.addViewListener('KeyUp', this.onPauseScene);
    }

    _addContextListeners() {
        this.addContextListener(Constants.events.PLAYER_MODEL_UPDATED, this.onPlayerUpdated);
        this.addContextListener(Constants.events.LEVEL_FINISHED, this.onLevelFinished);
    }

    onPlayerUpdated(e) {
        if (e) {
            this._playerData = e;
            // Player died, tween the camera back to spawning point.
            if (!e.alive) {
                const vec3 = new THREE.Vector3(0, this._cameraY, 14);
                // Create a tween for position first
                var tweenObj = {x:this.camera.position.x, y:this.camera.position.y};
                this._cameraTween = new TWEEN.Tween(tweenObj)
                    .to({x: this._playerData.posX, y:this._playerData.posY}, 2000)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .delay(2000)
                    .onUpdate((object) => {
                        this.camera.position.copy(new THREE.Vector3(object.x, object.y, 0)).add(vec3);
                        this.camera.lookAt(new THREE.Vector3(object.x, object.y, 0));

                        this.light.position.copy(new THREE.Vector3(object.x, object.y, 0)).add(new THREE.Vector3(0, 10, -10));
                        this.light.target.position.copy(new THREE.Vector3(object.x, 0, 0)).add(new THREE.Vector3(0, 5, 0));
                    })
                    .onComplete(() => {
                        this.player.respawn(this._playerData.posX, this._playerData.posY);
                        this.dispatchToContext(Constants.events.PLAYER_RESPAWNED);
                    })
                    .start();
            }
        }
    }

    onLevelFinished() {
        // this.pause();
        const timeLeft = this.getTimeLeft();
        this.dispatchToContext(Constants.events.UPDATE_PLAYER_SCORE, {points: timeLeft});
        this.pause();
        this.clearScene();
        this.buildScene();
        this.resume();
        setTimeout(()=>{
            this.pause();
            setTimeout(()=>{
                this.resume();
            }, 100);
        }, 100);
    }

    panCamera(to, duration = 2000) {
        const vec3 = new THREE.Vector3(0, this._cameraY, 14);
        var tweenObj = {x:this._startX, y:this._startY, z:0};
        this._cameraTween = new TWEEN.Tween(tweenObj)
            .to({x: to.x, y:to.y, z:to.z}, duration)
            .repeat(1)
            .yoyo(true)
            .easing(TWEEN.Easing.Quadratic.Out)
            .delay(2000)
            .repeatDelay(500)
            .onUpdate((object) => {
                const updatedVec = new THREE.Vector3(object.x, object.y, object.z);
                this.camera.position.copy(updatedVec).add(vec3);
                this.camera.lookAt(updatedVec);
            }).onComplete(() => {
                this.addPlayer();
                const creatables = this.levelParser.getCreatables();
                for (let i = 0; i < creatables.length; i++) {
                    creatables[i].create();
                }
            })
            .start();
    }

    createRenderer() {
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMapSoft = true;
        return renderer;
    }

    initScene(levelData, playerData) {
        this._levelData = levelData;
        this._playerData = playerData;

        this.renderer = this.createRenderer();

        const viewport = document.getElementById('viewport');
        viewport.appendChild(this.renderer.domElement);

        this.scene = new Physijs.Scene;
        this.scene.setGravity(new THREE.Vector3(0, -50, 0));

        const camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        const camera2 = new THREE.OrthographicCamera(-25, 25, 25, -25, 0.1, 1500);

        this.camera = camera1;

        this.camera.position.set(this._playerData.posX, this._playerData.posY, 14);

        const playerPos = this._levelData.levels[this._playerData.level].playerPos;
        this._startX = playerPos.x;
        this._startY = playerPos.y;

        const panTo = this._levelData.levels[this._playerData.level].cameraPan;
        this._panTo = { x: panTo.x, y: panTo.y, z: panTo.z, time: panTo.time };
        this.buildScene();
    }

    buildScene() {
        this.scene.add( this.camera );

        // Light
        const ambient = new THREE.AmbientLight( 0x686868 ); // soft white light
        this.scene.add( ambient );

        this.light = new THREE.DirectionalLight(0xEEEEEE);
        this.light.position.set(0, 5, 10);
        this.light.target.position.copy(this.scene.position);
        this.light.castShadow = true;
        this.light.shadow.camera = new THREE.OrthographicCamera( -15, 15, 10, -10, 0.5, 1000 );

        this.scene.add(this.light);
        this.scene.add(this.light.target);

        if (DebugSettings.showLightHelper) {
            const helper = new THREE.DirectionalLightHelper(this.light, 5);
            this.scene.add(helper);

            const chelper = new THREE.CameraHelper(this.light.shadow.camera);
            this.scene.add(chelper);
        }
        this.levelParser = new LevelParser(this.scene);
        this.levelParser.setupLevel(this._levelData, this._playerData.level);
        this._secondsLeft = this._levelData.levels[this._playerData.level].timeBonus;

        this.addCharacter();
        if (this.character && this.character.mesh) {
            this.startGame();
        }
    }

    handleVisibilityChange(e) {
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

    addCharacter() {
        if (!this.player) {
            this.player = new Character();
            this.player.create();
        } else {
            this.character.mesh.position.x = this._startX;
            this.character.mesh.position.y = this._startY;
        }
    }

    onPlayerLoaded(data) {
        this.character = data;
        this.character.mesh.position.x = this._startX;
        this.character.mesh.position.y = this._startY;
        this.playerInput = new PlayerInput(this.player);
        this.startGame();
    }

    startGame() {
        window.requestAnimationFrame(() => this.render() );
        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this), false);

        this.scene.simulate();
        this.panCamera({x:this._panTo.x, y:this._panTo.y, z:this._panTo.z}, this._panTo.time);
        setTimeout(()=>{
            this._clock = new THREE.Clock(true);
        }, 14500);
    }

    addPlayer() {
        this.scene.add( this.character.mesh);
        this.scene.add( this.character.model);
    }

    updateCamera() {
        if (this.camera && this._playerData.alive && this.character.mesh.parent) {
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
        } else if (code === 'KeyS') {
            this.dispatchToContext(Constants.events.LEVEL_FINISHED, 1);
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

    render(dt) {
        if (!this._isPaused) {
            this.scene.simulate(undefined, 1);

            this.dispatchToView('frameUpdate', dt);

            if (this.character && this.character.model && this._playerData.alive) {
                this.player.updatePlayer();
                this.updateCamera();
            }
            if (this._cameraTween) {
                TWEEN.update(dt);
            }
            window.requestAnimationFrame(() => this.render());
            this.renderer.render(this.scene, this.camera);

            if (this._clock) {
                const timeLeft = this.getTimeLeft();
                this.dispatchToView(Constants.events.TIMEBONUS_UPDATED, timeLeft);
            }
        }
    }

    getTimeLeft() {
        let left = this._secondsLeft;
        left -= this._clock.getElapsedTime();
        return Math.floor(left);
    }
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.camera.updateProjectionMatrix();
    }

    clearScene() {
        while(this.scene.children.length){
            this.scene.remove(this.scene.children[0]);
        }
    }
}