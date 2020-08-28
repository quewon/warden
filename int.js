var int = {};
var int_color = [];
int_color[0] = 'transparent';
int_color[1] = style.getPropertyValue('--primary');
int_color[2] = style.getPropertyValue('--secondary');
var int_library = {
	player: {
		x: cellsize*(3+Math.round(Math.random())),
		y: cellsize*(3+Math.round(Math.random())),
		force: 0,
		room: 'dock',
		interaction: undefined,
		design: [
				[1, 1, 1, 1, 1, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 1, 0, 0, 1, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 1, 1, 1, 1, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 1, 1, 1, 1, 1, 1, 1],
				],
	},
	cargo: {
		x: -1, //random x
		y: -1, //random y
		force: -1,
		room: 'dock',
		interaction: undefined,
		design: [
				[2, 2, 2, 2, 2, 2, 2, 2],
				[2, 0, 0, 2, 2, 0, 0, 2],
				[2, 0, 1, 2, 2, 1, 0, 2],
				[2, 2, 2, 2, 2, 2, 2, 2],
				[2, 2, 2, 2, 2, 2, 2, 2],
				[2, 0, 1, 2, 2, 1, 0, 2],
				[2, 0, 0, 2, 2, 0, 0, 2],
				[2, 2, 2, 2, 2, 2, 2, 2],
				],
	},
	empty_cargo: {
		x: -1,
		y: -1,
		force: -1,
		room: 'dock',
		interaction: undefined,
		design: [
				[2, 2, 2, 2, 2, 2, 2, 2],
				[2, 0, 0, 2, 2, 0, 0, 2],
				[2, 0, 0, 2, 2, 0, 0, 2],
				[2, 2, 2, 2, 2, 2, 2, 2],
				[2, 2, 2, 2, 2, 2, 2, 2],
				[2, 0, 0, 2, 2, 0, 0, 2],
				[2, 0, 0, 2, 2, 0, 0, 2],
				[2, 2, 2, 2, 2, 2, 2, 2],
				],
	},

	captain: {
		x: cellsize*2,
		y: cellsize*2,
		force: 1,
		room: 'dock',
		interaction: "hi there  warden shouldnt u be hauling cargo",
		design: [
				[1, 2, 1, 2, 2, 1, 2, 1],
				[1, 2, 1, 2, 2, 1, 2, 1],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 1, 0, 0, 1, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 1, 1, 1, 1, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 1, 1, 1, 1, 1, 1, 1],
				],
	},
	crew: {
		x: -1,
		y: -1,
		force: 1,
		room: 'ctrl',
		interaction: "hello im busy doing crew stuff",
		design: [
				[2, 2, 2, 2, 2, 2, 2, 2],
				[2, 2, 2, 2, 2, 2, 2, 2],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 1, 0, 0, 1, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 1, 1, 1, 1, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 1],
				[1, 1, 1, 1, 1, 1, 1, 1],
				],
	},
}

function drawInts() {
	let ints = Object.getOwnPropertyNames(int);
	for (let i=0; i<ints.length; i++) {
		if (int[ints[i]].room!=int.player.room) { continue }
		drawInt(ints[i]);
	}

	function drawInt(subject) {
		const { x, y, design } = int[subject];

		let dx=x, dy=y;
		let d = design;

		for (let i=0; i<8; i++) {
			for (let ii=0; ii<8; ii++) {
				c.fillStyle = int_color[d[i][ii]];
				c.fillRect(dx,dy,pixelsize,pixelsize);
				dx += pixelsize;
			}
			dx=x;
			dy+=pixelsize;
		}
	}
}

//SPAWNING
function intGen() {
	spawnInt('player', 'player');
	spawnInt('captain', 'captain');

	let cargo_value = 3;
	let empty_cargo_value = 6;
	let crew_value = 1;

	for (let i=0; i<cargo_value; i++) {
		const name = 'cargo'+i;
		spawnInt('cargo', name);
	}
	for (let i=0; i<empty_cargo_value; i++) {
		const name = 'empty_cargo'+i;
		spawnInt('empty_cargo', name);
	}
	for (let i=0; i<crew_value; i++) {
		const name = 'crew'+i;
		spawnInt('crew', name);
	}
}

function spawnInt(type, name) {
	const { x, y, force, room, design, interaction } = int_library[type];

	int[name] = {};
	int[name].room = room;
	int[name].design = design;
	int[name].force = force;
	int[name].interaction = interaction;

	const empty_space = findEmptySpace(room);
	
	if (x < 0) { int[name].x = empty_space.x; }
	else { int[name].x = x; }

	if (y < 0) { int[name].y = empty_space.y; }
	else { int[name].y = y; }
}

function findEmptySpace(room_name) {
	//get coordinates of ints in the room
	let ints = Object.getOwnPropertyNames(int);
	let ints_in_room = [];

	for (let i=0; i<ints.length-1; i++) {
		if (int[ints[i]].room==room_name) {
			ints_in_room.push([int[ints[i]].x, int[ints[i]].y])
		}
	}

	let potential_cells = [
		[cellsize, cellsize], [cellsize*2, cellsize], [cellsize*3, cellsize], [cellsize*4, cellsize], [cellsize*5, cellsize], [cellsize*6, cellsize],
		[cellsize, cellsize*2], [cellsize*2, cellsize*2], [cellsize*3, cellsize*2], [cellsize*4, cellsize*2], [cellsize*5, cellsize*2], [cellsize*6, cellsize*2],
		[cellsize, cellsize*3], [cellsize*2, cellsize*3], [cellsize*3, cellsize*3], [cellsize*4, cellsize*3], [cellsize*5, cellsize*3], [cellsize*6, cellsize*3],
		[cellsize, cellsize*4], [cellsize*2, cellsize*4], [cellsize*3, cellsize*4], [cellsize*4, cellsize*4], [cellsize*5, cellsize*4], [cellsize*6, cellsize*4],
		[cellsize, cellsize*5], [cellsize*2, cellsize*5], [cellsize*3, cellsize*5], [cellsize*4, cellsize*5], [cellsize*5, cellsize*5], [cellsize*6, cellsize*5],
		[cellsize, cellsize*6], [cellsize*2, cellsize*6], [cellsize*3, cellsize*6], [cellsize*4, cellsize*6], [cellsize*5, cellsize*6], [cellsize*6, cellsize*6]
	];

	//remove coords of objects in room from potential areas
	for (let i=0; i<ints_in_room.length; i++) {
		let index=0;
		for (let ii=0; ii<potential_cells.length; ii++) {
			if (potential_cells[ii][0]==ints_in_room[i][0] &&
				potential_cells[ii][1]==ints_in_room[i][1]) {
				index=ii;
				break
			}
		}

		potential_cells.splice(index,1)
	}

	if (potential_cells.length==0) { return null }

	const empty_cell = potential_cells[Math.floor(Math.random()*potential_cells.length)];
	return {x: empty_cell[0], y: empty_cell[1]};
}

//MOVEMENT
function move(subject, dir) {
	//get surrounding objects before moving
	let s = opposing(subject, dir);

	//subject moves
	if (!canMove(subject, dir)) { return }
	else {
		let c = colliding(subject, dir);

		if (c==null) {
			int[subject].x += dir_coords[dir].x;
			int[subject].y += dir_coords[dir].y;
		}

		else if (c.indexOf('out_of_bounds')>=0) {
			if (c=='out_of_bounds') {
				changeRoom(subject);
			}
			else {
				c = c.replace('out_of_bounds', '');
				if (canMove(c, dir)) {
					move(c, dir);
					changeRoom(subject);
				}
			}
		}

		else {
			//it must be an object that can be moved
			if (canMove(c, dir)) {
				move(c, dir);
				int[subject].x += dir_coords[dir].x;
				int[subject].y += dir_coords[dir].y;
			}
		}
	}

	//only player can drag
	if (subject=='player' && s && interacting && int[subject].force > int[s].force) {
		move(s, dir);
		dragging = true;
	}
}

function canMove(subject, dir) {
	let c = colliding(subject, dir);
	if (c==null) { return true }
	if (c=='wall') { return false }

	//object is not out of bounds
	else if (c.indexOf('out_of_bounds')===-1 &&
			int[c].force < int[subject].force) { return true }

	//object is out of bounds
	else if (c.indexOf('out_of_bounds')>=0) {
		//out of bounds but empty
		if (c=='out_of_bounds') { return true }

		//out of bounds but has object
		c = c.replace('out_of_bounds','');
		if (int[c].force < int[subject].force) { return true }
	}

	return false
}

function changeRoom(subject) {
	const { x, y } = int[subject];

	let newx = x, newy = y;

	if (y==0) { newy = cellsize*7 }
	else if (x==0) { newx = cellsize*7 }
	else if (y==cellsize*7) { newy = 0 }
	else if (x==cellsize*7) {newx = 0 }

	int[subject].room = nextRoom(subject);

	//place object in entrance of next room
	int[subject].x = newx;
	int[subject].y = newy;
}

function nextRoom(subject) {
	const { x, y, room } = int[subject];

	let rooms = Object.getOwnPropertyNames(map);
	let room_name = room;

	let rx = map[room].x;
	let ry = map[room].y;

	if (y==0) { ry--; }
	else if (x==0) { rx--; }
	else if (y==cellsize*7) { ry++; }
	else if (x==cellsize*7) { rx++; }

	for (let i=0; i<Object.keys(map).length; i++) {
		if (map[rooms[i]].x == rx && map[rooms[i]].y == ry) {
			room_name = rooms[i];
		}
	}

	return room_name
}

//INTERACTION
function interact(subject) {
	if (int[subject].interaction==undefined) { return }

	if (int_box.style.display=="none") {
		//interact with subject
		int_box_text.textContent = int[subject].interaction;
		pause_locked = true;
		int_box.style.display = "block";
	} else {
		pause_locked = false;
		int_box.style.display = "none";
	}
}

//COLLISION
var dir_coords = [
	{x: 0, y: -cellsize},
	{x: -cellsize, y: 0},
	{x: 0, y: cellsize},
	{x: cellsize, y: 0}
];

//get whatever it's colliding with
function colliding(subject, dir) {
	const { x, y, room } = int[subject];

	//colliding with wall
	let cx = x/cellsize;
	let cy = y/cellsize;

	switch (dir) {
		case 0:
			cy--;
			break;
		case 1:
			cx--;
			break;
		case 2:
			cy++;
			break;
		case 3:
			cx++;
			break;
	}

	if (r[cy]==undefined || r[cx]==undefined) {
		//check if there is an object colliding in the next room
		let room_tax = {x:0,y:0};

		switch (dir) {
			case 0:
				room_tax.y = cellsize*7;
				break;
			case 1:
				room_tax.x = cellsize*7;
				break;
			case 2:
				room_tax.y = cellsize*-7;
				break;
			case 3:
				room_tax.x = cellsize*-7;
				break;
		}

		cx = x+room_tax.x;
		cy = y+room_tax.y;

		let ints = Object.getOwnPropertyNames(int);
		let potential_output = '';
		for (let i=0; i<ints.length; i++) {
			if (int[ints[i]].room==nextRoom(subject) &&
				int[ints[i]].x==cx && int[ints[i]].y==cy) {
				potential_output = ints[i]
				break
			}
		}

		return 'out_of_bounds'+potential_output
	}
	else if (r[cy][cx] != 0) { return 'wall' }

	//colliding with interactable object
	cx = x+dir_coords[dir].x;
	cy = y+dir_coords[dir].y;

	let ints = Object.getOwnPropertyNames(int);
	for (let i=0; i<ints.length; i++) {
		let potential_output = ints[i];
		if (int[potential_output].room==room &&
			int[potential_output].x==cx && int[potential_output].y==cy) {
			return potential_output
		}
	}

	return null
}

function opposing(subject, dir) {
	let s = surrounding(subject);

	for (let i=0; i<s.length; i++) {
		let sx,sy,potential_subject;
		//if s has an outofbounds object
		if (s[i].indexOf('out_of_bounds')>=0) {
			potential_subject = s[i].replace('out_of_bounds','');
			sx = int[potential_subject].x;
			sy = int[potential_subject].y
			if (sy==0) { sy=cellsize*8 }
			else if (sy==cellsize*7) { sy=cellsize*-1 }
			if (sx==0) { sx=cellsize*8 }
			else if (sx==cellsize*7) { sx=cellsize*-1 }
		} else {
			potential_subject = s[i];
			sx = int[s[i]].x;
			sy = int[s[i]].y;
		}

		if (sx==int[subject].x-dir_coords[dir].x &&
			sy==int[subject].y-dir_coords[dir].y) {
			return potential_subject
		}
	}

	return null
}

function surrounding(subject) {
	let s = [];

	for (let i=0; i<4; i++) {
		let potential_subject = colliding(subject,i)
		if (potential_subject!=null &&
			potential_subject!='out_of_bounds' &&
			potential_subject!='wall') {
			s.push(potential_subject);
		}
	}

	return s
}

function surroundingInteractable(subject) {
	let s = surrounding(subject);

	for (let i=s.length-1; i>=0; i--) {
		if (int[s[i]].interaction==undefined) {
			s.splice(i,1)
		}
	}

	return s
}