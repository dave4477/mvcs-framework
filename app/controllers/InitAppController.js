import Constants from './../Constants.js';

export default class InitAppController extends fw.core.controllerCore {
	constructor() {
		super();
	}

	startApp() {
		console.log(`InitAppController::startApp`);		
		this.loadView('./views/mainlayout/mainLayout.html', './views/mainview/mainView.html', './views/uiview/ui.html');
	}

	/**
	 * Dynamically loads and attach view.
 	 */
	async loadView(layoutUrl, mainViewUrl, uiViewUrl) {
		const viewLoaderService = this.getServiceByName(Constants.servives.VIEW_LOADER_SERVICE);

		const layoutView = await viewLoaderService.loadView(layoutUrl);
		let view = new layoutView.script();
		view.addView(layoutView.html);

		const gameViewContainer = document.getElementById('gameView');
		const uiViewContainer = document.getElementById('uiView');

		const mainView = await viewLoaderService.loadView(mainViewUrl);
		view = new mainView.script();
		view.addHTML(mainView.html, gameViewContainer);

		const uiView = await viewLoaderService.loadView(uiViewUrl);
		view = new uiView.script();
		view.addView(uiView.html, uiViewContainer);
		view.init();

	}
}