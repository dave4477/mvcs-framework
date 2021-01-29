import EventBus from './EventBus.js';
import MVCSCore from './MVCSCore.js';

export default class ModelCore {
	constructor(name) {
		MVCSCore.modelMap[name] = this;
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

}