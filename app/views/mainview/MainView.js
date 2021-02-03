import Constants from './../../Constants.js';
import MainScene from './MainScene.js';

export default class MainView extends fw.core.viewCore {
	constructor() {
		super("MainView");
	}
	
	addHTML(html, parent = null) {
		this.addView(html, parent);
		this.mainScene = new MainScene();
		this.mainScene.initScene();
		this.addContextListener(Constants.events.USER_MODEL_UPDATED, this.updateView);
	}


	updateView(data) {
		document.getElementById('textBoxes').innerHTML = `Number of boxes: ${data.numBoxes}`;
		this.mainScene.spawnBoxes(data.numBoxes);
	}
}