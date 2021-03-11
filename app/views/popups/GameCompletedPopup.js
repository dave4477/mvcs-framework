import Constants from './../../Constants.js';

/**
 * Popup for level complete. Here we show score and button for next level.
 */
export default class GameCompletedPopup extends fw.core.viewCore {
    constructor() {
        super(Constants.views.POPUP_GAME_COMPLETE);
        this.timeBonus = NaN;
        this.score = NaN;
    }

    init() {
        this.addContextListener(Constants.events.TIME_BONUS_COLLECTED, (timeBonus)=>{
            document.querySelector('#finalTimeBonusText').innerHTML = timeBonus.points;
            this.timeBonus = timeBonus.points;
            this.checkTotal();
        });

        this.addContextListener(Constants.events.PLAYER_MODEL_UPDATED, (data) => {
           console.log("data:", data);
            this.score = data.score;
        });
    }

    show(score) {
        document.querySelector('#gameCompletePopup').style.display = "";
        document.querySelector('#popupView').style.display = "";
        document.querySelector('#coinsScoreText').innerHTML = score;
        document.querySelector('#restartButton').addEventListener('click', this.restart.bind(this));

        this.score = score;
        this.checkTotal();
    }

    hide() {
        document.querySelector('#gameCompletePopup').style.display = "none";
        document.querySelector('#popupView').style.display = "none";
    }

    checkTotal() {
        if (!isNaN(this.timeBonus) && !isNaN(this.score)) {
            document.querySelector('#finalTotalScoreText').innerHTML = (this.timeBonus + this.score);
        }
    }
    restart() {
        this.dispatchToContext(Constants.events.SWITCH_STATE, 'game');
        this.hide();
        this.timeBonus = 0;
        this.score = 0;
    }
}