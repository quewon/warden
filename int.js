var int = {};
var int_color = [];
int_color[0] = 'transparent';
int_color[1] = style.getPropertyValue('--primary');
int_color[2] = style.getPropertyValue('--secondary');
int_color[3] = style.getPropertyValue('--tertiary');
var int_design = {
	player: [
			[1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1]
	],
	cargo: [
			[2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2]
	]
}

function drawInts() {
	let ints = Object.getOwnPropertyNames(int);
	for (let i=0; i<ints.length; i++) {
		if (int[ints[i]].room!=int.player.room) { continue }
		drawInt(ints[i]);
	}

	function drawInt(subject) {
		let x=int[subject].x, y=int[subject].y;
		let d = int[subject].design;

		for (let i=0; i<8; i++) {
			for (let ii=0; ii<8; ii++) {
				c.fillStyle = int_color[d[i][ii]];
				c.fillRect(x,y,pixelsize,pixelsize);
				x += pixelsize;
			}
			x=int[subject].x;
			y+=pixelsize;
		}
	}
}

function interact(subject) {
	//TODO
	console.log('interacting with '+subject)
}

function intGen() {
	let cargo_value = 2;
	for (let i=0; i<cargo_value; i++) {
		const name = 'cargo'+i;
		spawnInt(name, -1, int.player.room, 'cargo');
	}
}

//COLLISION
function colliding(subject, dir) { //get whatever it's colliding with
	//colliding with wall
	let x = int[subject].x/cellsize;
	let y = int[subject].y/cellsize;

	if (dir==0) { y -= 1 }
	else if (dir==1) { x -= 1 }
	else if (dir==2) { y += 1 }
	else if (dir==3) { x += 1 }

	if (r[y]==undefined || r[x]==undefined) {
		//check if there is an object colliding in the next room
		let room_tax = {x:0,y:0};
		if (dir==0) { room_tax.y = cellsize*7 }
		else if (dir==1) { room_tax.x = cellsize*7 }
		else if (dir==2) { room_tax.y = cellsize*-7}
		else if (dir==3) { room_tax.x = cellsize*-7 }

		x = int[subject].x+room_tax.x;
		y = int[subject].y+room_tax.y;

		let ints = Object.getOwnPropertyNames(int);
		let potential_output = '';
		for (let i=0; i<ints.length; i++) {
			if (int[ints[i]].room==nextRoom(subject) &&
				int[ints[i]].x==x && int[ints[i]].y==y) {
				potential_output = ints[i]
				break
			}
		}

		return 'out_of_bounds'+potential_output
	}
	else if (r[y][x] != 0) { return 'wall' }

	//colliding with interactable object
	x = int[subject].x+dir_coords[dir].x;
	y = int[subject].y+dir_coords[dir].y;

	let ints = Object.getOwnPropertyNames(int);
	for (let i=0; i<ints.length; i++) {
		let potential_output = ints[i];
		if (int[potential_output].room==int[subject].room &&
			int[potential_output].x==x && int[potential_output].y==y) {
			return potential_output
		}
	}

	return null
}

function changeRoom(subject) {
	let newx = int[subject].x, newy = int[subject].y;

	if (int[subject].y==0) { newy = cellsize*7 }
	else if (int[subject].x==0) { newx = cellsize*7 }
	else if (int[subject].y==cellsize*7) { newy = 0 }
	else if (int[subject].x==cellsize*7) {newx = 0 }

	int[subject].room = nextRoom(subject);

	//place object in entrance of next room
	int[subject].x = newx;
	int[subject].y = newy;
}

function nextRoom(subject) {
	let rooms = Object.getOwnPropertyNames(map);
	let room_name = int[subject].room;

	let rx = map[int[subject].room].x;
	let ry = map[int[subject].room].y;

	if (int[subject].y==0) { ry--; }
	else if (int[subject].x==0) { rx--; }
	else if (int[subject].y==cellsize*7) { ry++; }
	else if (int[subject].x==cellsize*7) { rx++; }

	for (let i=0; i<Object.keys(map).length; i++) {
		if (map[rooms[i]].x == rx && map[rooms[i]].y == ry) {
			room_name = rooms[i];
		}
	}

	return room_name
}

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
	if (subject=='player' && s && interacting) {
		move(s, dir);
		dragging = true;
	}
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
			s.push(potential_subject)
		}
	}

	return s
}
var dir_coords = [
	{x: 0, y: -cellsize},
	{x: -cellsize, y: 0},
	{x: 0, y: cellsize},
	{x: cellsize, y: 0}
];

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

//PLAYER
//player initialization
int.player = {};
int.player.x = cellsize*(3+Math.round(Math.random()));
int.player.y = cellsize*(3+Math.round(Math.random()));
int.player.design = int_design.player;
int.player.force = 0;

//OTHER INTS
function spawnInt(subject, f, room_name, d) { //intname, force, roomname, design
	int[subject] = {};
	int[subject].room = room_name;
	int[subject].design = int_design[d];
	int[subject].force = f;
	int[subject].interact = "";

	let empty_space = findEmptySpace(room_name);

	int[subject].x = empty_space.x;
	int[subject].y = empty_space.y;
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

	let empty_cell = potential_cells[Math.floor(Math.random()*potential_cells.length)];

	return {x: empty_cell[0], y: empty_cell[1]};
}