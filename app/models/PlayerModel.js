import Constants from './../Constants.js';

export default class PlayerModel extends fw.core.modelCore {
	constructor() {
		super(Constants.models.PLAYER_MODEL);

		this._isAlive = true;
		this._score = 0;
		this._level = 0;
	}
	
	get isAlive() {
		return this._isAlive;
	}

	set isAlive(value) {
		this._isAlive = value;
		this.dispatchPlayerData();
	}

	get score() {
		return this._score;
	}

	set score(value) {
		this._score += value;
		console.log("score:", this._score);
		this.dispatchPlayerData();
	}

	set level(value) {
		this._level += value;
		this.dispatchPlayerData();

	}
	
	get level() {
		return this._level;
	}

	resetLevel() {
		this._level = 0;
		this.dispatchPlayerData();
	}

	getPlayerData() {
		return Object.freeze({
			alive: this._isAlive,
			score: this._score,
			level: this._level,
			posX: this._posX,
			posY: this._posY
		});
	}

	dispatchPlayerData() {
		this.dispatch(Constants.events.PLAYER_MODEL_UPDATED, this.getPlayerData());
	}
}