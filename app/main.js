import PlayerModel from './models/PlayerModel.js';
import SimulationModel from './models/SimulationModel.js';
import ViewLoaderService from './services/ViewLoaderService.js';
import InitAppController from './controllers/InitAppController.js';
import PlayerController from './controllers/PlayerController.js';

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

		// init controllers
		new InitAppController();
		new PlayerController();
		
		// init stateMachine's config
		fw.core.createStateMachine(result[url]);
	}
}
new Main();
