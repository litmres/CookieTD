
var _TD = {
	a: [],
	retina: window.devicePixelRatio || 1,
	init: function (td_board, is_debug) {
		delete this.init; 

		var i, TD = {
			version: "1.0.0 beta",
			is_debug: !!is_debug,
			is_paused: true,
			width: 16,
			height: 16, 
			show_monster_life: true, 
			fps: 0,
			exp_fps: 24, 
			exp_fps_half: 12,
			exp_fps_quarter: 6,
			exp_fps_eighth: 4,
			stage_data: {},
			defaultSettings: function () {
				return {
					step_time: 36,
					grid_size: 32 * _TD.retina, 
					padding: 10 * _TD.retina, 
					global_speed: 0.1 
				};
			},

			/**
			 * @param ob_board
			 */
			init: function (ob_board) {
				this.obj_board = TD.lang.$e(ob_board);
				this.canvas = this.obj_board.getElementsByTagName("canvas")[0];
				//this.obj_info = TD.lang.$e(ob_info);
				if (!this.canvas.getContext) return; 
				this.ctx = this.canvas.getContext("2d");
				this.monster_type_count = TD.getDefaultMonsterAttributes(); 
				this.iframe = 0;
				this.last_iframe_time = (new Date()).getTime();
				this.fps = 0;

				this.start();
			},

			
			start: function () {
				clearTimeout(this._st);
				TD.log("Start!");
				var _this = this;
				this._exp_fps_0 = this.exp_fps - 0.4; 
				this._exp_fps_1 = this.exp_fps + 0.4; 

				this.mode = "normal";
				this.eventManager.clear(); 
				this.lang.mix(this, this.defaultSettings());
				this.stage = new TD.Stage("stage-main", TD.getDefaultStageData("stage_main"));

				this.canvas.setAttribute("width", this.stage.width);
				this.canvas.setAttribute("height", this.stage.height);
				this.canvas.style.width = (this.stage.width / _TD.retina) + "px";
				this.canvas.style.height = (this.stage.height / _TD.retina) + "px";

				this.canvas.onmousemove = function (e) {
					var xy = _this.getEventXY.call(_this, e);
					_this.hover(xy[0], xy[1]);
				};
				this.canvas.onclick = function (e) {
					var xy = _this.getEventXY.call(_this, e);
					_this.click(xy[0], xy[1]);
				};

				this.is_paused = false;
				this.stage.start();
				this.step();

				return this;
			},

			/**
			 * @param cheat_code
			 *
			 * 1、more money：javascript:_TD.cheat="money+";void(0);
			 * 2、higher difficulty：javascript:_TD.cheat="difficulty+";void(0);
			 * 3、lower difficulty：javascript:_TD.cheat="difficulty-";void(0);
			 * 4、higher life：javascript:_TD.cheat="life+";void(0);
			 * 5、lower life：javascript:_TD.cheat="life-";void(0);
			 */
			checkCheat: function (cheat_code) {
				switch (cheat_code) {
					case "money+":
						this.money += 1000000;
						this.log("cheat success!");
						break;
					case "life+":
						this.life = 100;
						this.log("cheat success!");
						break;
					case "life-":
						this.life = 1;
						this.log("cheat success!");
						break;
					case "difficulty+":
						this.difficulty *= 2;
						this.log("cheat success! difficulty = " + this.difficulty);
						break;
					case "difficulty-":
						this.difficulty /= 2;
						this.log("cheat success! difficulty = " + this.difficulty);
						break;
				}
			},

			step: function () {

				if (this.is_debug && _TD && _TD.cheat) {
					this.checkCheat(_TD.cheat);
					_TD.cheat = "";
				}

				if (this.is_paused) return;

				this.iframe++;
				if (this.iframe % 50 == 0) {
					var t = (new Date()).getTime(),
						step_time = this.step_time;
					this.fps = Math.round(500000 / (t - this.last_iframe_time)) / 10;
					this.last_iframe_time = t;
					if (this.fps < this._exp_fps_0 && step_time > 1) {
						step_time--;
					} else if (this.fps > this._exp_fps_1) {
						step_time++;
					}

					this.step_time = step_time;
				}
				if (this.iframe % 2400 == 0) TD.gc();

				this.stage.step();
				this.stage.render();

				var _this = this;
				this._st = setTimeout(function () {
					_this.step();
				}, this.step_time);
			},

			/**
			 * 
			 * @param e
			 */
			getEventXY: function (e) {
				var wra = TD.lang.$e("wrapper"),
					x = e.clientX - wra.offsetLeft - this.canvas.offsetLeft + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
					y = e.clientY - wra.offsetTop - this.canvas.offsetTop + Math.max(document.documentElement.scrollTop, document.body.scrollTop);

				return [x * _TD.retina, y * _TD.retina];
			},

			/**
			 * 
			 * @param x
			 * @param y
			 */
			hover: function (x, y) {
				this.eventManager.hover(x, y);
			},

			/**
			 * 
			 * @param x
			 * @param y
			 */
			click: function (x, y) {
				this.eventManager.click(x, y);
			},

			/**
			 * 
			 * @param v {Boolean}
			 */
			mouseHand: function (v) {
				this.canvas.style.cursor = v ? "pointer" : "default";
			},

			/**
			 *
			 * @param txt
			 */
			log: function (txt) {
				this.is_debug && window.console && console.log && console.log(txt);
			},

			gc: function () {
				if (window.CollectGarbage) {
					CollectGarbage();
					setTimeout(CollectGarbage, 1);
				}
			}
		};

		for (i = 0; this.a[i]; i++) {
			this.a[i](TD);
		}
		delete this.a;

		TD.init(td_board);
	}
};
