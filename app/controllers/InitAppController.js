import Constants from './../Constants.js';
//import fw from './../../src/core/fw.js';

const ViewLoaderService = "VIEW_LOADER_SERVICE";

export default class InitAppController extends fw.core.controllerCore {
	constructor() {
		super();
		this.userModel = this.getModelByName("USER_MODEL");
		this.addListeners();
	}

	addListeners() {

		this.addListener(Constants.events.UPDATE_USER_MODEL, (data) => {
			this.userModel.numBoxes = data;
		});

		this.addListener(Constants.events.USER_MODEL_UPDATED, (data) => {

		});
	}

	init() {
		this.dispatch("switchState", "init");
	}
	startApp() {
		console.log(`InitAppController::startApp`);		
		this.loadView("MAIN_VIEW", "./views/mainview/mainView.html");
	}
	
	async loadView(viewName, url) {
		const mainView = this.getViewByName(viewName);
		const viewLoaderService = this.getServiceByName(ViewLoaderService);
		const loadedView = await viewLoaderService.loadView(url);
		
		if (loadedView) {
			fw.core.parsers.viewParser.parseHTML(loadedView).then(html => {
				mainView.addHTML(html);
			});
		} else {
			console.log(`Something went wrong: ${loadedView}`);
		}
	}
}