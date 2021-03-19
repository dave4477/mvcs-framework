import EventBus from './EventBus.js';
import MVCSCore from './MVCSCore.js';

export default class ViewCore {
	constructor(name) {
		// console.log(`Creating view ${name}`);
		MVCSCore.viewMap[name] = this;
		this._name = name;
		this._contextListeners = [];
		this._viewListeners = [];
		this._parent = document.body;
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

		if (parent) {
			this._parent = parent;
		}
		//const content = html.getElementsByTagName('body')[0].firstChild;
		let content = html.body || html;
		this._parent.appendChild(content);
		return html;
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
		const unsubscriber = EventBus.subscribe(type, fn.bind(this));
		this._contextListeners.push({type:type, fn:fn, unsubscriber:unsubscriber});
	}

	removeContextListener(type, fn) {
		for (let i = 0; i < this._contextListeners.length; i++) {
			const listener = this._contextListeners[i];
			if (listener.type == type && listener.fn == fn) {
				listener.unsubscriber.unsubscribe();
				this._contextListeners.splice(i,1);

			}
		}
	}

	dispatchToView(e, args) {
		EventBus.publishToView(e, args);
	}

	addViewListener(type, fn) {
		const unsubscriber = EventBus.subscribeToView(type, fn.bind(this));
		this._viewListeners.push({type:type, fn:fn, unsubscriber:unsubscriber});
	}

	removeViewListener(type, fn) {
		for (let i = 0; i < this._viewListeners.length; i++) {
			const listener = this._viewListeners[i];
			if (listener.type == type && listener.fn == fn) {
				listener.unsubscriber.unsubscribe();
				this._viewListeners.splice(i,1);
			}
		}
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