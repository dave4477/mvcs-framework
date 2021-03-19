import Constants from './../../Constants.js';

/**
 * Popup for level complete. Here we show score and button for next level.
 */
export default class GameOverPopup extends fw.core.viewCore {
    constructor() {
        super(Constants.views.POPUP_GAME_OVER);
        this.score = null;
    }

    init() {
    }

    show(score) {
        this.score = score;

        const popupView = document.querySelector('#popupView');

        popupView.style.display = "";

        this.addView(this.html, popupView);

        this.init();

        document.querySelector('#popupView').style.display = "";
        document.querySelector('#totalScoreText').innerHTML = (score);

        if (!score) {
            document.querySelector('#username').style.display = "none";
            document.querySelector('#submitScore').style.display = "none";
            document.querySelector('#nameField').style.display = "none";
        }
        document.querySelector('#submitScore').addEventListener('click', this.submitScore.bind(this));

        document.querySelector('#restartButton').addEventListener('click', this.restart.bind(this));
    }

    submitScore() {
        const name = encodeURI(document.querySelector('#username').value);
        this.dispatchToContext('submitScore', {name:name, score:this.score});
        this.hide();
    }

    hide() {
        const popupView = document.querySelector('#popupView');

        popupView.innerHTML = "";
        popupView.style.display = "none";
    }

    restart() {
        this.dispatchToContext('restartGame');
        this.hide();
    }
}