/**
 * Created by Bleekerd on 24/01/2021.
 */

var PlayerInput = pc.createScript('player_input');

PlayerInput.prototype.initialize  = function() {

    PlayerInput.LEFT = "left";
    PlayerInput.RIGHT = "right";
    PlayerInput.JUMP = "jump";


    // Create a pc.input.Controller instance to handle input
    this.controller = new pc.Controller(document);

    // Register all keyboard input
    this.controller.registerKeys(PlayerInput.LEFT, [pc.KEY_A, pc.KEY_Q, pc.KEY_LEFT]);
    this.controller.registerKeys(PlayerInput.RIGHT, [pc.KEY_D, pc.KEY_RIGHT]);
    this.controller.registerKeys(PlayerInput.JUMP, [pc.KEY_W, pc.KEY_SPACE, pc.KEY_UP]);

    this.walkDirection = 0;
    this.doJump = false;

    // Retrieve and store the script instance for the character controller
    this.playerScript = this.entity.script.platform_character_controller;
};

PlayerInput.prototype.update = function(dt) {

    // Check for left, right or jump and send move commands to the controller script
    if ( this.controller.isPressed(PlayerInput.LEFT) || this.walkDirection == -1) {
        this.playerScript.moveLeft();
    } else if (this.controller.isPressed(PlayerInput.RIGHT) || this.walkDirection == 1)  {
        this.playerScript.moveRight();
    }

    if (this.controller.wasPressed(PlayerInput.JUMP) || this.doJump) {
        this.playerScript.jump();
    }
    return PlayerInput;
};