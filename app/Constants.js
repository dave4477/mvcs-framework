
export default {
	events: {
		SWITCH_STATE: "switchState",
		LOAD_VIEW: "LoadView",
		PAUSE_SIMULATION: "PauseSimulation",
		RESUME_SIMULATION: "ResumeSimulation",
		SIMULATION_PAUSED: "SimulationPaused",
		SIMULATION_RESUMED: "SimulationResumed",
		PLAYER_DIED: "PlayerDied",
		PLAYER_RESPAWNED: "PlayerRespawned",
		PLAYER_MODEL_UPDATED: "PlayerModelUpdated",
		UPDATE_PLAYER_SCORE: "UpdatePlayerScore"
	},
	models: {
		SIMULATION_MODEL: "SimulationModel",
		PLAYER_MODEL: "PlayerModel"
	},
	controllers: {
		INIT_APP_CONTROLLER: "InitAppController"
	},
	servives: {
		VIEW_LOADER_SERVICE: "ViewLoaderService"
	},
	views: {
		MAIN_VIEW: "MainView",
		MAIN_SCENE: "MainScene",
		UI_VIEW: "UIView",
		CHARACTER: "Character",
		BEAR: "Bear",
		CRUSHER: "Crusher",
		ROCK: "Rock",
		SNOW_MAN: "SnowMan"
	}
}