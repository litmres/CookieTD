/*
 * Copyright (c) 2011.
 *
 * Author: oldj <oldj.wu@gmail.com>
 * Blog: http://oldj.net/
 *
 * Last Update: 2011/1/10 5:22:52
 */

//Modified by CookieJarApps/CookieGames
// _TD.a.push begin
_TD.a.push(function (TD) {

	// grid 
	var grid_obj = {
		_init: function (cfg) {
			cfg = cfg || {};
			this.map = cfg.map;
			this.scene = this.map.scene;
			this.mx = cfg.mx;
			this.my = cfg.my;
			this.width = TD.grid_size;
			this.height = TD.grid_size;
			this.is_entrance = this.is_exit = false;
			this.passable_flag = 1;
			this.build_flag = 1;
			this.building = null;
			this.caculatePos();
		},


		caculatePos: function () {
			this.x = this.map.x + this.mx * TD.grid_size;
			this.y = this.map.y + this.my * TD.grid_size;
			this.x2 = this.x + TD.grid_size;
			this.y2 = this.y + TD.grid_size;
			this.cx = Math.floor(this.x + TD.grid_size / 2);
			this.cy = Math.floor(this.y + TD.grid_size / 2);
		},


		checkBlock: function () {
			if (this.is_entrance || this.is_exit) {
				this._block_msg = TD._t("entrance_or_exit_be_blocked");
				return true;
			}

			var is_blocked,
				_this = this,
				fw = new TD.FindWay(
					this.map.grid_x, this.map.grid_y,
					this.map.entrance.mx, this.map.entrance.my,
					this.map.exit.mx, this.map.exit.my,
					function (x, y) {
						return !(x == _this.mx && y == _this.my) && _this.map.checkPassable(x, y);
					}
				);

			is_blocked = fw.is_blocked;

			if (!is_blocked) {
				is_blocked = !!this.map.anyMonster(function (obj) {
					return obj.chkIfBlocked(_this.mx, _this.my);
				});
				if (is_blocked)
					this._block_msg = TD._t("monster_be_blocked");
			} else {
				this._block_msg = TD._t("blocked");
			}

			return is_blocked;
		},

		/**
		 * @param building_type {String}
		 */
		buyBuilding: function (building_type) {
			var cost = TD.getDefaultBuildingAttributes(building_type).cost || 0;
			if (TD.money >= cost) {
				TD.money -= cost;
				this.addBuilding(building_type);
			} else {
				TD.log(TD._t("not_enough_money", [cost]));
				this.scene.panel.balloontip.msg(TD._t("not_enough_money", [cost]), this);
			}
		},

		/**
		 * @param building_type {String}
		 */
		addBuilding: function (building_type) {
			if (this.building) {
				this.removeBuilding();
			}

			var building = new TD.Building("building-" + building_type + "-" + TD.lang.rndStr(), {
				type: building_type,
				step_level: this.step_level,
				render_level: this.render_level
			});
			building.locate(this);

			this.scene.addElement(building, this.step_level, this.render_level + 1);
			this.map.buildings.push(building);
			this.building = building;
			this.build_flag = 2;
			this.map.checkHasWeapon();
			if (this.map.pre_building)
				this.map.pre_building.hide();
		},

		removeBuilding: function () {
			if (this.build_flag == 2)
				this.build_flag = 1;
			if (this.building)
				this.building.remove();
			this.building = null;
		},

		/**
		 * @param monster
		 */
		addMonster: function (monster) {
			monster.beAddToGrid(this);
			this.map.monsters.push(monster);
			monster.start();
		},

		/**
		 * @param show {Boolean}
		 */
		hightLight: function (show) {
			this.map.select_hl[show ? "show" : "hide"](this);
		},

		render: function () {
			var ctx = TD.ctx,
				px = this.x + 0.5,
				py = this.y + 0.5;


			if (this.is_hover) {
				ctx.fillStyle = "#0a0aff0f";
				ctx.beginPath();
				ctx.fillRect(px, py, this.width, this.height);
				ctx.closePath();
				ctx.fill();
			}

			if (this.passable_flag == 0) {
				ctx.fillStyle = "#fcc";
				ctx.beginPath();
				ctx.fillRect(px, py, this.width, this.height);
				ctx.closePath();
				ctx.fill();
			}


			if (this.is_entrance || this.is_exit) {
				ctx.lineWidth = 1;
				ctx.fillStyle = "#fff";
				ctx.beginPath();
				ctx.fillRect(px, py, this.width, this.height);
				ctx.closePath();
				ctx.fill();

				ctx.strokeStyle = "#666";
				ctx.fillStyle = this.is_entrance ? "#b19cd9" : "#80cee1";
				ctx.beginPath();
				ctx.arc(this.cx, this.cy, TD.grid_size * 0.325, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}

			ctx.strokeStyle = "#eee";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.strokeRect(px, py, this.width, this.height);
			ctx.closePath();
			ctx.stroke();
		},


		onEnter: function () {
			if (this.map.is_main_map && TD.mode == "build") {
				if (this.build_flag == 1) {
					this.map.pre_building.show();
					this.map.pre_building.locate(this);
				} else {
					this.map.pre_building.hide();
				}
			} else if (this.map.is_main_map) {
				var msg = "";
				if (this.is_entrance) {
					msg = TD._t("entrance");
				} else if (this.is_exit) {
					msg = TD._t("exit");
				} else if (this.passable_flag == 0) {
					msg = TD._t("_cant_pass");
				} else if (this.build_flag == 0) {
					msg = TD._t("_cant_build");
				}

				if (msg) {
					this.scene.panel.balloontip.msg(msg, this);
				}
			}
		},


		onOut: function () {
			if (this.scene.panel.balloontip.el == this) {
				this.scene.panel.balloontip.hide();
			}
		},

		onClick: function () {
			if (this.scene.state != 1) return;

			if (TD.mode == "build" && this.map.is_main_map && !this.building) {
				if (this.checkBlock()) {
					this.scene.panel.balloontip.msg(this._block_msg, this);
				} else {
					this.buyBuilding(this.map.pre_building.type);
				}
			} else if (!this.building && this.map.selected_building) {
				this.map.selected_building.toggleSelected();
				this.map.selected_building = null;
			}
		}
	};

	/**
	 * @param id {String}
	 * @param cfg {object}
	 */
	TD.Grid = function (id, cfg) {
		cfg.on_events = ["enter", "out", "click"];

		var grid = new TD.Element(id, cfg);
		TD.lang.mix(grid, grid_obj);
		grid._init(cfg);

		return grid;
	};

}); // _TD.a.push end
