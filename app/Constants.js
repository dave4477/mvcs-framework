
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
		UPDATE_PLAYER_SCORE: "UpdatePlayerScore",
		REQUEST_LEVEL_DATA: "RequestLevelData",
		LEVEL_DATA_RECEIVED: "LevelDataReceived"
	},
	models: {
		SIMULATION_MODEL: "SimulationModel",
		PLAYER_MODEL: "PlayerModel"
	},
	controllers: {
		INIT_APP_CONTROLLER: "InitAppController"
	},
	services: {
		VIEW_LOADER_SERVICE: "ViewLoaderService",
		GAME_SERVICE: "GameService"
	},
	views: {
		MAIN_VIEW: "MainView",
		MAIN_SCENE: "MainScene",
		LEVEL_PARSER: "LevelParser",
		UI_VIEW: "UIView",
		CHARACTER: "Character",
		BEAR: "Bear",
		CRUSHER: "Crusher",
		FALLING_ROCKS: "FallingRocks",
		ROCK: "Rock",
		SNOW_MAN: "SnowMan"
	}
}