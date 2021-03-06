/**
 * potion - v0.1.4
 * Copyright (c) 2014, Jan Sedivy
 *
 * Compiled: 2014-02-24
 *
 * potion is licensed under the MIT License.
 */
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.Potion=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Engine = _dereq_('./src/engine');

module.exports = {
  init: function(canvas, methods) {
    var engine = new Engine(canvas, methods);
    return engine.game;
  }
};

},{"./src/engine":4}],2:[function(_dereq_,module,exports){
/**
 * Animation class for rendering sprites in grid
 * @constructor
 * @param {object} sprite - sprite object
 * @param {number} width - width of individual images in animation
 * @param {number} height - height of individual images in animation
 * @param {number} [columns=null] - optional number of columns in animation
 */
var Animation = function(sprite, width, height, columns) {
  /**
   * @type object
   */
  this.sprite = sprite;

  /**
   * width of individual images in animation
   * @type {number}
   */
  this.width = width;

  /**
   * height of individual images in animation
   * @type {number}
   */
  this.height = height;

  /**
   * number of columns in animation
   * @type {number}
   */
  this.columns = columns;

  /**
   * Current index of image
   * @type {number}
   */
  this.state = 0;

  /**
   * Current X index
   * @type {number}
   */
  this.indexX = 0;

  /**
   * Current Y index
   * @type {number}
   */
  this.indexY = 0;

  /**
   * Image offset X
   * @type {number}
   */
  this.offsetX = 0;

  /**
   * Image offset Y
   * @type {number}
   */
  this.offsetY = 0;
};

/**
 * Set x and y index
 * @param {number} x - x index
 * @param {number} y - y index
 */
Animation.prototype.setIndexes = function(x, y) {
  this.setIndexX(x);
  this.setIndexY(y);
};

/**
 * Set x index
 * @param {number} x - x index
 */
Animation.prototype.setIndexX = function(x) {
  this.indexX = x;
  this.offsetX = this.width * this.indexX;
};

/**
 * Set y index
 * @param {number} y - y index
 */
Animation.prototype.setIndexY = function(y) {
  this.indexY = y;
  this.offsetY = this.height * this.indexY;
};

/**
 * Set image index
 * @param {number} state - image index
 */
Animation.prototype.setState = function(state) {
  this.state = state;

  var x = this.state;
  var y = 0;

  if (this.columns) {
    x = this.state % this.columns;
    y = Math.floor(this.state/this.columns);
  }

  this.setIndexX(x);
  this.setIndexY(y);
};

module.exports = Animation;

},{}],3:[function(_dereq_,module,exports){
/* global soundManager */

_dereq_('./lib/soundmanager2');

/**
 * Class for loading music
 * @constructor
 */
var Assets = function() {
  /**
   * Loaded sounds
   * @type {object}
   */
  this.sounds = {};

  /**
   * default path for assets
   * @type {string}
   */
  this.basePath = 'assets/';

  /**
   * Default path for sound
   * @type {string}
   */
  this.soundsPath = 'sounds/';
};

/**
 * Method that creates sound object
 * @param {string} path - sound path (without base path)
 * @param {function} callback - callback function that is called when sound is loaded
 */
Assets.prototype.createSound = function(path, callback) {
  var sound = soundManager.createSound({
    autoLoad: true,
    autoPlay: false,
    url: this.basePath + this.soundsPath + path
  }).load({ onload: callback });

  this.sounds[path] = sound;
};

/**
 * Load specified data
 * @param {object} data - data to load
 * @param {function} callback - function that is called when everything is loaded
 */
Assets.prototype.load = function(data, callback) {
  this.assetsPath = data.assetsPath || this.assetsPath;

  if (!data.sounds) {
    callback();
  } else {
    this.soundsPath = data.soundsPath || this.soundsPath;

    var soundsToLoad = data.sounds.length;

    var soundLoaded = function() {
      soundsToLoad -= 1;
      if (soundsToLoad <= 0) {
        callback();
      }
    };

    var self = this;
    soundManager.onload = function() {
      for (var i=0, len=data.sounds.length; i<len; i++) {
        var path = data.sounds[i];
        self.createSound(path, soundLoaded);
      }
    };
  }
};

/**
 * Get sound with specified name
 * @param {string} name - sound name
 * @return {object} sound object
 */
Assets.prototype.getSound = function(name) {
  return this.sounds[name];
};

module.exports = Assets;

},{"./lib/soundmanager2":8}],4:[function(_dereq_,module,exports){
var Game = _dereq_('./game');

var raf = _dereq_('./raf');

/**
 * Main Engine class which calls the game methods
 * @constructor
 */
var Engine = function(canvas, methods) {
  var GameClass = function(canvas) { Game.call(this, canvas); };
  GameClass.prototype = Object.create(Game.prototype);
  for (var method in methods) {
    GameClass.prototype[method] = methods[method];
  }

  /**
   * Game code instance
   * @type {Game}
   */
  this.game = new GameClass(canvas);

  this.setupCanvasSize();

  var start = false;
  var self = this;
  this.game.assets.load(this.game.load, function() {
    if (start) { self.start(); }
    start = true;
  });

  this.game.sprite.load(this.game.load.sprite, this.game.load.spriteImage, function() {
    if (start) { self.start(); }
    start = true;
  });
};

/**
 * Add event listener for window events
 * @private
 */
Engine.prototype.addEvents = function() {
  var self = this;

  window.addEventListener('resize', function() {
    self.setupCanvasSize();
  });

  window.addEventListener('blur', function() {
    self.game.input.resetKeys();
    self.game.blur();
  });

  window.addEventListener('focus', function() {
    self.game.input.resetKeys();
    self.game.focus();
  });
};

/**
 * Runs every time on resize event
 * @private
 */
Engine.prototype.setupCanvasSize = function() {
  this.game.resize();
  this.game.video.width = this.game.canvas.width = this.game.width;
  this.game.video.height = this.game.canvas.height = this.game.height;

  if (this.game.isRetina) {
    this.game.video.scaleCanvas(2);
  }
};

/**
 * Starts the game, adds events and run first frame
 * @private
 */
Engine.prototype.start = function() {
  this.game.init();
  this.addEvents();
  this.startFrame();
};

/**
 * Starts next frame in game loop
 * @private
 */
Engine.prototype.startFrame = function() {
  this._time = Date.now();
  var self = this;
  raf(function() { self.tick(); });
};

/**
 * Main tick function in game loop
 * @private
 */
Engine.prototype.tick = function() {
  var time = (Date.now() - this._time) / 1000;
  if (time > 0.016) { time = 0.016; }

  this.update(time);
  this.render();

  this.startFrame();
};

/**
 * Updates the game
 * @param {number} time - time in seconds since last frame
 * @private
 */
Engine.prototype.update = function(time) {
  this.game.update(time);
};

/**
 * Renders the game
 * @private
 */
Engine.prototype.render = function() {
  this.game.video.beginFrame();
  this.game.render();
  this.game.video.endFrame();
};

module.exports = Engine;

},{"./game":5,"./raf":9}],5:[function(_dereq_,module,exports){
var Video = _dereq_('./video');
var Input = _dereq_('./input');
var SpriteSheetManager = _dereq_('./spriteSheetManager');
var Assets = _dereq_('./assets');
var isRetina = _dereq_('./retina');

/**
 * Game class that is subclassed by actual game code
 * @constructor
 * @param {HTMLCanvasElement} canvas - canvas DOM element
 */
var Game = function(canvas) {
  /**
   * Canvas DOM element
   * @type {HTMLCanvasElement}
   */
  this.canvas = canvas;

  /**
   * Video instance for rendering into canvas
   * @type {Video}
   */
  this.video = new Video(canvas);

  /**
   * Game width in pixels
   * @type {number}
   */
  this.width = 300;

  /**
   * Game highs in pixels
   * @type {number}
   */
  this.height = 300;

  /**
   * Sprites to load
   * @type {object}
   */
  this.load = {};

  /**
   * Instance of SpriteSheetManager for managing sprites and images
   * @type {SpriteSheetManager}
   */
  this.sprite = new SpriteSheetManager();

  /**
   * Instance of Assets for loading assets for the game
   * @type {Assets}
   */
  this.assets = new Assets();

  /**
   * True if you are using retina screen
   * @type {boolean}
   */
  this.isRetina = isRetina();

  /**
   * Input instance for mouse and keyboard events
   * @type {Input}
   */
  this.input = new Input(this);

  this.config();
};

/**
 * Is called when all assets are loaded
 * @abstract
 */
Game.prototype.init = function() {};

/**
 * Configure the game
 * @abstract
 */
Game.prototype.config = function() {};

/**
 * Window resize event
 * @abstract
 */
Game.prototype.resize = function() {};

/**
 * Renders the game
 * @abstract
 */
Game.prototype.render = function() {};

/**
 * Updates the game
 * @param {number} time - time in seconds since last frame
 * @abstract
 */
Game.prototype.update = function(time) {};

/**
 * Keypress event
 * @param {number} keycode - char code of the pressed key
 * @abstract
 */
Game.prototype.keypress = function(keycode) {};

/**
 * Click event
 * @param {number} x - x position
 * @param {number} y - y position
 * @abstract
 */
Game.prototype.click = function(x, y) {};

/**
 * Mousemove event
 * @param {number} x - x position
 * @param {number} y - y position
 * @abstract
 */
Game.prototype.mousemove = function(x, y) {};

/**
 * Window Focus event
 * @abstract
 */
Game.prototype.focus = function() {};

/**
 * Window Blur event
 * @abstract
 */
Game.prototype.blur = function() {};

module.exports = Game;

},{"./assets":3,"./input":6,"./retina":10,"./spriteSheetManager":11,"./video":13}],6:[function(_dereq_,module,exports){
var keys = _dereq_('./keys');

/**
 * Input wrapper
 * @constructor
 * @param {Game} game - Game object
 */
var Input = function(game) {
  /**
   * Pressed keys object
   * @type {object}
   */
  this.keys = {};

  /**
   * Controls if you can press keys
   * @type {boolean}
   */
  this.canControlKeys = true;

  /**
   * Mouse object with positions and if is mouse button pressed
   * @type {object}
   */
  this.mouse = {
    isDown: false,
    position: { x: null, y: null }
  };

  this._addEvents(game);
};

/**
 * Clears the pressed keys object
 */
Input.prototype.resetKeys = function() {
  this.keys = {};
};

/**
 * Return true or false if key is pressed
 * @param {string} key
 * @return {boolean}
 */
Input.prototype.isKeyDown = function(key) {
  if (this.canControlKeys) {
    return this.keys[keys[key.toUpperCase()]];
  }
};

/**
 * Add canvas event listener
 * @private
 */
Input.prototype._addEvents = function(game) {
  var self = this;
  var canvas = game.canvas;

  canvas.addEventListener('mousemove', function(e) {
    game.mousemove(e.offsetX, e.offsetY);
    self.mouse.position.x = e.offsetX;
    self.mouse.position.y = e.offsetY;
  });

  canvas.addEventListener('mouseup', function() {
    self.mouse.isDown = false;
  });

  canvas.addEventListener('mousedown', function(e) {
    self.mouse.position.x = e.offsetX;
    self.mouse.position.y = e.offsetY;
    self.mouse.isDown = true;
  });

  canvas.addEventListener('click', function(e) {
    game.click(e.offsetX, e.offsetY);
  });

  document.addEventListener('keypress', function(e) {
    game.keypress(e.keyCode);
  });

  document.addEventListener('keydown', function(e) {
    game.input.keys[e.keyCode] = true;
  });

  document.addEventListener('keyup', function(e) {
    game.input.keys[e.keyCode] = false;
  });
};

module.exports = Input;

},{"./keys":7}],7:[function(_dereq_,module,exports){
module.exports = {
  'MOUSE1':-1,
  'MOUSE2':-3,
  'MWHEEL_UP':-4,
  'MWHEEL_DOWN':-5,
  'BACKSPACE':8,
  'TAB':9,
  'ENTER':13,
  'PAUSE':19,
  'CAPS':20,
  'ESC':27,
  'SPACE':32,
  'PAGE_UP':33,
  'PAGE_DOWN':34,
  'END':35,
  'HOME':36,
  'LEFT':37,
  'UP':38,
  'RIGHT':39,
  'DOWN':40,
  'INSERT':45,
  'DELETE':46,
  '_0':48,
  '_1':49,
  '_2':50,
  '_3':51,
  '_4':52,
  '_5':53,
  '_6':54,
  '_7':55,
  '_8':56,
  '_9':57,
  'A':65,
  'B':66,
  'C':67,
  'D':68,
  'E':69,
  'F':70,
  'G':71,
  'H':72,
  'I':73,
  'J':74,
  'K':75,
  'L':76,
  'M':77,
  'N':78,
  'O':79,
  'P':80,
  'Q':81,
  'R':82,
  'S':83,
  'T':84,
  'U':85,
  'V':86,
  'W':87,
  'X':88,
  'Y':89,
  'Z':90,
  'NUMPAD_0':96,
  'NUMPAD_1':97,
  'NUMPAD_2':98,
  'NUMPAD_3':99,
  'NUMPAD_4':100,
  'NUMPAD_5':101,
  'NUMPAD_6':102,
  'NUMPAD_7':103,
  'NUMPAD_8':104,
  'NUMPAD_9':105,
  'MULTIPLY':106,
  'ADD':107,
  'SUBSTRACT':109,
  'DECIMAL':110,
  'DIVIDE':111,
  'F1':112,
  'F2':113,
  'F3':114,
  'F4':115,
  'F5':116,
  'F6':117,
  'F7':118,
  'F8':119,
  'F9':120,
  'F10':121,
  'F11':122,
  'F12':123,
  'SHIFT':16,
  'CTRL':17,
  'ALT':18,
  'PLUS':187,
  'COMMA':188,
  'MINUS':189,
  'PERIOD':190
};

},{}],8:[function(_dereq_,module,exports){
/** @license
 *
 * SoundManager 2: JavaScript Sound for the Web
 * ----------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License:
 * http://schillmania.com/projects/soundmanager2/license.txt
 *
 * V2.97a.20131201
 */
(function(g,k){function U(U,ka){function V(b){return c.preferFlash&&v&&!c.ignoreFlash&&c.flash[b]!==k&&c.flash[b]}function q(b){return function(c){var d=this._s;return!d||!d._a?null:b.call(this,c)}}this.setupOptions={url:U||null,flashVersion:8,debugMode:!0,debugFlash:!1,useConsole:!0,consoleOnly:!0,waitForWindowLoad:!1,bgColor:"#ffffff",useHighPerformance:!1,flashPollingInterval:null,html5PollingInterval:null,flashLoadTimeout:1E3,wmode:null,allowScriptAccess:"always",useFlashBlock:!1,useHTML5Audio:!0,
html5Test:/^(probably|maybe)$/i,preferFlash:!1,noSWFCache:!1,idPrefix:"sound"};this.defaultOptions={autoLoad:!1,autoPlay:!1,from:null,loops:1,onid3:null,onload:null,whileloading:null,onplay:null,onpause:null,onresume:null,whileplaying:null,onposition:null,onstop:null,onfailure:null,onfinish:null,multiShot:!0,multiShotEvents:!1,position:null,pan:0,stream:!0,to:null,type:null,usePolicyFile:!1,volume:100};this.flash9Options={isMovieStar:null,usePeakData:!1,useWaveformData:!1,useEQData:!1,onbufferchange:null,
ondataerror:null};this.movieStarOptions={bufferTime:3,serverURL:null,onconnect:null,duration:null};this.audioFormats={mp3:{type:['audio/mpeg; codecs\x3d"mp3"',"audio/mpeg","audio/mp3","audio/MPA","audio/mpa-robust"],required:!0},mp4:{related:["aac","m4a","m4b"],type:['audio/mp4; codecs\x3d"mp4a.40.2"',"audio/aac","audio/x-m4a","audio/MP4A-LATM","audio/mpeg4-generic"],required:!1},ogg:{type:["audio/ogg; codecs\x3dvorbis"],required:!1},opus:{type:["audio/ogg; codecs\x3dopus","audio/opus"],required:!1},
wav:{type:['audio/wav; codecs\x3d"1"',"audio/wav","audio/wave","audio/x-wav"],required:!1}};this.movieID="sm2-container";this.id=ka||"sm2movie";this.debugID="soundmanager-debug";this.debugURLParam=/([#?&])debug=1/i;this.versionNumber="V2.97a.20131201";this.altURL=this.movieURL=this.version=null;this.enabled=this.swfLoaded=!1;this.oMC=null;this.sounds={};this.soundIDs=[];this.didFlashBlock=this.muted=!1;this.filePattern=null;this.filePatterns={flash8:/\.mp3(\?.*)?$/i,flash9:/\.mp3(\?.*)?$/i};this.features=
{buffering:!1,peakData:!1,waveformData:!1,eqData:!1,movieStar:!1};this.sandbox={};this.html5={usingFlash:null};this.flash={};this.ignoreFlash=this.html5Only=!1;var Ja,c=this,Ka=null,l=null,W,s=navigator.userAgent,La=g.location.href.toString(),n=document,la,Ma,ma,m,x=[],K=!1,L=!1,p=!1,y=!1,na=!1,M,w,oa,X,pa,D,E,F,Na,qa,ra,Y,sa,Z,ta,G,ua,N,va,$,H,Oa,wa,Pa,xa,Qa,O=null,ya=null,P,za,I,aa,ba,r,Q=!1,Aa=!1,Ra,Sa,Ta,ca=0,R=null,da,Ua=[],S,u=null,Va,ea,T,z,fa,Ba,Wa,t,fb=Array.prototype.slice,A=!1,Ca,v,Da,
Xa,B,ga,Ya=0,ha=s.match(/(ipad|iphone|ipod)/i),Za=s.match(/android/i),C=s.match(/msie/i),gb=s.match(/webkit/i),ia=s.match(/safari/i)&&!s.match(/chrome/i),Ea=s.match(/opera/i),Fa=s.match(/(mobile|pre\/|xoom)/i)||ha||Za,$a=!La.match(/usehtml5audio/i)&&!La.match(/sm2\-ignorebadua/i)&&ia&&!s.match(/silk/i)&&s.match(/OS X 10_6_([3-7])/i),Ga=n.hasFocus!==k?n.hasFocus():null,ja=ia&&(n.hasFocus===k||!n.hasFocus()),ab=!ja,bb=/(mp3|mp4|mpa|m4a|m4b)/i,Ha=n.location?n.location.protocol.match(/http/i):null,cb=
!Ha?"http://":"",db=/^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,eb="mpeg4 aac flv mov mp4 m4v f4v m4a m4b mp4v 3gp 3g2".split(" "),hb=RegExp("\\.("+eb.join("|")+")(\\?.*)?$","i");this.mimePattern=/^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;this.useAltURL=!Ha;var Ia;try{Ia=Audio!==k&&(Ea&&opera!==k&&10>opera.version()?new Audio(null):new Audio).canPlayType!==k}catch(ib){Ia=!1}this.hasHTML5=Ia;this.setup=function(b){var e=!c.url;b!==k&&p&&u&&c.ok();oa(b);b&&
(e&&(N&&b.url!==k)&&c.beginDelayedInit(),!N&&(b.url!==k&&"complete"===n.readyState)&&setTimeout(G,1));return c};this.supported=this.ok=function(){return u?p&&!y:c.useHTML5Audio&&c.hasHTML5};this.getMovie=function(b){return W(b)||n[b]||g[b]};this.createSound=function(b,e){function d(){a=aa(a);c.sounds[a.id]=new Ja(a);c.soundIDs.push(a.id);return c.sounds[a.id]}var a,f=null;if(!p||!c.ok())return!1;e!==k&&(b={id:b,url:e});a=w(b);a.url=da(a.url);void 0===a.id&&(a.id=c.setupOptions.idPrefix+Ya++);if(r(a.id,
!0))return c.sounds[a.id];if(ea(a))f=d(),f._setup_html5(a);else{if(c.html5Only||c.html5.usingFlash&&a.url&&a.url.match(/data\:/i))return d();8<m&&null===a.isMovieStar&&(a.isMovieStar=!(!a.serverURL&&!(a.type&&a.type.match(db)||a.url&&a.url.match(hb))));a=ba(a,void 0);f=d();8===m?l._createSound(a.id,a.loops||1,a.usePolicyFile):(l._createSound(a.id,a.url,a.usePeakData,a.useWaveformData,a.useEQData,a.isMovieStar,a.isMovieStar?a.bufferTime:!1,a.loops||1,a.serverURL,a.duration||null,a.autoPlay,!0,a.autoLoad,
a.usePolicyFile),a.serverURL||(f.connected=!0,a.onconnect&&a.onconnect.apply(f)));!a.serverURL&&(a.autoLoad||a.autoPlay)&&f.load(a)}!a.serverURL&&a.autoPlay&&f.play();return f};this.destroySound=function(b,e){if(!r(b))return!1;var d=c.sounds[b],a;d._iO={};d.stop();d.unload();for(a=0;a<c.soundIDs.length;a++)if(c.soundIDs[a]===b){c.soundIDs.splice(a,1);break}e||d.destruct(!0);delete c.sounds[b];return!0};this.load=function(b,e){return!r(b)?!1:c.sounds[b].load(e)};this.unload=function(b){return!r(b)?
!1:c.sounds[b].unload()};this.onposition=this.onPosition=function(b,e,d,a){return!r(b)?!1:c.sounds[b].onposition(e,d,a)};this.clearOnPosition=function(b,e,d){return!r(b)?!1:c.sounds[b].clearOnPosition(e,d)};this.start=this.play=function(b,e){var d=null,a=e&&!(e instanceof Object);if(!p||!c.ok())return!1;if(r(b,a))a&&(e={url:e});else{if(!a)return!1;a&&(e={url:e});e&&e.url&&(e.id=b,d=c.createSound(e).play())}null===d&&(d=c.sounds[b].play(e));return d};this.setPosition=function(b,e){return!r(b)?!1:c.sounds[b].setPosition(e)};
this.stop=function(b){return!r(b)?!1:c.sounds[b].stop()};this.stopAll=function(){for(var b in c.sounds)c.sounds.hasOwnProperty(b)&&c.sounds[b].stop()};this.pause=function(b){return!r(b)?!1:c.sounds[b].pause()};this.pauseAll=function(){var b;for(b=c.soundIDs.length-1;0<=b;b--)c.sounds[c.soundIDs[b]].pause()};this.resume=function(b){return!r(b)?!1:c.sounds[b].resume()};this.resumeAll=function(){var b;for(b=c.soundIDs.length-1;0<=b;b--)c.sounds[c.soundIDs[b]].resume()};this.togglePause=function(b){return!r(b)?
!1:c.sounds[b].togglePause()};this.setPan=function(b,e){return!r(b)?!1:c.sounds[b].setPan(e)};this.setVolume=function(b,e){return!r(b)?!1:c.sounds[b].setVolume(e)};this.mute=function(b){var e=0;b instanceof String&&(b=null);if(b)return!r(b)?!1:c.sounds[b].mute();for(e=c.soundIDs.length-1;0<=e;e--)c.sounds[c.soundIDs[e]].mute();return c.muted=!0};this.muteAll=function(){c.mute()};this.unmute=function(b){b instanceof String&&(b=null);if(b)return!r(b)?!1:c.sounds[b].unmute();for(b=c.soundIDs.length-
1;0<=b;b--)c.sounds[c.soundIDs[b]].unmute();c.muted=!1;return!0};this.unmuteAll=function(){c.unmute()};this.toggleMute=function(b){return!r(b)?!1:c.sounds[b].toggleMute()};this.getMemoryUse=function(){var b=0;l&&8!==m&&(b=parseInt(l._getMemoryUse(),10));return b};this.disable=function(b){var e;b===k&&(b=!1);if(y)return!1;y=!0;for(e=c.soundIDs.length-1;0<=e;e--)Pa(c.sounds[c.soundIDs[e]]);M(b);t.remove(g,"load",E);return!0};this.canPlayMIME=function(b){var e;c.hasHTML5&&(e=T({type:b}));!e&&u&&(e=b&&
c.ok()?!!(8<m&&b.match(db)||b.match(c.mimePattern)):null);return e};this.canPlayURL=function(b){var e;c.hasHTML5&&(e=T({url:b}));!e&&u&&(e=b&&c.ok()?!!b.match(c.filePattern):null);return e};this.canPlayLink=function(b){return b.type!==k&&b.type&&c.canPlayMIME(b.type)?!0:c.canPlayURL(b.href)};this.getSoundById=function(b,e){return!b?null:c.sounds[b]};this.onready=function(b,c){if("function"===typeof b)c||(c=g),pa("onready",b,c),D();else throw P("needFunction","onready");return!0};this.ontimeout=function(b,
c){if("function"===typeof b)c||(c=g),pa("ontimeout",b,c),D({type:"ontimeout"});else throw P("needFunction","ontimeout");return!0};this._wD=this._writeDebug=function(b,c){return!0};this._debug=function(){};this.reboot=function(b,e){var d,a,f;for(d=c.soundIDs.length-1;0<=d;d--)c.sounds[c.soundIDs[d]].destruct();if(l)try{C&&(ya=l.innerHTML),O=l.parentNode.removeChild(l)}catch(k){}ya=O=u=l=null;c.enabled=N=p=Q=Aa=K=L=y=A=c.swfLoaded=!1;c.soundIDs=[];c.sounds={};Ya=0;if(b)x=[];else for(d in x)if(x.hasOwnProperty(d)){a=
0;for(f=x[d].length;a<f;a++)x[d][a].fired=!1}c.html5={usingFlash:null};c.flash={};c.html5Only=!1;c.ignoreFlash=!1;g.setTimeout(function(){ta();e||c.beginDelayedInit()},20);return c};this.reset=function(){return c.reboot(!0,!0)};this.getMoviePercent=function(){return l&&"PercentLoaded"in l?l.PercentLoaded():null};this.beginDelayedInit=function(){na=!0;G();setTimeout(function(){if(Aa)return!1;$();Z();return Aa=!0},20);F()};this.destruct=function(){c.disable(!0)};Ja=function(b){var e,d,a=this,f,h,J,
g,n,q,s=!1,p=[],u=0,x,y,v=null,z;d=e=null;this.sID=this.id=b.id;this.url=b.url;this._iO=this.instanceOptions=this.options=w(b);this.pan=this.options.pan;this.volume=this.options.volume;this.isHTML5=!1;this._a=null;z=this.url?!1:!0;this.id3={};this._debug=function(){};this.load=function(b){var e=null,d;b!==k?a._iO=w(b,a.options):(b=a.options,a._iO=b,v&&v!==a.url&&(a._iO.url=a.url,a.url=null));a._iO.url||(a._iO.url=a.url);a._iO.url=da(a._iO.url);d=a.instanceOptions=a._iO;if(!d.url&&!a.url)return a;
if(d.url===a.url&&0!==a.readyState&&2!==a.readyState)return 3===a.readyState&&d.onload&&ga(a,function(){d.onload.apply(a,[!!a.duration])}),a;a.loaded=!1;a.readyState=1;a.playState=0;a.id3={};if(ea(d))e=a._setup_html5(d),e._called_load||(a._html5_canplay=!1,a.url!==d.url&&(a._a.src=d.url,a.setPosition(0)),a._a.autobuffer="auto",a._a.preload="auto",a._a._called_load=!0);else{if(c.html5Only||a._iO.url&&a._iO.url.match(/data\:/i))return a;try{a.isHTML5=!1,a._iO=ba(aa(d)),d=a._iO,8===m?l._load(a.id,d.url,
d.stream,d.autoPlay,d.usePolicyFile):l._load(a.id,d.url,!!d.stream,!!d.autoPlay,d.loops||1,!!d.autoLoad,d.usePolicyFile)}catch(f){H({type:"SMSOUND_LOAD_JS_EXCEPTION",fatal:!0})}}a.url=d.url;return a};this.unload=function(){0!==a.readyState&&(a.isHTML5?(g(),a._a&&(a._a.pause(),v=fa(a._a))):8===m?l._unload(a.id,"about:blank"):l._unload(a.id),f());return a};this.destruct=function(b){a.isHTML5?(g(),a._a&&(a._a.pause(),fa(a._a),A||J(),a._a._s=null,a._a=null)):(a._iO.onfailure=null,l._destroySound(a.id));
b||c.destroySound(a.id,!0)};this.start=this.play=function(b,e){var d,f,h,g,J;f=!0;f=null;e=e===k?!0:e;b||(b={});a.url&&(a._iO.url=a.url);a._iO=w(a._iO,a.options);a._iO=w(b,a._iO);a._iO.url=da(a._iO.url);a.instanceOptions=a._iO;if(!a.isHTML5&&a._iO.serverURL&&!a.connected)return a.getAutoPlay()||a.setAutoPlay(!0),a;ea(a._iO)&&(a._setup_html5(a._iO),n());1===a.playState&&!a.paused&&(d=a._iO.multiShot,d||(a.isHTML5&&a.setPosition(a._iO.position),f=a));if(null!==f)return f;b.url&&b.url!==a.url&&(!a.readyState&&
!a.isHTML5&&8===m&&z?z=!1:a.load(a._iO));a.loaded||(0===a.readyState?(!a.isHTML5&&!c.html5Only?(a._iO.autoPlay=!0,a.load(a._iO)):a.isHTML5?a.load(a._iO):f=a,a.instanceOptions=a._iO):2===a.readyState&&(f=a));if(null!==f)return f;!a.isHTML5&&(9===m&&0<a.position&&a.position===a.duration)&&(b.position=0);if(a.paused&&0<=a.position&&(!a._iO.serverURL||0<a.position))a.resume();else{a._iO=w(b,a._iO);if(null!==a._iO.from&&null!==a._iO.to&&0===a.instanceCount&&0===a.playState&&!a._iO.serverURL){d=function(){a._iO=
w(b,a._iO);a.play(a._iO)};if(a.isHTML5&&!a._html5_canplay)a.load({_oncanplay:d}),f=!1;else if(!a.isHTML5&&!a.loaded&&(!a.readyState||2!==a.readyState))a.load({onload:d}),f=!1;if(null!==f)return f;a._iO=y()}(!a.instanceCount||a._iO.multiShotEvents||a.isHTML5&&a._iO.multiShot&&!A||!a.isHTML5&&8<m&&!a.getAutoPlay())&&a.instanceCount++;a._iO.onposition&&0===a.playState&&q(a);a.playState=1;a.paused=!1;a.position=a._iO.position!==k&&!isNaN(a._iO.position)?a._iO.position:0;a.isHTML5||(a._iO=ba(aa(a._iO)));
a._iO.onplay&&e&&(a._iO.onplay.apply(a),s=!0);a.setVolume(a._iO.volume,!0);a.setPan(a._iO.pan,!0);a.isHTML5?2>a.instanceCount?(n(),f=a._setup_html5(),a.setPosition(a._iO.position),f.play()):(h=new Audio(a._iO.url),g=function(){t.remove(h,"ended",g);a._onfinish(a);fa(h);h=null},J=function(){t.remove(h,"canplay",J);try{h.currentTime=a._iO.position/1E3}catch(b){}h.play()},t.add(h,"ended",g),void 0!==a._iO.volume&&(h.volume=Math.max(0,Math.min(1,a._iO.volume/100))),a.muted&&(h.muted=!0),a._iO.position?
t.add(h,"canplay",J):h.play()):(f=l._start(a.id,a._iO.loops||1,9===m?a.position:a.position/1E3,a._iO.multiShot||!1),9===m&&!f&&a._iO.onplayerror&&a._iO.onplayerror.apply(a))}return a};this.stop=function(b){var c=a._iO;1===a.playState&&(a._onbufferchange(0),a._resetOnPosition(0),a.paused=!1,a.isHTML5||(a.playState=0),x(),c.to&&a.clearOnPosition(c.to),a.isHTML5?a._a&&(b=a.position,a.setPosition(0),a.position=b,a._a.pause(),a.playState=0,a._onTimer(),g()):(l._stop(a.id,b),c.serverURL&&a.unload()),a.instanceCount=
0,a._iO={},c.onstop&&c.onstop.apply(a));return a};this.setAutoPlay=function(b){a._iO.autoPlay=b;a.isHTML5||(l._setAutoPlay(a.id,b),b&&!a.instanceCount&&1===a.readyState&&a.instanceCount++)};this.getAutoPlay=function(){return a._iO.autoPlay};this.setPosition=function(b){b===k&&(b=0);var c=a.isHTML5?Math.max(b,0):Math.min(a.duration||a._iO.duration,Math.max(b,0));a.position=c;b=a.position/1E3;a._resetOnPosition(a.position);a._iO.position=c;if(a.isHTML5){if(a._a){if(a._html5_canplay){if(a._a.currentTime!==
b)try{a._a.currentTime=b,(0===a.playState||a.paused)&&a._a.pause()}catch(e){}}else if(b)return a;a.paused&&a._onTimer(!0)}}else b=9===m?a.position:b,a.readyState&&2!==a.readyState&&l._setPosition(a.id,b,a.paused||!a.playState,a._iO.multiShot);return a};this.pause=function(b){if(a.paused||0===a.playState&&1!==a.readyState)return a;a.paused=!0;a.isHTML5?(a._setup_html5().pause(),g()):(b||b===k)&&l._pause(a.id,a._iO.multiShot);a._iO.onpause&&a._iO.onpause.apply(a);return a};this.resume=function(){var b=
a._iO;if(!a.paused)return a;a.paused=!1;a.playState=1;a.isHTML5?(a._setup_html5().play(),n()):(b.isMovieStar&&!b.serverURL&&a.setPosition(a.position),l._pause(a.id,b.multiShot));!s&&b.onplay?(b.onplay.apply(a),s=!0):b.onresume&&b.onresume.apply(a);return a};this.togglePause=function(){if(0===a.playState)return a.play({position:9===m&&!a.isHTML5?a.position:a.position/1E3}),a;a.paused?a.resume():a.pause();return a};this.setPan=function(b,c){b===k&&(b=0);c===k&&(c=!1);a.isHTML5||l._setPan(a.id,b);a._iO.pan=
b;c||(a.pan=b,a.options.pan=b);return a};this.setVolume=function(b,e){b===k&&(b=100);e===k&&(e=!1);a.isHTML5?a._a&&(c.muted&&!a.muted&&(a.muted=!0,a._a.muted=!0),a._a.volume=Math.max(0,Math.min(1,b/100))):l._setVolume(a.id,c.muted&&!a.muted||a.muted?0:b);a._iO.volume=b;e||(a.volume=b,a.options.volume=b);return a};this.mute=function(){a.muted=!0;a.isHTML5?a._a&&(a._a.muted=!0):l._setVolume(a.id,0);return a};this.unmute=function(){a.muted=!1;var b=a._iO.volume!==k;a.isHTML5?a._a&&(a._a.muted=!1):l._setVolume(a.id,
b?a._iO.volume:a.options.volume);return a};this.toggleMute=function(){return a.muted?a.unmute():a.mute()};this.onposition=this.onPosition=function(b,c,e){p.push({position:parseInt(b,10),method:c,scope:e!==k?e:a,fired:!1});return a};this.clearOnPosition=function(a,b){var c;a=parseInt(a,10);if(isNaN(a))return!1;for(c=0;c<p.length;c++)if(a===p[c].position&&(!b||b===p[c].method))p[c].fired&&u--,p.splice(c,1)};this._processOnPosition=function(){var b,c;b=p.length;if(!b||!a.playState||u>=b)return!1;for(b-=
1;0<=b;b--)c=p[b],!c.fired&&a.position>=c.position&&(c.fired=!0,u++,c.method.apply(c.scope,[c.position]));return!0};this._resetOnPosition=function(a){var b,c;b=p.length;if(!b)return!1;for(b-=1;0<=b;b--)c=p[b],c.fired&&a<=c.position&&(c.fired=!1,u--);return!0};y=function(){var b=a._iO,c=b.from,e=b.to,d,f;f=function(){a.clearOnPosition(e,f);a.stop()};d=function(){if(null!==e&&!isNaN(e))a.onPosition(e,f)};null!==c&&!isNaN(c)&&(b.position=c,b.multiShot=!1,d());return b};q=function(){var b,c=a._iO.onposition;
if(c)for(b in c)if(c.hasOwnProperty(b))a.onPosition(parseInt(b,10),c[b])};x=function(){var b,c=a._iO.onposition;if(c)for(b in c)c.hasOwnProperty(b)&&a.clearOnPosition(parseInt(b,10))};n=function(){a.isHTML5&&Ra(a)};g=function(){a.isHTML5&&Sa(a)};f=function(b){b||(p=[],u=0);s=!1;a._hasTimer=null;a._a=null;a._html5_canplay=!1;a.bytesLoaded=null;a.bytesTotal=null;a.duration=a._iO&&a._iO.duration?a._iO.duration:null;a.durationEstimate=null;a.buffered=[];a.eqData=[];a.eqData.left=[];a.eqData.right=[];
a.failures=0;a.isBuffering=!1;a.instanceOptions={};a.instanceCount=0;a.loaded=!1;a.metadata={};a.readyState=0;a.muted=!1;a.paused=!1;a.peakData={left:0,right:0};a.waveformData={left:[],right:[]};a.playState=0;a.position=null;a.id3={}};f();this._onTimer=function(b){var c,f=!1,h={};if(a._hasTimer||b){if(a._a&&(b||(0<a.playState||1===a.readyState)&&!a.paused))c=a._get_html5_duration(),c!==e&&(e=c,a.duration=c,f=!0),a.durationEstimate=a.duration,c=1E3*a._a.currentTime||0,c!==d&&(d=c,f=!0),(f||b)&&a._whileplaying(c,
h,h,h,h);return f}};this._get_html5_duration=function(){var b=a._iO;return(b=a._a&&a._a.duration?1E3*a._a.duration:b&&b.duration?b.duration:null)&&!isNaN(b)&&Infinity!==b?b:null};this._apply_loop=function(a,b){a.loop=1<b?"loop":""};this._setup_html5=function(b){b=w(a._iO,b);var c=A?Ka:a._a,e=decodeURI(b.url),d;A?e===decodeURI(Ca)&&(d=!0):e===decodeURI(v)&&(d=!0);if(c){if(c._s)if(A)c._s&&(c._s.playState&&!d)&&c._s.stop();else if(!A&&e===decodeURI(v))return a._apply_loop(c,b.loops),c;d||(v&&f(!1),c.src=
b.url,Ca=v=a.url=b.url,c._called_load=!1)}else b.autoLoad||b.autoPlay?(a._a=new Audio(b.url),a._a.load()):a._a=Ea&&10>opera.version()?new Audio(null):new Audio,c=a._a,c._called_load=!1,A&&(Ka=c);a.isHTML5=!0;a._a=c;c._s=a;h();a._apply_loop(c,b.loops);b.autoLoad||b.autoPlay?a.load():(c.autobuffer=!1,c.preload="auto");return c};h=function(){if(a._a._added_events)return!1;var b;a._a._added_events=!0;for(b in B)B.hasOwnProperty(b)&&a._a&&a._a.addEventListener(b,B[b],!1);return!0};J=function(){var b;a._a._added_events=
!1;for(b in B)B.hasOwnProperty(b)&&a._a&&a._a.removeEventListener(b,B[b],!1)};this._onload=function(b){var c=!!b||!a.isHTML5&&8===m&&a.duration;a.loaded=c;a.readyState=c?3:2;a._onbufferchange(0);a._iO.onload&&ga(a,function(){a._iO.onload.apply(a,[c])});return!0};this._onbufferchange=function(b){if(0===a.playState||b&&a.isBuffering||!b&&!a.isBuffering)return!1;a.isBuffering=1===b;a._iO.onbufferchange&&a._iO.onbufferchange.apply(a);return!0};this._onsuspend=function(){a._iO.onsuspend&&a._iO.onsuspend.apply(a);
return!0};this._onfailure=function(b,c,e){a.failures++;if(a._iO.onfailure&&1===a.failures)a._iO.onfailure(a,b,c,e)};this._onfinish=function(){var b=a._iO.onfinish;a._onbufferchange(0);a._resetOnPosition(0);a.instanceCount&&(a.instanceCount--,a.instanceCount||(x(),a.playState=0,a.paused=!1,a.instanceCount=0,a.instanceOptions={},a._iO={},g(),a.isHTML5&&(a.position=0)),(!a.instanceCount||a._iO.multiShotEvents)&&b&&ga(a,function(){b.apply(a)}))};this._whileloading=function(b,c,e,d){var f=a._iO;a.bytesLoaded=
b;a.bytesTotal=c;a.duration=Math.floor(e);a.bufferLength=d;a.durationEstimate=!a.isHTML5&&!f.isMovieStar?f.duration?a.duration>f.duration?a.duration:f.duration:parseInt(a.bytesTotal/a.bytesLoaded*a.duration,10):a.duration;a.isHTML5||(a.buffered=[{start:0,end:a.duration}]);(3!==a.readyState||a.isHTML5)&&f.whileloading&&f.whileloading.apply(a)};this._whileplaying=function(b,c,e,d,f){var h=a._iO;if(isNaN(b)||null===b)return!1;a.position=Math.max(0,b);a._processOnPosition();!a.isHTML5&&8<m&&(h.usePeakData&&
(c!==k&&c)&&(a.peakData={left:c.leftPeak,right:c.rightPeak}),h.useWaveformData&&(e!==k&&e)&&(a.waveformData={left:e.split(","),right:d.split(",")}),h.useEQData&&(f!==k&&f&&f.leftEQ)&&(b=f.leftEQ.split(","),a.eqData=b,a.eqData.left=b,f.rightEQ!==k&&f.rightEQ&&(a.eqData.right=f.rightEQ.split(","))));1===a.playState&&(!a.isHTML5&&(8===m&&!a.position&&a.isBuffering)&&a._onbufferchange(0),h.whileplaying&&h.whileplaying.apply(a));return!0};this._oncaptiondata=function(b){a.captiondata=b;a._iO.oncaptiondata&&
a._iO.oncaptiondata.apply(a,[b])};this._onmetadata=function(b,c){var e={},d,f;d=0;for(f=b.length;d<f;d++)e[b[d]]=c[d];a.metadata=e;a._iO.onmetadata&&a._iO.onmetadata.apply(a)};this._onid3=function(b,c){var e=[],d,f;d=0;for(f=b.length;d<f;d++)e[b[d]]=c[d];a.id3=w(a.id3,e);a._iO.onid3&&a._iO.onid3.apply(a)};this._onconnect=function(b){b=1===b;if(a.connected=b)a.failures=0,r(a.id)&&(a.getAutoPlay()?a.play(k,a.getAutoPlay()):a._iO.autoLoad&&a.load()),a._iO.onconnect&&a._iO.onconnect.apply(a,[b])};this._ondataerror=
function(b){0<a.playState&&a._iO.ondataerror&&a._iO.ondataerror.apply(a)}};va=function(){return n.body||n.getElementsByTagName("div")[0]};W=function(b){return n.getElementById(b)};w=function(b,e){var d=b||{},a,f;a=e===k?c.defaultOptions:e;for(f in a)a.hasOwnProperty(f)&&d[f]===k&&(d[f]="object"!==typeof a[f]||null===a[f]?a[f]:w(d[f],a[f]));return d};ga=function(b,c){!b.isHTML5&&8===m?g.setTimeout(c,0):c()};X={onready:1,ontimeout:1,defaultOptions:1,flash9Options:1,movieStarOptions:1};oa=function(b,
e){var d,a=!0,f=e!==k,h=c.setupOptions;for(d in b)if(b.hasOwnProperty(d))if("object"!==typeof b[d]||null===b[d]||b[d]instanceof Array||b[d]instanceof RegExp)f&&X[e]!==k?c[e][d]=b[d]:h[d]!==k?(c.setupOptions[d]=b[d],c[d]=b[d]):X[d]===k?a=!1:c[d]instanceof Function?c[d].apply(c,b[d]instanceof Array?b[d]:[b[d]]):c[d]=b[d];else if(X[d]===k)a=!1;else return oa(b[d],d);return a};t=function(){function b(a){a=fb.call(a);var b=a.length;d?(a[1]="on"+a[1],3<b&&a.pop()):3===b&&a.push(!1);return a}function c(b,
e){var k=b.shift(),g=[a[e]];if(d)k[g](b[0],b[1]);else k[g].apply(k,b)}var d=g.attachEvent,a={add:d?"attachEvent":"addEventListener",remove:d?"detachEvent":"removeEventListener"};return{add:function(){c(b(arguments),"add")},remove:function(){c(b(arguments),"remove")}}}();B={abort:q(function(){}),canplay:q(function(){var b=this._s,c;if(b._html5_canplay)return!0;b._html5_canplay=!0;b._onbufferchange(0);c=b._iO.position!==k&&!isNaN(b._iO.position)?b._iO.position/1E3:null;if(b.position&&this.currentTime!==
c)try{this.currentTime=c}catch(d){}b._iO._oncanplay&&b._iO._oncanplay()}),canplaythrough:q(function(){var b=this._s;b.loaded||(b._onbufferchange(0),b._whileloading(b.bytesLoaded,b.bytesTotal,b._get_html5_duration()),b._onload(!0))}),ended:q(function(){this._s._onfinish()}),error:q(function(){this._s._onload(!1)}),loadeddata:q(function(){var b=this._s;!b._loaded&&!ia&&(b.duration=b._get_html5_duration())}),loadedmetadata:q(function(){}),loadstart:q(function(){this._s._onbufferchange(1)}),play:q(function(){this._s._onbufferchange(0)}),
playing:q(function(){this._s._onbufferchange(0)}),progress:q(function(b){var c=this._s,d,a,f=0,f=b.target.buffered;d=b.loaded||0;var h=b.total||1;c.buffered=[];if(f&&f.length){d=0;for(a=f.length;d<a;d++)c.buffered.push({start:1E3*f.start(d),end:1E3*f.end(d)});f=1E3*(f.end(0)-f.start(0));d=Math.min(1,f/(1E3*b.target.duration))}isNaN(d)||(c._onbufferchange(0),c._whileloading(d,h,c._get_html5_duration()),d&&(h&&d===h)&&B.canplaythrough.call(this,b))}),ratechange:q(function(){}),suspend:q(function(b){var c=
this._s;B.progress.call(this,b);c._onsuspend()}),stalled:q(function(){}),timeupdate:q(function(){this._s._onTimer()}),waiting:q(function(){this._s._onbufferchange(1)})};ea=function(b){return!b||!b.type&&!b.url&&!b.serverURL?!1:b.serverURL||b.type&&V(b.type)?!1:b.type?T({type:b.type}):T({url:b.url})||c.html5Only||b.url.match(/data\:/i)};fa=function(b){var e;b&&(e=ia?"about:blank":c.html5.canPlayType("audio/wav")?"data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w\x3d\x3d":
"about:blank",b.src=e,void 0!==b._called_unload&&(b._called_load=!1));A&&(Ca=null);return e};T=function(b){if(!c.useHTML5Audio||!c.hasHTML5)return!1;var e=b.url||null;b=b.type||null;var d=c.audioFormats,a;if(b&&c.html5[b]!==k)return c.html5[b]&&!V(b);if(!z){z=[];for(a in d)d.hasOwnProperty(a)&&(z.push(a),d[a].related&&(z=z.concat(d[a].related)));z=RegExp("\\.("+z.join("|")+")(\\?.*)?$","i")}a=e?e.toLowerCase().match(z):null;!a||!a.length?b&&(e=b.indexOf(";"),a=(-1!==e?b.substr(0,e):b).substr(6)):
a=a[1];a&&c.html5[a]!==k?e=c.html5[a]&&!V(a):(b="audio/"+a,e=c.html5.canPlayType({type:b}),e=(c.html5[a]=e)&&c.html5[b]&&!V(b));return e};Wa=function(){function b(a){var b,d=b=!1;if(!e||"function"!==typeof e.canPlayType)return b;if(a instanceof Array){g=0;for(b=a.length;g<b;g++)if(c.html5[a[g]]||e.canPlayType(a[g]).match(c.html5Test))d=!0,c.html5[a[g]]=!0,c.flash[a[g]]=!!a[g].match(bb);b=d}else a=e&&"function"===typeof e.canPlayType?e.canPlayType(a):!1,b=!(!a||!a.match(c.html5Test));return b}if(!c.useHTML5Audio||
!c.hasHTML5)return u=c.html5.usingFlash=!0,!1;var e=Audio!==k?Ea&&10>opera.version()?new Audio(null):new Audio:null,d,a,f={},h,g;h=c.audioFormats;for(d in h)if(h.hasOwnProperty(d)&&(a="audio/"+d,f[d]=b(h[d].type),f[a]=f[d],d.match(bb)?(c.flash[d]=!0,c.flash[a]=!0):(c.flash[d]=!1,c.flash[a]=!1),h[d]&&h[d].related))for(g=h[d].related.length-1;0<=g;g--)f["audio/"+h[d].related[g]]=f[d],c.html5[h[d].related[g]]=f[d],c.flash[h[d].related[g]]=f[d];f.canPlayType=e?b:null;c.html5=w(c.html5,f);c.html5.usingFlash=
Va();u=c.html5.usingFlash;return!0};sa={};P=function(){};aa=function(b){8===m&&(1<b.loops&&b.stream)&&(b.stream=!1);return b};ba=function(b,c){if(b&&!b.usePolicyFile&&(b.onid3||b.usePeakData||b.useWaveformData||b.useEQData))b.usePolicyFile=!0;return b};la=function(){return!1};Pa=function(b){for(var c in b)b.hasOwnProperty(c)&&"function"===typeof b[c]&&(b[c]=la)};xa=function(b){b===k&&(b=!1);(y||b)&&c.disable(b)};Qa=function(b){var e=null;if(b)if(b.match(/\.swf(\?.*)?$/i)){if(e=b.substr(b.toLowerCase().lastIndexOf(".swf?")+
4))return b}else b.lastIndexOf("/")!==b.length-1&&(b+="/");b=(b&&-1!==b.lastIndexOf("/")?b.substr(0,b.lastIndexOf("/")+1):"./")+c.movieURL;c.noSWFCache&&(b+="?ts\x3d"+(new Date).getTime());return b};ra=function(){m=parseInt(c.flashVersion,10);8!==m&&9!==m&&(c.flashVersion=m=8);var b=c.debugMode||c.debugFlash?"_debug.swf":".swf";c.useHTML5Audio&&(!c.html5Only&&c.audioFormats.mp4.required&&9>m)&&(c.flashVersion=m=9);c.version=c.versionNumber+(c.html5Only?" (HTML5-only mode)":9===m?" (AS3/Flash 9)":
" (AS2/Flash 8)");8<m?(c.defaultOptions=w(c.defaultOptions,c.flash9Options),c.features.buffering=!0,c.defaultOptions=w(c.defaultOptions,c.movieStarOptions),c.filePatterns.flash9=RegExp("\\.(mp3|"+eb.join("|")+")(\\?.*)?$","i"),c.features.movieStar=!0):c.features.movieStar=!1;c.filePattern=c.filePatterns[8!==m?"flash9":"flash8"];c.movieURL=(8===m?"soundmanager2.swf":"soundmanager2_flash9.swf").replace(".swf",b);c.features.peakData=c.features.waveformData=c.features.eqData=8<m};Oa=function(b,c){if(!l)return!1;
l._setPolling(b,c)};wa=function(){};r=this.getSoundById;I=function(){var b=[];c.debugMode&&b.push("sm2_debug");c.debugFlash&&b.push("flash_debug");c.useHighPerformance&&b.push("high_performance");return b.join(" ")};za=function(){P("fbHandler");var b=c.getMoviePercent(),e={type:"FLASHBLOCK"};if(c.html5Only)return!1;c.ok()?c.oMC&&(c.oMC.className=[I(),"movieContainer","swf_loaded"+(c.didFlashBlock?" swf_unblocked":"")].join(" ")):(u&&(c.oMC.className=I()+" movieContainer "+(null===b?"swf_timedout":
"swf_error")),c.didFlashBlock=!0,D({type:"ontimeout",ignoreInit:!0,error:e}),H(e))};pa=function(b,c,d){x[b]===k&&(x[b]=[]);x[b].push({method:c,scope:d||null,fired:!1})};D=function(b){b||(b={type:c.ok()?"onready":"ontimeout"});if(!p&&b&&!b.ignoreInit||"ontimeout"===b.type&&(c.ok()||y&&!b.ignoreInit))return!1;var e={success:b&&b.ignoreInit?c.ok():!y},d=b&&b.type?x[b.type]||[]:[],a=[],f,e=[e],h=u&&!c.ok();b.error&&(e[0].error=b.error);b=0;for(f=d.length;b<f;b++)!0!==d[b].fired&&a.push(d[b]);if(a.length){b=
0;for(f=a.length;b<f;b++)a[b].scope?a[b].method.apply(a[b].scope,e):a[b].method.apply(this,e),h||(a[b].fired=!0)}return!0};E=function(){g.setTimeout(function(){c.useFlashBlock&&za();D();"function"===typeof c.onload&&c.onload.apply(g);c.waitForWindowLoad&&t.add(g,"load",E)},1)};Da=function(){if(v!==k)return v;var b=!1,c=navigator,d=c.plugins,a,f=g.ActiveXObject;if(d&&d.length)(c=c.mimeTypes)&&(c["application/x-shockwave-flash"]&&c["application/x-shockwave-flash"].enabledPlugin&&c["application/x-shockwave-flash"].enabledPlugin.description)&&
(b=!0);else if(f!==k&&!s.match(/MSAppHost/i)){try{a=new f("ShockwaveFlash.ShockwaveFlash")}catch(h){a=null}b=!!a}return v=b};Va=function(){var b,e,d=c.audioFormats;if(ha&&s.match(/os (1|2|3_0|3_1)/i))c.hasHTML5=!1,c.html5Only=!0,c.oMC&&(c.oMC.style.display="none");else if(c.useHTML5Audio&&(!c.html5||!c.html5.canPlayType))c.hasHTML5=!1;if(c.useHTML5Audio&&c.hasHTML5)for(e in S=!0,d)if(d.hasOwnProperty(e)&&d[e].required)if(c.html5.canPlayType(d[e].type)){if(c.preferFlash&&(c.flash[e]||c.flash[d[e].type]))b=
!0}else S=!1,b=!0;c.ignoreFlash&&(b=!1,S=!0);c.html5Only=c.hasHTML5&&c.useHTML5Audio&&!b;return!c.html5Only};da=function(b){var e,d,a=0;if(b instanceof Array){e=0;for(d=b.length;e<d;e++)if(b[e]instanceof Object){if(c.canPlayMIME(b[e].type)){a=e;break}}else if(c.canPlayURL(b[e])){a=e;break}b[a].url&&(b[a]=b[a].url);b=b[a]}return b};Ra=function(b){b._hasTimer||(b._hasTimer=!0,!Fa&&c.html5PollingInterval&&(null===R&&0===ca&&(R=setInterval(Ta,c.html5PollingInterval)),ca++))};Sa=function(b){b._hasTimer&&
(b._hasTimer=!1,!Fa&&c.html5PollingInterval&&ca--)};Ta=function(){var b;if(null!==R&&!ca)return clearInterval(R),R=null,!1;for(b=c.soundIDs.length-1;0<=b;b--)c.sounds[c.soundIDs[b]].isHTML5&&c.sounds[c.soundIDs[b]]._hasTimer&&c.sounds[c.soundIDs[b]]._onTimer()};H=function(b){b=b!==k?b:{};"function"===typeof c.onerror&&c.onerror.apply(g,[{type:b.type!==k?b.type:null}]);b.fatal!==k&&b.fatal&&c.disable()};Xa=function(){if(!$a||!Da())return!1;var b=c.audioFormats,e,d;for(d in b)if(b.hasOwnProperty(d)&&
("mp3"===d||"mp4"===d))if(c.html5[d]=!1,b[d]&&b[d].related)for(e=b[d].related.length-1;0<=e;e--)c.html5[b[d].related[e]]=!1};this._setSandboxType=function(b){};this._externalInterfaceOK=function(b){if(c.swfLoaded)return!1;c.swfLoaded=!0;ja=!1;$a&&Xa();setTimeout(ma,C?100:1)};$=function(b,e){function d(a,b){return'\x3cparam name\x3d"'+a+'" value\x3d"'+b+'" /\x3e'}if(K&&L)return!1;if(c.html5Only)return ra(),c.oMC=W(c.movieID),ma(),L=K=!0,!1;var a=e||c.url,f=c.altURL||a,h=va(),g=I(),l=null,l=n.getElementsByTagName("html")[0],
m,p,q,l=l&&l.dir&&l.dir.match(/rtl/i);b=b===k?c.id:b;ra();c.url=Qa(Ha?a:f);e=c.url;c.wmode=!c.wmode&&c.useHighPerformance?"transparent":c.wmode;if(null!==c.wmode&&(s.match(/msie 8/i)||!C&&!c.useHighPerformance)&&navigator.platform.match(/win32|win64/i))Ua.push(sa.spcWmode),c.wmode=null;h={name:b,id:b,src:e,quality:"high",allowScriptAccess:c.allowScriptAccess,bgcolor:c.bgColor,pluginspage:cb+"www.macromedia.com/go/getflashplayer",title:"JS/Flash audio component (SoundManager 2)",type:"application/x-shockwave-flash",
wmode:c.wmode,hasPriority:"true"};c.debugFlash&&(h.FlashVars="debug\x3d1");c.wmode||delete h.wmode;if(C)a=n.createElement("div"),p=['\x3cobject id\x3d"'+b+'" data\x3d"'+e+'" type\x3d"'+h.type+'" title\x3d"'+h.title+'" classid\x3d"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase\x3d"'+cb+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version\x3d6,0,40,0"\x3e',d("movie",e),d("AllowScriptAccess",c.allowScriptAccess),d("quality",h.quality),c.wmode?d("wmode",c.wmode):"",d("bgcolor",
c.bgColor),d("hasPriority","true"),c.debugFlash?d("FlashVars",h.FlashVars):"","\x3c/object\x3e"].join("");else for(m in a=n.createElement("embed"),h)h.hasOwnProperty(m)&&a.setAttribute(m,h[m]);wa();g=I();if(h=va())if(c.oMC=W(c.movieID)||n.createElement("div"),c.oMC.id)q=c.oMC.className,c.oMC.className=(q?q+" ":"movieContainer")+(g?" "+g:""),c.oMC.appendChild(a),C&&(m=c.oMC.appendChild(n.createElement("div")),m.className="sm2-object-box",m.innerHTML=p),L=!0;else{c.oMC.id=c.movieID;c.oMC.className=
"movieContainer "+g;m=g=null;c.useFlashBlock||(c.useHighPerformance?g={position:"fixed",width:"8px",height:"8px",bottom:"0px",left:"0px",overflow:"hidden"}:(g={position:"absolute",width:"6px",height:"6px",top:"-9999px",left:"-9999px"},l&&(g.left=Math.abs(parseInt(g.left,10))+"px")));gb&&(c.oMC.style.zIndex=1E4);if(!c.debugFlash)for(q in g)g.hasOwnProperty(q)&&(c.oMC.style[q]=g[q]);try{C||c.oMC.appendChild(a),h.appendChild(c.oMC),C&&(m=c.oMC.appendChild(n.createElement("div")),m.className="sm2-object-box",
m.innerHTML=p),L=!0}catch(r){throw Error(P("domError")+" \n"+r.toString());}}return K=!0};Z=function(){if(c.html5Only)return $(),!1;if(l||!c.url)return!1;l=c.getMovie(c.id);l||(O?(C?c.oMC.innerHTML=ya:c.oMC.appendChild(O),O=null,K=!0):$(c.id,c.url),l=c.getMovie(c.id));"function"===typeof c.oninitmovie&&setTimeout(c.oninitmovie,1);return!0};F=function(){setTimeout(Na,1E3)};qa=function(){g.setTimeout(function(){c.setup({preferFlash:!1}).reboot();c.didFlashBlock=!0;c.beginDelayedInit()},1)};Na=function(){var b,
e=!1;if(!c.url||Q)return!1;Q=!0;t.remove(g,"load",F);if(v&&ja&&!Ga)return!1;p||(b=c.getMoviePercent(),0<b&&100>b&&(e=!0));setTimeout(function(){b=c.getMoviePercent();if(e)return Q=!1,g.setTimeout(F,1),!1;!p&&ab&&(null===b?c.useFlashBlock||0===c.flashLoadTimeout?c.useFlashBlock&&za():!c.useFlashBlock&&S?qa():D({type:"ontimeout",ignoreInit:!0,error:{type:"INIT_FLASHBLOCK"}}):0!==c.flashLoadTimeout&&(!c.useFlashBlock&&S?qa():xa(!0)))},c.flashLoadTimeout)};Y=function(){if(Ga||!ja)return t.remove(g,"focus",
Y),!0;Ga=ab=!0;Q=!1;F();t.remove(g,"focus",Y);return!0};M=function(b){if(p)return!1;if(c.html5Only)return p=!0,E(),!0;var e=!0,d;if(!c.useFlashBlock||!c.flashLoadTimeout||c.getMoviePercent())p=!0;d={type:!v&&u?"NO_FLASH":"INIT_TIMEOUT"};if(y||b)c.useFlashBlock&&c.oMC&&(c.oMC.className=I()+" "+(null===c.getMoviePercent()?"swf_timedout":"swf_error")),D({type:"ontimeout",error:d,ignoreInit:!0}),H(d),e=!1;y||(c.waitForWindowLoad&&!na?t.add(g,"load",E):E());return e};Ma=function(){var b,e=c.setupOptions;
for(b in e)e.hasOwnProperty(b)&&(c[b]===k?c[b]=e[b]:c[b]!==e[b]&&(c.setupOptions[b]=c[b]))};ma=function(){if(p)return!1;if(c.html5Only)return p||(t.remove(g,"load",c.beginDelayedInit),c.enabled=!0,M()),!0;Z();try{l._externalInterfaceTest(!1),Oa(!0,c.flashPollingInterval||(c.useHighPerformance?10:50)),c.debugMode||l._disableDebug(),c.enabled=!0,c.html5Only||t.add(g,"unload",la)}catch(b){return H({type:"JS_TO_FLASH_EXCEPTION",fatal:!0}),xa(!0),M(),!1}M();t.remove(g,"load",c.beginDelayedInit);return!0};
G=function(){if(N)return!1;N=!0;Ma();wa();!v&&c.hasHTML5&&c.setup({useHTML5Audio:!0,preferFlash:!1});Wa();!v&&u&&(Ua.push(sa.needFlash),c.setup({flashLoadTimeout:1}));n.removeEventListener&&n.removeEventListener("DOMContentLoaded",G,!1);Z();return!0};Ba=function(){"complete"===n.readyState&&(G(),n.detachEvent("onreadystatechange",Ba));return!0};ua=function(){na=!0;t.remove(g,"load",ua)};ta=function(){if(Fa&&(c.setupOptions.useHTML5Audio=!0,c.setupOptions.preferFlash=!1,ha||Za&&!s.match(/android\s2\.3/i)))ha&&
(c.ignoreFlash=!0),A=!0};ta();Da();t.add(g,"focus",Y);t.add(g,"load",F);t.add(g,"load",ua);n.addEventListener?n.addEventListener("DOMContentLoaded",G,!1):n.attachEvent?n.attachEvent("onreadystatechange",Ba):H({type:"NO_DOM2_EVENTS",fatal:!0})}var ka=null;if(void 0===g.SM2_DEFER||!SM2_DEFER)ka=new U;g.SoundManager=U;g.soundManager=ka})(window);
},{}],9:[function(_dereq_,module,exports){
module.exports = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

},{}],10:[function(_dereq_,module,exports){
var isRetina = function() {
  var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
  (min--moz-device-pixel-ratio: 1.5),\
  (-o-min-device-pixel-ratio: 3/2),\
  (min-resolution: 1.5dppx)";

  if (window.devicePixelRatio > 1)
    return true;

  if (window.matchMedia && window.matchMedia(mediaQuery).matches)
    return true;

  return false;
};

module.exports = isRetina;

},{}],11:[function(_dereq_,module,exports){
var getJSON = _dereq_('./utils').getJSON;

var animation = _dereq_('./animation');

/**
 * Class for loading images
 * @constructor
 */
var SpriteSheetManager = function() {
  /**
   * Sprite data
   * @type {object}
   */
  this.data = {};

  /**
   * animation class
   * @type {Animation}
   */
  this.animation = animation;

  /**
   * sprite image
   * @type {HTMLImageElement|null}
   */
  this.image = null;
};

/**
 * Load json file and actual sprite image
 * @param {string} json - path to the json file
 * @param {string} imagePath - path to the image
 * @param {function} callback - function that is called after everything is loaded
 */
SpriteSheetManager.prototype.load = function(json, imagePath, callback) {
  if (!json) { return setTimeout(callback, 0); }

  var self = this;

  var image = new Image();
  image.onload = function() {
    for (var name in self.data) {
      var item = self.data[name];
      item.image = image;
    }

    self.image = image;
    callback();
  };

  getJSON(json, function(data) {
    self.data = data;
    image.src = imagePath;
  });
};

/**
 * Get data about specific image
 * @param {string} name - image name
 * @return {object}
 */
SpriteSheetManager.prototype.get = function(name) {
  return this.data[name];
};

module.exports = SpriteSheetManager;

},{"./animation":2,"./utils":12}],12:[function(_dereq_,module,exports){
exports.getJSON = function(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    var data = JSON.parse(this.response);
    callback(data);
  };

  request.send();
};

},{}],13:[function(_dereq_,module,exports){
/**
 * @constructor
 * @param {HTMLCanvasElement} canvas - Canvas DOM element
 */
var Video = function(canvas) {
  /**
   * Canvas DOM element
   * @type {HTMLCanvasElement}
   */
  this.canvas = canvas;

  /**
   * Game width in pixels
   * @type {number}
   */
  this.width = null;

  /**
   * Game height in pixels
   * @type {number}
   */
  this.height = null;

  /**
   * canvas context
   * @type {CanvasRenderingContext2D}
   */
  this.ctx = canvas.getContext('2d');
};

/**
 * Includes mixins into Video library
 * @param {object} methods - object of methods that will included in Video
 */
Video.prototype.include = function(methods) {
  for (var method in methods) {
    this[method] = methods[method];
  }
};

Video.prototype.beginFrame = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

Video.prototype.endFrame = function() {};

/**
 * Scale canvas buffer, used for retina screens
 * @param {number} scale
 */
Video.prototype.scaleCanvas = function(scale) {
  this.canvas.style.width = this.canvas.width + 'px';
  this.canvas.style.height = this.canvas.height + 'px';

  this.canvas.width *= scale;
  this.canvas.height *= scale;

  this.scale(scale);
};

/**
 * Canvas helper for scaling
 * @param {number} scale
 */
Video.prototype.scale = function(scale) {
  this.ctx.scale(scale, scale);
};

/**
 * Draws image sprite into x a y position
 * @param {object} sprite - sprite data
 * @param {number} x - x position
 * @param {number} y - y position
 * @param {number} [offsetX] - image position offset x
 * @param {number} [offsetY] - image position offset y
 * @param {number} [w] - final rendering width
 * @param {number} [h] - final rendering height
 */
Video.prototype.sprite = function(sprite, x, y, offsetX, offsetY, w, h) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;

  w = w || sprite.width;
  h = h || sprite.height;

  x = Math.floor(x);
  y = Math.floor(y);

  var drawWidth = w;
  var drawHeight = h;

  if (sprite.source_image.match(/@2x.png$/)) {
    drawWidth /= 2;
    drawHeight /= 2;
  }

  this.ctx.drawImage(sprite.image, sprite.x + offsetX, sprite.y + offsetY, w, h, x, y, drawWidth, drawHeight);
};

/**
 * Draw animatino at given location
 * @param {Animation} animation - Animation object
 * @param {number} x - x position
 * @param {number} y - y position
 */
Video.prototype.animation = function(animation, x, y) {
  this.sprite(animation.sprite, x, y, animation.offsetX, animation.offsetY, animation.width, animation.height);
};

module.exports = Video;

},{}]},{},[1])
(1)
});