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
			'./views/mainscreen/mainScreen.html',
			'./views/loading/loadingView.html',
			'./views/mainview/mainView.html',
			'./views/uiview/ui.html',
			'./views/uiview/hudView.html',
			'./views/popups/levelCompletePopup.html',
			'./views/popups/pausePopup.html',
			'./views/popups/GameCompletedPopup.html',
			'./views/popups/GameOverPopup.html'
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
	async loadView(layoutUrl,
				   mainScreenUrl,
				   loadingViewUrl,
				   mainViewUrl,
				   uiViewUrl,
				   hudViewUrl,
				   levelCompletePopupUrl,
				   pausePopupUrl,
				   gameCompletePopupUrl,
	 			   gameOverPopupUrl) {

		const viewLoaderService = this.getServiceByName(Constants.services.VIEW_LOADER_SERVICE);

		const layoutView = await viewLoaderService.loadView(layoutUrl);
		let view = layoutView.script;
		view.addView(layoutView.html);

		const loadingViewContainer = document.getElementById('loadingView');
		const startScreenContainer = document.getElementById('startScreen');
		const gameViewContainer = document.getElementById('gameView');
		const uiViewContainer = document.getElementById('uiView');
		const hudViewContainer = document.getElementById('hudView');
		const popupView = document.getElementById('popupView');

		const mainView = await viewLoaderService.loadView(mainViewUrl);
		view = mainView.script;
		console.log(mainView.html);
		view.addHTML(mainView.html, gameViewContainer);

		const startScreen = await viewLoaderService.loadView(mainScreenUrl);
		view = startScreen.script;
		view.addView(startScreen.html, startScreenContainer);
		view.init();

		const loadingView = await viewLoaderService.loadView(loadingViewUrl);
		view = loadingView.script;
		view.addView(loadingView.html, loadingViewContainer);
		view.init();

		const uiView = await viewLoaderService.loadView(uiViewUrl);
		view = uiView.script;
		view.addView(uiView.html, uiViewContainer);
		view.init();

		const hudView = await viewLoaderService.loadView(hudViewUrl);
		view = hudView.script;
		view.addView(hudView.html, hudViewContainer);
		view.init();

		// const levelCompletePopup = await viewLoaderService.loadView(levelCompletePopupUrl);

		const PausePopup = await viewLoaderService.loadView(pausePopupUrl);
		view = PausePopup.script;
		// view.addView(PausePopup.html, popupView);
		view.init();

		const gameCompletePopup = await viewLoaderService.loadView(gameCompletePopupUrl);

		const gameOverPopup = await viewLoaderService.loadView(gameOverPopupUrl);

		this.dispatch(Constants.events.SWITCH_STATE, "mainScreen");

	}
}