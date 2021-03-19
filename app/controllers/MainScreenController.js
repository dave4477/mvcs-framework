import Constants from './../Constants.js';

export default class MainScreenController extends fw.core.controllerCore {
    constructor() {
        super();
    }

    show() {
        this.getViewByName("MainScreen").show();
        this.getViewByName("MainScreen").checkRotation();

        const HS = this.getServiceByName(Constants.services.LOCAL_STORAGE_SERVICE).getData("highscores");
        const GS = this.getServiceByName(Constants.services.GAME_SERVICE);
        GS.loadLevelData('./../app/highscores.php').then((response) => {
            return response.json();
        }).then((json) => {
            this.getViewByName("MainScreen").setHighScores(json);

        });

        console.log()
        // this.getViewByName("MainScreen").setHighScores(HS);
    }

    hide() {
        this.getViewByName("MainScreen").show();
    }
}