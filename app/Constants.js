
export default {
	events: {
		SWITCH_STATE: "switchState",
		LOAD_VIEW: "LoadView",
		ASSETS_LOADED: "AssetsLoaded",
		PAUSE_SIMULATION: "PauseSimulation",
		RESUME_SIMULATION: "ResumeSimulation",
		SIMULATION_PAUSED: "SimulationPaused",
		SIMULATION_RESUMED: "SimulationResumed",
		VISIBILITY_HIDDEN: "VisibilityHidden",
		VISIBILITY_SHOWN: "VisibilityShown",
		PLAYER_DIED: "PlayerDied",
		PLAYER_RESPAWNED: "PlayerRespawned",
		PLAYER_MODEL_UPDATED: "PlayerModelUpdated",
		UPDATE_PLAYER_SCORE: "UpdatePlayerScore",
		REQUEST_LEVEL_DATA: "RequestLevelData",
		LEVEL_DATA_RECEIVED: "LevelDataReceived",
		TIMEBONUS_UPDATED: "TimeBonusUpdated",
		LEVEL_FINISHED: "LevelFinished",
		NEXT_LEVEL: "NextLevel",
		TIMER_STARTED: "TimerStarted",
		TIME_BONUS_COLLECTED: "TimeBonusCollected"
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
		GAME_SERVICE: "GameService",
		LOCAL_STORAGE_SERVICE: "LocalStorageService"
	},
	views: {
		LOADING_VIEW: "LoadingView",
		MAIN_VIEW: "MainView",
		MAIN_SCENE: "MainScene",
		LEVEL_PARSER: "LevelParser",
		UI_VIEW: "UIView",
		CHARACTER: "Character",
		BEAR: "Bear",
		BEES: "Bees",
		BEE: "Bee",
		CRUSHER: "Crusher",
		FALLING_ROCKS: "FallingRocks",
		ROCK: "Rock",
		PARROT: "Parrot",
		FISH: "Fish",
		ROTATING_PLATFORM: "RotatingPlatform",
		FLAMINGO: "Flamingo",
		STORK: "Stork",
		VENUS_FLY_TRAP: "VenusFlyTrap",
		LEVEL_FINISH: "LevelFinish",
		SNOW_MAN: "SnowMan",
		OBJECTS_PRELOADER: "ObjectsPreloader",
		POPUP_PAUSE: "PopupPause",
		POPUP_LEVEL_COMPLETE: "PopupLevelComplete",
		POPUP_GAME_COMPLETE: "PopupGameComplete",
		POPUP_GAME_OVER: "PopupGameOver"
	}
}