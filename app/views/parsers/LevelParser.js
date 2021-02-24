import * as THREE from './../../../app/libs/three.module.js';

import Constants from './../../Constants.js';
import SkyBox from './../mainview/SkyBox.js';
import Platforms from './../mainview/Platforms.js';
import Banana from './../collectibles/Banana.js';
import FallingRocks from './../obstacles/FallingRocks.js';
import Palms from './../decoration/Palms.js';
import Spikes from './../obstacles/Spikes.js';
import Crusher from './../obstacles/Crusher.js';
import Launcher from './../interaction/Launcher.js';
import Bear from './../obstacles/Bear.js';
import Parrot from './../obstacles/Parrot.js';
import Flamingo from './../obstacles/Flamingo.js';
import Stork from './../obstacles/Stork.js';
import LevelFinish from './../finish/LevelFinish.js';
import Bridge from './../interaction/Bridge.js';
import LevelFeatures from './LevelFeatures.js';

export default class LevelParser extends fw.core.viewCore {
    constructor(container) {
        super(Constants.views.LEVEL_PARSER);
        this._levelData = null;
        this._container = container;
    }

    setupLevel(levelData, currLevel) {
        this._levelData = levelData.levels;
        const level = this._levelData[currLevel];

        // Destroy previous level if any.
        let destroyables = LevelFeatures.features.destroyable;
        for (let i = 0; i < destroyables.length; i++) {
            destroyables[i].destroy();
        }
        LevelFeatures.features.destroyable = [];

        // Add skybox
        const skyBox = SkyBox.create(level.skybox.path);
        this._container.add( skyBox );

        // Add platforms
        Platforms.create(this._container, level.platforms);
        Platforms.createBottomCatcher(this._container);

        // Add decorations
        const palms = new Palms();
        palms.create(this._container, level.decorations);

        // Add obstacles
        for (let spike = 0; spike < level.obstacles.length; spike++) {
            const obstacle = level.obstacles[spike];
            if (obstacle.type == "spike") {
                this._container.add(new Spikes().create(obstacle.x, obstacle.y));

            } else if (obstacle.type == "crusher") {
                this._container.add(new Crusher(new THREE.Vector3(obstacle.x, obstacle.y, obstacle.z), new THREE.Vector3(obstacle.width, obstacle.height, obstacle.depth), obstacle.delay).create());
            } else if (obstacle.type == "bear") {
                new Bear(obstacle.x, obstacle.y, obstacle.endX, obstacle.duration).create(this._container);
            } else if (obstacle.type == "parrot") {
                new Parrot(obstacle.x, obstacle.y, obstacle.endX, obstacle.duration).create(this._container);
            } else if (obstacle.type == "flamingo") {
                new Flamingo(obstacle.x, obstacle.y, obstacle.endX, obstacle.duration).create(this._container);
            } else if (obstacle.type == "stork") {
                new Stork(obstacle.x, obstacle.y, obstacle.endX, obstacle.duration).create(this._container);
            } else if (obstacle.type == "fallingRocks") {
                LevelFeatures.features.destroyable.push(new FallingRocks(obstacle.x, obstacle.y, this._container));
            } 
        }

        // Add collectables
        const collectibles = level.collectibles;
        for (let i = 0; i < collectibles.length; i++) {
            const collectible = collectibles[i];
            if (collectible.type == "banana") {
                new Banana(collectible.x, collectible.y).create(this._container);

            }
        }

        // Add helpers like e.g. launchers, ladders etc.
        const helpers = level.helpers;
        for (let i = 0; i < helpers.length; i++) {
            const helper = helpers[i];
            if (helper.type == "launcher") {
                this._container.add(new Launcher().create(new THREE.Vector3(helper.x, helper.y, helper.z), new THREE.Vector3(helper.width, helper.height, helper.depth), helper.launchForce));
            } else if (helper.type == "bridge") {
                new Bridge(helper.x, helper.y, helper.z).create(this._container);
            }
        }
        
        // Add finish
        const finish = level.finish;
        for (let i = 0; i < finish.length; i++) {
            const levelFinish = finish[i];
            new LevelFinish(levelFinish.x, levelFinish.y, levelFinish.z, levelFinish.scale, levelFinish.asset).create(this._container);

        }
    }

    getCreatables() {
        return LevelFeatures.features.destroyable;
    }

    getDestroyable() {
        return LevelFeatures.features.destroyable;
    }
}