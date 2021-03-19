
export default class MainScreen extends fw.core.viewCore {
    constructor() {
        super("MainScreen");
        this.frameId = 0;
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

    setHighScores(highscores) {
        if (highscores) {
            //highscores = JSON.parse(highscores);

            let names = highscores.names;
            let str = "<div style='position:absolute; top:0' id='highscoreScroll'>";

            names = names.sort((a,b)=>{
                if (a.score > b.score) {
                    return -1;
                } else if (a.score < b.score) {
                    return 1;
                }
                return 0;

            });
            for (let i = 0; i < names.length; i++) {
                str += "<div><span style='position:relative; float:left; width:250px'>" +names[i].name +"</span><span style='position:relative; float:left; width:125px; text-align:right'>" + names[i].score +"</span></div>";
            }
            str += "</div>";

            document.querySelector('#highScores').innerHTML = str;

            const scroll = document.querySelector('#highscoreScroll');
            const container = document.querySelector('#highscoreContainer');
            const fromY = container.offsetHeight;
            const toY = 0 - scroll.offsetHeight;

            this.createTween(scroll, fromY, toY);

            this.frameId = window.requestAnimationFrame(this.render.bind(this));
        }
    }

    createTween(el, fromY, toY) {
        new TWEEN.Tween({x:fromY})
            .to({x: toY}, Math.abs(toY) * 100)
            .repeat(999)
            .onUpdate((object) =>{
                el.style.top = object.x +"px";
            })
            .onComplete((object)=>{
                this.createTween(el, fromY, toY);
            })
            .start();

    }
    render() {
        TWEEN.update();
        this.frameId = window.requestAnimationFrame(this.render.bind(this));
    }

    startGame() {
        window.cancelAnimationFrame(this.frameId);
        window.removeEventListener('resize', this.checkRotation);
        this.hide();
        if (fw.utils.deviceInfo.isMobile()) {
            this.toggleFullScreen();
        } else {
            this.dispatchToContext('switchState', 'loading');
        }


    }

}