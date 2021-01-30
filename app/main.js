
import UserModel from './models/UserModel.js';
import ViewLoaderService from './services/ViewLoaderService.js';
import InitAppController from './controllers/InitAppController.js';
import MainView from './views/mainview/MainView.js';

export default class Main {
	constructor(){
		this.loadConfig();
	}

	async loadConfig() {
		const url = "./stateconfig.json";

		const result = await fw.core.connection.xhrLoader.loadFiles([url]);

		// init models
		new UserModel();

		// init services
		new ViewLoaderService();

		// init controllers
		new InitAppController();

		// init views
		new MainView();

		// init stateMachine's config
		fw.core.createStateMachine(result[url]);
	}
}
new Main();
