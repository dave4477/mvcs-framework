import Constants from './../../Constants.js';

/**
 * Popup for level complete. Here we show score and button for next level.
 */
export default class LevelCompletePopup extends fw.core.viewCore {
    constructor() {
        super(Constants.views.POPUP_LEVEL_COMPLETE);
        this.timeBonus = NaN;
        this.score = NaN;
    }

    init() {
        this.addContextListener(Constants.events.TIME_BONUS_COLLECTED, (timeBonus)=>{
            document.querySelector('#timeBonusText').innerHTML = timeBonus.points;
            this.timeBonus = timeBonus.points;
            this.checkTotal();
        });

        document.querySelector('#nextLevelButton').addEventListener('click', this.nextLevel.bind(this));
    }

    show(score) {
        const popupView = document.querySelector('#popupView');

        popupView.style.display = "";

        this.addView(this.html, popupView);

        this.init();

        document.querySelector('#popupView').style.display = "";
        document.querySelector('#coinsScoreText').innerHTML = score;
        this.score = score;
        this.checkTotal();
    }



    hide() {
        const popupView = document.querySelector('#popupView');

        popupView.innerHTML = "";
        popupView.style.display = "none";
    }

    checkTotal() {
        if (!isNaN(this.timeBonus) && !isNaN(this.score)) {
            document.querySelector('#totalScoreText').innerHTML = (this.timeBonus + this.score);
        }
    }
    nextLevel() {
        this.dispatchToContext(Constants.events.NEXT_LEVEL);
        this.dispatchToContext(Constants.events.SWITCH_STATE, 'game');
        this.hide();
        this.timeBonus = 0;
        this.score = 0;

    }
}