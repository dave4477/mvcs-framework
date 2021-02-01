import EventBus from './EventBus.js';
import MVCSCore from './MVCSCore.js';
import Backoff from './Backoff.js';

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
					fw.core.parsers.viewParser.parseHTML(loadedView).then(html => {
						// Check if there is a script attached.
						const content = html.getElementsByTagName('body')[0].firstChild;
						const script = content.hasAttribute('data-api') ? content.getAttribute('data-api') : null;
						if (script) {
							import(script).then(loadedscript => {
								resolve( {
									script: loadedscript.default,
									html: html
								});
							});
						} else {
							resolve({
								script: null,
								html: html
							});
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