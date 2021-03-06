import Constants from './../Constants.js';

export default class PlayerModel extends fw.core.modelCore {
	constructor() {
		super(Constants.models.PLAYER_MODEL);

		this._isAlive = true;
		this._score = 0;
		this._level = 0;
		this._lifes = 5; //Infinity;i6
	}
	
	get isAlive() {
		return this._isAlive;
	}

	set isAlive(value) {
		this._isAlive = value;
		if (value === false) {
			this._lifes --;
		}
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

	get lifes() {
		return this._lifes;
	}

	set lifes(value) {
		this._lifes = value;
	}

	get level() {
		return this._level;
	}

	resetScore() {
		this._score = 0;
	}

	resetLifes() {
		this._lifes = 5;
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
			lifes: this._lifes,
			posX: this._posX,
			posY: this._posY
		});
	}

	dispatchPlayerData() {
		this.dispatch(Constants.events.PLAYER_MODEL_UPDATED, this.getPlayerData());
	}
}