var GroundScript = pc.createScript('groundScript');

// initialize code called once per entity
GroundScript.prototype.initialize = function() {
    this.speed = 1;
};

// update code called every frame
GroundScript.prototype.update = function(dt) {
    var newX = this.entity.getPosition().x-(dt * this.speed);
    this.entity.setPosition(newX,0,0);
    this.entity.rigidbody.teleport(newX, 0, 0);
};

// swap method called for script hot-reloading
// inherit your script state here
// GroundScript.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting//**
