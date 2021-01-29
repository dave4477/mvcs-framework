const keyRegister = {
    "ArrowLeft": false,
    "ArrowRight": false,
    "Space": false
};

export default class PlayerInput {
    constructor(player) {
        this.player = player;
        this.addKeyListeners();
    }

    addKeyListeners() {
        document.body.addEventListener('keydown', (e) => {
            keyRegister[e.code] = true;
            this.player.keyPressed = e.code;
        });
        document.body.addEventListener('keyup', (e) => {
            let keyPressed = [];
            keyRegister[e.code] = false;

            Object.keys(keyRegister).map(key => {
                if (keyRegister[key] == true) {
                    keyPressed.push(key);
                }
            });
            if (keyPressed.length) {
                this.player.keyPressed = keyPressed[0];
            } else {
                this.player.keyPressed = null;
            }
        });
    }

}