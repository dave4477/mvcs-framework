/**
 * subscriptions data format: 
 * { eventType: { id: callback } }
 */

const singleton = Symbol();
const eventBus = Symbol();

const subscriptions = {};
const viewSubscriptions = {};

const stateConfiguration = {};

let _id = 0;
let _viewId = 0;	

class EventBus {
	constructor(enforcer) {
		if (enforcer !== eventBus) {
		  throw new Error('Cannot construct singleton');
		}
	}
	
	static set stateConfig(config) {
		stateConfiguration.states = config;
	}
	
	static get stateConfig() {
		return stateConfiguration;
	}
	
	static get instance() {
		if (!this[singleton]) {
		  this[singleton] = new EventBus(eventBus);
		}
		return this[singleton];
	}
 
	static subscribe(eventType, callback) {
		const id = _id++;

		if(!subscriptions[eventType]) {
			subscriptions[eventType] = {};
		}

		subscriptions[eventType][id] = callback;
		return {
			unsubscribe: () => {
				delete subscriptions[eventType][id];
				if(Object.keys(subscriptions[eventType]).length === 0) {
					delete subscriptions[eventType];
				}
			}
		};
	} 

	static subscribeToView(eventType, callback) {
		const id = _viewId++; 

		if(!viewSubscriptions[eventType]) {
			viewSubscriptions[eventType] = {};
		}
		viewSubscriptions[eventType][id] = callback;

		return { 
			unsubscribe: () => {
				delete viewSubscriptions[eventType][id];
				if(Object.keys(viewSubscriptions[eventType]).length === 0) {
					delete viewSubscriptions[eventType];
				}
			}
		};
	} 

	static publishToView(eventType, arg) {
		if(!viewSubscriptions[eventType]) {
			return;
		}
		Object.keys(viewSubscriptions[eventType]).forEach(key => viewSubscriptions[eventType][key](arg));
	}


	static publish(eventType, arg) {
		if(!subscriptions[eventType]) {
			return;
		}

		if (stateConfiguration.states && stateConfiguration.states.length && eventType !== "switchState") {
			for (var i = 0; i < stateConfiguration.states.length; i++) {
				if (stateConfiguration.states[i].stateName == stateConfiguration.states.current) {
					for (var e = 0; e < stateConfiguration.states[i].events.length; e++) {
						if (stateConfiguration.states[i].events[e] === eventType) {
							Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](arg));
						}
					}
				}
			}
		} else {
			Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](arg));
		}
	}		
}

export default EventBus;