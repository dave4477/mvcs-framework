import Constants from './../Constants.js';

export default class InitAppController extends fw.core.controllerCore {
	constructor() {
		super();
	}

	startApp() {
		console.log(`InitAppController::startApp`);		
		this.loadView('./views/mainview/mainView.html');
	}

	/**
	 * Dynamically loads and attach view.
 	 */
	async loadView(url) {
		const viewLoaderService = this.getServiceByName(Constants.servives.VIEW_LOADER_SERVICE);
		const loadedView = await viewLoaderService.loadView(url);
		new loadedView.script().addHTML(loadedView.html);
	}
}