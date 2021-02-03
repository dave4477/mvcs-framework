import EventBus from './EventBus.js';
import MVCSCore from './MVCSCore.js';

export default class ViewCore {
	constructor(name) {
		console.log(`Creating view ${name}`);
		MVCSCore.viewMap[name] = this;
		this._name = name;
		this._contextListeners = [];
		this._viewListeners = [];
	}
	
	/**
	 * Appends HTML node to a given parent.
	 * Returns a promise if a module.js is attached
	 * in the data-api attribute.
	 *
	 * @param html		HTML Node
	 * @param parent 	The parent to attach the HTML to,
	 * 					or document.body if empty.
     */
	addView(html, parent) {
		if (!parent) {
			parent = document.body;
		}
		const content = html.getElementsByTagName('body')[0].firstChild;
		parent.appendChild(content);
		return content;
	}

	removeView() {
		this.removeAllContextListeners();
		this.removeAllViewListeners();
		delete MVCSCore.viewMap[this._name];
	}

	getViewByName(name) {
		return MVCSCore.viewMap[name];
	}

	dispatchToContext(e, args) {
		EventBus.publish(e, args);
	}

	addContextListener(type, fn) {
		this._contextListeners.push({ type:type, fn:fn });
		MVCSCore.eventMap[type] = MVCSCore.eventMap[type] || {};
		MVCSCore.eventMap[type][fn] = EventBus.subscribe(type, fn.bind(this));
	}

	removeContextListener(type, fn) {
		if (!MVCSCore.eventMap[type][fn]) {
			console.warn(`${this.constructor.name} Could not unsubsribe  from ${type}`);
			return;
		}
		this._removeEvent(this._contextListeners, {type:type, fn:fn});
		MVCSCore.eventMap[type][fn].unsubscribe();
		delete MVCSCore.eventMap[type][fn];
	}

	dispatchToView(e, args) {
		EventBus.publishToView(e, args);
	}

	addViewListener(type, fn) {
		this._viewListeners.push({type:type, fn:fn});
		MVCSCore.eventMap[type] = MVCSCore.eventMap[type] || {};
		MVCSCore.eventMap[type][fn] = EventBus.subscribeToView(type, fn.bind(this));
	}

	removeViewListener(type, fn) {
		if (!MVCSCore.eventMap[type][fn]) {
			console.warn(`${this.constructor.name} Could not unsubsribe view listener for ${type}`);
			return;
		}
		this._removeEvent(this._viewListeners, {type:type, fn:fn});
		MVCSCore.eventMap[type][fn].unsubscribe();
		delete MVCSCore.eventMap[type][fn];
	}

	removeAllContextListeners() {
		let listener = null;
		for (let i = 0; i < this._contextListeners.length; i++) {
			listener = this._contextListeners[i];
			this.removeContextListener(listener.type, listener.fn);
		}
		this._contextListeners = [];
	}

	removeAllViewListeners() {
		let listener = null;
		for (let i = 0; i < this._viewListeners.length; i++) {
			listener = this._viewListeners[i];
			this.removeViewListener(listener.type, listener.fn);
		}
		this._viewListeners = [];
	}

	removeAllListeners() {
		this.removeAllContextListeners();
		this.removeAllViewListeners();
	}

	_removeEvent(arr, obj) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] == obj) {
				arr.splice(i, 1);
			}
		}
	}
}