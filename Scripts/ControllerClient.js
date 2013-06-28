$(function () {
    var socket = io.connect('/');
    function setupProportionalCanvas() {
        var $container = $("#container"), $canvas = $("#controllers"),
            h = window.innerHeight, w = window.innerWidth;

        $container.css('height', h * 2);
        window.scrollTo(0, 1);

        h = window.innerHeight + 2;
        $canvas.attr({ width: w, height: h });
        $container.css({ height: h, width: w, padding: 0, margin: 0 });
    }
    
    var getUserName = function () {
        return localStorage.getItem("playerName");
    };

    var getUserId = function () {
        return localStorage.getItem("playerId");
    };
    
    var updateUserName = function (name) {
        localStorage.setItem("playerName", name);
        socket.emit("changeName", name);
    };
    
    //Knappegreier:
   setupProportionalCanvas();
   function targetLocation(element, touch) {
       return (touch.pageX - $(element).position().left);
   }

  var $canvas = $("#controllers"), ctx = $canvas[0].getContext('2d'),
      keys = [ "<", ">"],
      keysOn = [ ],
      gutterWidth = 10,
      unitWidth = ($canvas.width()-gutterWidth) / keys.length,
      keyWidth = unitWidth-gutterWidth,
      canvasHeight = $canvas.height(),
      overlayHeight = $("#overlay").height();

    $canvas.on("touchstart touchend", function (e) {
    var elem = this;
    var evt = e.originalEvent;
      disableKeysOn();
      $.each(evt.targetTouches, function () {
          var loc = targetLocation(elem, this);
          setKeyOn(elem, loc);
      });
        updateKeys(keysOn);
        e.preventDefault();
    });
    
    if (!('ontouchstart' in document.documentElement)) {
        $canvas.on("mousedown", function (e) {
            var elem = this;
            disableKeysOn();
            var loc = targetLocation(elem, e);
            setKeyOn(elem, loc);
            updateKeys(keysOn);
            e.preventDefault();
        });
        $canvas.on("mouseup", function () {
            disableKeysOn();
            updateKeys(keysOn);
        });
    }
    function disableKeysOn() {
        $.each(keys, function (i) { keysOn[i] = false; });
    }

    function setKeyOn(element, x) {
        var key = Math.floor(x / $(element).width() * keys.length);
        keysOn[key] = true;
    }

  var tmp = 0;
  function updateKeys() {
      var t = false;
      $.each((keysOn), function(i) {
          if (keysOn[i] === true && tmp !== i) {
            switch (i) {
            case 0:
                socket.emit("moveSnake", "-1");
                break;
            case 1:
                socket.emit("moveSnake", "1");
                break;
            }
            tmp = i;
            t = true;
          }
      });
      if (!t) {
          tmp = -1;
          socket.emit("moveSnake", "0");
      }
  }

  function drawButton(idx) {
    var x = idx*unitWidth+gutterWidth,
        y = canvasHeight/2 - keyWidth/2 + overlayHeight;
    ctx.globalAlpha = keysOn[idx] ? 1.0 : 0.5;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x,y,keyWidth,keyWidth);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#000000";
    ctx.font = "bold " + (3*unitWidth/5) + "px arial";

    var txtSize = ctx.measureText(keys[idx]);

    ctx.fillText(keys[idx], 
                 x+keyWidth/2-txtSize.width/2, 
                 y+2*unitWidth/3);
  }

  function loop() {
    ctx.clearRect(0,0,$canvas.width(),$canvas.height());
    for (var i = 0, len = keys.length; i < len; i++) {
        if (keys[i]) { drawButton(i); }
    }

    window.requestAnimationFrame ?  window.requestAnimationFrame(loop) : setTimeout(loop,1000/60);
  }

  loop();

    socket.on("changeColor", function(color) {
        $("#controllers").css("background-color", color);
    });
    socket.on("status", function (status) {
        userViewModel.connectionStatus(status);
    });

    //Prøvar med tastatur også:
    var down = false;
    function handleKeyUp(event) {
        if (event.keyCode === 37 || event.keyCode === 39) {
            socket.emit("moveSnake", "0");
            down = false;
        }
    }
    function handleKeyDown(event) {
        // handle left key
        if (event.keyCode === 37 && !down) {
            socket.emit("moveSnake", "-1");
            down = true;
        }
        // handle right key
        if (event.keyCode === 39 && !down) {
            socket.emit("moveSnake", "1");
            down = true;
        }
    }

    $("#submitRegNameBtn").on('click', function () {
        var userId = getUserId();
        var player = { Name: $("#inputRegName").val(), Phone: $("#inputRegNumber").val(), Id: userId };
        $.ajax({
            type: "PUT",
            url: "http://achtung-node.apphb.com/api/Player/" + userId,
            data: player,
            success: function () {
                $('#regUserModal').modal('hide');
                updateUserName(player.Name);
            },
            error: function () {
                alert("Registration failed");
            }
        });
    });

    var userVm = function (name, phone) {
        var self = this;
        this.userName = ko.observable(name);
        this.phone = ko.observable(phone);
        this.score = ko.observable(0);
        this.connectionStatus = ko.observable("");
        this.isRegistered = ko.computed(function() {
            var length = self.phone() ? self.phone().length : 0;
            return length === 0 ? "btn btn-primary" : "btn btn-success";
        });
        this.isRegisteredText = ko.computed(function() {
            var length = self.phone() ? self.phone().length : 0;
            return length < 8 ? "Register to win!" : "Edit info";
        });
        this.leavePage = function() {
            window.location = "/";
        };
    };

    var userViewModel = new userVm(getUserName(), "");
    ko.applyBindings(userViewModel);
    var fetchUserInfo = function() {
        $.get("http://achtung-node.apphb.com/api/player/" + getUserId(), function (result) {
            userViewModel.userName(result.Name).phone(result.Phone);
        });
    };
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;

    setInterval(function() {
        getPersonalHighscore();
    }, 20000);

    var getPersonalHighscore = function() {
        $.get("http://achtung-node.apphb.com/api/highscore/" + getUserId(), function(result) {
            userViewModel.score(result.Score);
        });
    };
    getPersonalHighscore();
    
    if (getUserId() === null) { // First time user
        $.get('http://achtung-node.apphb.com/api/randomname', function (result) {
            $.post("http://achtung-node.apphb.com/api/player", { name: result }, function (player) {
                localStorage.setItem("playerId", player.Id);
                setUserAndJoin(player.Name);
            });
        });
    } else { // returning user
        setUserAndJoin(getUserName());
    }

    function setUserAndJoin(user) {
        updateUserName(user);
		var serverId = getUserId();
        socket.emit("join", getUserName(), serverId);
        fetchUserInfo();
    }
});