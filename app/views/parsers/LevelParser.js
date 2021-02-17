import * as THREE from './../../../app/libs/three.module.js';

import Constants from './../../Constants.js';
import SkyBox from './../mainview/SkyBox.js';
import Platforms from './../mainview/Platforms.js';
import Character from './../mainview/Character.js';
import Banana from './../collectibles/Banana.js';
import FallingRocks from './../obstacles/FallingRocks.js';
import Palms from './../decoration/Palms.js';
import Spikes from './../obstacles/Spikes.js';
import Crusher from './../obstacles/Crusher.js';
import Launcher from './../interaction/Launcher.js';
import Bear from './../obstacles/Bear.js';

export default class LevelParser extends fw.core.viewCore {
    constructor(container) {
        super(Constants.views.LEVEL_PARSER);
        this._levelData = null;
        this._container = container;
    }

    setupLevel(levelData, currLevel) {
        this._levelData = levelData.levels;
        const level = this._levelData[currLevel];

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
            } else if (obstacle.type == "fallingRocks") {
                new FallingRocks(obstacle.x, obstacle.y, this._container).create();
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
            }
        }
    }
}