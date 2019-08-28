// mercury
// smaller version of smge
// remember to be kind

'use strict';

Math.clamp = function(a, b, c) {
	return Math.max(b, Math.min(c, a));
}

export class Screen {
	constructor(options) {
		console.log('instantiating Screen');
		if (!options) {
			options = {scale: {}};
		}
		this.mode = options.mode || 'native';
		this.exact_aspect = options.exact_ascpect || true;
		this.width = options.width || 1;
		this.height = options.height || 1;
		this.half_width = this.width / 2;
		this.half_height = this.height / 2;
		this.scale = {
			x: options.scale.x || 1,
			y: options.scale.y || 1,
		};
		this.is_fullscreen = false;
		this.color = options.color || '#111111';
		this.canvas = document.createElement('canvas'),
		this.ctx = this.canvas.getContext('2d');
		
		this.resize(options.width, options.height);
		// no default mouse input
		this.canvas.onmousedown = e => {
			e.preventDefault();
		};
		// hide cursor
		this.canvas.style.cursor = 'none';
		// fullscreen and pointer lock
		this.canvas.requestFullscreen =
			this.canvas.requestFullScreen ||
			this.canvas.webkitRequestFullscreen ||
			this.canvas.mozRequestFullScreen ||
			this.canvas.msRequestFullscreen ||
			function() {
				console.log('no canvas fullscreen request api');
			};
		document.exitFullscreen =
			document.exitFullScreen ||
			document.webkitExitFullscreen ||
			document.mozCancelFullScreen ||
			document.msExitFullscreen ||
			function() {
				console.log('no cancel fullscreen api');
			};
		this.canvas.requestPointerLock =
			this.canvas.requestPointerLock ||
			this.canvas.webkitRequestPointerLock ||
			this.canvas.mozRequestPointerLock || 
			function() {
				console.log('no pointer lock request api');
			};
		document.exitPointerLock =
			document.exitPointerLock ||
			document.webkitExitPointerLock ||
			document.mozExitPointerLock ||
			function() {
				console.log('no exit pointer lock api');
			};
		// fullscreen listener
		this.canvas.onfullscreenchange = e => {
			console.log('fullscreen state change');
			return;
			console.log('checking fullscreen state');
			let fullscreen_element =
				document.fullscreenElement ||
				document.webkitFullscreenElement ||
				document.mozFullscreenElement ||
				document.msFullscreenElement;
		};
		// resize listener
		window.addEventListener('resize', e => {
			console.log(
				'window resize:'
					+ document.documentElement.clientWidth
					+ 'x'
					+ document.documentElement.clientHeight
			);
			this.refresh();
		});
	}
	resize(width, height) {
		this.width = width;
		this.height = height;
		this.half_width = this.width / 2;
		this.half_height = this.height / 2;
		this.refresh();
		this.canvas.dispatchEvent(new Event('resize'));
	}
	set_mode(mode) {
		this.mode = mode;
		this.refresh();
	}
	refresh() {
		console.log('refreshing screen properties');
		switch (this.mode) {
			case 'native':
				this.ctx.scale(
					this.scale.x,
					this.scale.y
				);
				this.canvas.width = this.width * this.scale.x;
				this.canvas.height = this.height * this.scale.y;
				return;
			case 'contain':
			case 'cover':
				let client_w = document.documentElement.clientWidth;
				let client_h = document.documentElement.clientHeight;
				let client_ratio = client_w / client_h;
				let screen_ratio = this.width / this.height;
				// console.log('client ratio: ' + client_ratio + ', screen ratio: ' + screen_ratio);
				let use_height = false;
				if ('contain' == this.mode) {
					// scale to touch screen longest dimension to client
					if (screen_ratio < client_ratio) {
						use_height = true;
					}
				}
				else if ('cover' == this.mode) {
					// scale to touch screen shortest dimension to client
					if (screen_ratio > client_ratio) {
						use_height = true;
					}
				}
				if (use_height) {
					console.log('touching screen height to client vertical edges');
					this.canvas.height = client_h;
					this.canvas.width = client_h * screen_ratio;
				}
				else {
					console.log('touching screen width to client horizontal edges');
					this.canvas.width = client_w;
					this.canvas.height = client_w / screen_ratio;
				}
				if (this.exact_aspect) {
					let multiple = 1;
					while (
						multiple * this.width < this.canvas.width
						&& multiple * this.height < this.canvas.height
					) {
						multiple += 1;
					}
					multiple -= 1;
					if (0 < multiple) {
						this.canvas.width = this.width * multiple;
						this.canvas.height = this.height * multiple;
					}
				}
				this.scale.x = this.canvas.width / this.width;
				this.scale.y = this.scale.x;
				this.ctx.scale(
					this.scale.x,
					this.scale.y
				);
				return;
			case 'stretch':
				this.canvas.width = document.documentElement.clientWidth;
				this.canvas.height = document.documentElement.clientHeight;
				this.scale.x = this.canvas.width / this.width;
				this.scale.y = this.canvas.height / this.height;
				this.ctx.scale(
					this.scale.x,
					this.scale.y
				);
				return;
		}
	}
	clear() {
		if ('transparent' == this.color) {
			this.ctx.clearRect(
				0,
				0,
				this.canvas.width,
				this.canvas.height
			);
			return;
		}
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);
	}
	blit(image, sx, sy, swidth, sheight, x, y, width, height) {
		// copy world canvas to screen
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.drawImage(
			image,
			sx,
			sy,
			swidth,
			sheight,
			x,
			y,
			width,
			height
		);
	}
	blit_world(world) {
		// copy world canvas to screen
		this.ctx.imageSmoothingEnabled = false;
		let sx = world.focus.x - this.half_width / world.zoom;
		let sy = world.focus.y - this.half_height / world.zoom;
		this.ctx.drawImage(
			world.canvas,
			sx,
			sy,
			this.width / world.zoom,
			this.height / world.zoom,
			0,
			0,
			this.width,
			this.height
		);
	}
	toggle_fullscreen() {
		console.log('toggling fullscreen');
		if (document.fullscreenElement && document.fullscreenElement == this.canvas) {
			console.log('attempting to leave fullscreen');
			document.exitFullscreen();
			document.exitPointerLock();
			//this.refresh();
		}
		else {
			console.log('attempting to enter fullscreen');
			document.exitFullscreen();
			this.canvas.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			this.canvas.requestPointerLock();
			//this.refresh();
		}
	}
}

export class Input {
	constructor(bindings) {
		this.controllers = [
			{
				left: 'ArrowLeft',
				up: 'ArrowUp',
				right: 'ArrowRight',
				down: 'ArrowDown',
				b: 'z',
				a: 'x',
				y: 'a',
				x: 's',
				start: 'Enter',
				select: 'Shift',
				l: 'q',
				r: 'r',
				lb: 'w',
				rb: 'e',
			},
		];
		this.alias = {
			'lmb': 'm1',
			'rmb': 'm3',
		};
		this.fullscreen = 'F11';
		this.cursor = {
			virtual: {
				x: 0,
				y: 0,
			},
			screen: {
				x: 0,
				y: 0,
			},
		};
		this.accumulated_mousewheel = 0;
		this.mousewheel = 0;
		this.attached = true;
		this.state = {
			pressed: [], // buttons pressed this frame
			down: [], // buttons down this frame
			released: [], // buttons released this frame
			mousewheel: 0, // mousewheel state this frame
			current: {
				pressed: [], // buttons pressed since last read
				down: [], // buttons currently down (including buttons released since last read and not including buttons pressed since last read)
				released: [], // buttons released since last read
				mousewheel: 0, // accumulated mousewheel since last read
			},
		};
		let supports_passive = false;
		try {
			let opts = Object.defineProperty({}, 'passive', {
				get: function() {
					supports_passive = true;
				}
			});
			window.addEventListener('testPassive', null, opts);
			window.removeEventListener('testPassive', null, opts);
		} catch (e) {}
		// input presses
		document.addEventListener('keydown', e => {
			if (!this.attached) {
				return;
			}
			if (-1 == this.state.current.pressed.indexOf(e.key)) {
				this.state.current.pressed.push(e.key);
			}
			if (-1 == this.state.current.down.indexOf(e.key)) {
				this.state.current.down.push(e.key);
			}
		});
		document.addEventListener('mousedown', e => {
			if (!this.attached) {
				return;
			}
			let button = 'm' + (e.button + 1);
			if (-1 == this.state.current.pressed.indexOf(button)
			) {
				this.state.current.pressed.push(button);
			}
			if (-1 == this.state.current.down.indexOf(button)
			) {
				this.state.current.down.push(button);
			}
		});
		screen.canvas.addEventListener('touchstart', e => {
			if (!this.attached) {
				return;
			}
			e.preventDefault();
			/** /
			// touch start as mouse1 down
			if (-1 == this.state.current.pressed.indexOf('m1')
			) {
				this.state.current.pressed.push('m1');
			}
			/**/
			this.touchmove(e);
			// touch start as touch down
			if (-1 == this.state.current.pressed.indexOf('touch')) {
				this.state.current.pressed.push('touch');
			}
			if (-1 == this.state.current.down.indexOf('touch')) {
				this.state.current.down.push('touch');
			}
		});//, supports_passive ? {passive: true} : false);
		// input releases
		document.addEventListener('keyup', e => {
			e.preventDefault();
			if (!this.attached) {
				return;
			}
			if (-1 == this.state.current.released.indexOf(e.key)) {
				this.state.current.released.push(e.key);
			}
		});
		document.addEventListener('mouseup', e => {
			if (!this.attached) {
				return;
			}
			let button = 'm' + (e.button + 1);
			if (-1 == this.state.current.released.indexOf(button)) {
				this.state.current.released.push(button);
			}
		});
		screen.canvas.addEventListener('touchend', e => {
			if (!this.attached) {
				return;
			}
			e.preventDefault();
			let index = null;
			// touch end as touch up
			if (-1 == this.state.current.released.indexOf('touch')) {
				this.state.current.released.push('touch');
			}
		});//, supports_passive ? {passive: true} : false);
		// mousewheel
		document.addEventListener('wheel', e => {
			if (!this.attached) {
				return;
			}
			this.state.current.mousewheel += Math.sign(e.deltaY);
		});
		// movement
		screen.canvas.addEventListener('mousemove', e => {
			if (!this.attached) {
				return;
			}
			this.mousemove(e);
		});
		screen.canvas.addEventListener('touchmove', e => {
			if (!this.attached) {
				return;
			}
			e.preventDefault();
			this.touchmove(e);
		});//, supports_passive ? {passive: true} : false);
		document.oncontextmenu = e => {
			e.preventDefault();
		};
	}
	mousemove(e) {
		// locked
		if (
			document.pointerLockElement
			&& (
				document.pointerLockElement === screen.canvas
				|| document.webkitPointerLockElement === screen.canvas
				|| document.mozPointerLockElement === screen.canvas
			)
		) {
			let movement_x = e.movementX || e.webkitMovementX || e.mozMovementX || 0;
			let movement_y = e.movementY || e.webkitMovementY || e.mozMovementY || 0;
			// console.log('pointer lock ' + e.movementX + ',' + e.movementY);
			// console.log('last virtual: ' + this.cursor.virtual.x + ',' + this.cursor.virtual.y);
			this.cursor.virtual.x += movement_x;
			this.cursor.virtual.y += movement_y;
			this.cursor.virtual.x = Math.clamp(
				this.cursor.virtual.x,
				0,
				screen.canvas.width
			);
			this.cursor.virtual.y = Math.clamp(
				this.cursor.virtual.y,
				0,
				screen.canvas.height
			);
			this.cursor.screen.x = this.cursor.virtual.x / screen.scale.x;
			this.cursor.screen.y = this.cursor.virtual.y / screen.scale.y;
			// console.log('movement: ' + e.movementX + ',' + e.movementY + '\nvirtual mouse at ' + this.cursor.virtual.x + ',' + this.cursor.virtual.y + '\ncanvas size: ' + screen.display.canvas.width + 'x' + screen.display.canvas.height + '\ncanvas scale: ' + screen.scale.x + ', ' + screen.scale.y + '\nlocked mouse at ' + this.cursor.screen.x + ',' + this.cursor.screen.y);
		}
		// unlocked
		else {
			this.cursor.screen.x = Math.clamp(
				e.pageX - screen.canvas.offsetLeft,
				0,
				screen.canvas.width
			) / screen.scale.x;
			this.cursor.screen.y = Math.clamp(
				e.pageY - screen.canvas.offsetTop,
				0,
				screen.canvas.height
			) / screen.scale.y;
			// console.log('unlocked mouse at screen ' + this.cursor.screen.x + ',' + this.cursor.screen.y);
		}
	}
	touchmove(e) {
		if (document.fullscreenElement && document.fullscreenElement === screen.canvas) {
			let offset_left = (window.innerWidth - screen.canvas.width) / 2;
			let offset_top = (window.innerHeight - screen.canvas.height) / 2;
			this.cursor.screen.x = Math.clamp(
				e.touches[0].pageX - offset_left,
				0,
				screen.canvas.width
			) / screen.scale.x;
			this.cursor.screen.y = Math.clamp(
				e.touches[0].pageY - offset_top,
				0,
				screen.canvas.height
			) / screen.scale.y;
		}
		else {
			this.cursor.screen.x = Math.clamp(
				e.touches[0].pageX - screen.canvas.offsetLeft,
				0,
				screen.canvas.width
			) / screen.scale.x;
			this.cursor.screen.y = Math.clamp(
				e.touches[0].pageY - screen.canvas.offsetTop,
				0,
				screen.canvas.height
			) / screen.scale.y;
			// console.log('unlocked touch at screen ' + this.cursor.screen.x + ',' + this.cursor.screen.y);
		}
	}
	clear_state() {
		this.state.pressed = [];
		this.state.down = [];
		this.state.released = [];
		this.current.pressed = [];
		this.current.down = [];
		this.current.released = [];
	}
	aliased(key) {
		if (this.alias[key]) {
			return this.alias[key];
		}
		return key;
	}
	pressed(key) {
		if (-1 != this.state.pressed.indexOf(key)) {
			return true;
		}
		return false;
	}
	down(key) {
		if (-1 != this.state.down.indexOf(key)) {
			return true;
		}
		return false;
	}
	released(key) {
		if (-1 != this.state.released.indexOf(key)) {
			return true;
		}
		return false;
	}
	read_state() {
		this.state.pressed = this.state.current.pressed.slice();
		this.state.current.pressed = [];
		this.state.released = this.state.current.released.slice();
		this.state.current.released = [];
		this.state.down = this.state.current.down.slice();
		// should be able to be pressed down and released on same frame
		// if key was pressed and released between frames
		for (let i in this.state.released) {
			let key = this.state.released[i];
			let index = this.state.current.down.indexOf(key);
			if (-1 != index) {
				this.state.current.down.splice(index, 1);
			}
		}
		this.state.mousewheel = this.state.current.mousewheel;
		this.state.current.mousewheel = 0;
	}
	read_world_cursor(world) {
		return {
			x: this.cursor.screen.x + world.offset.x,
			y: this.cursor.screen.y + world.offset.y,
		}
	}
}

export class Timescale {
	constructor(scale) {
		console.log('instantiating Timescale');
		this.scale = scale;
		this.time = 0;
		this.last_realtime = new Date().getTime();
		this.delta = 0;
	}
	update(current_realtime) {
		if (this.scale < 0) {
			this.scale = 0;
			return;
		}
		if (!current_realtime) {
			current_realtime = new Date().getTime();
		}
		this.delta = this.scale * (current_realtime - this.last_realtime);
		this.time += this.delta;
		this.last_realtime = current_realtime;
	}
}

export class Mg {
	constructor(options) {
		//TODO console image
		//TODO console.log('%c ', 'font-size: 0; padding: 32px; background: url() no-repeat;');
		console.log('instantiating mg');
		console.log('https://github.com/secretisdead/mg');
		this.version = '0.0.1';
		this.ready = false;
		// options
		this.initial_cartridge = options.initial_cartridge || null;
		this.interaction_required = options.interaction_required || false;
		this.interaction_image = options.interaction_image || null;
		this.interaction_start_delay_ms = options.interaction_start_delay_ms || 50;
		this.start_fullscreen = options.start_fullscreen || false;
		this.on_ready = options.on_ready || null;
		// globally available mg components
		window.mg = this;
		window.screen = new Screen;
		window.input = new Input;
		// debug
		this.debug = false;
		this.fps = {
			measure_period_ms: 500,
			last: 0,
			next: 0,
			accumulated: 0,
			current: 0,
		};
		// timestamps
		this.start_time = 0;
		this.system_time = 0;
		this.run_duration = 0;
		this.hidden_time = 0;
		this.hidden_duration = 0;
		// handle page hiding
		this.on_hide = null;
		document.addEventListener('visibilitychange', () => {
			//TODO this is kind of buggy maybe?
			//TODO all the hidden handler stuff behaves strangely
			//TODO when the page is hidden for very long periods of time
			return;
			if (document.hidden) {
				this.hidden_time = new Date().getTime();
				if (this.on_hide && 'function' === typeof this.on_hide) {
					this.on_hide();
				}
				return;
			}
			this.hidden_duration += new Date().getTime() - this.hidden_time;
		});
		// framerate and ticks (hardcoded to 60fps for now)
		this.target_fps = 60;
		this.ms_per_frame = Math.floor(1000 / this.target_fps);
		this.next_tick = 0;
		// timescales
		this.timescales = {
			real: new Timescale(1),
			default: new Timescale(1),
		};
		// waiting actions
		this.waiting_actions = [];
		// await interaction or start immediately
		if (this.interaction_required) {
			this.await_interaction();
		}
		else {
			this.start();
		}
	}
	update() {
		// update time
		this.system_time = new Date().getTime();
		this.run_duration = this.system_time - this.start_time - this.hidden_duration;
		if (this.system_time < this.next_tick) {
			return;
		}
		this.next_tick = this.system_time + this.ms_per_frame;
		// update timescales
		for (let i in this.timescales) {
			this.timescales[i].update(this.system_time);
		}
		if (!this.cartridge) {
			return;
		}
		// update input
		input.read_state();
		// fullscreen
		if (input.pressed(input.fullscreen)) {
			screen.toggle_fullscreen();
		}
		// actions waiting
		if (0 < this.waiting_actions.length) {
			let waiting_actions_to_remove = [];
			for (let i in this.waiting_actions) {
				let waiting_action = this.waiting_actions[i];
				waiting_action.delay -= waiting_action.timescale.delta;
				if (0 >= waiting_action.delay) {
					waiting_action.cb();
					waiting_actions_to_remove.push(waiting_action);
				}
			}
			for (let i in waiting_actions_to_remove) {
				let waiting_action = waiting_actions_to_remove[i];
				this.waiting_actions.splice(
					this.waiting_actions.indexOf(waiting_action),
					1
				);
			}
		}
		// update cartridge
		if (this.cartridge) {
			this.cartridge.update();
		}
	}
	draw() {
		screen.clear();
		if (this.cartridge) {
			this.cartridge.draw();
		}
		this.draw_fps();
	}
	draw_fps() {
		// fps
		if (!this.debug) {
			return;
		}
		this.fps.accumulated += 1;
		if (this.system_time >= this.fps.next) {
			let elapsed = this.system_time - this.fps.last;
			this.fps.current = (this.fps.accumulated / elapsed) * 1000;
			this.fps.accumulated = 0;
			this.fps.last = this.system_time;
			this.fps.next = this.system_time + this.fps.measure_period_ms;
		}

		let label_offset = {
			x: 4,
			y: 4,
		};
		let color = '#808080bf';
		let font = '20px Tahoma';
		let line_height = 20;

		screen.ctx.fillStyle = color;
		screen.ctx.font = font;
		screen.ctx.fillText(
			Math.round(mg.fps.current),
			label_offset.x,
			label_offset.y + line_height
		);
	}
	load(cartridge) {
		// mg isn't ready
		if (!this.ready) {
			console.log('ensure mg is ready before loading a cartridge');
			console.log('(probably attempted to load a cartridge before interacting with page with interaction_required set)');
			return;
		}
		console.log('start loading cartridge ' + cartridge.constructor.name);
		cartridge.loaded_resources = 0;
		if (Object.keys(cartridge.resources).length) {
			console.log('cartridge contained resources to load');
			for (let id in cartridge.resources) {
				console.log('loading cartridge resource ' + id);
				let resource = cartridge.resources[id];
				switch (resource.type) {
					case 'image':
						let image = document.createElement('img');
						image.addEventListener(
							'load',
							() => {
								cartridge.loaded_resources += 1;
								this.resources_check(cartridge);
							}
						);
						image.src = resource.url;
						cartridge.resources[id] = image;
						break;
					case 'audio':
						let audio = new Audio;
						audio.internal = 1;
						audio.setAttribute('data-id', id);
						// run check and remove listener after
						// canplaythrough fires the first time during audio loading
						let listener = e => {
							this.resources_check(cartridge);
							let audio = e.currentTarget;
							audio.removeEventListener('canplaythrough', listener);
							cartridge.loaded_resources += 1;
							this.resources_check(cartridge);
						};
						audio.addEventListener('canplaythrough', listener);
						audio.volume = 0.5;
						audio.src = resource.url;
						cartridge.resources[id] = audio;
						break;
					case 'json':
						let xhr = new XMLHttpRequest();
						xhr.id = id;
						xhr.onreadystatechange = () => {
							if (xhr.readyState == XMLHttpRequest.DONE) {
								if (xhr.status != 200) {
									console.log('there was an error fetching json resource');
								}
								cartridge.resources[xhr.id] = JSON.parse(xhr.responseText);
								cartridge.loaded_resources += 1;
								this.resources_check(cartridge);
							}
						};
						xhr.open('get', resource.url, true);
						xhr.send();
						break;						
					default:
						cartridge.loaded_resources += 1;
						break;
				}
			}
			return;
		}
		this.resources_check(cartridge);
	}
	resources_check(cartridge) {
		if (cartridge.loaded_resources != Object.keys(cartridge.resources).length) {
			console.log('waiting to load remaining resources (currently ' + cartridge.loaded_resources + '/' + Object.keys(cartridge.resources).length + ')');
			return;
		}
		console.log('finish loading cartridge ' + cartridge.constructor.name);
		this.cartridge = cartridge;
		if (this.cartridge.on_load && 'function' === typeof this.cartridge.on_load) {
			this.cartridge.on_load();
		}
	}
	eject() {
		if (!this.cartridge) {
			console.log('no cartridge loaded');
			return;
		}
		console.log('ejected current cartridge');
		this.cartridge = null;
	}
	add_waiting_action(cb, delay, timescale) {
		delay = delay || 0;
		if (!timescale) {
			setTimeout(cb, delay);
			return;
		}
		this.waiting_actions.push({
			delay: delay,
			timescale: timescale,
			cb: cb,
		});
	}
	stop() {
		this.stopped = true;
		if (this.interval) {
			clearInterval(this.interval());
		}
	}
	await_interaction() {
		screen.canvas.style.cursor = 'pointer';
		let on_interaction = e => {
			console.log('on interaction');
			screen.canvas.style.cursor = 'none';
			screen.canvas.removeEventListener('click', on_interaction);
			screen.canvas.removeEventListener('touchstart', on_interaction);
			document.removeEventListener('keydown', on_interaction);
			this.add_waiting_action(() => {
				this.start();
			}, this.interaction_start_delay_ms);
		};
		screen.canvas.addEventListener('click', on_interaction);
		screen.canvas.addEventListener('touchstart', on_interaction);
		document.addEventListener('keydown', on_interaction);
		if (!this.interaction_image) {
			// set default awaiting interaction image dimensions based on viewport
			let width = window.innerWidth;
			let height = window.innerHeight;
			// create default awaiting interaction image
			let c = document.createElement('canvas');
			c.width = width;
			c.height = height;
			let ctx = c.getContext('2d');
			let short_edge = Math.min(width, height);
			let tri_height = short_edge / 4;
			let half_tri_height = tri_height / 2;
			let tri_width = half_tri_height + half_tri_height / 2;
			let half_tri_width = tri_width / 2;
			ctx.fillStyle = '#ffffff';
			ctx.beginPath();
			ctx.moveTo(width / 2 + half_tri_width, height / 2);
			ctx.lineTo(width / 2 - half_tri_width, height / 2 - half_tri_height);
			ctx.lineTo(width / 2 - half_tri_width, height / 2 + half_tri_height);
			ctx.closePath();
			ctx.fill();
			this.interaction_image = c;
		}
		screen.resize(this.interaction_image.width, this.interaction_image.height);
		screen.ctx.drawImage(
			this.interaction_image,
			0,
			0,
			this.interaction_image.width,
			this.interaction_image.height,
			0,
			0,
			this.interaction_image.width,
			this.interaction_image.height
		);
	}
	start() {
		console.log('start');
		if (this.start_fullscreen) {
			this.add_waiting_action(() => {
				screen.toggle_fullscreen();
			}, 100);
		}
		this.start_time = new Date().getTime();
		setInterval(() => {
			if (this.stopped) {
				return;
			}
			this.update();
		}, 1000 / 60);
		if (this.on_start && 'function' == typeof this.on_start) {
			this.on_start();
		}
		let requestAnimationFrame =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			false;
		if (!requestAnimationFrame) {
			this.interval = setInterval(this.draw, 1000 / 60);
			return;
		}
		let cb = () => {
			if (this.stopped) {
				return;
			}
			this.draw();
			requestAnimationFrame(cb);
		};
		cb();
		this.ready = true;
		if (this.on_ready && 'function' === typeof this.on_ready) {
			this.on_ready();
		}
		if (this.initial_cartridge) {
			this.load(this.initial_cartridge);
		}
	}
}

export class Cartridge {
	constructor() {
		this.resources = {};
	}
	on_load() {}
	update() {}
	draw() {}
}

export class World {
	constructor(width, height, zoom) {
		this.canvas = document.createElement('canvas');
		this.width = 1;
		this.height = 1;
		this.zoom = 1;
		this.focus = {
			x: 0,
			y: 0,
		};
		this.offset = {
			x: 0,
			y: 0,
		};
		this.apparent_screen_width = screen.width;
		this.apparent_screen_height = screen.height;
		this.resize(width, height, zoom);
		this.ctx = this.canvas.getContext('2d');
		this.entity_manager = new EntityManager(this);
		this.bound_manager = new BoundManager(this.entity_manager);
		this.set_apparent_screen_dimensions();
		// update the apparent screen dimensions if the screen is resized after creation
		screen.canvas.addEventListener('resize', () => {
			this.set_apparent_screen_dimensions();
		});
	}
	set_apparent_screen_dimensions() {
		this.apparent_screen_width = screen.width / this.zoom;
		this.apparent_screen_height = screen.height / this.zoom;
	}
	resize(width, height, zoom) {
		this.width = width || 1;
		this.height = height || 1;
		this.zoom = zoom || 1;
		this.set_apparent_screen_dimensions();
		this.set_focus(this.focus.x, this.focus.y);
		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}
	clear() {
		this.ctx.clearRect(
			0,
			0,
			this.width,
			this.height
		);
		//this.ctx.fillRect(0, 0, this.width, this.height);
	}
	set_focus(x, y) {
		this.focus.x = x;
		this.focus.y = y;
		this.offset.x = this.focus.x - screen.half_width / this.zoom;
		this.offset.y = this.focus.y - screen.half_height / this.zoom;
	}
	update() {
		this.entity_manager.update();
	}
	draw() {
		this.entity_manager.draw();
	}
	draw_debug() {
		if (!mg.debug) {
			return;
		}
		this.ctx.lineWidth = 1;
		let label_offset = {
			x: 4,
			y: 4,
		};
		let line_spacing = 1;
		let colors = {
			//info: '#808080',
			transform: '#ff8000',
			entity: '#bfbfbf',
			sprite: '#00ffff',
			bound: '#808080',
			bound_on: '#0000ff',
			bound_off: '#ff0000',
			bound_during: '#ffffff',
		};
		let fonts = {
			//info: '10px Tahoma',
			transform: '9px Tahoma',
			entity: '10px Tahoma',
		};
		let line_heights = {
			transform: 9,
			entity: 10,
		};

		this.entity_manager.foreach_sorted_entity(entity => {
			if (!entity.transform || 'Glyph' == entity.constructor.name) {
				return;
			}
			this.ctx.fillStyle = colors.transform;
			this.ctx.font = fonts.transform;
			this.ctx.fillText(
				Math.round(entity.transform.x) + ',' + Math.round(entity.transform.y) + ',' + entity.priority,
				entity.transform.x + label_offset.x,
				entity.transform.y + label_offset.y
			);

			if (entity.name) {
				this.ctx.fillStyle = colors.entity;
				this.ctx.font = fonts.transform;
				this.ctx.fillText(
					entity.name,
					entity.transform.x + label_offset.x,
					entity.transform.y + label_offset.y + line_heights.transform + line_spacing
				);
			}

			// sprite
			if (entity.sprite) {
				this.ctx.strokeStyle = colors.sprite;
				this.ctx.strokeRect(
					entity.transform.x - entity.sprite.origin.x * entity.transform.scale.x,
					entity.transform.y - entity.sprite.origin.y * entity.transform.scale.y,
					entity.sprite.width * entity.transform.scale.x,
					entity.sprite.height * entity.transform.scale.y
				);
			}
			// bounds
			if (entity.bounds) {
				for (let i in entity.bounds) {
					let bound = entity.bounds[i];
					if (0 != bound.on.length) {
						this.ctx.strokeStyle = colors.bound_on;
					}
					else if (0 != bound.off.length) {
						this.ctx.strokeStyle = colors.bound_off;
					}
					else if (0 != bound.during.length) {
						this.ctx.strokeStyle = colors.bound_during;
					}
					else {
						this.ctx.strokeStyle = colors.bound;
					}
					switch (bound.type) {
						case 'point':
							break;
						case 'circle':
							this.ctx.beginPath();
							this.ctx.arc(
								entity.transform.x + bound.offset.x,
								entity.transform.y + bound.offset.y,
								bound.radius * entity.transform.scale.x,
								0,
								2 * Math.PI
							);
							this.ctx.stroke();
							break;
						case 'rect':
							this.ctx.strokeRect(
								entity.transform.x + bound.offset.x * entity.transform.scale.x - 1,
								entity.transform.y + bound.offset.y * entity.transform.scale.y + 1,
								bound.width * entity.transform.scale.x,
								bound.height * entity.transform.scale.y
							);
							break;
					}
				}
			}
			this.ctx.fillStyle = colors.transform;
			this.ctx.fillRect(entity.transform.x - 1, entity.transform.y - 1, 2, 2);
		});
		// dim non-screen area
		let above_screen_height = this.offset.y;
		let below_screen_height = this.height - this.offset.y + this.apparent_screen_height;
		let before_screen_width = this.offset.x;
		let after_screen_width = this.width - this.offset.x + this.apparent_screen_width;
		let screen_right_edge = this.offset.x + this.apparent_screen_width;
		let screen_bottom_edge = this.offset.y + this.apparent_screen_height;
		this.ctx.fillStyle = '#00000080';
		this.ctx.fillRect(0, 0, this.width, above_screen_height);
		this.ctx.fillRect(0, screen_bottom_edge, this.width, below_screen_height);
		this.ctx.fillRect(0, this.offset.y, before_screen_width, this.apparent_screen_height);
		this.ctx.fillRect(screen_right_edge, this.offset.y, after_screen_width, this.apparent_screen_height);
	}
	get_screen_image() {
		let c = document.createElement('canvas');
		c.width = screen.width;
		c.height = screen.height;
		let ctx = c.getContext('2d');
		ctx.imageSmoothingEnabled = false;
		let sx = world.focus.x - screen.half_width / this.zoom;
		let sy = world.focus.y - screen.half_height / this.zoom;
		ctx.drawImage(
			this.canvas,
			sx,
			sy,
			screen.width / this.zoom,
			screen.height / this.zoom,
			0,
			0,
			screen.width,
			screen.height
		);
	}
}

// bounds and management
export class Bound {
	// point: Bound(name, collides, offset_x, offset_y)
	// circ: Bound(name, collides, offset_x, offset_y, radius)
	// rect: Bound(name, collides, offset_x, offset_y, width, height)
	constructor(name, collides, offset_x, offset_y, width_or_radius, height) {
		this.name = name;
		this.collides = collides;
		this.colliding = [];
		this.offset = {
			x: offset_x,
			y: offset_y,
		};
		if (!width_or_radius) {
			this.type = 'point';
		}
		else if (!height) {
			this.type = 'circle';
			this.radius = width_or_radius;
		}
		else {
			this.type = 'rect';
			this.width = width_or_radius;
			this.height = height;
		}
		// array of other collided bounds
		this.on = [];
		this.during = [];
		this.off = [];
		// unchanged status
		this.unchanged = false;
		this.point = {
			x: 0,
			y: 0,
		};
		this.circ = {
			x: 0,
			y: 0,
			radius: 0,
		};
		this.rect = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		};
		// last transform and bound
		this.last = {
			x: null,
			y: null,
			scale: {
				x: null,
				y: null,
			},
			offset: {
				x: null,
				y: null,
			},
			width: null,
			height: null,
		};
	}
	on_add() {
		if (!this.parent.bounds) {
			this.parent.bounds = [];
		}
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
		this.parent.bounds.push(this);
	}
	refresh() {
		// force recalculation by setting last transform x to null
		this.last.x = null;
	}
}

export class BoundManager {
	constructor(entity_manager) {
		this.entity_manager = entity_manager;
	}
	static intersects(b1, b2) {
		switch (b1.type) {
			case 'point':
				switch (b2.type) {
					case 'point':
						return BoundManager.point_intersects_point(b1.point, b2.point);
						break;
					case 'circle':
						return BoundManager.point_intersects_circ(b1.point, b2.circ);
						break;
					case 'rect':
						return BoundManager.point_intersects_rect(b1.point, b2.rect);
						break;
				}
				break;
			case 'circle':
				switch (b2.type) {
					case 'point':
						return BoundManager.point_intersects_circ(b2.point, b1.circ);
						break;
					case 'circle':
						return BoundManager.circ_intersects_circ(b1.circ, b2.circ);
						break;
					case 'rect':
						return BoundManager.circ_intersects_rect(b1.circ, b2.rect);
						break;
				}
				break;
			case 'rect':
				switch (b2.type) {
					case 'point':
						return BoundManager.point_intersects_rect(b2.point, b1.rect);
						break;
					case 'circle':
						return BoundManager.circ_intersects_rect(b2.circ, b1.rect);
						break;
					case 'rect':
						return BoundManager.rect_intersects_rect(b1.rect, b2.rect);
						break;
				}
				break;
		}
	}
	static point_intersects_point(p1, p2) {
		return p1.x == p2.x && p1.y == p2.y;
	}
	static point_intersects_circ(p, c) {
		return BoundManager.circ_intersects_circ(
			{
				x: p.x,
				y: p.y,
				radius: 1,
			},
			c
		);
	}
	static point_intersects_rect(p, r) {
		return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
	}
	static circ_intersects_circ(c1, c2) {
		let dx = c1.x - c2.x;
		let dy = c1.y - c2.y;
		let dr = c1.radius + c2.radius;
		return Math.abs(dx * dx + dy * dy) < dr * dr;
	}
	static circ_intersects_rect(c, r) {
		//TODO this is really expensive, can i have circ vs rect reasonably cheaply?
		return false;
	}
	static rect_intersects_rect(r1, r2) {
		return (r1.right > r2.left && r2.right > r1.left) && (r1.bottom > r2.top && r2.bottom > r1.top);
	}
	static check(bound, state, check_name) {
		// check for any collided
		if (!check_name) {
			if (bound[state].length) {
				return true;
			}
			return false;
		}
		if (-1 != bound[state].indexOf(check_name)) {
			return true;
		}
		return false;
	}
	update() {
		let bounds = [];
		// get all bounds
		for (let i in this.entity_manager.sorted) {
			let entity = this.entity_manager.sorted[i];
			if (entity.bounds) {
				for (let i in entity.bounds) {
					bounds.push(entity.bounds[i]);
				}
			}
		}
		// get unchanged statuses
		for (let i in bounds) {
			let bound = bounds[i];
			if (
				bound.parent.transform.x == bound.last.x
				&& bound.parent.transform.y == bound.last.y
				&& bound.parent.transform.scale.x == bound.last.scale.x
				&& bound.parent.transform.scale.y == bound.last.scale.y
				&& bound.offset.x == bound.last.offset.x
				&& bound.offset.y == bound.last.offset.y
				&& bound.width == bound.last.width
				&& bound.height == bound.last.height
			) {
				bound.unchanged = true;
				continue;
			}
			bound.unchanged = false;
			// update last transform
			bound.last.x = bound.parent.transform.x;
			bound.last.y = bound.parent.transform.y;
			bound.last.scale.x = bound.parent.transform.scale.x;
			bound.last.scale.y = bound.parent.transform.scale.y;
			bound.last.offset.x = bound.offset.x;
			bound.last.offset.y = bound.offset.y;
			bound.last.width = bound.width;
			bound.last.height = bound.height;
			// update bound
			let x = bound.parent.transform.x;
			let y = bound.parent.transform.y;
			if ('point' == bound.type) {
				bound.point.x = x;
				bound.point.y = y;
			}
			else if ('rect' == bound.type) {
				bound.rect.left = x + (
					bound.offset.x * bound.parent.transform.scale.x
				);
				bound.rect.right = bound.rect.left + (
					bound.width * bound.parent.transform.scale.x
				);
				bound.rect.top = y + (
					bound.offset.y * bound.parent.transform.scale.y
				);
				bound.rect.bottom = bound.rect.top + (
					bound.height * bound.parent.transform.scale.y
				);
			}
			else if ('circle' == bound.type) {
				bound.circ.x = x;
				bound.circ.y = y;
				bound.circ.radius = bound.radius * bound.parent.transform.scale.x;
			}
		}
		for (let i in bounds) {
			let bound1 = bounds[i];
			bound1.colliding = [];
			// store previous during
			let previous = bound1.during.slice();
			bound1.during = [];
			bound1.off = [];
			for (let j in bounds) {
				// skip for self
				if (i == j) {
					continue;
				}
				let bound2 = bounds[j];
				// skip not tagged for collision with this bound
				if (-1 == bound1.collides.indexOf(bound2.name)) {
					continue
				}
				// check current collision
				if (BoundManager.intersects(bound1, bound2)) {
					// set during collided bound
					bound1.during.push(bound2.name);
					bound1.colliding.push(bound2);
				}
			}
			// copy current during
			bound1.on = bound1.during.slice();
			for (let j in previous) {
				let collided_name = previous[j];
				let index = bound1.during.indexOf(collided_name);
				// bound_id was collided in previous frame but is not collided in this one
				if (-1 == index) {
					bound1.off.push(collided_name);
					continue;
				}
				// remove from on
				bound1.on.splice(index, 1);
			}
		}
	}
}

// entities and management
export class Entity {
	constructor() {
		this.world = null;
		this.timescale = mg.timescales.default;
		this.disabled = false;
		this.priority = 0;
		this.modules = [];
	}
	on_add() {}
	on_remove() {
		for (let i in this.modules) {
			if (
					this.modules[i].on_remove
					&& 'function' === typeof this.modules[i].on_remove
				) {
				this.modules[i].on_remove();
			}
			this.remove_module(this.modules[i]);
		}
		this.world.entity_manager.changed = true;
	}
	change_priority(priority) {
		this.priority = priority;
		if (this.world) {
			this.world.entity_manager.order_changed = true;
		}
	}
	disable() {
		this.disabled = true;
		if (this.world) {
			this.world.entity_manager.order_changed = true;
		}
	}
	enable() {
		this.disabled = false;
		if (this.world) {
			this.world.entity_manager.order_changed = true;
		}
	}
	toggle() {
		this.disabled = !this.disabled;
		if (this.world) {
			this.world.entity_manager.order_changed = true;
		}
	}
	add_module(module) {
		//!console.log('adding module ' + module.constructor.name + ' to entity');
		this.modules.push(module);
		module.parent = this;
		module.timescale = module.timescale || this.timescale;
		if (module.on_add && 'function' === typeof module.on_add) {
			module.on_add();
		}
		if (this.world) {
			this.world.entity_manager.order_changed = true;
		}
		return module;
	}
	remove_module(module) {
		if (!module) {
			return;
		}
		let i = this.modules.indexOf(module);
		if (-1 == i) {
			return;
		}
		this.modules.splice(i, 1);
		if (this.world) {
			this.world.entity_manager.order_changed = true;
		}
	}
	prune() {
		if (this.world) {
			mg.add_waiting_action(() => {
				this.world.entity_manager.remove(this);
			});
		}
	}
}

export class EntityManager {
	constructor(world) {
		this.world = world;
		this.entities = [];
		this.sorted = [];
		this.order_changed = true;
	}
	add(entity) {
		this.set_world(entity);
		this.entities.push(entity);
		if (entity.on_add && 'function' == typeof entity.on_add) {
			entity.on_add();
		}
		this.order_changed = true;
	}
	set_world(entity) {
		entity.world = this.world;
		for (let i in entity.modules) {
			this.set_world(entity.modules[i])
		}
	}
	remove(entity) {
		this.entities.splice(this.entities.indexOf(entity), 1);
		this.order_changed = true;
	}
	sort_entity(entity, prioritized, current_priority) {
		if (entity.disabled) {
			return prioritized;
		}
		current_priority += entity.priority || 0;
		// priority of this entity not yet in sorted
		if (!prioritized[current_priority]) {
			prioritized[current_priority] = [];
		}
		prioritized[current_priority].push(entity);
		if (entity.modules) {
			for (let i in entity.modules) {
				prioritized = this.sort_entity(
					entity.modules[i],
					prioritized,
					current_priority
				);
			}
		}
		return prioritized;
	}
	sort() {
		if (!this.order_changed) {
			return;
		}
		let prioritized = {};
		for (let i in this.entities) {
			prioritized = this.sort_entity(this.entities[i], prioritized, 0);
		}
		let priority_keys = Object.keys(prioritized);
		priority_keys.sort(function(a, b) {
			return a - b;
		});
		this.sorted = [];
		for (let i in priority_keys) {
			let current_priority = priority_keys[i];
			this.sorted = this.sorted.concat(prioritized[current_priority]);
		}
		this.order_changed = false;
	}
	foreach_sorted_entity(cb) {
		for (let i in this.sorted) {
			cb(this.sorted[i]);
		}
	}
	draw() {
		this.foreach_sorted_entity(entity => {
			if (entity.draw && 'function' === typeof entity.draw) {
				entity.draw();
			}
		});
	}
	update() {
		this.sort();
		this.foreach_sorted_entity(entity => {
			if (entity.update && 'function' === typeof entity.update) {
				entity.update();
			}
		});
	}
}

// standalone
export class Timer {
	constructor(duration, cb) {
		this.duration = 0;
		this.remaining = 0;
		this.cb = null;
		this.percent = {
			complete: 0,
			remaining: 1
		};
		this.stopped = false;
		this.set(duration, cb);
	}
	// fire cb once this frame if delta is greater than remaining
	check(delta) {
		if (this.stopped) {
			return;
		}
		if (delta > this.remaining) {
			if (this.cb && 'function' === typeof this.cb) {
				this.cb();
			}
		}
		if (this.stopped) {
			return;
		}
		this.remaining -= delta;
		this.percent.remaining = this.remaining / this.duration;
		this.percent.complete = 1 - this.percent.remaining;
	}
	check_stop(delta) {
		if (this.stopped) {
			return;
		}
		if (delta > this.remaining) {
			this.stop();
			if (this.cb && 'function' === typeof this.cb) {
				this.cb();
				return;
			}
		}
		if (this.stopped) {
			return;
		}
		this.remaining -= delta;
		this.percent.remaining = this.remaining / this.duration;
		this.percent.complete = 1 - this.percent.remaining;
	}
	// fire cb for each time that duration would've elapsed during delta time
	multi_check(delta) {
		while (delta > this.remaining) {
			if (this.stopped) {
				console.log('timer stopped during delta while loop, aborting multi_check');
				return;
			}
			delta -= this.remaining;
			if (this.cb && 'function' === typeof this.cb) {
				this.cb(this);
			}
			if (0 == this.duration) {
				console.log('duration 0, preventing infinite loop');
				break;
			}
			this.remaining += this.duration;
		}
		if (this.stopped) {
			console.log('timer stopped after delta while loop, aborting multi_check');
			return;
		}
		this.remaining -= delta;
		this.percent.remaining = this.remaining / this.duration;
		this.percent.complete = 1 - this.percent.remaining;
	}
	stop() {
		this.stopped = true;
		this.percent.remaining = 0;
		this.percent.complete = 1;
	}
	start() {
		this.stopped = false;
		this.percent.remaining = 1;
		this.percent.complete = 0;
	}
	set(duration, cb) {
		if (!duration) {
			return;
		}
		if (!cb) {
			cb = null;
		}
		this.duration = duration;
		this.cb = cb;
		this.remaining = this.duration;
		this.percent.complete = 0;
		this.percent.remaining = 1;
		this.stopped = false;
	}
	reset() {
		this.remaining = this.duration;
		this.percent.complete = 0;
		this.percent.remaining = 1;
	}
	reverse() {
		if (this.stopped) {
			this.remaining = this.duration;
			this.percent.complete = 0;
			this.percent.remaining = 1;
			this.stopped = false;
		}
		else {
			this.remaining = this.duration - this.remaining;
			this.percent.remaining = this.remaining / this.duration;
			this.percent.complete = 1 - this.percent.remaining;
		}
	}
}

export class Animation {
	constructor(imagesheet, recipe) {
		this.frames = [];
		this.current = 0;
		this.previous = -1;
		this.paused = true;
		this.loops = 0;
		this.direction = 1;
		this.on_complete;
		this.frame_listeners = {
			name: {},
			number: {},
		};
		this.timer = new Timer;
		this.load(imagesheet, recipe);
		this.cb = null;
	}
	add_frame_listener(frame, cb) {
		// adding frame name callback
		if ('string' === typeof frame) {
			if (!this.frame_listeners.name[frame]) {
				this.frame_listeners.name[frame] = [];
			}
			this.frame_listeners.name[frame].push(cb);
			return cb;
		}
		// adding frame number callback
		if (!this.frame_listeners.number[frame]) {
			this.frame_listeners.number[frame] = [];
		}
		this.frame_listeners.number[frame].push(cb);
		return cb;
	}
	seek(frame) {
		if (!this.frames[frame]) {
			console.log('attempting to seek to non-existant frame ' + frame);
			return;
		}
		this.current = frame;
	}
	play(loops, cb, frame, direction) {
		this.set_direction(direction || 1);
		this.seek(frame || 0);
		this.loops = loops;
		this.on_complete = cb;
		this.paused = false;
		this.timer.set(
			this.frames[this.current].duration,
			this.advance_frame.bind(this)
		);
	}
	set_direction(value) {
		this.direction = value;
	}
	advance_frame() {
		// on last frame when advancing
		if (
			(
				1 == this.direction
				&& this.current == this.frames.length - 1
			)
			|| (
				-1 == this.direction
				&& this.current == 0
			)
		) {
			// not infinite loop
			if (-1 != this.loops) {
				// decrease loops left
				this.loops -= 1;
			}
			// loops complete callback
			if (0 == this.loops) {
				// pause on last frame
				this.timer.stopped = true;
				this.paused = true;
				// run completion callback
				if (this.on_complete && 'function' === typeof this.on_complete) {
					this.on_complete(this);
				}
				return;
			}
			// looping
			if (1 == this.direction) {
				this.current = -1;
			}
			else {
				this.current = this.frames.length;
			}
		}
		// next frame
		this.current += this.direction;
		// do frame listener events
		if (
			this.frames[this.current].name
			&& this.frame_listeners.name[this.frames[this.current].name]
		) {
			let listeners = this.frame_listeners.name[this.frames[this.current].name];
			for (let i in listeners) {
				listeners[i]();
			}
		}
		if (this.frame_listeners.number[this.current]) {
			let listeners = this.frame_listeners.number[this.current];
			for (let i in listeners) {
				listeners[i]();
			}
		}
		//TODO do bound updates for bound data in recipe
		this.timer.duration = this.frames[this.current].duration;
	}
	load(imagesheet, recipe) {
		if (!imagesheet || !recipe) {
			console.log('attempting to load animation without imagesheet or recipe');
			return;
		}
		this.frames = recipe.frames;
		for (let i in this.frames) {
			// console.log('building ready sprite image for "' + i + '"');
			let c = document.createElement('canvas');
			c.width = this.frames[i].width;
			c.height = this.frames[i].height;
			let ctx = c.getContext('2d');
			ctx.drawImage(
				imagesheet,
				this.frames[i].sx,
				this.frames[i].sy,
				this.frames[i].width,
				this.frames[i].height,
				0,
				0,
				this.frames[i].width,
				this.frames[i].height
			);
			this.frames[i].image = c;
			// build mirrored and flipped versions of frame image
			this.frames[i].mirrored_image = Sprite.mirror(this.frames[i].image);
			this.frames[i].flipped_image = Sprite.flip(this.frames[i].image);
			this.frames[i].flipped_mirrored_image = Sprite.mirror(this.frames[i].flipped_image);
		}
		//TODO create bounds if they're present in the recipe
	}
}

export class SpriteFont {
	constructor(data, imagesheet) {
		this.data = data;
		this.width = this.data.width || 1;
		this.height = this.data.height || 1;
		this.spacing = this.data.spacing || {x: 1, y: 1};
		this.glyphs = {};
		if (this.data.nonuniform_glyphs) {
			for (let i in this.data.nonuniform_glyphs) {
				// console.log('building ready nonuniform glyph for "' + i + '"');
				let glyph = this.data.nonuniform_glyphs[i];
				this.glyphs[glyph] = {
					image: Sprite.image_from_spritesheet(
						imagesheet,
						glyph.sx,
						glyph.sy,
						glyph.width,
						glyph.height
					),
					width: glyph.width,
					height: glyph.height,
					color: {}
				};
			}
			return;
		}
		let offset_x = 0;
		for (let i in this.data.glyphs) {
			// console.log('building ready glyph for "' + glyph + '"');
				let glyph = this.data.glyphs[i];
				this.glyphs[glyph] = {
					image: Sprite.image_from_spritesheet(
						imagesheet,
						offset_x,
						0,
						this.width,
						this.height
					),
					width: this.width,
					height: this.height,
					color: {}
				};
				offset_x += this.data.width;
		}
	}
	get_glyph(glyph) {
		if (!this.glyphs[glyph]) {
			return false;
		}
		let c = document.createElement('canvas');
		c.width = this.glyphs[glyph].width;
		c.height = this.glyphs[glyph].height;
		let ctx = c.getContext('2d');
		ctx.drawImage(
			this.glyphs[glyph].image,
			0, 
			0, 
			this.glyphs[glyph].width, 
			this.glyphs[glyph].height
		);
		return c;
	}
}

export function SNESMosaic(c, size) {
	if (2 > size) {
		return c;
	}
	let ctx = c.getContext('2d');

	let mc = document.createElement('canvas');
	mc.width = c.width;
	mc.height = c.height;
	let mctx = mc.getContext('2d');

	let image_data = ctx.getImageData(
		0,
		0,
		c.width,
		c.height
	);

	let sx = 0;
	let sy = 0;
	let samples = [];
	// grab every size-th pixel from the canvas
	for (let y = 0; y < c.height; y += size) {
		for (let x = 0; x < c.width; x += size) {
			let i = ((y * c.width) + x) * 4;
			let color = 'rgba('
				+ image_data.data[i] + ','
				+ image_data.data[i + 1] + ','
				+ image_data.data[i + 2] + ','
				+ image_data.data[i + 3]
				+ ')';
			mctx.fillStyle = color;
			mctx.fillRect(sx, sy, size, size);
			sx += size;
		}
		sx = 0;
		sy += size;
	}
	return mc;
}

export function SNESMosaic_screen(size) {
	if (1 == screen.scale.x && 1 == screen.scale.y) {
		return SNESMosaic(screen.canvas, size);
	}
	let c = document.createElement('canvas');
	c.width = screen.width;
	c.height = screen.height;
	let ctx = c.getContext('2d');
	// draw screen to small canvas
	ctx.drawImage(
		screen.canvas,
		0, 0, screen.canvas.width, screen.canvas.height,
		0, 0, c.width, c.height
	);
	let mc = SNESMosaic(c, size);
	// resize based on screen scale
	c.width = screen.canvas.width;
	c.height = screen.canvas.height;
	ctx.scale(1 / screen.scale.x, 1 / screen.scale.y);
	ctx.drawImage(
		mc,
		0, 0, mc.width, mc.height,
		0, 0, c.width, c.height
	);
	return c;
}

export function CanvasChannelsRGB(c) {
	let ctx = c.getContext('2d');
	let image_data_r = ctx.getImageData(
		0,
		0,
		c.width,
		c.height
	);
	let image_data_g = ctx.getImageData(
		0,
		0,
		c.width,
		c.height
	);
	let image_data_b = ctx.getImageData(
		0,
		0,
		c.width,
		c.height
	);
	// color channel canvases
	for (let i = 0; i < image_data_r.data.length; i += 4) {
		image_data_r.data[i + 1] = 0;
		image_data_r.data[i + 2] = 0;
		image_data_g.data[i] = 0;
		image_data_g.data[i + 2] = 0;
		image_data_b.data[i] = 0;
		image_data_b.data[i + 1] = 0;
	}
	// r
	let rc = document.createElement('canvas');
	rc.width = c.width;
	rc.height = c.height;
	let rctx = rc.getContext('2d');
	rctx.putImageData(image_data_r, 0, 0);
	// g
	let gc = document.createElement('canvas');
	gc.width = c.width;
	gc.height = c.height;
	let gctx = gc.getContext('2d');
	gctx.putImageData(image_data_g, 0, 0);
	// b
	let bc = document.createElement('canvas');
	bc.width = c.width;
	bc.height = c.height;
	let bctx = bc.getContext('2d');
	bctx.putImageData(image_data_b, 0, 0);
	return {
		r: rc,
		g: gc,
		b: bc,
	};
}

export function ChromaticAberration(c, rx, ry, gx, gy, bx, by) {
	if (
		0 == rx
		&& 0 == ry
		&& 0 == gx
		&& 0 == gy
		&& 0 == bx
		&& 0 == by
	) {
		return c;
	}
	let channels = CanvasChannelsRGB(c);
	let mc = document.createElement('canvas');
	mc.width = c.width;
	mc.height = c.height;
	let mctx = mc.getContext('2d');
	// composite channels
	mctx.globalCompositeOperation = 'screen';
	mctx.drawImage(channels.r, rx, ry);
	mctx.drawImage(channels.g, gx, gy);
	mctx.drawImage(channels.b, bx, by);
	return mc;
}

// prefabs
export class Cursor extends Entity {
	constructor() {
		super();
		this.add_module(new Transform);
		this.priority = 4096;
	}
	update() {
		let world_pos = input.read_world_cursor(this.world);
		if (this.transform.x == world_pos.x && this.transform.y == world_pos.y) {
			return;
		}
		this.transform.x = world_pos.x;
		this.transform.y = world_pos.y;
	}
}

export class MousewheelZoom extends Entity {
	constructor(step) {
		super();
		this.step = step || 0.025;
	}
	update() {
		if (0 < input.mousewheel) {
			let world_zoom = this.world.zoom;
			if (0 < this.world.zoom) {
				world_zoom = this.world.zoom - this.step
			}
			if (0 >= world_zoom) {
				world_zoom = this.step;
			}
			this.world.resize(
				this.world.width,
				this.world.height,
				world_zoom
			);
		}
		else if (0 > input.mousewheel) {
			this.world.resize(
				this.world.width,
				this.world.height,
				this.world.zoom + this.step
			);
		}
	}
}

export class Glyph extends Entity {
	constructor(text, image, index, line, line_index) {
		super();
		this.text = text;
		this.add_module(new Sprite(image));
		this.index = index;
		this.line = line;
		this.line_index = line_index;
		this.effect = {
			type: 'none',
			module: null,
			intensity: 0,
			frequency: 0,
			clockwise: true,
			offset: 0,
			offset_type: 'per_line',
		};
	}
	set_color(color) {
		let ctx = this.sprite.image.getContext('2d');
		ctx.globalCompositeOperation = 'source-atop';
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, this.sprite.width, this.sprite.height);
	}
	set_effect(options) {
		options = options || {};
		this.effect.intensity = options.intensity || this.effect.intensity;
		this.effect.frequency = options.frequency || this.effect.frequency;
		this.effect.offset = options.offset || this.effect.offset;
		this.effect.clockwise = options.clockwise || false;
		this.effect.offset_type = options.offset_type || this.effect.offset_type;
		// setting effect type
		if (options.type) {
			// changing type
			if (this.effect.type != options.type) {
				// existing module
				if (this.effect.module) {
					this.effect.module.stop();
					this.remove_module(this.effect.module);
					this.effect.module = null;
				}
				switch (options.type) {
					case 'shake':
						this.effect.module = new Shaker(
							this.effect.intensity,
							this.effect.frequency,
						);
						this.add_module(this.effect.module);
						break;
					case 'roll':
						this.effect.module = new Roller(
							this.effect.intensity,
							this.effect.frequency,
							this.calculate_offset(),
							this.effect.clockwise
						);
						this.add_module(this.effect.module);
						break;
					case 'none':
					default:
						break;
				}
				this.effect.type = options.type;
			}
		}
		// set effect module properties
		if (this.effect.module) {
			this.effect.module.intensity = this.effect.intensity;
			this.effect.module.frequency = this.effect.frequency;
			// adjust direction if offset was changed
			if (this.effect.module.direction && !options.type && options.offset) {
				this.effect.module.direction += this.calculate_offset();
			}
			// start effect module if it wasn't started
			if (!this.effect.module.active) {
				this.effect.module.start();
			}
		}
	}
	calculate_offset() {
		switch (this.effect.offset_type) {
			case 'continuous':
				return this.effect.offset * this.index;
			case 'exact':
				return this.effect.offset;
			case 'per_line':
			default:
				return this.effect.offset * this.line_index;
		}
	}
}

export class Text extends Entity {
	constructor(font, text, options) {
		super();
		this.add_module(new Transform);
		this.font = font;
		this.text = text;
		this.glyphs = [];
		this.lines = [];
		this.width = 0;
		this.height = 0;
		this.origin = {
			x: 0,
			y: 0,
		};
		this.last = {
			x: null,
			y: null,
		};
		this.create_glyphs(text, options);
		this.alignment =  'left';
		this.attachment = {
			x: 'left',
			y: 'top',
		};
		this.align(options.alignment, options.attachment_x, options.attachment_y);
	}
	create_glyphs(text, options) {
		let color = options.color || '#ffffff';
		let effect = options.effect || 'none';
		let intensity = options.intensity || 0;
		let frequency = options.frequency || 0;
		let clockwise = options.clockwise || false;
		let offset = options.offset || 0;
		let offset_type = options.offset_type || 'per_line';
		let max_width = options.max_width || 0;
		let line = {
			width: 0,
			height: this.font.height,
			glyphs: [],
		};
		for (let i = 0; i < this.text.length; i++) {
			// control
			while ('\\' == this.text.charAt(i)) {
				i += 1;
				// newline
				if ('n' == this.text.charAt(i)) {
					i += 1;
					this.commit_line(line);
					line = {
						width: 0,
						height: this.font.height,
						glyphs: [],
					};
				}
				// other control
				else {
					let control_code = this.text.charAt(i);
					i += 2;
					let control_end = this.text.substring(i).indexOf('"');
					let control_value = this.text.substring(i, i + control_end);
					i += control_end + 1;
					switch (control_code) {
						case 'c':
							color = control_value;
							break;
						case 'e':
							effect = control_value;
							break;
						case 'i':
							intensity = parseFloat(control_value);
							break;
						case 'f':
							frequency = parseFloat(control_value);
							break;
						case 'w':
							clockwise = parseInt(control_value);
						case 'o':
							offset = parseFloat(control_value);
							break;
						case 't':
							offset_type = control_value;
							break;
						default:
							break;
					}
				}
			}
			// still at least one glyph in text after advancing past control block
			if (i >= this.text.length) {
				break;
			}
			let current_glyph = this.text.charAt(i);
			if (!this.font.glyphs[current_glyph]) {
				console.log('missing glyph ' + current_glyph + ' from spritefont');
				continue;
			}
			let glyph = new Glyph(
				current_glyph,
				this.font.get_glyph(current_glyph),
				this.glyphs.length,
				this.lines.length,
				line.glyphs.length
			);
			glyph.set_color(color);
			glyph.set_effect({
				type: effect,
				intensity: intensity,
				frequency: frequency,
				clockwise: clockwise,
				offset: offset,
				offset_type: offset_type,
			});
			line.glyphs.push(glyph);
			this.glyphs.push(glyph);
			this.add_module(glyph);
			line.width += this.font.glyphs[current_glyph].width + this.font.spacing.x;
			// force line wrap
			if (
				0 < max_width
				&& max_width < line.width - this.font.spacing.x
			) {
				// walk back through current line until last whitespace
				let next_line = {
					width: 0,
					height: this.font.height,
					glyphs: [],
				};
				let last_glyph = line.glyphs.pop();
				while (' ' != last_glyph.text) {
					// move glyph from current line to next line
					line.width -= this.font.glyphs[last_glyph.text].width + this.font.spacing.x;
					next_line.width += this.font.glyphs[last_glyph.text].width + this.font.spacing.x;
					last_glyph.line += 1;
					next_line.glyphs.unshift(last_glyph);
					last_glyph = line.glyphs.pop();
				}
				// no need to push last_glyph back to line, since it's a trailing space
				// but disable it
				last_glyph.disable();
				this.commit_line(line);
				// correct line indices
				let line_index = 0;
				for (let i in next_line.glyphs) {
					let glyph = next_line.glyphs[i];
					glyph.line_index = line_index;
					let effect_type = glyph.effect.type;
					glyph.set_effect({type: 'none'});
					glyph.set_effect({type: effect_type});
					line_index += 1;
				}
				line = next_line;
			}
		}
		this.commit_line(line);
		// text block dimensions
		this.width = 0;
		this.height = 0;
		for (let i in this.lines) {
			this.height += this.lines[i].height + this.font.spacing.y;
			this.width = Math.max(this.width, this.lines[i].width);
		}
		// don't add vertical spacing for last line?
		this.height -= this.font.spacing.y;
	}
	commit_line(line) {
		if (line.width) {
			line.width -= this.font.spacing.x;
		}
		this.lines.push(line);
	}
	for_each_glyph(cb) {
		for (let i in this.glyphs) {
			cb(this.glyphs[i]);
		}
	}
	align(alignment, attachment_x, attachment_y) {
		this.alignment = alignment || this.alignment || 'left';
		this.attachment.x = attachment_x || this.attachment.x || 'left';
		this.attachment.y = attachment_y || this.attachment.y || 'top';
		switch (attachment_x) {
			case 'right':
				this.origin.x = -1 * this.width;
				break;
			case 'center':
				this.origin.x = -0.5 * this.width;
				break;
			case 'left':
			default:
				this.origin.x = 0;
				break;
		}
		switch (attachment_y) {
			case 'bottom':
				this.origin.y = -1 * this.height;
				this.for_each_glyph(glyph => {
					glyph.sprite.origin.y = glyph.sprite.height;
				});
				break;
			case 'middle':
				this.origin.y = -0.5 * this.height;
				this.for_each_glyph(glyph => {
					glyph.sprite.origin.y = 0.5 * glyph.sprite.height;
				});
				break;
			case 'top':
			default:
				this.origin.y = 0;
				this.for_each_glyph(glyph => {
					glyph.sprite.origin.y = 0;
				});
				break;
		}
		let x = this.origin.x + this.transform.x;
		let y = this.origin.y + this.transform.y;
		for (let i in this.lines) {
			let line = this.lines[i];
			let line_x = 0;
			switch (alignment) {
				case 'right':
					line_x = x + this.width - line.width;
					break;
				case 'center':
					line_x = x + 0.5 * this.width - 0.5 * line.width;
					break;
				case 'left':
				default:
					line_x = x;
					break;
			}
			for (let j in line.glyphs) {
				let glyph = line.glyphs[j];
				glyph.transform.x = line_x;
				glyph.transform.y = y;
				line_x += glyph.sprite.width + this.font.spacing.x;
			}
			y += line.height + this.font.spacing.y;
		}
	}
	set_color(color = '#ffffff', start = 0, count = 0) {
		count = count || this.glyphs.length;
		let end = start + count;
		this.for_each_glyph(glyph => {
			if (glyph.index < start || glyph.index >= end) {
				return;
			}
			glyph.set_color(color);
		});
	}
	set_effect(options = {}, start = 0, count = 0) {
		count = count || this.glyphs.length;
		let end = start + count;
		this.for_each_glyph(glyph => {
			if (glyph.index < start || glyph.index >= end) {
				return;
			}
			glyph.set_effect(options);
		});
	}
	update() {
		// if position has changed then update all glyph positions
		if (this.transform.x == this.last.x && this.transform.y == this.last.y) {
			return;
		}
		let dif_x = this.transform.x - this.last.x;
		let dif_y = this.transform.y - this.last.y;
		this.for_each_glyph((glyph) => {
			glyph.transform.x += dif_x;
			glyph.transform.y += dif_y;
		});
		this.last.x = this.transform.x;
		this.last.y = this.transform.y;
	}
}

export class Writer extends Text {
	constructor(font, text, options) {
		super(font, text, options);
		this.for_each_glyph(glyph => {
			glyph.sprite.disable();
		});
		this.delay_ms = options.delay_ms || 16;
		this.direction = options.direction || 1;
		this.voices = options.voices || {};
		this.voice_name = options.voice_name || '';
		this.apply_control_codes(options);
		this.voice_style = options.voice_style || 'every_glyph';
		this.index = -1;
		this.playing = false;
		this.delta = 0;
		this.on_write = options.on_write || null;
	}
	apply_control_codes(options) {
		let delay_ms = options.delay_ms || 16;
		let voice_name = options.voice_name || '';
		let index = 0;
		for (let i = 0; i < this.text.length; i++) {
			// control
			while ('\\' == this.text.charAt(i)) {
				i += 1;
				// newline
				if ('n' == this.text.charAt(i)) {
					i += 1;
				}
				// other control
				else {
					let control_code = this.text.charAt(i);
					i += 2;
					let control_end = this.text.substring(i).indexOf('"');
					let control_value = this.text.substring(i, i + control_end);
					i += control_end + 1;
					switch (control_code) {
						case 'd':
							delay_ms = parseInt(control_value);
							break;
						case 'v':
							voice_name = control_value;
							break;
						default:
							break;
					}
				}
			}
			// still at least one glyph in text after advancing past control block
			if (i >= this.text.length) {
				break;
			}
			let glyph = this.glyphs[index];
			glyph.delay_ms = delay_ms;
			glyph.voice_name = voice_name;
			index += 1;
		}
	}
	set_voice(voice_name = null, start = 0, count = 0) {
		//TODO
	}
	set_delay(delay_ms = 16, start = 0, count = 0) {
		//TODO
	}
	forward() {
		this.index += 1;
		if (this.index > this.glyphs.length) {
			this.voice_name = '';
			this.index = this.glyphs.length;
			this.stop();
		}
		if (!this.glyphs[this.index]) {
			return;
		}
		let glyph = this.glyphs[this.index];
		glyph.sprite.enable();
		if (this.on_write && 'function' == typeof this.on_write) {
			this.on_write(glyph);
		}
		this.update_properties(glyph);
	}
	back() {
		this.index -= 1;
		if (this.index < -1) {
			this.voice_name = '';
			this.index = -1;
			this.stop();
		}
		if (!this.glyphs[this.index]) {
			return;
		}
		let glyph = this.glyphs[this.index];
		glyph.sprite.disable();
		this.update_properties(glyph);
	}
	update_properties(glyph) {
		if (glyph.voice_name != this.voice_name) {
			this.voice_name = glyph.voice_name;
		}
		if (glyph.delay_ms != this.delay_ms) {
			this.delay_ms = glyph.delay_ms;
		}
	}
	seek(index, silent = true) {
		index -= 1;
		if (index < -1) {
			index = -1;
		}
		else if (index > this.glyphs.length) {
			index = this.glyphs.length;
		}
		this.for_each_glyph(glyph => {
			if (glyph.index > index) {
				glyph.sprite.disable();
			}
			else {
				glyph.sprite.enable();
			}
		});
		this.index = index;
	}
	play() {
		if (!this.playing) {
			this.playing = true;
			this.delta = 0;
		}
	}
	stop() {
		if (this.playing) {
			this.playing = false;
		}
	}
	skip() {
		this.seek(this.glyphs.length, true);
	}
	update() {
		super.update();
		if (!this.playing) {
			return;
		}
		this.delta += this.timescale.delta;
		while (this.delta > this.delay_ms) {
			this.delta -= this.delay_ms;
			if (1 == this.direction) {
				this.forward();
			}
			else {
				this.back();
			}
			if (
				// skip silent voice
				'' == this.voice_name
				// no glyph
				|| !this.glyphs[this.index]
				// skip whitespace
				|| ' ' == this.glyphs[this.index].text
			) {
				continue;
			}
			if (!this.voices[this.voice_name]) {
				console.log('glyph voice name (' + this.voice_name + ') not in voices list');
				continue;
			}
			switch (this.voice_style) {
				case 'exclusive':
					if (!this.voice || this.voice.ended) {
						this.voice = this.voices[this.voice_name];
						this.voice.play();
					}
					break;
				case 'every_glyph':
				default:
					this.voice = this.voices[this.voice_name];
					this.voice.currentTime = 0;
					this.voice.play();
					break;
			}
		}
	}
}

export class Dialogue extends Entity {
	constructor(writers, controls) {
		super();
		this.writers = writers;
		this.controls = controls || {
			fast: ['z'],
			skip: ['x'],
			advance: ['x'],
		};
		this.fast_delay_ms = 20;
		this.index = -1;
		this.next_index = 0;
		this.fast_increase = 1;
		this.current_writer = null;
	}
	seek(index) {
		if (this.current_writer) {
			this.current_writer.disable();
			this.world.entity_manager.remove(this.current_writer);
		}
		this.current_writer = this.get_writer(index);
		if (!this.current_writer) {
			return;
		}
		this.world.entity_manager.add(this.current_writer);
		if (this.current_writer.on_seek && 'function' === typeof this.current_writer.on_seek) {
			this.current_writer.on_seek(this.current_writer);
		}
		this.current_writer.seek(-1, true);
		this.current_writer.play();
	}
	get_writer(index) {
		this.index = index;
		if (
			-1 < this.index
			&& this.writers.length > this.index
			&& 'function' === typeof this.writers[this.index].generator
		) {
			if (
				this.writers[this.index].target_index
				|| 0 === this.writers[this.index].target_index
			) {
				this.next_index = this.writers[this.index].target_index;
			}
			else {
				this.next_index = this.index + 1;
			}
			return this.writers[this.index].generator();
		}
		this.next_index = this.writers.length;
		return null;
	}
	advance() {
		this.seek(this.next_index);
	}
	set_fast_delay(writer) {
		writer.for_each_glyph(glyph => {
			if (!glyph.original_delay_ms) {
				glyph.original_delay_ms = glyph.delay_ms;
				glyph.delay_ms = this.fast_delay_ms;
			}
		});
		writer.forward();
	}
	restore_delay(writer) {
		writer.for_each_glyph(glyph => {
			if (glyph.original_delay_ms) {
				glyph.delay_ms = glyph.original_delay_ms;
				glyph.original_delay_ms = 0;
			}
		});
	}
	update() {
		if (!this.current_writer) {
			return;
		}
		if (this.current_writer.playing) {
			// skip
			let skip = false;
			for (let i in this.controls.skip) {
				if (input.pressed(this.controls.skip[i])) {
					skip = true;
					break;
				}
			}
			if (skip) {
				this.restore_delay(this.current_writer);
				this.current_writer.skip();
				this.current_writer.stop();
				return;
			}
			// fast
			let fast = false;
			for (let i in this.controls.fast) {
				if (input.down(this.controls.fast[i])) {
					fast = true;
					break;
				}
			}
			if (fast) {
				this.set_fast_delay(this.current_writer);
			}
			else {
				this.restore_delay(this.current_writer);
			}
			return;
		}
		//TODO writer chooser choices selection and index targetting
		// advance
		let advance = false;
		for (let i in this.controls.advance) {
			if (input.pressed(this.controls.advance[i])) {
				advance = true;
				break;
			}
		}
		if (advance) {
			console.log('advancing');
			this.restore_delay(this.current_writer);
			this.advance();
		}
	}
}

export class Particle extends Entity {
	constructor() {
		super();
		this.add_module(new Transform);
		this.emitter = null;
	}
	update() {
		this.transform.apply_velocity();
	}
	remove() {
		this.prune();
		if (this.emitter) {
			this.emitter.remove_particle(this);
		}
	}
}

export class Emitter extends Entity {
	constructor(
		width,
		height,
		emit_frequency_ms,
		direction,
		direction_variance,
		speed,
		speed_variance,
		generate_particle
	) {
		super();
		this.width = width || 1;
		this.height = height || 1;
		this.emit_frequency_ms = emit_frequency_ms;
		this.direction = direction;
		this.direction_variance = direction_variance;
		this.speed = speed;
		this.speed_variance = speed_variance;
		this.generate_particle = generate_particle;
		this.add_module(new Transform);
		this.particles = [];
		this.activated = false;
		this.timer = new Timer(this.emit_frequency_ms, () => {
			this.emit();
		});
	}
	activate() {
		this.activated = true;
		this.timer.start();
	}
	deactivate() {
		this.activated = false;
		this.timer.stop();
	}
	emit(x, y) {
		x = x ||  this.transform.x;
		y = y || this.transform.y;
		let p = this.generate_particle();
		p.timescale = this.timescale;
		p.transform.x = x - (this.width * 0.5) + (Math.random() * this.width);
		p.transform.y = y - (this.height * 0.5) + (Math.random() * this.height);
		let direction = this.direction;
		if (0 != this.direction_variance) {
			direction -= (this.direction_variance * 0.5);
			direction += (Math.random() * this.direction_variance);
		}
		let speed = this.speed;
		if (0 != this.speed_variance) {
			speed -= (this.speed_variance * 0.5);
			speed += (Math.random() * this.speed_variance);
		}
		p.transform.velocity.x = Math.cos(direction) * speed;
		p.transform.velocity.y = Math.sin(direction) * speed;
		p.emitter = this;
		this.world.entity_manager.add(p);
		this.particles.push(p);
		return p;
	}
	update() {
		if (!this.activated) {
			return;
		}
		this.timer.multi_check(this.timescale.delta);
	}
	remove_particle(particle) {
		let index = this.particles.indexOf(particle);
		if (-1 !== index) {
			this.particles.splice(index, 1);
		}
	}
}

export class PercentEmitter extends Emitter {
	// emits a percent of its area each emit_frequency_ms
	constructor(
		width,
		height,
		emit_frequency_ms,
		direction,
		direction_variance,
		speed,
		speed_variance,
		generate_particle,
		percent
	) {
		super(
			width,
			height,
			emit_frequency_ms,
			direction,
			direction_variance,
			speed,
			speed_variance,
			generate_particle
		);
		this.percent = percent;
		this.per_emit = Math.floor(this.width * this.height * this.percent);
	}
	emit() {
		for (let i = 0; i < this.per_emit; i++) {
			super.emit();
		}
	}
}

// modules
export class Module extends Entity {}

export class Transform extends Module {
	constructor(x, y, scale_x, scale_y, velocity_x, velocity_y, max_velocity) {
		super();
		this.x = x || 0;
		this.y = y || 0;
		this.scale = {
			x: scale_x || 1,
			y: scale_y || 1,
		};
		this.velocity = {
			x: velocity_x || 0,
			y: velocity_y || 0,
		};
		this.max_velocity = max_velocity || 1;
		this.source = {
			x: 0,
			y: 0
		};
		this.destination = {
			x: 0,
			y: 0
		};
		this.distance = {
			x: 0,
			y: 0
		};
		this.percent_traversed = 1;
	}
	on_add() {
		this.parent.transform = this;
	}
	apply_velocity() {
		if (0 > this.parent.timescale.delta) {
			console.log('negative delta time when applying transform velocity');
			return;
		}
		//TODO reorganize this to not use sqrt?
		if (
			this.max_velocity < Math.sqrt(
				Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)
			)
		) {
			this.velocity = this.normalize(this.max_velocity);
		}
		if (0 != this.velocity.x) {
			this.x += this.velocity.x * this.parent.timescale.delta;
		}
		if (0 != this.velocity.y) {
			this.y += this.velocity.y * this.parent.timescale.delta;
		}
	}
	normalize(velocity) {
		let norm = Math.sqrt(
			Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)
		);
		if (0 == norm) {
			return {
				x: 0,
				y: 0,
			};
		}
		return {
			x: velocity * (this.velocity.x / norm),
			y: velocity * (this.velocity.y / norm),
		};
	}
	set_direction(direction, speed) {
		this.velocity.x = Math.cos(direction) * speed;
		this.velocity.y = Math.sin(direction) * speed;
	}
	distance_to(x, y) {
		return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
	}
	move_to(x, y, duration) {
		if (!duration) {
			this.x = x;
			this.y = y;
			return;
		}
		this.duration = duration;
		this.elapsed = 0;
		this.percent_traversed = 0;
		this.source = {
			x: this.x,
			y: this.y
		};
		this.destination = {
			x: x,
			y: y
		};
		this.distance = {
			x: x - this.x,
			y: y - this.y
		};
	}
	update() {
		if (1 == this.percent_traversed) {
			return;
		}
		this.elapsed += this.parent.timescale.delta;
		this.percent_traversed = this.elapsed / this.duration;
		if (1 <= this.percent_traversed) {
			this.percent_traversed = 1;
			this.x = this.destination.x;
			this.y = this.destination.y;
			return;
		}
		this.x = this.source.x + (this.percent_traversed * this.distance.x);
		this.y = this.source.y + (this.percent_traversed * this.distance.y);
	}
}

export class Midpoint extends Module {
	constructor(target_transform_1, target_transform_2, weight) {
		super();
		this.target_transform_1 = target_transform_1;
		this.target_transform_2 = target_transform_2;
		this.weight = weight;
	}
	on_add() {
		this.parent.midpoint = this;
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
	}
	sync() {
		let dx = this.target_transform_1.x - this.target_transform_2.x;
		this.parent.transform.x = this.target_transform_1.x - dx * this.weight;
		let dy = this.target_transform_1.y - this.target_transform_2.y;
		this.parent.transform.y = this.target_transform_1.y - dy * this.weight;
	}
}

export class AutoMidpoint extends Midpoint {
	constructor(target_transform_1, target_transform_2, weight) {
		super(target_transform_1, target_transform_2, weight);
		this.priority = 2047;
	}
	update() {
		this.sync();
	}
}

export class Focus extends Module {
	constructor(restricted) {
		super();
		this.restricted = restricted || false;
	}
	on_add() {
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
		this.parent.focus = this.focus.bind(this);
	}
	focus() {
		let x = this.parent.transform.x;
		let y = this.parent.transform.y;
		if (this.restricted) {
			// restrict to screen area within world
			let r = {
				left: this.parent.world.apparent_screen_width / 2,
				right: this.parent.world.width - (this.parent.world.apparent_screen_width / 2),
				top: this.parent.world.apparent_screen_height / 2,
				bottom: this.parent.world.height - (this.parent.world.apparent_screen_height / 2),
			};
			if (x < r.left) {
				x = r.left;
			}
			else if (x > r.right) {
				x = r.right;
			}
			if (y < r.top) {
				y = r.top;
			}
			else if (y > r.bottom) {
				y = r.bottom;
			}
		}
		this.parent.world.set_focus(
			x,
			y,
			this.parent.world.zoom
		);
	}
}

export class AutoFocus extends Focus {
	constructor(restricted) {
		super(restricted);
		this.priority = 4095;
	}
	on_add() {
		super.on_add();
		if (!this.parent.autofocus) {
			this.parent.autofocus = this;
		}
	}
	update() {
		this.parent.focus();
	}
}

export class Rect extends Module {
	constructor(color, origin_x, origin_y, width, height) {
		super();
		this.color = color || '#ffffff';
		this.origin = {
			x: origin_x || 0,
			y: origin_y || 0,
		};
		this.width = width || 1;
		this.height = height || 1;
	}
	on_add() {
		this.parent.rect = this;
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
	}
	draw() {
		if (!this.parent.world) {
			return;
		}
		let rect = {
			//left: Math.round(this.parent.transform.x - this.origin.x * this.parent.transform.scale.x),
			//top: Math.round(this.parent.transform.y - this.origin.y * this.parent.transform.scale.y),
			//width: Math.round(this.width * this.parent.transform.scale.x),
			//height: Math.round(this.height * this.parent.transform.scale.y),
			left: this.parent.transform.x - this.origin.x * this.parent.transform.scale.x,
			top: this.parent.transform.y - this.origin.y * this.parent.transform.scale.y,
			width: this.width * this.parent.transform.scale.x,
			height: this.height * this.parent.transform.scale.y,
		};
		rect.right = rect.left + rect.width;
		rect.bottom = rect.top + rect.height;
		// if rect is outside of screen return early to skip drawing
		if (
				rect.bottom <= this.parent.world.offset.y
				|| rect.right <= this.parent.world.offset.x
				|| rect.top >= this.parent.world.offset.y + this.parent.world.apparent_screen_height
				|| rect.left >= this.parent.world.offset.x + this.parent.world.apparent_screen_width
			) {
			return;
		}
		this.parent.world.ctx.fillStyle = this.color;
		this.parent.world.ctx.fillRect(
			rect.left,
			rect.top,
			rect.width,
			rect.height
		);
	}
}

export class Sprite extends Module {
	// Sprite(image, origin_x, origin_y)
	// Sprite(spritesheet, origin_x, origin_y, sx, sy, width, height)
	constructor(image_or_spritesheet, origin_x, origin_y, sx, sy, width, height) {
		super();
		this.image;
		this.width;
		this.height;
		this.set_image(image_or_spritesheet, sx, sy, width, height);
		this.origin = {
			x: origin_x || 0,
			y: origin_y || 0,
		};
	}
	on_add() {
		this.parent.sprite = this;
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
	}
	static image_from_spritesheet(spritesheet, sx, sy, width, height) {
		let c = document.createElement('canvas');
		c.width = width;
		c.height = height;
		let ctx = c.getContext('2d');
		ctx.drawImage(
			spritesheet,
			sx,
			sy,
			width,
			height,
			0,
			0,
			width,
			height
		);
		return c;
	}
	set_image(image_or_spritesheet, sx, sy, width, height) {
		if (!image_or_spritesheet) {
			return;
		}
		// cutting from spritesheet
		if (width && height) {
			image_or_spritesheet = Sprite.image_from_spritesheet(
				image_or_spritesheet,
				sx,
				sy,
				width,
				height
			);
		}
		this.image = image_or_spritesheet;
		this.width = this.image.width;
		this.height = this.image.height;
	}
	static mirror(image) {
		let c = document.createElement('canvas');
		c.width = image.width;
		c.height = image.height;
		let ctx = c.getContext('2d');
		ctx.save();
		ctx.scale(-1, 1);
		ctx.drawImage(
			image,
			0,
			0,
			image.width * -1,
			image.height
		);
		ctx.restore();
		return c;
	}
	static flip(image) {
		let c = document.createElement('canvas');
		c.width = image.width;
		c.height = image.height;
		let ctx = c.getContext('2d');
		ctx.save();
		ctx.scale(-1, 1);
		ctx.drawImage(
			image,
			0,
			0,
			image.width,
			image.height * -1
		);
		ctx.restore();
		return c;
	}
	draw() {
		let image = this.image;
		if (!this.image) {
			return;
		}
		let rect = {
			//left: Math.round(this.parent.transform.x - this.origin.x * this.parent.transform.scale.x),
			//top: Math.round(this.parent.transform.y - this.origin.y * this.parent.transform.scale.y),
			//width: Math.round(this.width * this.parent.transform.scale.x),
			//height: Math.round(this.height * this.parent.transform.scale.y),
			left: this.parent.transform.x - this.origin.x * this.parent.transform.scale.x,
			top: this.parent.transform.y - this.origin.y * this.parent.transform.scale.y,
			width: this.width * this.parent.transform.scale.x,
			height: this.height * this.parent.transform.scale.y,
		};
		rect.right = rect.left + rect.width;
		rect.bottom = rect.top + rect.height;
		// if rect is outside of screen return early to skip drawing
		if (
				rect.bottom <= this.parent.world.offset.y
				|| rect.right <= this.parent.world.offset.x
				|| rect.top >= this.parent.world.offset.y + this.parent.world.apparent_screen_height
				|| rect.left >= this.parent.world.offset.x + this.parent.world.apparent_screen_width
			) {
			return;
		}
		this.parent.world.ctx.imageSmoothingEnabled = false;
		// draw the sprite image
		this.parent.world.ctx.drawImage(
			this.image,
			rect.left,
			rect.top,
			rect.width,
			rect.height
		);
	}
}

export class Animator extends Module {
	constructor(imagesheet, recipes) {
		super();
		this.animations = {};
		this.current_animation_name = '';
		this.current_animation = null;
		if (imagesheet && recipes) {
			for (let i in recipes) {
				let recipe = recipes[i];
				this.add_animation(recipe.name, new Animation(imagesheet, recipe));
			}
		}
	}
	mirror(value) {
		if ('undefined' == typeof value) {
			value = !this.mirrored;
		}
		this.mirrored = value;
	}
	flip(value) {
		if ('undefined' == typeof value) {
			value = !this.flipped;
		}
		this.flipped = value;
	}
	on_add() {
		this.parent.animator = this;
		if (!this.parent.sprite) {
			this.parent.add_module(new Sprite);
		}
	}
	add_animation(name, animation) {
		this.animations[name] = animation;
	}
	set_animation(name) {
		if (!this.animations[name]) {
			return;
		}
		this.current_animation_name = name;
		this.current_animation = this.animations[name];
	}
	update() {
		if (
			!this.current_animation
			|| this.current_animation.paused
			|| 0 == this.current_animation.loops
		) {
			return;
		}
		this.current_animation.timer.multi_check(this.parent.timescale.delta);
		// current frame is different than previous frame
		if (this.current_animation.current != this.current_animation.previous) {
			this.update_sprite();
		}
	}
	play(loops, cb, name) {
		this.set_animation(name);
		this.current_animation.play(loops, cb);
	}
	update_sprite() {
		//TODO update bound offsets for flipped/mirrored frames
		// update parent object sprite with frame data
		let current_frame = this.current_animation.frames[this.current_animation.current];
		if (this.mirrored && this.flipped) {
			this.parent.sprite.set_image(current_frame.mirrored_flipped_image);
			this.parent.sprite.origin.x = current_frame.image.width - current_frame.origin.x;
			this.parent.sprite.origin.y = current_frame.image.height - current_frame.origin.y;
		}
		else if (this.mirrored) {
			this.parent.sprite.set_image(current_frame.mirrored_image);
			this.parent.sprite.origin.x = current_frame.image.width - current_frame.origin.x;
			this.parent.sprite.origin.y = current_frame.origin.y;
		}
		else if (this.flipped) {
			this.parent.sprite.set_image(current_frame.flipped_image);
			this.parent.sprite.origin.x = current_frame.origin.x;
			this.parent.sprite.origin.y = current_frame.image.height - current_frame.origin.y;
		}
		else {
			this.parent.sprite.set_image(current_frame.image);
			this.parent.sprite.origin.x = current_frame.origin.x;
			this.parent.sprite.origin.y = current_frame.origin.y;
		}
	}
}

export class TransformMod extends Module {
	constructor(duration) {
		super();
		this.delta = 0;
		this.duration = duration || -1;
		this.timer = new Timer;
		this.active = false;
		this.mod = {
			x: 0,
			y: 0,
		};
	}
	on_add() {
		if (!this.parent.transform) {
			this.parent.add_module(new Transform);
		}
	}
	update() {
		this.timer.check(this.parent.timescale.delta);
		if (!this.active) {
			return;
		}
		// keep timer going for indefinite
		//TODO something better than resetting timer duration
		//TODO maybe in timer class allow indefinite
		if (-1 == this.duration) {
			this.timer.set(60000, () => {
				this.stop();
			});
		}
		this.restore();
		this.calculate();
		this.apply();
	}
	restore() {
		this.parent.transform.x -= this.mod.x;
		this.parent.transform.y -= this.mod.y;
	}
	calculate() {}
	apply() {
		this.parent.transform.x += this.mod.x;
		this.parent.transform.y += this.mod.y;
	}
	stop() {
		this.parent.transform.x -= this.mod.x;
		this.parent.transform.y -= this.mod.y;
		this.active = false;
		this.timer.stop();
	}
	start(duration) {
		this.duration = duration || this.duration || -1;
		duration = this.duration;
		if (-1 == duration) {
			duration = 60000;
		}
		this.timer.set(duration, () => {
			this.stop();
		});
		this.active = true;
	}
}

export class TransformModWave extends TransformMod {
	constructor(intensity, frequency, duration) {
		super(duration);
		this.intensity = intensity;
		this.frequency = frequency;
	}
	start(intensity, frequency, duration) {
		this.intensity = intensity || this.intensity;
		this.frequency = frequency || this.frequency;
		super.start(duration);
	}
}

export class Shaker extends TransformModWave {
	constructor(intensity, frequency, duration) {
		super(intensity, frequency, duration);
		this.aggregate_delta = 0;
		this.half_intensity = this.intensity / 2;
	}
	calculate() {
		this.aggregate_delta += this.parent.timescale.delta;
		if (this.aggregate_delta < this.frequency) {
			return;
		}
		while (this.aggregate_delta > this.frequency) {
			this.aggregate_delta -= this.frequency;
		}
		let max = this.intensity * this.timer.percent.remaining;
		let min = this.half_intensity * this.timer.percent.remaining;
		let x_direction = Math.random() < 0.5 ? 1 : -1;
		let y_direction = Math.random() < 0.5 ? 1 : -1;
		this.mod.x = x_direction * ((max * Math.random()) + min) * this.parent.transform.scale.x;
		this.mod.y = y_direction * ((max * Math.random()) + min) * this.parent.transform.scale.y;
	}
	on_add() {
		super.on_add();
		this.parent.shaker = this;
	}
	start(intensity, frequency, duration) {
		super.start(intensity, frequency, duration);
		this.half_intensity = this.intensity / 2;
	}
}

export class Roller extends TransformModWave {
	constructor(intensity, frequency, starting_direction, clockwise, duration) {
		super(intensity, frequency, duration);
		this.direction = starting_direction || 0;
		this.clockwise = !clockwise || true;
	}
	on_add() {
		super.on_add();
		this.parent.roller = this;
	}
	start(intensity, frequency, starting_direction, clockwise, duration) {
		super.start(intensity, frequency, duration);
		if (0 === starting_direction) {
			this.direction = 0;
		}
		else {
			this.direction = starting_direction || this.direction || 0;
		}
		this.clockwise = clockwise || this.clockwise || false;
	}
	calculate() {
		let direction_mod = this.parent.timescale.delta * this.frequency;
		if (this.clockwise) {
			this.direction -= direction_mod;
		}
		else {
			this.direction += direction_mod;
		}
		let x_component = Math.sin(this.direction);
		let y_component = Math.cos(this.direction);
		this.mod.x = x_component * this.intensity * this.timer.percent.remaining * this.parent.transform.scale.x;
		this.mod.y = y_component * this.intensity * this.timer.percent.remaining * this.parent.transform.scale.y;
	}
}

export class TransformModShift extends TransformMod {
	constructor(begin_x, begin_y, end_x, end_y, duration) {
		super(duration);
		this.begin = {
			x: begin_x,
			y: begin_y,
		};
		this.end = {
			x: end_x,
			y: end_y,
		};
		this.amount = {
			x: this.end.x + this.begin.x,
			y: this.end.y + this.begin.y,
		};
	}
	stop() {
		this.parent.transform.x -= this.mod.x;
		this.parent.transform.y -= this.mod.y;
		this.parent.transform.x += this.amount.x * this.parent.transform.scale.x;
		this.parent.transform.y += this.amount.y * this.parent.transform.scale.y;
		this.active = false;
		this.timer.stop();
	}
}

export class Shifter extends TransformModShift {
	on_add() {
		super.on_add();
		this.parent.shifter = this;
	}
	calculate() {
		this.mod.x = (this.begin.x + (this.end.x * this.timer.percent.complete)) * this.parent.transform.scale.x;
		this.mod.y = (this.begin.y + (this.end.y * this.timer.percent.complete)) * this.parent.transform.scale.y;
	}
}

export class Scaler extends TransformModShift {
	on_add() {
		super.on_add();
		this.parent.scaler = this;
	}
	restore() {
		this.parent.transform.scale.x -= this.mod.x;
		this.parent.transform.scale.y -= this.mod.y;
	}
	calculate() {
		this.mod.x = this.begin.x + (this.end.x * this.timer.percent.complete);
		this.mod.y = this.begin.y + (this.end.y * this.timer.percent.complete);
	}
	apply() {
		this.parent.transform.scale.x += this.mod.x;
		this.parent.transform.scale.y += this.mod.y;
	}
	stop() {
		this.parent.transform.scale.x -= this.mod.x;
		this.parent.transform.scale.y -= this.mod.y;
		this.parent.transform.scale.x += this.amount.x;
		this.parent.transform.scale.y += this.amount.y;
		this.active = false;
		this.timer.stop();
	}
}

export class EdgeDetector extends Module {
	constructor(
		name,
		collides,
		width,
		height,
		vertical_detector_percent = 0.5,
		horizontal_detector_percent = 0.5,
	) {
		super();
		this.name = name;
		this.collides = collides;
		this.width = width;
		this.height = height;
		this.detector_percent = {
			horizontal: horizontal_detector_percent,
			vertical: vertical_detector_percent,
		};
		//TODO precedence order
		//TODO flag for whether vertical or horizontal claims center
		this.edges = {
			left: null,
			right: null,
			bottom: null,
			top: null,
		};
	}
	on_add() {
		this.parent.edge_detector = this;
		let half_width = this.width / 2;
		let half_height = this.height / 2;
		let vertical_detector_width = this.width * this.detector_percent.horizontal;
		let vertical_detector_height = half_height;
		let vertical_detector_offset_x = vertical_detector_width / -2;
		let horizontal_detector_width = (this.width - vertical_detector_width) / 2;
		let horizontal_detector_height = this.height * this.detector_percent.vertical;
		let horizontal_detector_offset_y = horizontal_detector_height / -2;
		// top
		this.edges.top = new Bound(
			this.name,
			this.collides,
			vertical_detector_offset_x,
			-1 * half_height, // offset y
			vertical_detector_width,
			vertical_detector_height
		);
		this.parent.add_module(this.edges.top);
		// bottom
		this.edges.bottom = new Bound(
			this.name,
			this.collides,
			vertical_detector_offset_x,
			0, // offset y
			vertical_detector_width,
			vertical_detector_height
		);
		this.parent.add_module(this.edges.bottom);
		// left
		this.edges.left = new Bound(
			this.name,
			this.collides,
			-1 * half_width, // offset x
			horizontal_detector_offset_y,
			horizontal_detector_width,
			horizontal_detector_height
		);
		this.parent.add_module(this.edges.left);
		// right
		this.edges.right = new Bound(
			this.name,
			this.collides,
			half_width - horizontal_detector_width, // offset x
			horizontal_detector_offset_y,
			horizontal_detector_width,
			horizontal_detector_height
		);
		this.parent.add_module(this.edges.right);
		//TODO maybe individual percentage for each edge detector later
	}
}

export class EdgeEjector extends EdgeDetector {
	eject() {
		let ejecting = false;
		if (BoundManager.check(this.edges.top, 'during')) {
			this.eject_top();
			ejecting = true;
		}
		if (BoundManager.check(this.edges.bottom, 'during')) {
			this.eject_bottom();
			ejecting = true;
		}
		if (BoundManager.check(this.edges.left, 'during')) {
			this.eject_left();
			ejecting = true;
		}
		if (BoundManager.check(this.edges.right, 'during')) {
			this.eject_right();
			ejecting = true;
		}
		return ejecting;
	}
	eject_top() {
		// move parent transform so top of top detector is at bottom of bound being collided
		let bottommost_y = this.bottommost_edge(this.edges.top.colliding);
		let top_y = this.edges.top.offset.y + this.parent.transform.y;
		let dy = bottommost_y - top_y;
		this.parent.transform.y += dy;
	}
	eject_bottom() {
		// move parent transform so bottom of bottom detector is at top of bound being collided
		let topmost_y = this.topmost_edge(this.edges.bottom.colliding);
		let bottom_y = this.edges.bottom.offset.y + this.edges.bottom.height + this.parent.transform.y;
		let dy = topmost_y - bottom_y;
		this.parent.transform.y += dy;
	}
	eject_left() {
		// move parent transform so left of left detector is at right of bound being collided
		let rightmost_x = this.rightmost_edge(this.edges.left.colliding);
		let left_x = this.edges.left.offset.x + this.parent.transform.x;
		let dx = rightmost_x - left_x;
		this.parent.transform.x += dx;
	}
	eject_right() {
		// move parent transform so right of right detector is at left of bound being collided
		let leftmost_x = this.leftmost_edge(this.edges.right.colliding);
		let right_x = this.edges.right.offset.x + this.edges.right.width + this.parent.transform.x;
		let dx = leftmost_x - right_x;
		this.parent.transform.x += dx;
	}
	topmost_edge(bounds) {
		let edge = null;
		for (let i in bounds) {
			let bound = bounds[i];
			let bound_edge = bound.offset.y + bound.parent.transform.y;
			if (null == edge || edge > bound_edge) {
				edge = bound_edge;
			}
		}
		return edge;
	}
	bottommost_edge(bounds) {
		let edge = null;
		for (let i in bounds) {
			let bound = bounds[i];
			let bound_edge = bound.offset.y + bound.height + bound.parent.transform.y;
			if (null == edge || edge < bound_edge) {
				edge = bound_edge;
			}
		}
		return edge;
	}
	leftmost_edge(bounds) {
		let edge = null;
		for (let i in bounds) {
			let bound = bounds[i];
			let bound_edge = bound.offset.x + bounds[i].parent.transform.x;
			if (null == edge || edge > bound_edge) {
				edge = bound_edge;
			}
		}
		return edge;
	}
	rightmost_edge(bounds) {
		let edge = null;
		for (let i in bounds) {
			let bound = bounds[i];
			let bound_edge = bound.offset.x + bound.width + bounds[i].parent.transform.x;
			if (null == edge || edge < bound_edge) {
				edge = bound_edge;
			}
		}
		return edge;
	}
}

export class EdgeEjectorStopper extends EdgeEjector {
	eject_top() {
		super.eject_top();
		this.parent.transform.velocity.y = 0;
	}
	eject_bottom() {
		super.eject_bottom();
		this.parent.transform.velocity.y = 0;
	}
	eject_left() {
		super.eject_left();
		this.parent.transform.velocity.x = 0;
	}
	eject_right() {
		super.eject_right();
		this.parent.transform.velocity.x = 0;
	}
}

export class Wiper extends Entity {
	constructor(color, duration, cb) {
		super();
		this.timer = new Timer(duration, cb);
		this.timer.stopped = true;
		this.color = color;
	}
	update() {
		this.timer.check_stop(this.timescale.delta);
	}
	reset() {
		this.timer.reset();
	}
	start() {
		this.timer.start();
	}
	stop() {
		this.timer.stop();
	}
	restart() {
		this.timer.reset();
		this.timer.start();
	}
}

export class FlatWiper extends Wiper {
	constructor(direction, color, duration, cb) {
		super(color, duration, cb);
		//TODO some more extensible version based around fractional directions
		//TODO instead of just cardinal
		this.direction = direction || 'ltr';
	}
	draw() {
		if (0 == this.timer.percent.complete) {
			return;
		}
		let sx = 0;
		let sy = 0;
		let width = 0;
		let height = 0;
		switch (this.direction) {
			case 'ttb':
				width = this.world.width;
				height = this.world.height * this.timer.percent.complete;
				break;
			case 'btt':
				width = this.world.width;
				height = this.world.height * this.timer.percent.complete;
				sy = this.world.height - height;
				break;
			case 'rtl':
				width = this.world.width * this.timer.percent.complete;
				height = this.world.height;
				sx = this.world.width - width;
				break;
			case 'ltr':
			default:
				width = this.world.width * this.timer.percent.complete;
				height = this.world.height;
				break;
		}
		this.world.ctx.fillStyle = this.color;
		this.world.ctx.fillRect(
			sx,
			sy,
			width,
			height
		);
	}
}

export class PinwheelWiper extends Wiper {
	constructor(segments, color, duration, reverse, offset_per_ms, cb) {
		super(color, duration, cb);
		this.segments = Math.abs(segments) || 1;
		this.segment_angle = Math.PI * 2 / this.segments;
		this.add_module(new Transform);
		this.world_diag = Math.sqrt(screen.width * screen.width + screen.height * screen.height);
		this.reverse = reverse || false;
		this.offset = 0;
		this.offset_per_ms = offset_per_ms || 0;
		//TODO clockwise/counterclockwise
	}
	on_add() {
		//TODO update world diag if world is resized after creation?
		this.world_diag = Math.sqrt(
			this.world.width * this.world.width
			+ this.world.height * this.world.height
		);
	}
	update() {
		super.update();
		this.offset += this.offset_per_ms * this.timescale.delta;
	}
	draw() {
		this.world.ctx.fillStyle = this.color;
		let percent = this.timer.percent.complete;
		let offset = this.offset;
		if (this.reverse) {
			percent = this.timer.percent.remaining;
			offset *= -1;
		}
		if (0 == percent) {
			return;
		}
		if (1 == percent) {
			this.world.ctx.fillRect(
				0,
				0,
				this.world.width,
				this.world.height,
			);
			return;
		}
		let segment_percent = (this.segment_angle + offset) * percent;
		for (let i = 0; i < this.segments; i++) {
			let start_angle = this.segment_angle * i + offset;
			let end_angle = start_angle + segment_percent;
			this.world.ctx.beginPath();
			this.world.ctx.arc(
				this.transform.x,
				this.transform.y,
				this.world_diag,
				start_angle,
				end_angle
			);
			this.world.ctx.lineTo(this.transform.x, this.transform.y);
			this.world.ctx.fill();
		}
	}
}

