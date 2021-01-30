//import fw from './../../../src/core/fw.js';
import Constants from './../../Constants.js';

export default class MainView extends fw.core.viewCore {
	constructor() {
		super("MAIN_VIEW");
		this._html = null;
		this.mainScene = null;
	}
	
	addHTML(html) {
		this._html = html;
		const content = this.addView(this._html.firstChild);
		var script = content.hasAttribute('data-api') ? content.getAttribute('data-api') : null;
		if (script) {
			import (script).then(MainScene => {
				this.mainScene = new MainScene.default();
				this.mainScene.initScene();
				this.addContextListener(Constants.events.USER_MODEL_UPDATED, this.updateView);
			});
		}
	}


	updateView(data) {
		document.getElementById('textBoxes').innerHTML = `Number of boxes: ${data.numBoxes}`;
		this.mainScene.spawnBoxes(data.numBoxes);
	}
}