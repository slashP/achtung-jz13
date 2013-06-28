$(function () {
    var socket = io.connect('/');
    socket.emit("joinAsGameBoard");
	$("#displayUrl").text(document.domain.toUpperCase());
    var w = $("#leftColumn").innerWidth(),
        h = $("#leftColumn").innerHeight(),
        countDownInterval,
        isInCountDownMode = false,
        game = new Game('gameCanvas', w, h, false),
        playerManager = game.playerManager,
        drawingContext = game.getDrawingContext(),
        numberOfDirectionProcessesPerSecond = 100,
        currentDirections = [],
        processCurrentDirections = function () {
            for (var i in currentDirections) {
                game.handleControl(i, currentDirections[i]);
            }
        },
        processCurrentDirectionsInterval,
        startCurrentDirectionsProcess = function() {
            clearInterval(processCurrentDirectionsInterval);
            processCurrentDirectionsInterval = setInterval(processCurrentDirections, 1000 / numberOfDirectionProcessesPerSecond);
        },
        handleCollision = function(playerId) {
            var player = playerManager.getPlayerByID(playerId);
            var position = playerManager.numberOfPlayersAlive() + 1;
            var numberOfPlayers = playerManager.numberOfPlayersPlaying();
            updateScore(player, position, numberOfPlayers);

            if (playerManager.numberOfPlayersAlive() < 2) {
                isInCountDownMode = true;
                var winner = playerManager.getWinner();
                updateScore(winner, 1, numberOfPlayers);
                skrivICanvas(winner.name + " won!");
                playerManager.resetScores();
                game.stop();
                removeInactivePlayers();
                setTimeout(function () {
                    updateHighscores();
                }, 500);
                setTimeout(function () {
                    countDown();
                }, 2000);
            }
        },
        updateScore = function(player, position, numberOfPlayers) {
            $.post("http://achtung-node.apphb.com/api/score", { Position: position, PlayerId: player.serverId, SnakeLength: player.distance, NumberOfPlayers: numberOfPlayers }, function() {

            });
            updatePlayerLastRound(player, position, numberOfPlayers);
        },
        skrivICanvas = function(text) {
            drawingContext.font = "bold 50pt Calibri";
            drawingContext.textAlign = 'center';
            drawingContext.fillStyle = "rgb(255, 246, 36)";
            drawingContext.fillText(text, w / 2, h / 2);
        },
        clearCanvasText = function() {
            var canvas = document.getElementById("gameCanvas");
            var cy = canvas.height / 2;
            drawingContext.clearRect(10, cy - 70, canvas.width-20, 85);
        },
        countDown = function() {
            var time = Config.waitBetweenGames + 1;
            countDownInterval = setInterval(function () {
                clearCanvasText();
                skrivICanvas("New game starts in " + --time + " second" + (time !== 1 ? "s" : ""));
                if (time === 0) {
                    clearInterval(countDownInterval);
                    isInCountDownMode = false;
                    game.restart();
                    clearLastRound();
                }
            }, 1000);
        },
        removeInactivePlayers = function() {
            var connectionIds = game.removeInactivePlayersAndGetConnectionIds();
            for (var i = 0; i < connectionIds.length; i++) {
                socket.emit("notifyplayer", connectionIds[i], "white");
            }
        };

    game.setCollisionCallback(handleCollision);

    socket.on("moved", function(cid, direction) {
        var player = playerManager.getPlayerByCid(cid);
        currentDirections[player.ID] = direction;
        player.timeLastMove = new Date().getTime();
    });
    socket.on("joined", function(cid, name, serverId) {
        game.addPlayer(name, serverId, cid);
        socket.emit("notifyplayer", cid, playerManager.getPlayerByCid(cid).color);
        // start game when the first client connected
        if (playerManager.numberOfPlayers() === 2 && !isInCountDownMode) {
            // start the game
            game.restart();
            playerManager.resetTimeLastMove();
            //resetter score og shit
            game.startSession();
            //Denne er smart:
            startCurrentDirectionsProcess();
        }
    });
    socket.on("disconnected", function (data) {
        var playerByCid = playerManager.getPlayerByCid(data);
        if (!playerByCid)
            return;
        var id = playerByCid.ID;
        if (id !== undefined) {
            game.removePlayer(id);
        }
    });
    socket.on("changeName", function(cid, newName) {
        var playerByCid = playerManager.getPlayerByCid(cid);
        if (!playerByCid)
            return;
        game.changeName(playerByCid.ID, newName);
    });

    // Higscore
    var viewModel = ko.mapping.fromJS({ highscoresToday: [], highscoresTotal: [],  lastRoundScores: [] });
    ko.applyBindings(viewModel);
    
    var updateHighscores = function () {
        $.get('http://achtung-node.apphb.com/api/highscoretotal', function (result) {
            viewModel.highscoresTotal(result);
        });
        $.get('http://achtung-node.apphb.com/api/highscore', function (result) {
            viewModel.highscoresToday(result);
        });
    };

    var updatePlayerLastRound = function (player, position, numberOfPlayers) {
        var playerScore = Math.floor(player.distance * ((numberOfPlayers - position) * 0.2 + 1 * Math.min((numberOfPlayers - position), 1))); // Must be same as in HighscoreController!
        viewModel.lastRoundScores.unshift({ score: playerScore, name: player.name, playerColor: player.color });
    };

    var clearLastRound = function() {
        viewModel.lastRoundScores([]);
    };
    
    updateHighscores();

    setInterval(function() {
        var numberOfPlayers = playerManager.numberOfPlayers();
        if (numberOfPlayers < 2 && !isInCountDownMode) {
            clearCanvasText();
            var remainginPlayerCount = 2 - numberOfPlayers;
            skrivICanvas("Waiting for " + remainginPlayerCount + " player" + (remainginPlayerCount !== 1 ? "s" : ""));
        }
    }, 1500);
});