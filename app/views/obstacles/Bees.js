import Constants from './../../Constants.js';
import Bee from './Bee.js';

export default class Bees extends fw.core.viewCore {
    constructor( arrBees) {
        super(Constants.views.BEES);
        this.bees = arrBees;
        this.loaded = 0;
        this.loadedBees = [];
        this.addViewListener('BeeObjectLoaded', ()=> {
            this.loaded ++;
            if (this.loaded == this.bees.length) {
                for (let i = 0; i < this.loadedBees.length; i++) {
                    this.loadedBees[i].addTweens();
                }
            }
        });
    }

    create(container) {
        for (let i = 0; i < this.bees.length ; i++) {
            const beeProperties = this.bees[i];
            this.loadedBees.push(new Bee(beeProperties.x,
                beeProperties.y,
                beeProperties.z,
                beeProperties.endX,
                beeProperties.duration));
            this.loadedBees[this.loadedBees.length-1].create(container);


        }
    }
}