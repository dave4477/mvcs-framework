var fw = function () {
  'use strict';
  /**
   * The Loader class is responsible for loading files.
   * Once all files are loaded we fulfill the promise.
   */

  const HTTP_STATUS_OK = 200;

  class Loader {
    constructor() {
      this._numFiles = 0;
      this._files = {};
    }
    /**
     * Loads a bunch of files.
     * @param {string} url The url for the file to load.
     */


    loadFiles(files) {
      return new Promise((resolve, reject) => {
        this._numFiles = files.length;
        files.forEach(url => {
          this.loadFile(url, resolve, reject);
        });
      });
    }

    loadFile(url, resolve, reject) {
      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "json";

      request.onreadystatechange = (request => {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status !== HTTP_STATUS_OK) {
            this._throwLoadError(url);
          }

          this._fileLoaded(url, request, resolve);
        }
      }).bind(undefined, request);

      request.send();
    }

    _fileLoaded(url, request, resolve) {
      this._files[url] = request.response;

      if (Object.keys(this._files).length === this._numFiles) {
        resolve(this._files);
        this._files = {};
      }
    }

    _throwLoadError(url) {
      console.warn("Could not load file with url:", url);
      this._files[url] = null;
    }

  }
  /**
   * subscriptions data format: 
   * { eventType: { id: callback } }
   */


  const singleton = Symbol();
  const eventBus = Symbol();
  const subscriptions = {};
  const viewSubscriptions = {};
  const stateConfiguration = {};
  let _id = 0;
  let _viewId = 0;

  class EventBus {
    constructor(enforcer) {
      if (enforcer !== eventBus) {
        throw new Error('Cannot construct singleton');
      }
    }

    static set stateConfig(config) {
      stateConfiguration.states = config;
    }

    static get stateConfig() {
      return stateConfiguration;
    }

    static get instance() {
      if (!this[singleton]) {
        this[singleton] = new EventBus(eventBus);
      }

      return this[singleton];
    }

    static subscribe(eventType, callback) {
      const id = _id++;

      if (!subscriptions[eventType]) {
        subscriptions[eventType] = {};
      }

      subscriptions[eventType][id] = callback;
      return {
        unsubscribe: () => {
          delete subscriptions[eventType][id];

          if (Object.keys(subscriptions[eventType]).length === 0) {
            delete subscriptions[eventType];
          }
        }
      };
    }

    static subscribeToView(eventType, callback) {
      const id = _viewId++;

      if (!viewSubscriptions[eventType]) {
        viewSubscriptions[eventType] = {};
      }

      viewSubscriptions[eventType][id] = callback;
      return {
        unsubscribe: () => {
          delete viewSubscriptions[eventType][id];

          if (Object.keys(viewSubscriptions[eventType]).length === 0) {
            delete viewSubscriptions[eventType];
          }
        }
      };
    }

    static publishToView(eventType, arg) {
      if (!viewSubscriptions[eventType]) {
        return;
      }

      Object.keys(viewSubscriptions[eventType]).forEach(key => viewSubscriptions[eventType][key](arg));
    }

    static publish(eventType, arg) {
      if (!subscriptions[eventType]) {
        return;
      }

      if (stateConfiguration.states && stateConfiguration.states.length && eventType !== "switchState") {
        for (var i = 0; i < stateConfiguration.states.length; i++) {
          if (stateConfiguration.states[i].stateName == stateConfiguration.states.current) {
            for (var e = 0; e < stateConfiguration.states[i].events.length; e++) {
              if (stateConfiguration.states[i].events[e] === eventType) {
                Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](arg));
              }
            }
          }
        }
      } else {
        Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](arg));
      }
    }

  }

  var MVCSCore = {
    modelMap: {},
    controllerMap: {},
    viewMap: {},
    serviceMap: {},
    eventMap: {},
    addModel: function (name, model) {
      this.modelMap[name] = model;
    },
    addView: function (name, view) {
      this.viewMap[name] = view;
    },
    addController: function (name, controller) {
      this.controllerMap[name] = controller;
    },
    addService: function (name, service) {
      this.serviceMap[name] = service;
    }
  };

  class ControllerCore {
    constructor(name) {
      MVCSCore.controllerMap[this.constructor.name] = this;
    }

    dispatch(e, args) {
      EventBus.publish(e, args);
    }

    addListener(type, fn) {
      MVCSCore.eventMap[type] = {};
      MVCSCore.eventMap[type][fn] = EventBus.subscribe(type, fn.bind(this));
    }

    removeListener(type, fn) {
      MVCSCore.eventMap[type][fn].unsubscribe();
      delete MVCSCore.eventMap[type][fn];
    }

    getModelByName(name) {
      return MVCSCore.modelMap[name];
    }

    getServiceByName(name) {
      return MVCSCore.serviceMap[name];
    }

    getViewByName(name) {
      return MVCSCore.viewMap[name];
    }

  }

  class ModelCore {
    constructor(name) {
      MVCSCore.modelMap[name] = this;
    }

    dispatch(e, args) {
      EventBus.publish(e, args);
    }

    getModelByName(name) {
      return MVCSCore.modelMap[name];
    }

    getServiceByName() {
      return MVCSCore.serviceMap[name];
    }

  }

  class Backoff {
    constructor() {}
    /**
     * Gets a url
     * @param url
     * @returns {*}
        */


    async getURL(url) {
      return this._getURL(url);
    }
    /**
     * Post to a url.
     * @param url
     * @param data
     * @returns {*}
        */


    async postURL(url, data) {
      return this._postURL(url, data);
    }

    async _getURL(url, retryCount = 5, attempt = 0) {
      return await this.httpGet(url).then(data => {
        return data;
      }, err => {
        if (retryCount > 0) {
          setTimeout(() => {
            this._getURL(url, --retryCount, ++attempt);
          }, 250 * attempt);
        }
      });
    }

    async _postURL(url, params, retryCount = 5, attempt = 0) {
      return await this.httpPost(url, params).then(data => {
        return data;
      }, err => {
        if (retryCount > 0) {
          setTimeout(() => {
            this._postURL(url, params, --retryCount, ++attempt);
          }, 150 * attempt);
        }
      });
    }

    async httpGet(url) {
      return new Promise((resolve, reject) => {
        fetch(url).then(response => {
          if (response.ok) {
            resolve(response);
          } else {
            reject();
          }
        }).catch(err => {
          reject(err);
        });
      });
    }

    async httpPost(url, data) {
      return new Promise((resolve, reject) => {
        fetch(url, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json' // 'Content-Type': 'application/x-www-form-urlencoded',

          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
          body: JSON.stringify(data) // body data type must match "Content-Type" header

        }).then(response => {
          if (response.ok) {
            resolve(response);
          } else {
            reject();
          }
        }).catch(err => {
          reject(err);
        });
      });
    }

  }

  class ViewCore {
    constructor(name) {
      console.log(`Creating view ${name}`);
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


    addView(html, parent) {
      if (!parent) {
        parent = document.body;
      }

      const content = html.getElementsByTagName('body')[0].firstChild;
      parent.appendChild(content);
      return content;
    }

    getViewByName(name) {
      return MVCSCore.viewMap[name];
    }

    dispatchToContext(e, args) {
      EventBus.publish(e, args);
    }

    addContextListener(type, fn) {
      this._contextListeners.push({
        type: type,
        fn: fn
      });

      MVCSCore.eventMap[type] = MVCSCore.eventMap[type] || {};
      MVCSCore.eventMap[type][fn] = EventBus.subscribe(type, fn.bind(this));
    }

    removeContextListener(type, fn) {
      if (!MVCSCore.eventMap[type][fn]) {
        console.warn(`${this.constructor.name} Could not unsubsribe  from ${type}`);
        return;
      }

      this._removeEvent(this._contextListeners, {
        type: type,
        fn: fn
      });

      MVCSCore.eventMap[type][fn].unsubscribe();
      delete MVCSCore.eventMap[type][fn];
    }

    dispatchToView(e, args) {
      EventBus.publishToView(e, args);
    }

    addViewListener(type, fn) {
      this._viewListeners.push({
        type: type,
        fn: fn
      });

      MVCSCore.eventMap[type] = MVCSCore.eventMap[type] || {};
      MVCSCore.eventMap[type][fn] = EventBus.subscribeToView(type, fn.bind(this));
    }

    removeViewListener(type, fn) {
      if (!MVCSCore.eventMap[type][fn]) {
        console.warn(`${this.constructor.name} Could not unsubsribe view listener for ${type}`);
        return;
      }

      this._removeEvent(this._viewListeners, {
        type: type,
        fn: fn
      });

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

  class ServiceCore {
    constructor(name) {
      MVCSCore.serviceMap[name] = this;
      this.backoff = new Backoff();
    }

    dispatch(e, args) {
      EventBus.publish(e, args);
    }

    getModelByName(name) {
      return MVCSCore.modelMap[name];
    }

    getServiceByName() {
      return MVCSCore.serviceMap[name];
    }

    async loadView(url) {
      return new Promise((resolve, reject) => {
        this.backoff.getURL(url).then(loadedView => {
          if (loadedView) {
            fw.core.parsers.viewParser.parseHTML(loadedView).then(html => {
              // Check if there is a script attached.
              const content = html.getElementsByTagName('body')[0].firstChild;
              const script = content.hasAttribute('data-api') ? content.getAttribute('data-api') : null;

              if (script) {
                import(script).then(loadedscript => {
                  resolve({
                    script: loadedscript.default,
                    html: html
                  });
                });
              } else {
                const id = content.getAttribute('id');
                const script = class generatedViewClass extends ViewCore {
                  constructor(name) {
                    super(name || id);
                  }

                };
                resolve({
                  script: script,
                  html: html
                });
              }
            });
          } else {
            console.log(`Something went wrong: ${loadedView}`);
            reject();
          }
        });
      });
    }

    async httpGet(url, data = null) {
      return this.backoff.getURL(url);
    }

    async httpPost(url, data = null) {
      return this.backoff.postURL(url);
    }

  }
  /**
   * Switching states should:
   * 1. postProcess current state
   * 2. switch to new state
   * 3. preProcess new state
   */


  const SYSTEM_STATE = {
    stateName: "__system__",
    preProcess: [],
    postProcess: [],
    outbound: [],
    events: []
  };

  class StateMachine {
    constructor() {}

    init(config) {
      this._config = config;
      this._currentState = SYSTEM_STATE.stateName;
      config.states.current = this._currentState;
      SYSTEM_STATE.outbound.push(config.initialState);

      const newItem = this._config.states.push(SYSTEM_STATE);

      EventBus.stateConfig = config.states;
      this.addListeners();
      EventBus.publish("switchState", config.initialState);
    }

    addListeners() {
      EventBus.subscribe("switchState", data => {
        const states = this._config.states;
        const statesLen = states.length;

        for (var i = 0; i < statesLen; i++) {
          if (states[i].stateName == this._currentState) {
            const currState = states[i];

            if (this._currentState) {
              for (var connections = 0; connections < currState.outbound.length; connections++) {
                if (data === currState.outbound[connections]) {
                  // Process the exit commands for the old state.
                  this._processCommands(currState.postProcess); // Switch state.


                  this._currentState = data;
                  EventBus.stateConfig.states.current = data;
                  console.log(`Switched to state ${this._currentState}`);

                  const newState = this._getNewState(states, data); // Process enter commands for new state.


                  this._processCommands(newState.preProcess); // We have switched state.


                  return true;
                }
              }

              console.warn(`Could not move to state ${data} : currentState is ${this._currentState}`);
              return false;
            }
          }
        }
      });
    }

    _getNewState(states, state) {
      for (var i = 0; i < states.length; i++) {
        if (states[i].stateName === state) {
          return states[i];
        }
      }

      return null;
    }

    _processCommands(process) {
      for (let i = 0; i < process.length; i++) {
        const strArr = process[i].split(":");
        const controller = strArr[0];
        const fn = strArr[1];
        MVCSCore.controllerMap[controller][fn]();
      }
    }

  }

  class Node {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
    }

  }

  class BinaryTree {
    constructor() {
      this.root = null;
    }

    find(value) {
      if (!this.root) {
        return false;
      }

      let current = this.root;
      let found = false;

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

    insert(value) {
      var newNode = new Node(value);

      if (this.root === null) {
        this.root = newNode;
        return this;
      }

      let current = this.root;

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

    remove(value) {
      this.root = this.removeNode(this.root, value);
    }

    removeNode(current, value) {
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
          let tempNode = this.smallestNode(current.right);
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

    smallestNode(node) {
      while (!node.left === null) {
        node = node.left;
      }

      return node;
    }

  }
  /**
   * Linked list data structure.
   */


  class Node$1 {
    constructor(data) {
      this.data = data;
      this.next = null;
      this.prev = null;
    }

  }

  class LinkedList {
    constructor() {
      this.head = null;
      this.tail = null;
    }

    append(item) {
      let node = new Node$1(item);

      if (!this.head) {
        this.head = node;
        this.tail = node;
      } else {
        node.prev = this.tail;
        this.tail.next = node;
        this.tail = node;
      }
    }

    appendAt(pos, item) {
      let current = this.head;
      let counter = 1;
      let node = new Node$1(item);

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

    appendAfter(item) {//
    }

    remove(item) {
      let current = this.head;

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

    removeAt(pos) {
      let current = this.head;
      let counter = 1;

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

    reverse() {
      let current = this.head;
      let prev = null;

      while (current) {
        let next = current.next;
        current.next = prev;
        current.prev = next;
        prev = current;
        current = next;
      }

      this.tail = this.head;
      this.head = prev;
    }

    swap(nodeOne, nodeTwo) {
      let current = this.head;
      let counter = 0;
      let firstNode; // Make sure we are okay to go

      if (nodeOne === nodeTwo) {
        console.log(`ERROR: 'SWAP' both the nodes must be different!`);
        return false;
      } else if (nodeOne > nodeTwo) {
        let temp = nodeOne;
        nodeOne = nodeTwo;
        nodeTwo = temp;
      }

      if (nodeOne < 0 || nodeTwo < 0) {
        console.log(`ERROR: 'SWAP' both the nodes must be index & index can not be negative!`);
        return false;
      } // Swap nodes


      while (current !== null) {
        if (counter == nodeOne) {
          firstNode = current;
        } else if (counter == nodeTwo) {
          let temp = current.data;
          current.data = firstNode.data;
          firstNode.data = temp;
        }

        current = current.next;
        counter++;
      }

      return true;
    }

    length() {
      let current = this.head;
      let counter = 0;

      while (current !== null) {
        counter++;
        current = current.next;
      }

      return counter;
    }

    display() {
      let current = this.head;
      let elements = [];

      while (current !== null) {
        elements.push(current.data);
        current = current.next;
      }

      return elements.join(" ");
    }

    isEmpty() {
      return this.length() < 1;
    }

    traverse(fn) {
      if (!fn || typeof fn !== 'function') {
        console.log(`ERROR: 'TRAVERSE' function is undefined!`);
        return false;
      }

      let current = this.head;

      while (current !== null) {
        fn(current);
        current = current.next;
      }

      return true;
    }

    traverseReverse(fn) {
      if (!fn || typeof fn !== 'function') {
        console.log(`ERROR: 'TRAVERSE_REVERSE' function is undefined!`);
        return false;
      }

      let current = this.tail;

      while (current !== null) {
        fn(current);
        current = current.prev;
      }

      return true;
    }

    search(item) {
      let current = this.head;
      let counter = 0;

      while (current) {
        if (current.data == item) {
          return counter;
        }

        current = current.next;
        counter++;
      }

      return false;
    }

    getArray() {
      let current = this.head;
      let returnArr = [];

      while (current) {
        if (current.data) {
          returnArr.push(current.data);
        }

        current = current.next;
      }

      return returnArr;
    }

  }

  class Queue extends Array {
    constructor() {
      super();
    }

    enqueue(val) {
      this.push(val);
    }

    dequeue() {
      return this.shift();
    }

    peek() {
      return this[0];
    }

    isEmpty() {
      return this.length === 0;
    }

  }

  class ViewParser {
    static async parseHTML(responseText) {
      var data = await responseText.text();
      var parser = new DOMParser();
      return parser.parseFromString(data, "text/html");
    }

    static async parseJSON(responseText) {
      return responseText.json();
    }

  }

  class Sound {
    constructor(id, buffer, context) {
      this.id = id;
      this._autoStart = true;
      this._context = context;
      this._mainGain = context.createGain();
      this._masterGain = null;
      this.sourceNode = context.createBufferSource();
      this.sourceNode.buffer = buffer;
      this._isPlaying = false;
    }

    set autoStart(value) {
      this._autoStart = value;
    }

    set masterGain(value) {
      this._masterGain = value;
    }

    connectNodes(source) {
      source.connect(this._mainGain);

      if (this._masterGain) {
        this._mainGain.connect(this._masterGain);
      }

      this._masterGain.connect(this._context.destination);
    }

    play(offset = 0) {
      if (this._context && this._context.state === 'suspended') {
        this._context.resume();
      }

      if (this._context) {
        const newSource = this._context.createBufferSource();

        newSource.buffer = this.sourceNode.buffer;
        this.sourceNode = newSource;
        this.connectNodes(newSource);
        newSource.start();
      } else {
        this.sourceNode.play();
      }

      this._isPlaying = true;
      console.log(`[Sound] playing sound ${this.id}`);
    }

    stop() {
      this.sourceNode.stop();
      this._isPlaying = false;
      console.log(`[Sound] ${this.id} was stopped`);
    }

    setVolume(value) {
      this._mainGain.gain.setValueAtTime(value, 0);
    }

  }

  class AudioManager {
    constructor() {
      this.loader = new Backoff();
      this._context = null;
      this._sounds = {};
      this._masterGain = null;
    }

    get isWebAudioSupported() {
      if (!this._context) {
        try {
          window.AudioContext = window.AudioContext || window.webkitAudioContext;
          return new AudioContext();
        } catch (e) {
          console.warn("WebAudio is not supported");
          return null;
        }
      } else {
        return this._context;
      }
    }
    /**
     * Will start playing the sound requested by id.
     * If the sound was already loaded, we play it from cache if autoStart is true,
     * otherwise we will load the sound first and then play it if autoStart is true.
     *
     * @method playSound.
     * @param {string} id The id or url from where to load the sound.
     * @param {boolean} loop Whether to loop the playback. Default is false.
     * @param {number} volume The amount of damage we want to cause to ears. 0 for no sound, 1 for normal volume. Default is 1.
     * @param {boolean} autoStart Automatically starts playing when <code>true</code>. Default is true.
     */


    playSound(id, loop = false, volume = 1, autoStart = true) {
      if (!this._context) {
        this._context = this.isWebAudioSupported;
        this._masterGain = this._context.createGain();
      }

      if (this._sounds[id]) {
        this._sounds[id].loop = loop = this._sounds[id].sourceNode.loop = loop;

        this._sounds[id].setVolume(volume);

        this._sounds[id].autoStart = autoStart;
        this._sounds[id].masterGain = this._masterGain;

        if (autoStart) {
          this._sounds[id].play();
        }

        return;
      } else {
        this._loadSounds(id).then(result => {
          this.playSound(id, loop, volume, autoStart);
        });
      }
    }

    muteSounds() {
      this._masterGain.gain.setValueAtTime(0, 0);
    }

    unmuteSounds() {
      this._masterGain.gain.setValueAtTime(1, 0);
    }

    stopSound(id) {
      if (this._sounds[id]) {
        this._sounds[id].stop();
      }
    }

    getAllSounds() {
      return this._sounds;
    }

    setVolume(id, value) {
      if (this._sounds[id]) {
        this._sounds[id].setVolume(value);
      }
    }
    /**
     * Loads and decodes sounds from an array of URLs.
     * @param {Array} sounds. An array of urls to a soundfile.
     * @returns {Promise} A promise with all loaded objects of type Sound,
     *					  once resolved ALL sounds are loaded and decoded. .
     */


    _loadSounds(sound) {
      return new Promise((resolve, reject) => {
        this.loader.getURL(sound).then(response => response.arrayBuffer()).then(arrayBuffer => this._context.decodeAudioData(arrayBuffer)).then(audioBuffer => {
          var snd = new Sound(sound, audioBuffer, this._context);
          this._sounds[sound] = snd;
          resolve(this._sounds);
        });
      });
    }

  }
  /**
   * Very simple lightweight "MVCS" framework, including
   * an optional state machine and utils.
   */


  var fw$1 = {
    core: {
      createStateMachine: function (stateConfig) {
        new StateMachine().init(stateConfig);
      },
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
    },
    utils: {
      audioManager: new AudioManager()
    }
  };
  return fw$1;
}();
