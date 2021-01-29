var CharMove = pc.createScript('charMove');

// initialize code called once per entity
CharMove.prototype.initialize = function() {
    this.isJumping = false;
    this.colliders = this.entity.findByTag("Collider");
    this.forceMultiplier = 15;
    this.force = new pc.Vec3();
    this.torque = 7;
    this.speedy = 0;
};

// update code called every frame
CharMove.prototype.update = function(dt) {
    this.entity.rigidbody.activate();

    if (this.app.keyboard.isPressed(pc.KEY_SPACE)) {
        console.log("Space bar is pressed");
        //this.entity.rigidbody.type = pc.BODYTYPE_KINEMATIC;

        var newY = this.entity.getPosition().y + (dt * this.speedy);

        if (this.speedy < 1) {
            this.speedy += 0.5;

        }

        this.entity.rigidbody.applyForce(0, 1, 0);
        this.entity.rigidbody.teleport(0, 1, 0);

        /*
         this.entity.setPosition(this.entity.getPosition().x, newY, this.entity.getPosition().z);
         this.entity.rigidbody.applyImpulse(this.entity.getPosition().x, this.speedy * this.forceMultiplier, 0);
         for (var i = 0; i < this.colliders.length; i++){
         this.colliders[i].rigidbody.teleport(this.colliders[i].getPosition().x, newY, this.colliders[i].getPosition().z);
         }
         */
        console.log(newY);

        /*
         for (var i = 0; i < this.colliders.length; i++){
         this.colliders[i].rigidbody.teleport(this.colliders[i].getPosition().x, newY, this.colliders[i].getPosition().z);
         }
         */

        //this.entity.rigidbody.applyImpulse(0, this.speedy * this.forceMultiplier, 0);
        //this.entity.rigidbody.applyTorque(0, this.speedx * this.forceMultiplier, this.speedy * this.forceMultiplier);


    }

};
