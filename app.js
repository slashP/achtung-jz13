(function () {
    "use strict";
    var express = require('express'),
        app = express(),
        server = require('http').Server(app),
        io = require('socket.io').listen(server),
        players = {},
        gameBoard;
    app.use(express.static(__dirname));
    server.listen(80);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        var emitToGameBoard = function (eventName, arg1, arg2, arg3) {
            if (gameBoard) {
                gameBoard.emit(eventName, arg1, arg2, arg3);
                return true;
            }
            return false;
        };
        players[socket.id] = socket;
        emitToGameBoard("connected", socket.id);
        socket.on("disconnect", function () {
            emitToGameBoard("disconnected", socket.id);
            delete players[socket.id];
            if (gameBoard && gameBoard.id === socket.id) {
                gameBoard = undefined;
            }
        });
        socket.on("moveSnake", function (direction) {
            emitToGameBoard("moved", socket.id, direction);
        });
        socket.on("join", function (name, playerId) {
            var success = emitToGameBoard("joined", socket.id, name, playerId);
            if (!success) {
                socket.emit("status", "Connection failed. No board available");
            }
        });
        socket.on("joinAsGameBoard", function () {
            if (gameBoard !== undefined) {
                socket.broadcast.emit("status", "Board changed - you must refresh to rejoin");
                socket.broadcast.emit("changeColor", "white");
            }
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