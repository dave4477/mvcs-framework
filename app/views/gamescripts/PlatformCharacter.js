
// Platform Character Controller
// This is the main player controler script
// It handles moving the player, playing animations, death and resetting
// Requires: 
//  - A child entity called "Model" which has the model component and animation component. Animations as defined in the ANIMATIONS list.
//  - player_input.js script should also be attached
//  - damagable.js script should also be attached


var PlatformCharacterController = pc.createScript('platform_character_controller');

PlatformCharacterController.attributes.add("moveImpulse", { type: "number", default:0.5, description: "Move Impulse"}); // Horizontal impulse to apply when the left or right key is down.
PlatformCharacterController.attributes.add("jumpImpulse", { type: "number", default:15, description: "Jump Impulse"}); // Vertical impulse to apply when the jump key is pressed.
PlatformCharacterController.attributes.add("minRunSpeed", { type: "number", default:1, description: "Min Run Speed"}); // Minimum speed at which the run animation will play.
PlatformCharacterController.attributes.add("jumpGraceTime", { type: "number", default:0.1, description: "Jump Grace Time"}); // Extra time allowed to jump after falling off a platform.


PlatformCharacterController.prototype.initialize = function() {
    this.CHECK_GROUND_RAY = new pc.Vec3(0, -0.7, 0);

    // Names of animation assets mapped to simple names like "idle"
    var ANIMATIONS = {
        "idle": "Playbot_idle",
        "run": "Playbot_run",
        "jump": "Playbot_jump",
        "die": "Playbot_die"
    };

    // Animation states
    this.STATE_IDLE = 0;
    this.STATE_RUNNING = 1;
    this.STATE_JUMPING = 2;

    // Temp vector used to fire raycast
    this.raycastEnd = new pc.Vec3();




    this.onGround = false;
    this.groundEntity = null;

    this.jumpTimer = 0;
    this.fallTimer = 0;

    this.model = null;

    this.origin = null;

    this.dead = false;

    this.animationState = this.STATE_IDLE;

    // store the original position for reseting
    this.origin = new pc.Vec3().copy(this.entity.getPosition());

    // Get the child entity that has the model and animation component
    this.model = this.entity.findByName("Model");

    // Attach an event to the damagable script to detect when the player is killed
    this.entity.script.damagable.on("killed", this.onKilled, this);

    // Uncomment this line to display collision volumes
    // context.systems.collision.setDebugRender(true);
    // 
    console.log(this.model);

};

PlatformCharacterController.prototype.update = function(dt) {

    // Don't update movement while dead
    if (this.dead) {
        return;
    }

    // Decrement timers
    this.jumpTimer -= dt;
    this.fallTimer -= dt;

    // Check to see if player is on the ground
    this.checkOnGround();

    var vel = this.entity.rigidbody.linearVelocity;
    var speed = vel.length();

    // Apply drag if in motion
    if (Math.abs(vel.x) > 0) {
        vel.x = vel.x * 0.9;
        this.entity.rigidbody.linearVelocity = vel;
    }

    // Update the animation            
    this.updateAnimation(vel, dt);
};


PlatformCharacterController.prototype.updateAnimation = function(vel, dt) {
    var speed = Math.sqrt(vel.x*vel.x + vel.z*vel.z);
    if (this.animationState === this.STATE_IDLE) {
        if (speed > this.minRunSpeed) {
            // start running
            this.run();
        }
    } else if (this.animationState === this.STATE_RUNNING) {
        if (speed < this.minRunSpeed) {
            // stop running
            this.idle();
        }
    }
};

// Function called by player_input to move the player
PlatformCharacterController.prototype.moveLeft = function () {
    if (!this.dead) {
        this.entity.rigidbody.applyImpulse(-this.moveImpulse, 0, 0);
        this.model.setEulerAngles(0, -90, 0);
    }
};

// Function called by player_input to move the player
PlatformCharacterController.prototype.moveRight = function () {
    if (!this.dead) {
        this.entity.rigidbody.applyImpulse(this.moveImpulse, 0, 0);
        this.model.setEulerAngles(0, 90, 0);
    }
};

// Function called by player_input to jump the player
PlatformCharacterController.prototype.jump = function () {
    if (!this.dead && this.jumpTimer < 0) {
        if (this.onGround || this.fallTimer > 0) {

            // store the position for reseting
            // this.origin = new pc.Vec3().copy(this.entity.getPosition());


            //this.entity.translate(1, 0, 0);
            //this.entity.rigidbody.activate();
            console.log(this.entity.rigidbody.isActive());
            this.entity.rigidbody.applyImpulse(0, this.jumpImpulse, 0);

            // Start the jump animation
            this.animationState = this.STATE_JUMPING;
            this.model.script.animation.setAnimation("Jump");
            this.model.script.animation.toggleAnimation(true);

            this.jumpTimer = 0.1;
        }
    }

};

// Switch to run animation state and start the run animation
PlatformCharacterController.prototype.run = function () {
    this.animationState = this.STATE_RUNNING;
    this.model.script.animation.setAnimation("Walk");
    this.model.script.animation.toggleAnimation(true);
    //this.app.root.findByName("Camera").script.platformerCamera.zoomIn();
};

// Switch to idle animation state and start the idle animation
PlatformCharacterController.prototype.idle = function () {
    this.animationState = this.STATE_IDLE;
    console.log("IDLE STATE");
    this.model.script.animation.toggleAnimation(false);
    //this.app.root.findByName("Camera").script.platformerCamera.zoomOut();
};

// Switch to idle animation state and start the idle animation
PlatformCharacterController.prototype.land = function () {
    this.animationState = this.STATE_IDLE;
    this.model.script.animation.setAnimation("Walk");
    this.model.script.animation.toggleAnimation(false);
};

PlatformCharacterController.prototype.checkOnGround = function () {
    // Immediately after jumping we don't check for ground
    if (this.jumpTimer > 0) {
        return;
    }

    var raycastStart = this.entity.getPosition();
    this.raycastEnd.add2(raycastStart, this.CHECK_GROUND_RAY);

    var wasOnGround = this.onGround;
    this.onGround = false;
    this.groundEntity = null;



    // fire ray down and see if it hits another entity
    this.app.systems.rigidbody.raycastFirst(raycastStart, this.raycastEnd, function (result) {
        if (result.entity) {
            this.onGround = true;
            this.groundEntity = result.entity;
            if (this.animationState === this.STATE_JUMPING) {
                this.land();
            }
            if (wasOnGround) {
                this.fallTimer = this.jumpGraceTime;
            }
        }
    }.bind(this));
};

PlatformCharacterController.prototype.getGround = function () {
    return this.groundEntity;
};

// Called by damagable script when this entity is killed
PlatformCharacterController.prototype.onKilled = function (killer) {
    if (!this.dead) {
        this.dead = true;
        var v = this.entity.rigidbody.linearVelocity;
        v.x = 0;
        this.entity.rigidbody.linearVelocity = v;


        //this.entity.rigidbody.applyImpulse(0, this.jumpImpulse, this.jumpImpulse);


        // stop body sliding
        this.entity.rigidbody.friction = 1;

        setTimeout(function () {
            this.reset(this.origin);
        }.bind(this), 500);
    }
};

// Reset the player back to a new position
PlatformCharacterController.prototype.reset = function (origin) {
    this.entity.setPosition(origin);
    this.entity.rigidbody.syncEntityToBody();
    this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
    this.entity.rigidbody.friction = 0;
    this.dead = false;
    this.idle();
};