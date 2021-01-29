

export default {
	modelMap: {},
	controllerMap: {},
	viewMap: {},
	serviceMap: {},
	eventMap: {},
	addModel: function(name, model) {
		this.modelMap[name] = model;
	},
	
	addView: function(name, view) {
		this.viewMap[name] = view;
	},
		
	addController: function(name, controller) {
		this.controllerMap[name] = controller;
	},
	
	addService: function(name, service) {
		this.serviceMap[name] = service;
	}
};