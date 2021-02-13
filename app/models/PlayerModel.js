import Constants from './../Constants.js';

export default class PlayerModel extends fw.core.modelCore {
	constructor() {
		super("PlayerModel");

		this._isAlive = true;
		this._score = 0;
	}
	
	get isAlive() {
		return this._isAlive;
	}

	set isAlive(value) {
		this._isAlive = value;
		this.dispatch(Constants.events.PLAYER_MODEL_UPDATED, {alive:this._isAlive, score:this._score})
	}

	get score() {
		return this._score;
	}

	set score(value) {
		this._score = value;
	}

}