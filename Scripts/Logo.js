﻿var stage;
var stjerneSheet = new Image();
stjerneSheet.src = "../../Content/sprites/stjerne.png";
var ciberLogo = new Image();
ciberLogo.src = "../../Content/sprites/ciber.png";
function init() {
    stage = new createjs.Stage("demoCanvas");

    var data = { images: [stjerneSheet], frames: { width: 16, height: 16 } };
    var spriteSheet = new createjs.SpriteSheet(data);
    var logo = new createjs.Bitmap(ciberLogo);
    var shadow = new createjs.Shadow("#000000", 2, 5, 1000);

    logo.scaleX = 1;
    logo.scaleY = 1;
    logo.shadow = shadow;

    // create a BitmapAnimation to display frames from the sprite sheet:
    var icon1 = new createjs.BitmapAnimation(spriteSheet);
    icon1.x = 9;
    icon1.y = 12;
    var icon2 = icon1.clone();
    icon2.x = 18;
    icon2.y = 30;
    var icon3 = icon1.clone();
    icon3.x = 36;
    icon3.y = 2;
    var icon4 = icon1.clone();
    icon4.x = 58;
    icon4.y = 3;
    var icon5 = icon1.clone();
    icon5.x = 72;
    icon5.y = 35;
    var icon6 = icon1.clone();
    icon6.x = 96;
    icon6.y = 13;
    var icon7 = icon1.clone();
    icon7.x = 106;
    icon7.y = 34;
    var icon8 = icon1.clone();
    icon8.x = 119;
    icon8.y = 13;
    var icon9 = icon1.clone();
    icon9.x = 132;
    icon9.y = 43;
    var icon10 = icon1.clone();
    icon10.x = 148;
    icon10.y = 13;

    icon10.gotoAndPlay(1);
    icon9.gotoAndPlay(2);
    icon8.gotoAndPlay(3);
    icon7.gotoAndPlay(4);
    icon6.gotoAndPlay(5);
    icon5.gotoAndPlay(6);
    icon4.gotoAndPlay(7);
    icon3.gotoAndPlay(8);
    icon2.gotoAndPlay(9);
    icon1.gotoAndPlay(10);

    stage.addChild(logo);
    stage.addChild(icon1);
    stage.addChild(icon2);
    stage.addChild(icon3);
    stage.addChild(icon4);
    stage.addChild(icon5);
    stage.addChild(icon6);
    stage.addChild(icon7);
    stage.addChild(icon8);
    stage.addChild(icon9);
    stage.addChild(icon10);

    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.setFPS(10);
}

function tick() {
    stage.update(); // important!!
}