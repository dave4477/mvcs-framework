
export default class MainScreen extends fw.core.viewCore {
    constructor() {
        super("MainScreen");
    }

    init() {
        const startGameButton = document.querySelector('#startGameButton');
        startGameButton.addEventListener('click', this.startGame.bind(this));
    }

    checkRotation() {
        const landscape = document.querySelector('#landScape');
        if (window.innerWidth < window.innerHeight) {
            landscape.style.display = "";
        } else {
            landscape.style.display = "none";
        }
        window.removeEventListener('resize', this.checkRotation);
        window.addEventListener('resize', this.checkRotation);
    }


    startGame() {
        window.removeEventListener('resize', this.checkRotation);
        document.getElementById('mainScreen').style.display = "none";
        this.dispatchToContext('switchState', 'loading');
    }

}