var Game = function(canvasId, canvasWidth, canvasHeight /*, useFullscreen */) {
    if (arguments[3]) {
        this.useFullscreen = arguments[3];
    }

    Config.canvasWidth = canvasWidth;
    Config.canvasHeight = canvasHeight;

    this.canvasElement = document.getElementById(canvasId);

    if (this.useFullscreen) {
        Config.canvasWidth = window.innerWidth;
        Config.canvasHeight = window.innerHeight;
    }

    this.canvasElement.width = Config.canvasWidth;
    this.canvasElement.height = Config.canvasHeight;
    
    if (this.canvasElement.getContext) {
        this.drawingContext = this.canvasElement.getContext('2d');
    } else {
        throw 'No canvas support';
    }
	
    this.playerManager = new PlayerManager();
    this.engine = new Engine(this.drawingContext, this.playerManager.players);
	this.engineOnHalt = false;
};

Game.prototype.getPlayerName = function(id)
{
	return this.playerManager.getPlayerName(id);
};

Game.prototype.getPlayerColor = function(id) {
    return this.playerManager.getPlayerColor(id);
};

Game.prototype.getDrawingContext = function() {
    return this.drawingContext;  
};

Game.prototype.start = function() {
	
	if (this.playerManager.numberOfPlayers() < 2) {
		this.engineOnHalt = true;
		this.drawFrame();
		return;
	}
	
	this.drawFrame();
	this.playerManager.initializePlayers();
	this.engine.start();
	this.engineOnHalt = false;
};

Game.prototype.restart = function() {
	this.engine.stop();
	this.drawingContext.clearRect(0, 0, Config.canvasWidth, Config.canvasHeight);
	this.start();
};

Game.prototype.stop = function() {
	this.engine.stop();
};

Game.prototype.addPlayer = function(name, achtungServerId, cid) {
    var playerId = this.playerManager.addPlayer(name, achtungServerId, cid);
	
	if (this.engineOnHalt) {
		this.start();
	}
	
	return playerId;
};

Game.prototype.removePlayer = function (playerId) {
	this.playerManager.removePlayer(playerId);
	
	if (this.playerManager.numberOfPlayersAlive() < 2) {
		this.stop();

        if (this.engine.onRoundOver) {
            this.engine.onRoundOver();
        }
	}
};

Game.prototype.handleControl = function(playerId, direction) {
    this.playerManager.navigatePlayer(playerId, direction);  
};

Game.prototype.setCollisionCallback = function(callback) {
	this.engine.setCollisionCallback(callback);
};

Game.prototype.setRoundCallback = function(callback) {
	var that = this;
	
	this.engine.setRoundCallback(function() {
		that.engine.playerRank.unshift(that.playerManager.getAlivePlayers()[0]);

	    var stats = {
	        winnerID: that.playerManager.getAlivePlayers()[0],
	        rank: that.engine.playerRank
	    };
		
		callback(stats);
	});
};

Game.prototype.startSession = function() {
	this.playerManager.resetScores();
	this.engine.countWins = true;
};

Game.prototype.stopSession = function() {
	this.engine.countWins = false;
};

Game.prototype.drawFrame = function () {
	this.drawingContext.lineWidth = 10;
	this.drawingContext.strokeStyle = "#E3D42E";
	this.drawingContext.strokeRect(0, 0, Config.canvasWidth - 0, Config.canvasHeight - 0);
};

Game.prototype.changeName = function(playerId, newName) {
    this.playerManager.changeName(playerId, newName);
};

Game.prototype.removeInactivePlayersAndGetConnectionIds = function () {
    var connectionIds = [];
    var playersToRemove = this.playerManager.getInactivePlayers();
    for (var i = 0; i < playersToRemove.length; i++) {
        var player = playersToRemove[i];
        this.removePlayer(player.ID);
        connectionIds.push(player.cid);
    }
    return connectionIds;
}