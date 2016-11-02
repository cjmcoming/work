var kflGame = (function() {

	var extend = function(Child, Parent) {
		var F = function() {};
		F.prototype = Parent.prototype;
		Child.prototype = new F();
		Child.prototype.constructor = Child;
	};

	var Origin = (function() {
		var _Origin = function() {};
		_Origin.prototype = {
			setDead: function(bPara) {this.bDead = bPara;},
			setState: function(sPara) {this.sState = sPara;},
			update: function() {},
			draw: function() {},
			reset: function() {}
		};
		return _Origin;
	}) ();

	var GameBg1 = (function() {
		var _Module = function(o) {
			for (var i in o) { 
				this[i] = o[i];
			}
		};
		extend(_Module, Origin);
		_Module.prototype.update = function() {
			var _sel = this;
			_sel.nY -= _sel.nSpeed;
			if(_sel.nY < -_sel.nH) {
				_sel.nY += _sel.nH * 2;
			}
		};
		_Module.prototype.draw = function() {
			var _sel = this,
				ctx = _sel.ctx;
			ctx.drawImage(_sel.sImg, _sel.nX, _sel.nY, _sel.nW, _sel.nH);
		};
		return _Module;
	}) ();
	var GameBg2 = (function() {
		var _Module = function(o) {
			for (var i in o) { 
				this[i] = o[i];
			}
		};
		extend(_Module, Origin);
		_Module.prototype.draw = function() {
			var _sel = this,
				ctx = _sel.ctx;
			ctx.drawImage(_sel.sImg, _sel.nX, _sel.nY, _sel.nW, _sel.nH);
		};
		return _Module;
	}) ();

	var GameInverseBg = (function() {
		var _Module = function(o) {
			for (var i in o) { 
				this[i] = o[i];
			}
			this.reset();
		};
		extend(_Module, Origin);
		_Module.prototype.draw = function() {
			var _sel = this,
				ctx = _sel.ctx;
			ctx.save();
			ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
			ctx.fillRect(_sel.nX, _sel.nY, _sel.nW, _sel.nH);
			ctx.restore();
		};
		_Module.prototype.reset = function() {
			this.setDead(false);
		}
		return _Module;
	}) ();
	var GameInverseNum = (function() {
		var _Module = function(o) {
			for (var i in o) { 
				this[i] = o[i];
			}
			this.reset();
		};
		extend(_Module, Origin);
		_Module.prototype.update = function() {
			var _sel = this;
			_sel.nTick ++;
			if(_sel.nTick % _sel.nInverseTick == 0) {
				if(_sel.nImgNum > 0) {
					_sel.nImgNum --;
					_sel.sImg = _sel.aImg[_sel.nImgNum];
				}else{
					console.log("start game");
					_sel.callback();
				}
			}
		}
		_Module.prototype.draw = function() {
			var _sel = this,
				ctx = _sel.ctx;
			ctx.drawImage(_sel.sImg, _sel.nX, _sel.nY, _sel.nW, _sel.nH);
		}
		_Module.prototype.reset = function() {
			this.nTick = 0;
			this.nImgNum = 2;
			this.sImg = this.aImg[this.nImgNum];
			this.setDead(false);
		}
		return _Module;
	}) ();

	var GameRole = (function() {
		var _Module = function(o) {
			for (var i in o) { 
				this[i] = o[i];
			}
			this.reset();
		};
		extend(_Module, Origin);
		_Module.prototype.update = function() {
			var _sel = this;
			
			if(_sel.sState != "stop") {
				_sel.nTick ++;
				if(_sel.nTick % _sel.nAnimateTick == 0) {
					if(_sel.nImgNum > 0) {
						_sel.nImgNum --;
					}else{
						_sel.nImgNum = 1;
					}
					_sel.sImg = _sel.aImg[_sel.nImgNum];
				}
				if(_sel.nY < _sel.nMaxY) {
					_sel.nY += _sel.nSpeedY;
				}
				_sel.nX += _sel.nSpeedX;
			}
		}
		_Module.prototype.draw = function() {
			var _sel = this,
				ctx = _sel.ctx;
			ctx.drawImage(_sel.sImg, _sel.nX, _sel.nY);
		}
		_Module.prototype.reset = function() {
			this.nTick = 0;
			this.nX = (this.nCanvasW - this.nW)/2;
			this.nY = 0;
			this.nImgNum = 0;
			this.sImg = this.aImg[this.nImgNum];
			this.setState("stop");
		}
		_Module.prototype.testOverlap = function(oCoin, nCanvasW, nCanvasH, bAndroid) {
			var _sel = this,
				overlapLX = _sel.nX > oCoin.nX ? _sel.nX : oCoin.nX,
				overlapRX = _sel.nX + _sel.nW < oCoin.nX + oCoin.nW ? _sel.nX + _sel.nW : oCoin.nX + oCoin.nW,
				overlapTY = _sel.nY  > oCoin.nY ? _sel.nY : oCoin.nY,
				overlapBY = _sel.nY + _sel.nH < oCoin.nY + oCoin.nH ? _sel.nY + _sel.nH : oCoin.nY + oCoin.nH,
				overlapW = overlapRX - overlapLX,
				overlapH = overlapBY - overlapTY;

			if(overlapW <= 0 || overlapH <= 0) {
				return false;
			}

			if(bAndroid) {
				if(overlapW > 0 && overlapH > 0) {
					return true;
				}
			}else{
				var oCanvas = document.createElement("canvas");
				oCanvas.width = nCanvasW;
				oCanvas.height = nCanvasH;
				var ctx = oCanvas.getContext("2d");
				ctx.drawImage(_sel.sImg, 0, 0, _sel.nW, _sel.nH);
				ctx.globalCompositeOperation = "source-in";
				ctx.drawImage(oCoin.sImg, oCoin.nX - _sel.nX, oCoin.nY - _sel.nY, oCoin.nW, oCoin.nH);
				var aData = ctx.getImageData(overlapLX - _sel.nX, overlapTY - _sel.nY, overlapW, overlapH).data;
				ctx.globalCompositeOperation = "source-out";
				oCanvas = null;

				for(var i = 3; i < aData.length; i += 4){
					if(aData[i]){
						return true;
					}
				}
			}
			return false;
		}
		return _Module;
	}) ();

	var GameCoin = (function() {
		var _Module = function(o) {
			for (var i in o) { 
				this[i] = o[i];
			}
		};
		extend(_Module, Origin);
		_Module.prototype.update = function() {
			var _sel = this;
			_sel.nY -= _sel.nSpeed;
			if(_sel.nY < -_sel.nH) {
				_sel.setDead(true);
			}
		}
		_Module.prototype.draw = function() {
			var _sel = this,
				ctx = _sel.ctx;
			ctx.drawImage(_sel.sImg, _sel.nX, _sel.nY, _sel.nW, _sel.nH);
		}
		return _Module;
	}) ();

	var GameText = (function() {
		var _Module = function(o) {
			for (var i in o) { 
				this[i] = o[i];
			}
		};
		extend(_Module, Origin);
		_Module.prototype.draw = function() {
			var _sel = this,
				ctx = _sel.ctx;
			ctx.save();
			ctx.font = 'bold '+_sel.nSize+'px arial';
	        ctx.textAlign = 'left';
	        ctx.textBaseline = 'top';
	        ctx.fillStyle = '#87858f';
	        ctx.fillText(_sel.sText, _sel.nX, _sel.nY);
			ctx.restore();
		}
		_Module.prototype.setText = function(sPara) {
			var _sel = this;
			_sel.sText = sPara;
		}
		return _Module;
	}) ();

	var _kflGame = function() {
		this.bInit = false;
	}

	_kflGame.prototype = {
		init: function(o) {
			if(this.bInit) {
				this.reStartGame();
			}else{
				this.bInit = true;

				for (var i in o) {this[i] = o[i];}

				this.oCanvas = document.createElement("canvas");
				var cs = this.oCanvas.style;
				cs.position = "absolute";
				cs.left = 0;
				cs.top = 0;
				this.oCanvas.width = this.nCanvasW;
				this.oCanvas.height = this.nCanvasH;
				this.oParentEle.appendChild(this.oCanvas);
				this.ctx = this.oCanvas.getContext("2d");

				this.addEvent(this.oCanvas, "touchstart", function(e) {
					e.preventDefault();
            		e.stopPropagation();
				});

				this.nTick = this.nCoinTick =  0;

				this.aZindex1 = [];
				this.aZindex2 = [];
				this.aZindex3 = [];

				this.nCoinSpeed = 3;
				this.nRoleSpeedY = 0.98;
				this.nTimer = 30;
				this.nTimerTick = 90;
				this.nAddCoinTick = 60;
				this.nMeter = 0;
				this.nGameStep = 0;
				this.bGameOver = false;

				this.startGame();
			}
		},
		startGame: function(){
			var _sel = this, aImgs = _sel.aImgs;

			_sel.oGameInverseBg = new GameInverseBg({ctx:_sel.ctx, nX:0, nY:0, nW:640, nH:1008});
			_sel.oGameInverseNum = new GameInverseNum({
				ctx:_sel.ctx,
				aImg:[aImgs.gameNum1.oImg, aImgs.gameNum2.oImg, aImgs.gameNum3.oImg],
				nW:aImgs.gameNum1.nImgW,
				nH:aImgs.gameNum1.nImgH,
				nX:(_sel.nCanvasW - aImgs.gameNum1.nImgW)/2,
				nY:330,
				nInverseTick:40,
				callback: _sel.callbackInverse()
			});

			_sel.oGameBg1_1 = new GameBg1({
				ctx:_sel.ctx,
				sImg:aImgs.gameBg1.oImg,
				nW:aImgs.gameBg1.nImgW,
				nH:aImgs.gameBg1.nImgH,
				nX:0,
				nY:0,
				nSpeed:_sel.nCoinSpeed
			});
			_sel.oGameBg1_2 = new GameBg1({
				ctx:_sel.ctx,
				sImg:aImgs.gameBg1.oImg,
				nW:aImgs.gameBg1.nImgW,
				nH:aImgs.gameBg1.nImgH,
				nX:0,
				nY:aImgs.gameBg1.nImgH,
				nSpeed:_sel.nCoinSpeed
			});
			_sel.oGameBg2 = new GameBg2({
				ctx:_sel.ctx,
				sImg:aImgs.gameBg2.oImg,
				nW:aImgs.gameBg2.nImgW,
				nH:aImgs.gameBg2.nImgH,
				nX:0,
				nY:0
			});

			_sel.oGameRole = new GameRole({
				ctx:_sel.ctx,
				aImg:[aImgs.gameFigure1.oImg, aImgs.gameFigure2.oImg, aImgs.gameFigure3.oImg, aImgs.gameFigure4.oImg],
				nW:aImgs.gameFigure1.nImgW,
				nH:aImgs.gameFigure1.nImgH,
				nMaxY:_sel.nClientH<_sel.nCanvasH ? (_sel.nClientH-aImgs.gameFigure1.nImgH)/2 : (_sel.nCanvasH-aImgs.gameFigure1.nImgH)/2,
				nSpeedX:0,
				nSpeedY:_sel.nRoleSpeedY,
				nCanvasW:_sel.nCanvasW,
				nAnimateTick:20
			});

			_sel.oGameText1 = new GameText({ctx:_sel.ctx, nX:45, nY:60, nSize: 70, sText:_sel.nTimer});
			_sel.oGameText2 = new GameText({ctx:_sel.ctx, nX:510, nY:60, nSize: 70, sText:"00"});
			_sel.oGameText3 = new GameText({ctx:_sel.ctx, nX:78, nY:130, nSize: 40, sText:"s"});
			_sel.oGameText4 = new GameText({ctx:_sel.ctx, nX:518, nY:130, nSize: 36, sText:"mm"});

			_sel.aZindex1.push(_sel.oGameBg1_1);
			_sel.aZindex1.push(_sel.oGameBg1_2);
			_sel.aZindex1.push(_sel.oGameBg2);
			_sel.aZindex1.push(_sel.oGameRole);
			_sel.aZindex3.push(_sel.oGameText1);
			_sel.aZindex3.push(_sel.oGameText2);
			_sel.aZindex3.push(_sel.oGameText3);
			_sel.aZindex3.push(_sel.oGameText4);
			_sel.aZindex3.push(_sel.oGameInverseBg);
			_sel.aZindex3.push(_sel.oGameInverseNum);

			_sel.raf(_sel.runGame() );
		},
		reStartGame: function() {
			var _sel = this;

			if(_sel.bGameOver == false) {return;}
			_sel.aZindex2 = [];
			_sel.nTimer = 30;
			_sel.nMeter = 0;
			this.nGameStep = 0;
			_sel.bGameOver = false;

			for(var i = 0, l = _sel.aZindex1.length; i < l; i++) {
				_sel.aZindex1[i].reset();
			}
			_sel.aZindex2 = [];
			for(var i = 0, l = _sel.aZindex3.length; i < l; i++) {
				_sel.aZindex3[i].reset();
			}
			_sel.oGameText1.setText(_sel.nTimer);
			_sel.oGameText1.setState("stop");
			_sel.oGameText2.setText("00");

			_sel.raf(_sel.runGame() );
		},
		runGame: function() {
			var _sel = this;

			return function() {
				_sel.updateGame();
				_sel.drawGame();

				if(!_sel.bGameOver) {
					_sel.raf(_sel.runGame() );
				}
			};
		},
		updateGame: function() {
			var _sel = this;
			_sel.nTick ++;

			for(var i = 0, l = _sel.aZindex1.length; i < l; i++) {
				var oItem = _sel.aZindex1[i];
				if(!oItem.bDead) {
					oItem.update();
				}
			}

			for(var i = _sel.aZindex2.length - 1; i >= 0; i--) {
				var oItem = _sel.aZindex2[i];
				oItem.update();
				if(oItem.bDead) {
					_sel.aZindex2.splice(i, 1);
				}
				if(_sel.oGameRole.testOverlap(oItem, _sel.nCanvasW, _sel.nCanvasH, _sel.bAndroid) ) {
					_sel.aZindex2.splice(i, 1);
					_sel.nMeter += (Math.round(Math.random() * 4) + 1);
					(_sel.nMeter > 88) && (_sel.nMeter = 88);
					_sel.oGameText2.setText(_sel.nMeter < 10 ? '0'+_sel.nMeter : _sel.nMeter);
					_sel.oGameRole.nImgNum = 2;
					_sel.oGameRole.sImg = _sel.oGameRole.aImg[2];
				}
			}

			for(var i = 0, l = _sel.aZindex3.length; i < l; i++) {
				var oItem = _sel.aZindex3[i];
				if(!oItem.bDead) {
					oItem.update();
				}
			}

			if(_sel.nTick % _sel.nAddCoinTick == 0) {
				_sel.addGameCoin();
			}

			if(_sel.nTick % _sel.nTimerTick == 0) {
				if(_sel.oGameText1.sState == "play") {
					_sel.oGameText1.setText(--_sel.nTimer);
				}
			}

			if(_sel.oGameRole.nX <= _sel.nCanvasBorder || _sel.oGameRole.nX >= _sel.nCanvasW - _sel.oGameRole.nW - _sel.nCanvasBorder || _sel.nTimer <= 0 || _sel.nMeter >= 88) {
				_sel.gameOver();
			}
		},
		drawGame: function() {
			var _sel = this;

			_sel.ctx.clearRect(0, 0, _sel.nCanvasW, _sel.nCanvasH);

			for(var i = 0, l = _sel.aZindex1.length; i < l; i++) {
				var oItem = _sel.aZindex1[i];
				if(!oItem.bDead) {
					oItem.draw();
				}
			}

			for(var i = 0, l = _sel.aZindex2.length; i < l; i++) {
				_sel.aZindex2[i].draw();
			}

			for(var i = 0, l = _sel.aZindex3.length; i < l; i++) {
				var oItem = _sel.aZindex3[i];
				if(!oItem.bDead) {
					oItem.draw();
				}
			}
		},
		addGameCoin: function() {
			var _sel = this, sImg, nX, nY = _sel.nCanvasH, nW, nH;

			if(_sel.nGameStep == 1) {
				_sel.nCoinTick ++;
				if(_sel.nCoinTick % 2 == 0) {
					sImg = _sel.aImgs.gameCoin1.oImg;
					nW = _sel.aImgs.gameCoin1.nImgW;
					nH = _sel.aImgs.gameCoin1.nImgH;
				}else{
					sImg = _sel.aImgs.gameCoin2.oImg;
					nW = _sel.aImgs.gameCoin2.nImgW;
					nH = _sel.aImgs.gameCoin2.nImgH;
				}
				nX = Math.floor(Math.random() * (_sel.nCanvasW - nW - _sel.nCanvasBorder * 2) ) + _sel.nCanvasBorder;
				var oCoin = new GameCoin({
					ctx:_sel.ctx,
					sImg:sImg,
					nW:nW,
					nH:nH,
					nX:nX,
					nY:nY,
					nSpeed:_sel.nCoinSpeed
				});
				_sel.aZindex2.push(oCoin);
			}
		},
		callbackInverse: function() {
			var _sel = this;

			return function() {
				_sel.nGameStep = 1;
				_sel.oGameInverseBg.setDead(true);
				_sel.oGameInverseNum.setDead(true);
				_sel.oGameRole.setState("play");
				_sel.oGameText1.setState("play");
				_sel.addEvent(window, "deviceorientation", _sel.deviceOrientationHandler() );
			}
		},
		deviceOrientationHandler: function() {
			var _sel = this;

			return function(e){
				var gamma = e.gamma,
					nSpeed = gamma * Math.PI / 180;
				_sel.oGameRole.nSpeedX = nSpeed * 4;
			};
		},
		gameOver: function(){
			var _sel = this;
			_sel.bGameOver = true;
			_sel.removeEvent(window, "deviceorientation", _sel.deviceOrientationHandler());
			if(_sel.nMeter < 88) {
				_sel.oGameRole.nY -= 26;
				_sel.oGameRole.sImg = _sel.oGameRole.aImg[3];
			}
			setTimeout(function(){
				_sel.callback(_sel.nMeter);
			}, 500);
		},
		raf: function(callback) {
			var _sel = this;
			var _raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };
			_raf(callback);
		},
		eCatch: {},
		addEvent: function(o, e, func) {
			var _sel = this;
	        o.addEventListener(e, func, false);
	        _sel.eCatch[func] = func;
		},
		removeEvent: function(o, e, func) {
			var _sel = this;
			o.removeEventListener(e, _sel.eCatch[func], false);
			_sel.eCatch[func] = undefined;
		}
	}

	return new _kflGame();

})();