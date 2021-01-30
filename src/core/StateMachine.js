import EventBus from './EventBus.js';
import MVCSCore from './MVCSCore.js';

/**
 * Switching states should:
 * 1. postProcess current state
 * 2. switch to new state
 * 3. preProcess new state
 */

const SYSTEM_STATE = {
	stateName: "__system__",
	preProcess:[],
	postProcess:[],
	outbound:[],
	events:[]
};

export default class StateMachine {
	constructor() {
	}
	
	init(config) {
		this._config = config;
		this._currentState = SYSTEM_STATE.stateName;
		config.states.current = this._currentState;
		SYSTEM_STATE.outbound.push(config.initialState);
		const newItem = this._config.states.push(SYSTEM_STATE);

		EventBus.stateConfig = config.states;
		
		this.addListeners();

		EventBus.publish("switchState", config.initialState);
	}
	
	addListeners() {

		EventBus.subscribe("switchState", ( data ) => {
			const states = this._config.states;
			const statesLen = states.length;
			
			for (var i = 0; i < statesLen; i++) {
				if (states[i].stateName == this._currentState) {
					const currState = states[i];
					if (this._currentState) {						
	
						for (var connections = 0; connections < currState.outbound.length; connections++) {
							if (data === currState.outbound[connections]) {

								// Process the exit commands for the old state.
								this._processCommands(currState.postProcess);
								
								// Switch state.
								this._currentState = data;

								EventBus.stateConfig.states.current = data;
								console.log(`Switched to state ${this._currentState}`);

								const newState = this._getNewState(states, data);

								// Process enter commands for new state.
								this._processCommands(newState.preProcess);

								// We have switched state.
								return true;
							}
						}
						console.warn(`Could not move to state ${data} : currentState is ${this._currentState}`);
						return false;
					}
				}
			}
		});
	}
	
	_getNewState(states, state) {
		for (var i = 0; i < states.length; i++) {
			if (states[i].stateName === state) {
				return states[i];
			}
		}
		return null;
	}

	_processCommands(process) {
		for (let i = 0; i < process.length; i++) {
			const strArr = process[i].split(":");
			const controller = strArr[0];
			const fn = strArr[1];
			
			MVCSCore.controllerMap[controller][fn]();
		}
	}
}