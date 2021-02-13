import Constants from './../Constants.js';

export default class PlayerController extends fw.core.controllerCore {
	constructor() {
		super();

		this.playerModel = this.getModelByName(Constants.models.PLAYER_MODEL);
	}

	startGame() {
		console.log(`PlayerController::startGame`);

		this.getViewByName(Constants.views.MAIN_VIEW).initScene();

		this.addListener(Constants.events.PLAYER_DIED, ()=> {
			this.playerModel.isAlive = false;
		});

		this.addListener(Constants.events.PLAYER_RESPAWNED, ()=> {
			this.playerModel.isAlive = true;
		});

	}
}