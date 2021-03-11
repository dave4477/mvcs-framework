import * as THREE from './../../libs/three.module.js';

import Constants from './../../Constants.js';
import SkyBox from './../mainview/SkyBox.js';
import Platforms from './../mainview/Platforms.js';
import Banana from './../collectibles/Banana.js';
import Cog from './../collectibles/Cog.js';
import FallingRocks from './../obstacles/FallingRocks.js';
import Palms from './../decoration/Palms.js';
import Grass from './../decoration/Grass.js';
import Spikes from './../obstacles/Spikes.js';
import Crusher from './../obstacles/Crusher.js';
import Launcher from './../interaction/Launcher.js';
import Bear from './../obstacles/Bear.js';
import VenusFlyTrap from './../obstacles/VenusFlyTrap.js';
import Parrot from './../obstacles/Parrot.js';
import Flamingo from './../obstacles/Flamingo.js';
import Stork from './../obstacles/Stork.js';
import Bees from './../obstacles/Bees.js';
import Bee from './../obstacles/Bee.js';
import Fish from './../obstacles/Fish.js';

import LevelFinish from './../finish/LevelFinish.js';
import Bridge from './../interaction/Bridge.js';
import Canoe from './../helpers/Canoe.js';
import UFO from './../helpers/UFO.js';
import Crate from './../helpers/Crate.js';
import LevelFeatures from './LevelFeatures.js';
import WaterPlane from './../decoration/WaterPlane.js';

const DEG2RAD = Math.PI / 180;

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
        const skyBox = new SkyBox(level.skybox.path, level.skybox.filetype, level.skybox.rotation).create(this._container);
        

        // Add platforms
        Platforms.create(this._container, level.platforms);
        Platforms.createBottomCatcher(this._container);

        // Add decorations
        const palms = new Palms();
        const palmArr = [];

        const grass = new Grass();
        const grassArr = [];

        for (let i = 0; i < level.decorations.length; i++) {
            const decoration = level.decorations[i];
            if (decoration.type == "tree") {
                palmArr.push(decoration);
            } else if (decoration.type == "grass") {
                grassArr.push(decoration);
            } else if (decoration.type == "water") {
                new WaterPlane(this._container, decoration.y).create(10000, 10000);
            }
        }
        palms.create(this._container, palmArr);
        grass.create(this._container, grassArr);

        // Add obstacles
        for (let spike = 0; spike < level.obstacles.length; spike++) {
            const obstacle = level.obstacles[spike];
            if (obstacle.type == "spike") {
                let rotation = obstacle.rotation || 0;
                let z = obstacle.z || 0;
                this._container.add(new Spikes().create(obstacle.x, obstacle.y, z, rotation));

            } else if (obstacle.type == "crusher") {
                this._container.add(new Crusher(new THREE.Vector3(obstacle.x, obstacle.y, obstacle.z), new THREE.Vector3(obstacle.width, obstacle.height, obstacle.depth), obstacle.toY, obstacle.delay).create());
            } else if (obstacle.type == "bear") {
                new Bear(obstacle.x, obstacle.y, obstacle.endX, obstacle.duration).create(this._container);
            } else if (obstacle.type == "parrot") {
                new Parrot(obstacle.x, obstacle.y, obstacle.z, obstacle.endX, obstacle.duration).create(this._container);
            } else if (obstacle.type == "flamingo") {
                new Flamingo(obstacle.x, obstacle.y, obstacle.endX, obstacle.duration).create(this._container);
            } else if (obstacle.type == "stork") {
                new Stork(obstacle.x, obstacle.y, obstacle.endX, obstacle.duration).create(this._container);
            } else if (obstacle.type == "fallingRocks") {
                LevelFeatures.features.destroyable.push(new FallingRocks(obstacle.x, obstacle.y, this._container));
            } else if (obstacle.type == "venusFlyTrap") {
                new VenusFlyTrap(obstacle.x, obstacle.y).create(this._container);
            } else if (obstacle.type == "bee") {
                new Bee(obstacle.x, obstacle.y, obstacle.z, obstacle.endX, obstacle.duration).create(this._container);
            } else if (obstacle.type == "bees") {
                new Bees(obstacle.bees).create(this._container);
            } else if (obstacle.type == "fish") {
                new Fish(obstacle.x, obstacle.y, obstacle.z, obstacle.delay, obstacle.duration, obstacle.force).create(this._container);
            }
        }

        // Add collectables
        const collectibles = level.collectibles;
        for (let i = 0; i < collectibles.length; i++) {
            const collectible = collectibles[i];
            if (collectible.type == "banana") {
                new Banana(collectible.x, collectible.y).create(this._container);
            } else if (collectible.type == "cog") {
                new Cog(collectible.x, collectible.y).create(this._container);
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
            } else if (helper.type == "canoe") {
                new Canoe(helper.x, helper.y, helper.z).create(this._container);
            } else if (helper.type == "crate") {
                new Crate(helper.x, helper.y, helper.z).create(this._container);
            } else if (helper.type == "UFO") {
                new UFO(helper.x, helper.y, helper.z).create(this._container);
            }
        }
        
        // Add finish
        const finish = level.finish;
        for (let i = 0; i < finish.length; i++) {
            const levelFinish = finish[i];
            new LevelFinish(levelFinish.x, levelFinish.y, levelFinish.z, levelFinish.scale, levelFinish.rotationY, levelFinish.asset).create(this._container);

        }
    }

    getCreatables() {
        return LevelFeatures.features.destroyable;
    }

    getDestroyable() {
        return LevelFeatures.features.destroyable;
    }
}