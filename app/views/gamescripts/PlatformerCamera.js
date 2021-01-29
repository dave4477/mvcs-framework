var PlatformerCamera = pc.createScript('platformerCamera');

PlatformerCamera.attributes.add("playerEntityName", {type:"string", default:"", description: "Player Entity Name"});
PlatformerCamera.attributes.add("height", {type:"number", default: 3.5, description: "Height"});
PlatformerCamera.attributes.add("lead", {type:"number", default: 3.5, description: "Lead"});
PlatformerCamera.attributes.add("transferSpeed", {type:"number", default:2.5, description: "Transfer Speed"});
PlatformerCamera.attributes.add("lowerLimit", {type:"number", default:-5, description: "Camera Lower Limit"});

var STATE_LOCKED_BOTTOM = 0;
var STATE_LOCKED_PLATFORM = 1;
var STATE_TRANSFER = 2;
var temp = new pc.Vec3();

// initialize code called once per entity
PlatformerCamera.prototype.initialize = function() {

    this.state = STATE_LOCKED_PLATFORM;
    this.player = null;

    this.targetPosition = new pc.Vec3();

    this.transferStart = new pc.Vec3();
    this.transferEnd = new pc.Vec3();
    this.transferProgress = 1.01;

    this.lastGroundEntity = null;

    this.player = this.app.root.findByName(this.playerEntityName);

    this.isZooming = false;

    if (!this.player) {
        console.log("PlatformerCamera can't find player entity: " + this.playerEntityName);
    }
};

PlatformerCamera.prototype.update = function(dt) {
    if (!this.player) {
        return;
    }

    if (this.state === STATE_LOCKED_BOTTOM) {
        this.updateLockedBottom(dt);
    } else if (this.state === STATE_LOCKED_PLATFORM) {
        this.updateLockedPlatform(dt);
    }

    this.updateCameraPosition(dt);
    if (this.isZooming) {
        this.vertigoIn(dt);
    } else {
        this.vertigoOut(dt);
    }

};

PlatformerCamera.prototype.updateLockedBottom = function (dt) {
    var pp = this.player.getPosition();

    var pos = this.entity.getPosition();
    pos.x = pp.x;

    // this.entity.setPosition(pos);
    this.targetPosition.copy(pos);
};

PlatformerCamera.prototype.zoomIn = function() {
    this.isZooming = true;
};

PlatformerCamera.prototype.zoomOut = function() {
    this.isZooming = false;
};

PlatformerCamera.prototype.vertigoIn = function(dt) {
    var pos = this.entity.getPosition();
    var newZ = pos.z;

    if (this.entity.camera.fov < 55) {
        this.entity.camera.fov ++;
        if (newZ > 5) {
            newZ --;
        }
        this.entity.setPosition(pos.x, pos.y, newZ);
    }
};

PlatformerCamera.prototype.vertigoOut = function(dt) {
    if (this.entity.camera.fov > 45) {
        this.entity.camera.fov --;
        this.entity.setPosition(this.entity.getPosition().x, this.entity.getPosition().y, this.entity.getPosition().z --);
    }
};

PlatformerCamera.prototype.updateLockedPlatform = function (dt) {
    var ground = this.player.script.platform_character_controller.getGround();
    if (ground){
        // Don't update camera when we are on a falling platform.
        if (ground.tags.has("falling")) {
            ground = null;
        }
    }
    var pp = this.player.getPosition();
    var pos = temp.copy(this.entity.getPosition());

    pos.x = pp.x;

    if (ground || this.lastGroundEntity) {
        if (ground && ground !== this.lastGroundEntity) {
            // New ground
            this.transfer(pos);
            this.lastGroundEntity = ground;
        }
        var gp = this.lastGroundEntity.getPosition();
        var platformHalfHeight = this.lastGroundEntity.collision.halfExtents.y;
        pos.y = gp.y + platformHalfHeight + this.height;

        if (pp.y < gp.y) {
            pos.y = pp.y;
            this.transfer(pos);
        }
    }

    if (pos.y < this.lowerLimit) {
        pos.y = this.lowerLimit;
    }
    this.targetPosition.copy(pos);
};

PlatformerCamera.prototype.transfer = function (target) {
    this.transferStart.copy(this.entity.getPosition());
    this.transferEnd.copy(target);
    this.transferProgress = 0;
};

PlatformerCamera.prototype.updateCameraPosition = function (dt) {
    if (this.transferProgress < 1) {
        // smoothly move from one target to another
        this.transferProgress += this.transferSpeed * dt;
        if (this.transferProgress > 1) {
            this.transferProgress = 1.01;
        }
        // temp.lerp(this.transferStart, this.targetPosition, this.transferProgress);
        var progress = pc.tween.easeOutCubic(this.transferProgress);
        temp.sub2(this.targetPosition, this.transferStart).scale(progress).add(this.transferStart);

    } else {
        temp.copy(this.targetPosition);
    }

    this.entity.setPosition(temp);
};
