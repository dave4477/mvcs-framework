import Constants from './../../Constants.js';

/**
 * Popup for level complete. Here we show score and button for next level.
 */
export default class LevelCompletePopup extends fw.core.viewCore {
    constructor() {
        super(Constants.views.POPUP_LEVEL_COMPLETE);
        this.timeBonus = NaN;
        this.score = NaN;
        this.onNextLevel = this.nextLevel.bind(this);
    }

    init() {
        document.querySelector('#nextLevelButton').addEventListener('click', this.onNextLevel);
    }

    onTimeBonus(timeBonus) {
        this.timeBonus = timeBonus.points;
        this.checkTotal();
    }

    show(score) {
        console.log("score:", score);
        this.score = score;
        const popupView = document.querySelector('#popupView');

        popupView.style.display = "";

        this.addView(this.html, popupView);
        this.init();

        document.querySelector('#popupView').style.display = "";
        document.querySelector('#coinsScoreText').innerHTML = score;
        this.score = score;
        this.checkTotal();
    }


    setTimeBonus(timeBonus) {
        this.timeBonus = timeBonus;
        this.checkTotal();
    }

    hide() {
        const popupView = document.querySelector('#popupView');

        this.removeContextListener(this.onTimeBonus);
        document.querySelector('#nextLevelButton').removeEventListener('click', this.onNextLevel);

        this.score = NaN;
        this.timeBonus = NaN;
        popupView.innerHTML = "";
        popupView.style.display = "none";
        this.removeView();
    }

    checkTotal() {
        if (!isNaN(this.timeBonus) && !isNaN(this.score)) {
            document.querySelector('#timeBonusText').innerHTML = this.timeBonus;
            document.querySelector('#totalScoreText').innerHTML = this.timeBonus + this.score;
            this.dispatchToContext(Constants.events.UPDATE_PLAYER_SCORE, {points: this.timeBonus});
        }
    }
    nextLevel() {
        this.dispatchToContext(Constants.events.NEXT_LEVEL);
        this.dispatchToContext(Constants.events.SWITCH_STATE, 'game');
        this.hide();

    }
}