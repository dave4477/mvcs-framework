import PlayerModel from './models/PlayerModel.js';
import SimulationModel from './models/SimulationModel.js';
import ViewLoaderService from './services/ViewLoaderService.js';
import GameService from './services/GameService.js';
import LocalStorageService from './services/LocalStorageService.js';
import InitAppController from './controllers/InitAppController.js';
import MainScreenController from './controllers/MainScreenController.js';
import PlayerController from './controllers/PlayerController.js';
import GameController from './controllers/GameController.js';
import LoadingViewController from './controllers/LoadingViewController.js';

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
		new LocalStorageService();

		// init controllers
		new InitAppController();
		new MainScreenController();
		new PlayerController();
		new GameController();
		new LoadingViewController();

		// init stateMachine's config
		fw.core.createStateMachine(result[url]);
	}
}
new Main();
