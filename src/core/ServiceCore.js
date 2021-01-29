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
		return this.backoff.getURL(url);
	}

	async httpGet(url, data = null) {
		return this.backoff.getURL(url);
	}
	async httpPost(url, data = null) {
		return this.backoff.postURL(url);
	}
}