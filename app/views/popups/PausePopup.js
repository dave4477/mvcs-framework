import Constants from './../../Constants.js';

export default class PausePopup extends fw.core.viewCore {
    constructor() {
        super(Constants.views.POPUP_PAUSE);
    }

    init() {
        this.addContextListener(Constants.events.VISIBILITY_HIDDEN, this.show);
        this.resumeHandler = this.resume.bind(this);
    }

    resume() {
        this.dispatchToContext(Constants.events.VISIBILITY_SHOWN);
        this.hide();
    }
    
    show() {
        const popupView = document.querySelector('#popupView');

        popupView.style.display = "";

        this.addView(this.html, popupView);

        popupView.addEventListener('touchstart', this.resumeHandler, false);
        popupView.addEventListener('mousedown', this.resumeHandler, false);

    }

    hide() {
        const popupView = document.querySelector('#popupView');

        popupView.innerHTML = "";
        popupView.style.display = "none";

        popupView.removeEventListener('touchstart', this.resumeHandler, false);
        popupView.removeEventListener('mousedown', this.resumeHandler, false);

    }
}