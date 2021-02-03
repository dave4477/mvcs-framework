const keyRegister = {
    "ArrowLeft": false,
    "ArrowRight": false,
    "Space": false
};

export default class UIView extends fw.core.viewCore {
    constructor() {
        super("UIView");

        this.onLeftHandlerDown = this.onLeftTouchStart.bind(this);
        this.onLeftHandlerUp = this.onLeftTouchEnd.bind(this);

        this.onRightHandlerDown = this.onRightTouchStart.bind(this);
        this.onRightHandlerUp = this.onRightTouchEnd.bind(this);

        this.onSpaceHandlerDown = this.onSpaceTouchStart.bind(this);
        this.onSpaceHandlerUp = this.onSpaceTouchEnd.bind(this);
    }

    init() {
        this.addListeners();
    }

    addListeners() {
        const leftArrow = document.getElementById('leftArrow');
        const rightArrow = document.getElementById('rightArrow');
        const jumpArrow = document.getElementById('jumpArrow');

        leftArrow.addEventListener('touchstart', this.onLeftHandlerDown, false);
        leftArrow.addEventListener('mousedown', this.onLeftHandlerDown, false);
        leftArrow.addEventListener('touchend', this.onLeftHandlerUp, false);
        leftArrow.addEventListener('mouseup', this.onLeftHandlerUp, false);

        rightArrow.addEventListener('touchstart', this.onRightHandlerDown, false);
        rightArrow.addEventListener('mousedown', this.onRightHandlerDown, false);
        rightArrow.addEventListener('touchend', this.onRightHandlerUp, false);
        rightArrow.addEventListener('mouseup', this.onRightHandlerUp, false);

        jumpArrow.addEventListener('touchstart', this.onSpaceHandlerDown, false);
        jumpArrow.addEventListener('mousedown', this.onSpaceHandlerDown, false);
        jumpArrow.addEventListener('touchend', this.onSpaceHandlerUp, false);
        jumpArrow.addEventListener('mouseup', this.onSpaceHandlerUp, false);
    }

    onLeftTouchStart(e) {
        keyRegister['ArrowLeft'] = true;
        this.dispatchToView('UIButtonPressed', keyRegister);
    }

    onRightTouchStart(e) {
        keyRegister['ArrowRight'] = true;
        this.dispatchToView('UIButtonPressed', keyRegister);
    }

    onSpaceTouchStart(e) {
        keyRegister['Space'] = true;
        this.dispatchToView('UIButtonPressed', keyRegister);
    }

    onLeftTouchEnd(e) {
        keyRegister['ArrowLeft'] = false;
        this.dispatchToView('UIButtonPressed', keyRegister);
    }

    onRightTouchEnd(e) {
        keyRegister['ArrowRight'] = false;
        this.dispatchToView('UIButtonPressed', keyRegister);
    }

    onSpaceTouchEnd(e) {
        keyRegister['Space'] = false;
        this.dispatchToView('UIButtonPressed', keyRegister);
    }

}