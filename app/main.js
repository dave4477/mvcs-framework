import PlayerModel from './models/PlayerModel.js';
import SimulationModel from './models/SimulationModel.js';
import ViewLoaderService from './services/ViewLoaderService.js';
import GameService from './services/GameService.js';
import InitAppController from './controllers/InitAppController.js';
import PlayerController from './controllers/PlayerController.js';
import GameController from './controllers/GameController.js';

export default class Main {
	constructor(){
		this.loadConfig();
	}

	async loadConfig() {
		const url = "./stateconfig.json";

		const result = await fw.core.connection.xhrLoader.loadFiles([url]);

		// init models
		new PlayerModel();
		new SimulationModel();

		// init services
		new ViewLoaderService();
		new GameService();

		// init controllers
		new InitAppController();
		new PlayerController();
		new GameController();
		
		// init stateMachine's config
		fw.core.createStateMachine(result[url]);
	}
}
new Main();
