import Constants from './../Constants.js';

export default class LoadingViewController extends fw.core.controllerCore {
    constructor() {
        super();

    }

    hide () {
        this.getViewByName(Constants.views.LOADING_VIEW).hide();
    }

    show() {
        this.getViewByName(Constants.views.LOADING_VIEW).show();
    }
}