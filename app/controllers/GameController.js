import Constants from './../Constants.js';
import ObjectsPreloader from './../views/helpers/ObjectsPreloader.js';

export default class GameController extends fw.core.controllerCore {
	constructor() {
		super();

		this.playerModel = this.getModelByName(Constants.models.PLAYER_MODEL);
		this.simulationModel = this.getModelByName(Constants.models.SIMULATION_MODEL);
		this.gameService = this.getServiceByName(Constants.services.GAME_SERVICE);
		this.objectPreloader = new ObjectsPreloader();

		this.addListener(Constants.events.LEVEL_FINISHED, ()=> {
			this.showLevelComplete();
		});
		this.json = null;
	}

	loadLevelData() {
		console.log(`GameController::loadLevelData`);

		this.gameService.loadLevelData('./../app/data/levels.json').then((response) => {
			return response.json();
		}).then((json) => {
			this.simulationModel.levelData = json;
			this.preLoadObjects(json);
		});
	}

	preLoadObjects(json) {
		this.objectPreloader.preload(json);
	}

	showLevelComplete() {
		this.getViewByName(Constants.views.POPUP_LEVEL_COMPLETE).show(this.playerModel.score);
	}

	hideLevelComplete() {

	}

	startGame() {
		console.log(`PlayerController::startGame`);
		if (this.playerModel.level == 0) {
			const json = this.simulationModel.levelData;
			this.getViewByName(Constants.views.MAIN_VIEW).initScene(json, this.playerModel.getPlayerData());
		} else {
			this.nextLevel();
		}
	}

	nextLevel() {
		this.getViewByName(Constants.views.MAIN_VIEW).nextLevel();
	}
}