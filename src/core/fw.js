import Loader from './service/Loader.js';
import ControllerCore from './ControllerCore.js';
import ModelCore from './ModelCore.js';
import ServiceCore from './ServiceCore.js';
import ViewCore from './ViewCore.js';
import StateMachine from './StateMachine.js';
import BinaryTree from './data/binarytree/BinaryTree.js';
import LinkedList from './data/linkedlist/LinkedList.js';
import Queue from './data/queue/Queue.js';
import ViewParser from './parsers/ViewParser.js';
import Backoff from './Backoff.js';
import AudioManager from './utils/AudioManager.js';
/**
 * Very simple lightweight "MVCS" framework, including
 * an optional state machine and utils.
 */
export default {
	core: {
		createStateMachine: function(stateConfig) {
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
