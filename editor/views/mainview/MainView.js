import Constants from './../../Constants.js';
import MainScene from './MainScene.js';

export default class MainView extends fw.core.viewCore {
	constructor() {
		super(Constants.views.MAIN_VIEW);
		this.mainScene = null;
	}
	
	addHTML(html, parent = null) {
		this.addView(html, parent);
		this.mainScene = new MainScene();
		//this.mainScene.initScene();
	}

	initScene(levelData, playerData) {
		this.mainScene.initScene(levelData, playerData);
	}
	
	nextLevel() {
		this.mainScene.onNextLevel();
	}
}