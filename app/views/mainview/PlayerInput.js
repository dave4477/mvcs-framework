const keyRegister = {
    "ArrowLeft": false,
    "ArrowRight": false,
    "Space": false,
    "KeyA": false,
    "KeyD": false,
    "KeyP": false,
    "KeyW": false,
    "KeyX": false,
    "KeyS": false
};

export default class PlayerInput extends fw.core.viewCore {
    constructor(player) {
        super("PlayerInput");
        this.player = player;
        this.addKeyListeners();
    }

    get pressedKeys() {
        return keyRegister;
    }

    addKeyListeners() {
        document.body.addEventListener('keydown', (e) => {
            if (Object.keys(keyRegister).indexOf(e.code)>-1) {
                keyRegister[e.code] = true;
                this.dispatchToView('KeyPressed', keyRegister);
            }
        });
        document.body.addEventListener('keyup', (e) => {
            if (Object.keys(keyRegister).indexOf(e.code)>-1) {
                keyRegister[e.code] = false;
            }
            this.dispatchToView('KeyUp', e.code);
            this.dispatchToView('KeyPressed', keyRegister);
        });
    }

}