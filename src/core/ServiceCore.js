import EventBus from './EventBus.js';
import MVCSCore from './MVCSCore.js';
import Backoff from './Backoff.js';
import ViewCore from './ViewCore.js';

export default class ServiceCore {
	constructor(name) {
		MVCSCore.serviceMap[name] = this;
		this.backoff = new Backoff();
	}
	
	dispatch(e, args) {
		EventBus.publish(e, args);
	}
	
	getModelByName(name) {
		return MVCSCore.modelMap[name];
	}
	
	getServiceByName() {
		return MVCSCore.serviceMap[name];
	}	
	
	async loadView(url) {
		return new Promise((resolve, reject) =>{
			this.backoff.getURL(url).then((loadedView) =>{
				if (loadedView) {
					let data;
					fw.core.parsers.viewParser.parseHTML(loadedView).then(html => {
						// Check if there is a script attached.
						const content = html.getElementsByTagName('body')[0].firstChild;
						const script = content.hasAttribute('data-api') ? content.getAttribute('data-api') : null;
						if (script) {
							import(script).then(loadedscript => {
								data = {
									script: new loadedscript.default(),
									html: content
								};
								data.script.html = content;
								resolve( data );
							});
						} else {
							const id = content.getAttribute('id');
							const script = class generatedViewClass extends ViewCore {
								constructor(name) {
									super(name || id);
								}
							};

							data = {
								script: new script(),
								html: html
							};
							data.script.html = content;
							resolve( data );
						}
					});
				} else {
					console.log(`Something went wrong: ${loadedView}`);
					reject();
				}
			});
		});
	}

	async httpGet(url, data = null) {
		return this.backoff.getURL(url);
	}
	async httpPost(url, data = null) {
		return this.backoff.postURL(url);
	}
}