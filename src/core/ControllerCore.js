import EventBus from './EventBus.js';
import MVCSCore from './MVCSCore.js';

export default class ControllerCore {
	constructor(name) {
		MVCSCore.controllerMap[this.constructor.name] = this;
	}
	
	dispatch(e, args) {
		EventBus.publish(e, args);
	}
	
	addListener(type, fn) {
		MVCSCore.eventMap[type] = {};
		MVCSCore.eventMap[type][fn] = EventBus.subscribe(type, fn.bind(this));
	}

	removeListener(type, fn) {
		MVCSCore.eventMap[type][fn].unsubscribe();
		delete MVCSCore.eventMap[type][fn];
	}
	
	getModelByName(name) {
		return MVCSCore.modelMap[name];
	}
	
	getServiceByName(name) {
		return MVCSCore.serviceMap[name];
	}

	getViewByName(name) {
		return MVCSCore.viewMap[name];
	}
}