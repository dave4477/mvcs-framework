import Constants from './../../Constants.js';

export default class HudView extends fw.core.viewCore {
    constructor() {
        super("HudView");
        this._timeBonus = null;
        this._score = null;
    }

    init() {

        this.addViewListener(Constants.events.TIMER_STARTED, () => {
            document.querySelector('#timeBonus').style.display = "";
        });
        this.addContextListener(Constants.events.LEVEL_FINISHED, ()=> {
            document.querySelector('#timeBonus').style.display = "none";
        });

        this.addViewListener(Constants.events.TIMEBONUS_UPDATED, (time) => {
            if (!this._timeBonus) {
                this._timeBonus = document.getElementById('timeBonus');
            }
            if (time >= 0 && this._timeBonus) {
                this._timeBonus.innerHTML = "Time Bonus: " + Math.floor(time);
            }
        });

        this.addContextListener(Constants.events.PLAYER_MODEL_UPDATED, (data) => {
            if (!this._score) {
                this._score = document.getElementById('score');
            }
            if (data.score && this._score) {
                this._score.innerHTML = "Score: " +data.score;
            }

            if (data.lifes) {
                this.updateLifes(data.lifes);
            }
        });
    }

    updateLifes(lifes) {
        document.querySelector('#lifesLeftText').innerHTML = lifes;
    }
}
