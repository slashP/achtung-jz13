(function () {
    "use strict";
    var express = require('express'),
        app = express(),
        server = require('http').Server(app),
        io = require('socket.io').listen(server),
        players = {},
        gameBoard;
    app.use(express.static(__dirname));
    app.get('/', function (req, res) {
        res.render('index.html');
    });
    server.listen(80);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        var emitToGameBoard = function (eventName, arg1, arg2, arg3) {
            if (gameBoard) {
                gameBoard.emit(eventName, arg1, arg2, arg3);
            }
        };
        players[socket.id] = socket;
        emitToGameBoard("connected", socket.id);
        socket.on("disconnect", function () {
            emitToGameBoard("disconnected", socket.id);
            delete players[socket.id];
        });
        socket.on("moveSnake", function (direction) {
            emitToGameBoard("moved", socket.id, direction);
        });
        socket.on("join", function (name, playerId) {
            emitToGameBoard("joined", socket.id, name, playerId);
        });
        socket.on("joinAsGameBoard", function () {
            gameBoard = socket;
        });
        socket.on("notifyplayer", function (id, color) {
            var socket = players[id];
            if (socket) {
                socket.emit("changeColor", color);
            }
        });
        socket.on("changeName", function (newName) {
            emitToGameBoard("changeName", socket.id, newName);
        });
    });
}());