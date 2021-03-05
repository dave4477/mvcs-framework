import Constants from './../../Constants.js';

export default class PausePopup extends fw.core.viewCore {
    constructor() {
        super(Constants.views.POPUP_PAUSE);
    }

    init() {
        this.addContextListener(Constants.events.VISIBILITY_HIDDEN, this.show);

        this.resumeHandler = this.resume.bind(this);
        // popupView.addEventListener('touchend', this.onLeftHandlerUp, false);
        // popupView.addEventListener('mouseup', this.onLeftHandlerUp, false);


    }

    resume() {
        this.dispatchToContext(Constants.events.VISIBILITY_SHOWN);
        this.hide();
    }
    
    show() {
        const popupView = document.querySelector('#popupView');

        popupView.style.display = "";
        document.querySelector('#pausePopup').style.display = "";
        popupView.addEventListener('touchstart', this.resumeHandler, false);
        popupView.addEventListener('mousedown', this.resumeHandler, false);

    }

    hide() {
        const popupView = document.querySelector('#popupView');

        popupView.style.display = "none";
        document.querySelector('#pausePopup').style.display = "none";

        popupView.removeEventListener('touchstart', this.resumeHandler, false);
        popupView.removeEventListener('mousedown', this.resumeHandler, false);

    }
}