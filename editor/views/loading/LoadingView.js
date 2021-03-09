import Constants from './../../Constants.js';
import * as THREE from './../../libs/three.module.js';

export default class LoadingView extends fw.core.viewCore {
    constructor() {
        super(Constants.views.LOADING_VIEW);
        this.clock = new THREE.Clock(true);
        this.subtext = null;
        this.orgText = null;
        this.count = 0;
        this.elipses = ["",".", "..", "..."];
        this.intervalSub = null;
        this.interval = null;
    }
    
    init() {
        this.show();
    }

    hide() {

        clearInterval(this.interval);
        clearInterval(this.intervalSub);

        setTimeout(()=>{
            document.getElementById('loading').style.display = "none";
        }, 1000);
    }

    show() {
        document.getElementById('loading').style.display = "block";
        this.subtext = document.getElementById('loadingSubtext');
        this.orgText = this.subtext.innerHTML;


        const loading = "LOADING";

        for (let i = 0; i < loading.length; i++) {
            const letter = loading[i];
            const el = document.getElementById(letter);
            var tweenObj = {y: el.offsetTop, el:el };
            new TWEEN.Tween(tweenObj)
                .to({y:40}, 1000)
                .repeat(50)
                .yoyo(true)
                .delay(i * 150)
                .onUpdate((object) => {
                    object.el.style.top = object.y +"px";
                })
                .start()
        }
        this.interval = setInterval(this.updateText.bind(this), 200);
        this.intervalSub = setInterval(this.updateSub.bind(this), 333);
    }

    updateText() {
        const dt = this.clock.getDelta();
        TWEEN.update(dt);
    }

    updateSub() {
        this.subtext.innerHTML = this.orgText +this.elipses[this.count % this.elipses.length];
        this.count ++;
    }
}