import fw from './../../src/core/fw.js';
import Constants from './../Constants.js';

export default class UserModel extends fw.core.modelCore {
	constructor() {
		super("USER_MODEL");

		this._numBoxes = 0;
	}
	
	get numBoxes() {
		return this._numBoxes;
	}
	
	set numBoxes(value) {
		this._numBoxes = value;
		this.dispatch(Constants.events.USER_MODEL_UPDATED, { numBoxes: this._numBoxes });
	}
}