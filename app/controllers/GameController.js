import Constants from './../Constants.js';
import ObjectsPreloader from './../views/helpers/ObjectsPreloader.js';

export default class GameController extends fw.core.controllerCore {
	constructor() {
		super();

		this.playerModel = this.getModelByName(Constants.models.PLAYER_MODEL);
		this.simulationModel = this.getModelByName(Constants.models.SIMULATION_MODEL);
		this.gameService = this.getServiceByName(Constants.services.GAME_SERVICE);
		this.objectPreloader = new ObjectsPreloader();
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

	startGame() {
		console.log(`PlayerController::startGame`);
		const json = this.simulationModel.levelData;
		this.getViewByName(Constants.views.MAIN_VIEW).initScene(json, this.playerModel.getPlayerData());
	}
}