# mvcs-framework

A simple MVCS framework written in Javascript.
This includes a stateConfig.json to include a finite statemachine, however this is optional.
There are some utilities included, like an audio manager.
For backwards compatibility I have used babel.

To see how to bootstrap, look in main.js in the app folder.
If you either import the release module or include the script tag, 
there is no need to import the core classes for the view, controller, model or service.

The basic principle is as follow:

Load framework. The framework can be accessed through fw.
Initialize your models, controllers and services, and optional views.

Models should extend <code>fw.core.ModelCore</code><br>
Controllers should extend <code>fw.core.ControllerCore</code><br>
Views should extend <code>fw.core.ViewCore</code><br>
Services should extend <code>fw.core.ServiceCore</code><br>

Creating a state configuration:<br>
<sub>example</sub>
<pre>
{
	"initialState": "init",
	"states": [
	{
		"stateName": "init",
		"preProcess":[
			"InitAppController:startApp" // will automatically trigger upon entering this state		
		],
		"postProcess":[ // will trigger when leaving this state
		],
		"outbound":["popup"], // states it can transition to
		"events":[ // allowed events for this state
			"UserModelUpdated",
			"UpdateUserModel",
			"LoadView"
		]
	}
}
</pre>



Then initialize it using:
<code>fw.setStateConfiguration(json);</code><br>

Everything that is dispatched to the context, is validated by the state machine. 
If the event is not found for the current state, the subscriber will not receive it.

Controllers can access models, services and views directly and invoke methods on them.
Models can dispatch to the context.
Views and controllers can listen to this context.
Views can dispatch to the context, and also dispatch to other views, which by-passes the state validation.
Services can dispatch to the context and access models directly. 
Services can get and post data using a build-in backoff strategy.


