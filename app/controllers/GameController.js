import Constants from './../Constants.js';
import ObjectsPreloader from './../views/helpers/ObjectsPreloader.js';

export default class GameController extends fw.core.controllerCore {
	constructor() {
		super();

		this.sceneHasInitialized = false;
		this.playerModel = this.getModelByName(Constants.models.PLAYER_MODEL);
		this.simulationModel = this.getModelByName(Constants.models.SIMULATION_MODEL);
		this.gameService = this.getServiceByName(Constants.services.GAME_SERVICE);
		this.storageService = this.getServiceByName(Constants.services.LOCAL_STORAGE_SERVICE);
		this.objectPreloader = new ObjectsPreloader();

		this.addListener(Constants.events.LEVEL_FINISHED, ()=> {
			if (this.playerModel.level < this.simulationModel.levelData.levels.length) {
				this.showLevelComplete();
			} else {
				this.playerModel.resetLevel();
				this.showGameComplete();
			}
		});

		this.addListener('submitScore', this.submitScore);
		this.addListener('restartGame', this.restartGame);
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

	showGameComplete() {
		this.getViewByName(Constants.views.POPUP_GAME_COMPLETE).show(this.playerModel.score);
	}

	submitScore(data) {
		console.log("data received:", data);

		this.gameService.loadLevelData('./../app/highscores.php?name=' +data.name+'&score=' +data.score).then((response) => {
		});

		this.restartGame();
	}


	gameOver() {
		this.getViewByName(Constants.views.POPUP_GAME_OVER).show(this.playerModel.score);

		// this.dispatch(Constants.events.SWITCH_STATE, 'mainScreen');
	}

	restartGame() {

		this.sceneHasInitialized = false;
		this.playerModel.resetLevel();
		this.playerModel.resetLifes();
		this.playerModel.resetScore();
		this.playerModel.isAlive = true;

		this.getViewByName(Constants.views.MAIN_SCENE).dispose();

		window.location.reload();
		//this.dispatch(Constants.events.SWITCH_STATE, 'mainScreen');
	}

	startGame() {
		console.log(`PlayerController::startGame`);

		if (!this.sceneHasInitialized) {
			this.sceneHasInitialized = true;
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