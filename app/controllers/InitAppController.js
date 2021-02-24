import Constants from './../Constants.js';

export default class InitAppController extends fw.core.controllerCore {
	constructor() {
		super();

		this.simulationModel = this.getModelByName(Constants.models.SIMULATION_MODEL);
	}

	startApp() {
		console.log(`InitAppController::startApp`);

		this.loadView(
			'./views/mainlayout/mainLayout.html',
			'./views/loading/loadingView.html',
			'./views/mainview/mainView.html',
			'./views/uiview/ui.html',
			'./views/uiview/hudView.html'
		);

		this.addListener(Constants.events.PAUSE_SIMULATION, ()=> {
			this.simulationModel.isPaused = true;
		});

		this.addListener(Constants.events.RESUME_SIMULATION, ()=> {
			this.simulationModel.isPaused = false;
		});

	}

	/**
	 * Dynamically loads and attach view.
 	 */
	async loadView(layoutUrl, loadingViewUrl, mainViewUrl, uiViewUrl, hudViewUrl) {
		const viewLoaderService = this.getServiceByName(Constants.services.VIEW_LOADER_SERVICE);

		const layoutView = await viewLoaderService.loadView(layoutUrl);
		let view = new layoutView.script();
		view.addView(layoutView.html);

		const loadingViewContainer = document.getElementById('loadingView');
		const gameViewContainer = document.getElementById('gameView');
		const uiViewContainer = document.getElementById('uiView');
		const hudViewContainer = document.getElementById('hudView');
		const mainView = await viewLoaderService.loadView(mainViewUrl);
		view = new mainView.script();
		view.addHTML(mainView.html, gameViewContainer);

		const loadingView = await viewLoaderService.loadView(loadingViewUrl);
		view = new loadingView.script();
		view.addView(loadingView.html, loadingViewContainer);
		view.init();

		const uiView = await viewLoaderService.loadView(uiViewUrl);
		view = new uiView.script();
		view.addView(uiView.html, uiViewContainer);
		view.init();

		const hudView = await viewLoaderService.loadView(hudViewUrl);
		view = new hudView.script();
		view.addView(hudView.html, hudViewContainer);
		view.init();

		this.dispatch(Constants.events.SWITCH_STATE, "loading");

	}
}