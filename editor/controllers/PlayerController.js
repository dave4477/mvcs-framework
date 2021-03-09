import Constants from './../Constants.js';

export default class PlayerController extends fw.core.controllerCore {
	constructor() {
		super();

		this.playerModel = this.getModelByName(Constants.models.PLAYER_MODEL);
		this.simulationModel = this.getModelByName(Constants.models.SIMULATION_MODEL);

		this.addListener(Constants.events.PLAYER_DIED, ()=> {
			this.playerModel.isAlive = false;
		});

		this.addListener(Constants.events.PLAYER_RESPAWNED, ()=> {
			this.playerModel.isAlive = true;
		});

		this.addListener(Constants.events.UPDATE_PLAYER_SCORE, (data)=> {
			this.playerModel.score = data.points;
		});

		this.addListener(Constants.events.LEVEL_FINISHED, (data) => {
			this.playerModel.level = data;
		});

	}

}