var KillTrigger = pc.createScript('killTrigger');

// initialize code called once per entity
KillTrigger.prototype.initialize = function() {

    this.entity.collision.on("triggerenter", this.onTriggerEnter, this);
};

KillTrigger.prototype.onTriggerEnter = function (other) {
    console.log("DIE!");

    if (other.script && other.script.damagable) {
        other.script.damagable.kill(this.entity);
    }
};
