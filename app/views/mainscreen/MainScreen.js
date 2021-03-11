
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


    toggleFullScreen() {
        document.addEventListener('fullscreenchange', ()=>{
            if (document.fullscreenElement) {
                this.dispatchToContext('switchState', 'loading');
            }

        });

        document.onfullscreenerror = ( event ) => {
            this.dispatchToContext('switchState', 'loading');
        };

        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    show() {
        document.getElementById('mainScreen').style.display = "";
    }

    hide() {
        document.getElementById('mainScreen').style.display = "none";

    }

    startGame() {
        window.removeEventListener('resize', this.checkRotation);
        this.hide();
        if (fw.utils.deviceInfo.isMobile()) {
            this.toggleFullScreen();
        } else {
            this.dispatchToContext('switchState', 'loading');
        }


    }

}