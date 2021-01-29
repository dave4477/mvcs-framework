"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fw = function () {
	'use strict';

	/**
  * The Loader class is responsible for loading files.
  * Once all files are loaded we fulfill the promise.
  */

	var HTTP_STATUS_OK = 200;

	var Loader = function () {
		function Loader() {
			_classCallCheck(this, Loader);

			this._numFiles = 0;
			this._files = {};
		}

		/**
   * Loads a bunch of files.
   * @param {string} url The url for the file to load.
   */


		_createClass(Loader, [{
			key: "loadFiles",
			value: function loadFiles(files) {
				var _this = this;

				return new Promise(function (resolve, reject) {
					_this._numFiles = files.length;
					files.forEach(function (url) {
						_this.loadFile(url, resolve, reject);
					});
				});
			}
		}, {
			key: "loadFile",
			value: function loadFile(url, resolve, reject) {
				var _this2 = this;

				var request = new XMLHttpRequest();
				request.open("GET", url, true);
				request.responseType = "json";
				request.onreadystatechange = function (request) {
					if (request.readyState === XMLHttpRequest.DONE) {
						if (request.status !== HTTP_STATUS_OK) {
							_this2._throwLoadError(url);
						}
						_this2._fileLoaded(url, request, resolve);
					}
				}.bind(undefined, request);
				request.send();
			}
		}, {
			key: "_fileLoaded",
			value: function _fileLoaded(url, request, resolve) {
				this._files[url] = request.response;
				if (Object.keys(this._files).length === this._numFiles) {
					resolve(this._files);
					this._files = {};
				}
			}
		}, {
			key: "_throwLoadError",
			value: function _throwLoadError(url) {
				console.warn("Could not load file with url:", url);
				this._files[url] = null;
			}
		}]);

		return Loader;
	}();

	/**
  * subscriptions data format: 
  * { eventType: { id: callback } }
  */

	var singleton = Symbol();
	var eventBus = Symbol();

	var subscriptions = {};
	var viewSubscriptions = {};

	var stateConfiguration = {};

	var _id = 0;
	var _viewId = 0;

	var EventBus = function () {
		function EventBus(enforcer) {
			_classCallCheck(this, EventBus);

			if (enforcer !== eventBus) {
				throw new Error('Cannot construct singleton');
			}
		}

		_createClass(EventBus, null, [{
			key: "subscribe",
			value: function subscribe(eventType, callback) {
				var id = _id++;

				if (!subscriptions[eventType]) {
					subscriptions[eventType] = {};
				}

				subscriptions[eventType][id] = callback;
				return {
					unsubscribe: function unsubscribe() {
						delete subscriptions[eventType][id];
						if (Object.keys(subscriptions[eventType]).length === 0) {
							delete subscriptions[eventType];
						}
					}
				};
			}
		}, {
			key: "subscribeToView",
			value: function subscribeToView(eventType, callback) {
				var id = _viewId++;

				if (!viewSubscriptions[eventType]) {
					viewSubscriptions[eventType] = {};
				}
				viewSubscriptions[eventType][id] = callback;

				return {
					unsubscribe: function unsubscribe() {
						delete viewSubscriptions[eventType][id];
						if (Object.keys(viewSubscriptions[eventType]).length === 0) {
							delete viewSubscriptions[eventType];
						}
					}
				};
			}
		}, {
			key: "publishToView",
			value: function publishToView(eventType, arg) {
				if (!viewSubscriptions[eventType]) {
					return;
				}
				Object.keys(viewSubscriptions[eventType]).forEach(function (key) {
					return viewSubscriptions[eventType][key](arg);
				});
			}
		}, {
			key: "publish",
			value: function publish(eventType, arg) {
				if (!subscriptions[eventType]) {
					return;
				}

				if (stateConfiguration.states && stateConfiguration.states.length && eventType !== "switchState") {
					for (var i = 0; i < stateConfiguration.states.length; i++) {
						if (stateConfiguration.states[i].stateName == stateConfiguration.states.current) {
							for (var e = 0; e < stateConfiguration.states[i].events.length; e++) {
								if (stateConfiguration.states[i].events[e] === eventType) {

									console.log("EventBus::state:", stateConfiguration.states.current, ":publishing:", eventType);

									Object.keys(subscriptions[eventType]).forEach(function (key) {
										return subscriptions[eventType][key](arg);
									});
								}
							}
						}
					}
				} else {
					Object.keys(subscriptions[eventType]).forEach(function (key) {
						return subscriptions[eventType][key](arg);
					});
				}
			}
		}, {
			key: "stateConfig",
			set: function set(config) {
				stateConfiguration.states = config;
			},
			get: function get() {
				return stateConfiguration;
			}
		}, {
			key: "instance",
			get: function get() {
				if (!this[singleton]) {
					this[singleton] = new EventBus(eventBus);
				}
				return this[singleton];
			}
		}]);

		return EventBus;
	}();

	var MVCSCore = {
		modelMap: {},
		controllerMap: {},
		viewMap: {},
		serviceMap: {},
		eventMap: {},
		addModel: function addModel(name, model) {
			this.modelMap[name] = model;
		},

		addView: function addView(name, view) {
			this.viewMap[name] = view;
		},

		addController: function addController(name, controller) {
			this.controllerMap[name] = controller;
		},

		addService: function addService(name, service) {
			this.serviceMap[name] = service;
		}
	};

	var ControllerCore = function () {
		function ControllerCore(name) {
			_classCallCheck(this, ControllerCore);

			MVCSCore.controllerMap[this.constructor.name] = this;
		}

		_createClass(ControllerCore, [{
			key: "dispatch",
			value: function dispatch(e, args) {
				EventBus.publish(e, args);
			}
		}, {
			key: "addListener",
			value: function addListener(type, fn) {
				MVCSCore.eventMap[type] = {};
				MVCSCore.eventMap[type][fn] = EventBus.subscribe(type, fn.bind(this));
			}
		}, {
			key: "removeListener",
			value: function removeListener(type, fn) {
				MVCSCore.eventMap[type][fn].unsubscribe();
				delete MVCSCore.eventMap[type][fn];
			}
		}, {
			key: "getModelByName",
			value: function getModelByName(name) {
				return MVCSCore.modelMap[name];
			}
		}, {
			key: "getServiceByName",
			value: function getServiceByName(name) {
				return MVCSCore.serviceMap[name];
			}
		}, {
			key: "getViewByName",
			value: function getViewByName(name) {
				return MVCSCore.viewMap[name];
			}
		}]);

		return ControllerCore;
	}();

	var ModelCore = function () {
		function ModelCore(name) {
			_classCallCheck(this, ModelCore);

			MVCSCore.modelMap[name] = this;
		}

		_createClass(ModelCore, [{
			key: "dispatch",
			value: function dispatch(e, args) {
				EventBus.publish(e, args);
			}
		}, {
			key: "getModelByName",
			value: function getModelByName(name) {
				return MVCSCore.modelMap[name];
			}
		}, {
			key: "getServiceByName",
			value: function getServiceByName() {
				return MVCSCore.serviceMap[name];
			}
		}]);

		return ModelCore;
	}();

	var Backoff = function () {
		function Backoff() {
			_classCallCheck(this, Backoff);
		}

		/**
   * Gets a url
   * @param url
   * @returns {*}
      */


		_createClass(Backoff, [{
			key: "getURL",
			value: async function getURL(url) {
				return this._getURL(url);
			}

			/**
    * Post to a url.
    * @param url
    * @param data
    * @returns {*}
       */

		}, {
			key: "postURL",
			value: async function postURL(url, data) {
				return this._postURL(url, data);
			}
		}, {
			key: "_getURL",
			value: async function _getURL(url) {
				var _this3 = this;

				var retryCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
				var attempt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

				return await this.httpGet(url).then(function (data) {
					return data;
				}, function (err) {
					if (retryCount > 0) {
						setTimeout(function () {
							_this3._getURL(url, --retryCount, ++attempt);
						}, 250 * attempt);
					}
				});
			}
		}, {
			key: "_postURL",
			value: async function _postURL(url, params) {
				var _this4 = this;

				var retryCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
				var attempt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

				return await this.httpPost(url, params).then(function (data) {
					return data;
				}, function (err) {
					if (retryCount > 0) {
						setTimeout(function () {
							_this4._postURL(url, params, --retryCount, ++attempt);
						}, 150 * attempt);
					}
				});
			}
		}, {
			key: "httpGet",
			value: async function httpGet(url) {
				return new Promise(function (resolve, reject) {
					fetch(url).then(function (response) {
						if (response.ok) {
							resolve(response);
						} else {
							reject();
						}
					}).catch(function (err) {
						reject(err);
					});
				});
			}
		}, {
			key: "httpPost",
			value: async function httpPost(url, data) {
				return new Promise(function (resolve, reject) {
					fetch(url, {
						method: 'POST',
						mode: 'cors',
						cache: 'no-cache',
						credentials: 'same-origin',
						headers: {
							'Content-Type': 'application/json'
							// 'Content-Type': 'application/x-www-form-urlencoded',
						},
						redirect: 'follow',
						referrerPolicy: 'no-referrer',
						body: JSON.stringify(data) // body data type must match "Content-Type" header
					}).then(function (response) {
						if (response.ok) {
							resolve(response);
						} else {
							reject();
						}
					}).catch(function (err) {
						reject(err);
					});
				});
			}
		}]);

		return Backoff;
	}();

	var ServiceCore = function () {
		function ServiceCore(name) {
			_classCallCheck(this, ServiceCore);

			MVCSCore.serviceMap[name] = this;
			this.backoff = new Backoff();
		}

		_createClass(ServiceCore, [{
			key: "dispatch",
			value: function dispatch(e, args) {
				EventBus.publish(e, args);
			}
		}, {
			key: "getModelByName",
			value: function getModelByName(name) {
				return MVCSCore.modelMap[name];
			}
		}, {
			key: "getServiceByName",
			value: function getServiceByName() {
				return MVCSCore.serviceMap[name];
			}
		}, {
			key: "loadView",
			value: async function loadView(url) {
				return this.backoff.getURL(url);
			}
		}, {
			key: "httpGet",
			value: async function httpGet(url) {
				var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

				return this.backoff.getURL(url);
			}
		}, {
			key: "httpPost",
			value: async function httpPost(url) {
				var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

				return this.backoff.postURL(url);
			}
		}]);

		return ServiceCore;
	}();

	var ViewCore = function () {
		function ViewCore(name) {
			_classCallCheck(this, ViewCore);

			MVCSCore.viewMap[name] = this;
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


		_createClass(ViewCore, [{
			key: "addView",
			value: function addView(html, parent) {
				if (!parent) {
					parent = document.body;
				}
				var content = html.getElementsByTagName('body')[0].firstChild;
				parent.appendChild(content);
				return content;
			}
		}, {
			key: "getViewByName",
			value: function getViewByName(name) {
				return MVCSCore.viewMap[name];
			}
		}, {
			key: "dispatchToContext",
			value: function dispatchToContext(e, args) {
				EventBus.publish(e, args);
			}
		}, {
			key: "addContextListener",
			value: function addContextListener(type, fn) {
				this._contextListeners.push({ type: type, fn: fn });
				MVCSCore.eventMap[type] = MVCSCore.eventMap[type] || {};
				MVCSCore.eventMap[type][fn] = EventBus.subscribe(type, fn.bind(this));
			}
		}, {
			key: "removeContextListener",
			value: function removeContextListener(type, fn) {
				if (!MVCSCore.eventMap[type][fn]) {
					console.warn(this.constructor.name + " Could not unsubsribe  from " + type);
					return;
				}
				console.log("removing contextListener:", type);
				this._removeEvent(this._contextListeners, { type: type, fn: fn });
				MVCSCore.eventMap[type][fn].unsubscribe();
				delete MVCSCore.eventMap[type][fn];
			}
		}, {
			key: "dispatchToView",
			value: function dispatchToView(e, args) {
				EventBus.publishToView(e, args);
			}
		}, {
			key: "addViewListener",
			value: function addViewListener(type, fn) {
				this._viewListeners.push({ type: type, fn: fn });
				MVCSCore.eventMap[type] = MVCSCore.eventMap[type] || {};
				MVCSCore.eventMap[type][fn] = EventBus.subscribeToView(type, fn.bind(this));
			}
		}, {
			key: "removeViewListener",
			value: function removeViewListener(type, fn) {
				if (!MVCSCore.eventMap[type][fn]) {
					console.warn(this.constructor.name + " Could not unsubsribe view listener for " + type);
					return;
				}
				this._removeEvent(this._viewListeners, { type: type, fn: fn });
				MVCSCore.eventMap[type][fn].unsubscribe();
				delete MVCSCore.eventMap[type][fn];
			}
		}, {
			key: "removeAllContextListeners",
			value: function removeAllContextListeners() {
				var listener = null;
				console.log("All contextListeners:", this._contextListeners);
				for (var i = 0; i < this._contextListeners.length; i++) {
					listener = this._contextListeners[i];
					this.removeContextListener(listener.type, listener.fn);
				}
				this._contextListeners = [];
			}
		}, {
			key: "removeAllViewListeners",
			value: function removeAllViewListeners() {
				var listener = null;
				for (var i = 0; i < this._viewListeners.length; i++) {
					listener = this._viewListeners[i];
					this.removeViewListener(listener.type, listener.fn);
				}
				this._viewListeners = [];
			}
		}, {
			key: "removeAllListeners",
			value: function removeAllListeners() {
				this.removeAllContextListeners();
				this.removeAllViewListeners();
			}
		}, {
			key: "_removeEvent",
			value: function _removeEvent(arr, obj) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] == obj) {
						arr.splice(i, 1);
					}
				}
			}
		}]);

		return ViewCore;
	}();

	/**
  * Switching states should:
  * 1. postProcess current state
  * 2. switch to new state
  * 3. preProcess new state
  */

	var SYSTEM_STATE = {
		stateName: "__system__",
		preProcess: [],
		postProcess: [],
		outbound: [],
		events: []
	};

	var StateMachine = function () {
		function StateMachine() {
			_classCallCheck(this, StateMachine);
		}

		_createClass(StateMachine, [{
			key: "init",
			value: function init(config) {
				this._config = config;
				this._currentState = SYSTEM_STATE.stateName;
				config.states.current = this._currentState;
				SYSTEM_STATE.outbound.push(config.initialState);
				var newItem = this._config.states.push(SYSTEM_STATE);

				console.log("newItem:", this._config.states);
				EventBus.stateConfig = config.states;

				this.addListeners();

				EventBus.publish("switchState", config.initialState);
			}
		}, {
			key: "addListeners",
			value: function addListeners() {
				var _this5 = this;

				EventBus.subscribe("switchState", function (data) {
					// console.log("Trying to move to state ", data);
					var states = _this5._config.states;
					var statesLen = states.length;

					for (var i = 0; i < statesLen; i++) {
						if (states[i].stateName == _this5._currentState) {
							var currState = states[i];
							if (_this5._currentState) {

								for (var connections = 0; connections < currState.outbound.length; connections++) {
									if (data === currState.outbound[connections]) {

										// Process the exit commands for the old state.
										_this5._processCommands(currState.postProcess);

										// Switch state.
										_this5._currentState = data;

										EventBus.stateConfig.states.current = data;
										console.log("Switched to state " + _this5._currentState);

										var newState = _this5._getNewState(states, data);

										// Process enter commands for new state.
										_this5._processCommands(newState.preProcess);

										// We have switched state.
										return true;
									}
								}
								console.warn("Could not move to state " + data + " : currentState is " + _this5._currentState);
								return false;
							}
						}
					}
				});
			}
		}, {
			key: "_getNewState",
			value: function _getNewState(states, state) {
				for (var i = 0; i < states.length; i++) {
					if (states[i].stateName === state) {
						return states[i];
					}
				}
				return null;
			}
		}, {
			key: "_processCommands",
			value: function _processCommands(process) {
				for (var i = 0; i < process.length; i++) {
					var strArr = process[i].split(":");
					var controller = strArr[0];
					var fn = strArr[1];

					MVCSCore.controllerMap[controller][fn]();
				}
			}
		}]);

		return StateMachine;
	}();

	var Node = function Node(value) {
		_classCallCheck(this, Node);

		this.value = value;
		this.left = null;
		this.right = null;
	};

	var BinaryTree = function () {
		function BinaryTree() {
			_classCallCheck(this, BinaryTree);

			this.root = null;
		}

		_createClass(BinaryTree, [{
			key: "find",
			value: function find(value) {
				if (!this.root) {
					return false;
				}
				var current = this.root;
				var found = false;
				while (current && !found) {
					if (value < current.value) {
						current = current.left;
					} else if (value > current.value) {
						current = current.right;
					} else {
						found = current;
					}
				}
				if (!found) {
					return undefined;
				}
				return found;
			}
		}, {
			key: "insert",
			value: function insert(value) {
				var newNode = new Node(value);
				if (this.root === null) {
					this.root = newNode;
					return this;
				}
				var current = this.root;
				while (current) {
					if (value === current.value) {
						return undefined;
					}
					if (value < current.value) {
						if (current.left === null) {
							current.left = newNode;
							return this;
						}
						current = current.left;
					} else {
						if (current.right === null) {
							current.right = newNode;
							return this;
						}
						current = current.right;
					}
				}
			}
		}, {
			key: "remove",
			value: function remove(value) {
				this.root = this.removeNode(this.root, value);
			}
		}, {
			key: "removeNode",
			value: function removeNode(current, value) {
				if (current === null) {
					return current;
				}

				if (value === current.value) {
					if (current.left === null && current.right === null) {
						return null;
					} else if (current.left === null) {
						return current.right;
					} else if (current.right === null) {
						return current.left;
					} else {
						var tempNode = this.smallestNode(current.right);
						current.value = tempNode.value;

						current.right = this.removeNode(current.right, tempNode.value);
						return current;
					}
				} else if (value < current.value) {
					current.left = this.removeNode(current.left, value);
					return current;
				} else {
					current.right = this.removeNode(current.right, value);
					return current;
				}
			}
		}, {
			key: "smallestNode",
			value: function smallestNode(node) {
				while (!node.left === null) {
					node = node.left;
				}
				return node;
			}
		}]);

		return BinaryTree;
	}();

	/**
  * Linked list data structure.
  */


	var Node$1 = function Node$1(data) {
		_classCallCheck(this, Node$1);

		this.data = data;
		this.next = null;
		this.prev = null;
	};

	var LinkedList = function () {
		function LinkedList() {
			_classCallCheck(this, LinkedList);

			this.head = null;
			this.tail = null;
		}

		_createClass(LinkedList, [{
			key: "append",
			value: function append(item) {
				var node = new Node$1(item);

				if (!this.head) {
					this.head = node;
					this.tail = node;
				} else {
					node.prev = this.tail;
					this.tail.next = node;
					this.tail = node;
				}
			}
		}, {
			key: "appendAt",
			value: function appendAt(pos, item) {
				var current = this.head;
				var counter = 1;
				var node = new Node$1(item);
				if (pos == 0) {
					this.head.prev = node;
					node.next = this.head;
					this.head = node;
				} else {
					while (current) {
						current = current.next;
						if (counter == pos) {
							node.prev = current.prev;
							current.prev.next = node;
							node.next = current;
							current.prev = node;
						}
						counter++;
					}
				}
			}
		}, {
			key: "appendAfter",
			value: function appendAfter(item) {
				//
			}
		}, {
			key: "remove",
			value: function remove(item) {
				var current = this.head;
				while (current) {
					if (current.data === item) {
						if (current == this.head && current == this.tail) {
							this.head = null;
							this.tail = null;
						} else if (current == this.head) {
							this.head = this.head.next;
							this.head.prev = null;
						} else if (current == this.tail) {
							this.tail = this.tail.prev;
							this.tail.next = null;
						} else {
							current.prev.next = current.next;
							current.next.prev = current.prev;
						}
					}
					current = current.next;
				}
			}
		}, {
			key: "removeAt",
			value: function removeAt(pos) {
				var current = this.head;
				var counter = 1;
				if (pos == 0) {
					this.head = this.head.next;
					this.head.prev = null;
				} else {
					while (current) {
						current = current.next;
						if (current == this.tail) {
							this.tail = this.tail.prev;
							this.tail.next = null;
						} else if (counter == pos) {
							current.prev.next = current.next;
							current.next.prev = current.prev;
							break;
						}
						counter++;
					}
				}
			}
		}, {
			key: "reverse",
			value: function reverse() {
				var current = this.head;
				var prev = null;
				while (current) {
					var next = current.next;
					current.next = prev;
					current.prev = next;
					prev = current;
					current = next;
				}
				this.tail = this.head;
				this.head = prev;
			}
		}, {
			key: "swap",
			value: function swap(nodeOne, nodeTwo) {
				var current = this.head;
				var counter = 0;
				var firstNode = void 0;

				// Make sure we are okay to go
				if (nodeOne === nodeTwo) {
					console.log("ERROR: 'SWAP' both the nodes must be different!");
					return false;
				} else if (nodeOne > nodeTwo) {
					var temp = nodeOne;
					nodeOne = nodeTwo;
					nodeTwo = temp;
				}

				if (nodeOne < 0 || nodeTwo < 0) {
					console.log("ERROR: 'SWAP' both the nodes must be index & index can not be negative!");
					return false;
				}

				// Swap nodes
				while (current !== null) {
					if (counter == nodeOne) {
						firstNode = current;
					} else if (counter == nodeTwo) {
						var _temp = current.data;
						current.data = firstNode.data;
						firstNode.data = _temp;
					}
					current = current.next;
					counter++;
				}
				return true;
			}
		}, {
			key: "length",
			value: function length() {
				var current = this.head;
				var counter = 0;
				while (current !== null) {
					counter++;
					current = current.next;
				}
				return counter;
			}
		}, {
			key: "display",
			value: function display() {
				var current = this.head;
				var elements = [];
				while (current !== null) {
					elements.push(current.data);
					current = current.next;
				}
				return elements.join(" ");
			}
		}, {
			key: "isEmpty",
			value: function isEmpty() {
				return this.length() < 1;
			}
		}, {
			key: "traverse",
			value: function traverse(fn) {
				if (!fn || typeof fn !== 'function') {
					console.log("ERROR: 'TRAVERSE' function is undefined!");
					return false;
				}
				var current = this.head;
				while (current !== null) {
					fn(current);
					current = current.next;
				}
				return true;
			}
		}, {
			key: "traverseReverse",
			value: function traverseReverse(fn) {
				if (!fn || typeof fn !== 'function') {
					console.log("ERROR: 'TRAVERSE_REVERSE' function is undefined!");
					return false;
				}
				var current = this.tail;
				while (current !== null) {
					fn(current);
					current = current.prev;
				}
				return true;
			}
		}, {
			key: "search",
			value: function search(item) {
				var current = this.head;
				var counter = 0;

				while (current) {
					if (current.data == item) {
						return counter;
					}
					current = current.next;
					counter++;
				}
				return false;
			}
		}, {
			key: "getArray",
			value: function getArray() {
				var current = this.head;
				var returnArr = [];

				while (current) {
					if (current.data) {
						returnArr.push(current.data);
					}
					current = current.next;
				}
				return returnArr;
			}
		}]);

		return LinkedList;
	}();

	var Queue = function (_Array) {
		_inherits(Queue, _Array);

		function Queue() {
			_classCallCheck(this, Queue);

			return _possibleConstructorReturn(this, (Queue.__proto__ || Object.getPrototypeOf(Queue)).call(this));
		}

		_createClass(Queue, [{
			key: "enqueue",
			value: function enqueue(val) {
				this.push(val);
			}
		}, {
			key: "dequeue",
			value: function dequeue() {
				return this.shift();
			}
		}, {
			key: "peek",
			value: function peek() {
				return this[0];
			}
		}, {
			key: "isEmpty",
			value: function isEmpty() {
				return this.length === 0;
			}
		}]);

		return Queue;
	}(Array);

	var ViewParser = function () {
		function ViewParser() {
			_classCallCheck(this, ViewParser);
		}

		_createClass(ViewParser, null, [{
			key: "parseHTML",
			value: async function parseHTML(responseText) {
				var data = await responseText.text();
				var parser = new DOMParser();
				return parser.parseFromString(data, "text/html");
			}
		}, {
			key: "parseJSON",
			value: async function parseJSON(responseText) {
				return responseText.json();
			}
		}]);

		return ViewParser;
	}();

	/**
  * Very simple lightweight "MVCS" framework, including
  * an optional state machine and utils.
  */


	var fw = {
		core: {
			createStateMachine: function createStateMachine(stateConfig) {
				new StateMachine().init(stateConfig);
			},
			/*		states: {
   			stateMachine: new StateMachine()
   		},*/
			data: {
				binaryTree: BinaryTree,
				linkedList: LinkedList,
				queue: Queue
			},
			parsers: {
				viewParser: ViewParser
			},
			connection: {
				backOff: new Backoff(),
				xhrLoader: new Loader()
			},
			controllerCore: ControllerCore,
			modelCore: ModelCore,
			serviceCore: ServiceCore,
			viewCore: ViewCore
		}
	};

	return fw;
}();
