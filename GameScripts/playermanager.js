var PlayerManager = function() {
    this.players = [];
    this.colorManager = new ColorManager(Config.colorSaturation, Config.colorValue, Config.colors);
};

PlayerManager.prototype.addPlayer = function(name, achtungServerId, cid) {
    var newPlayer = new Player();
    newPlayer.color = this.getColor();
    newPlayer.serverId = achtungServerId;
    newPlayer.cid = cid;
    newPlayer.name = name;
	
    var index = this.playerPush(newPlayer);
    newPlayer.ID = index;
    return index;
};

PlayerManager.prototype.playerPush = function (newPlayer) {
	for (var i=0; i < this.players.length; i++) {
		var player = this.players[i];
		
		if (player.canceled) {
			this.players[i] = newPlayer;
			return i;
		}
	}
	
	this.players.push(newPlayer);
	
	return this.players.length - 1;
};

PlayerManager.prototype.removePlayer = function(playerID) {
    var player = this.getPlayerByID(playerID);
    player.canceled = true;
    //Legger fargen tilbake i fargestacken - P-K: Det funket ikke 
    //this.colorManager.colors.push(player.color);
};

PlayerManager.prototype.initializePlayers = function() {
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];

        player.x = Utilities.random(Config.canvasWidth / 4, 3 * Config.canvasWidth / 4);
        player.y = Utilities.random(Config.canvasHeight / 4, 3 * Config.canvasHeight / 4);
        player.angle = Math.random() * 360;	
        player.isPlaying = true;
        player.isAlive = true;
		player.resetTimeout();
    }
};

PlayerManager.prototype.getColor = function() {
    return this.colorManager.convertRGBToHex(this.colorManager.getColor());
};

PlayerManager.prototype.navigatePlayer = function(playerID, direction) {
    var player = this.getPlayerByID(playerID);
    player.navigate(direction);
};

PlayerManager.prototype.numberOfPlayersAlive = function() {
    var count = 0;

    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].isAlive && !this.players[i].canceled) {
            count++;
        }
    }

    return count;
};

PlayerManager.prototype.numberOfPlayersPlaying = function () {
    var count = 0;
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (!player.canceled && player.distance !== -1) {
            count++;
        }
    }
    return count;
};

PlayerManager.prototype.numberOfPlayers = function() {
    var count = 0;

    for (var i = 0; i < this.players.length; i++) {
        if (!this.players[i].canceled) {
            count++;
        }
    }

    return count;
};

PlayerManager.prototype.resetScores = function() {
	for (var i = 0; i < this.players.length; i++) {
		this.players[i].wins = 0;
		this.players[i].distance = 0;
	}
};

/* ---- GETTER & SETTER ---- */
PlayerManager.prototype.getPlayerByID = function(playerID) {
    return this.players[playerID]; 
};

PlayerManager.prototype.getPlayerName = function(playerID) {
    var player = this.players[playerID];
    return player ? player.name : "";
};

PlayerManager.prototype.getPlayerDistance = function(playerID) {
    return this.players[playerID].distance;
};

PlayerManager.prototype.getPlayerColor = function(playerID) {
    return this.players[playerID].color;
};

PlayerManager.prototype.getPlayerWins = function(playerID) {
    return this.players[playerID].wins;
};

PlayerManager.prototype.getAlivePlayers = function() {
	var alivePlayers = [];
	
	for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].isAlive && !this.players[i].canceled) {
            alivePlayers.push(this.players[i].ID);
        }
    }
	
	return alivePlayers;
};

PlayerManager.prototype.getWinner = function () {
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (player.isAlive && !player.canceled) {
            return player;
        }
    }
    return undefined;
};

PlayerManager.prototype.getPlayerByCid = function (cid) {
    for (var i = 0; i < this.players.length; i++)
        if (this.players[i].cid === cid)
            return this.players[i];
    return undefined;
};

PlayerManager.prototype.changeName = function(playerID, newName) {
    this.players[playerID].name = newName;
};

PlayerManager.prototype.getInactivePlayers = function() {
    var inactivePlayers = [];
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (!player.canceled) {
            var timeSinceLastMove = (new Date().getTime() - player.timeLastMove);
            if (timeSinceLastMove > Config.timeoutInactivePlayers) {
                inactivePlayers.push(player);
            }
        }
    }
    return inactivePlayers;
};

PlayerManager.prototype.resetTimeLastMove = function () {
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (!player.canceled) {
            player.timeLastMove = new Date().getTime();
        }
    }
};