var mob = {};
var encountered_mobs = [];
var stb = [];
stb[0] = 'transparent';
stb[1] = style.getPropertyValue('--primary');
stb[2] = style.getPropertyValue('--secondary');
stb[3] = style.getPropertyValue('--tertiary');
var mob_design = {
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

function drawMobs() {
	let mobs = Object.getOwnPropertyNames(mob);
	for (let i=0; i<mobs.length; i++) {
		if (i!='player' && mob[mobs[i]].room!=mob.player.room) { continue }
		drawMob(mobs[i]);
	}

	function drawMob(m) {
		let x=mob[m].x, y=mob[m].y;
		let d = mob[m].design;

		if (typeof d=='string') {
			c.fillStyle = d;
			c.fillRect(x,y,cellsize,cellsize)
		} else if (typeof d=='object') {
			for (let i=0; i<8; i++) {
				for (let ii=0; ii<8; ii++) {
					c.fillStyle = stb[d[i][ii]];
					c.fillRect(x,y,pixelsize,pixelsize);
					x += pixelsize;
				}
				x=mob[m].x;
				y+=pixelsize;
			}
		}
	}
}

function interactMob(m) {
	//TODO
}

function mobGen() {
	//TODO
	spawnMob('cargo', -1);
	mob.cargo.interact = "cargo can't talk.";
}

//COLLISION
function isCollidingSta(m, dir) {
	let v = false;
	let x = mob[m].x, y = mob[m].y;
	x = x/cellsize, y = y/cellsize;

	if (dir==0) { y -= 1 }
	else if (dir==1) { x -= 1 }
	else if (dir==2) { y += 1 }
	else if (dir==3) { x += 1 }

	if (r[y] == undefined || r[x] == undefined) { changeRoom(m) }
	else if (r[y][x] != 0) { v = true }

	return v
}

function collidingMobs(m, dir) {
	let v = [];
	x = mob.player.x, y = mob.player.y;

	if (dir==0) { y -= cellsize }
	else if (dir==1) { x -= cellsize }
	else if (dir==2) { y += cellsize }
	else if (dir==3) { x += cellsize }

	let mobs = Object.getOwnPropertyNames(mob);
	for (let i=0; i<mobs.length; i++) {
		let subject = mob[mobs[i]];
		if (subject.room==mob[m].room && subject.x==x && subject.y==y) {
			v.push(mobs[i])
		}
	}

	return v
}

function surroundingMobs(m) {
	let v = [];

	x = mob[m].x, y = mob[m].y;

	let e = [ //adjacent cells
		{x: x, y: y-cellsize},
		{x: x-cellsize, y: y},
		{x: x, y: y+cellsize},
		{x: x+cellsize, y: y}
	];

	let mobs = Object.getOwnPropertyNames(mob);
	for (let i=0; i<mobs.length; i++) {
		let subject = mob[mobs[i]];

		for (let ii=0; ii<e.length; ii++) {
			if (subject.room==mob[m].room && subject.x==e[ii].x && subject.y==e[ii].y) {
				v.push(mobs[i])
			} else if (subject.room!=mob[m].room) {
				let room_confusion = false;
				if (subject.x-8*cellsize==e[ii].x && subject.y==e[ii].y) { room_confusion = true }
				else if (subject.x+8*cellsize==e[ii].x && subject.y==e[ii].y) { room_confusion = true }
				else if (subject.x==e[ii].x && subject.y-8*cellsize==e[ii].y) { room_confusion = true }
				else if (subject.x==e[ii].x && subject.y+8*cellsize==e[ii].y) { room_confusion = true }
				
				if (room_confusion) { v.push(mobs[i]) }
			}
		}
	}

	return v
}

//PLAYER
//player initialization
mob.player = {};
mob.player.x = cellsize*(3+Math.round(Math.random()));
mob.player.y = cellsize*(3+Math.round(Math.random()));
mob.player.design = mob_design.player;
mob.player.force = 0;

var move_tags = [
	{x: 0, y: -cellsize},
	{x: -cellsize, y: 0},
	{x: 0, y: cellsize},
	{x: cellsize, y: 0}
];
function move(dir) {
	if (isCollidingSta('player', dir)) { return }
	
	let cmobs = collidingMobs('player', dir);
	if (cmobs.length>0) {
		for (let i=0; i<cmobs.length; i++) {
			let subject = mob[cmobs[i]];
			if (subject.force < mob.player.force && !isCollidingSta(cmobs[i],dir)) {
				subject.x += move_tags[dir].x;
				subject.y += move_tags[dir].y;
			} else {
				return
			}
		}
	}

	let smobs = surroundingMobs('player');
	if (smobs.length>0 && key_interacting) {
		for (let i=0; i<smobs.length; i++) {
			let subject = mob[smobs[i]];

			//you can only drag it in the opposite direction of where it is
			let smob_dir = null;
			for (let ii=0; ii<move_tags.length; ii++) {
				if (mob.player.x+move_tags[ii].x==subject.x && mob.player.y+move_tags[ii].y==subject.y) {
					smob_dir = ii;
				}

				if (subject.room != mob.player.room) {
					let room_confusion = false;
					if (subject.x-8*cellsize==mob.player.x+move_tags[ii].x && subject.y==mob.player.y+move_tags[ii].y) { room_confusion = true }
					else if (subject.x+8*cellsize==mob.player.x+move_tags[ii].x && subject.y==mob.player.y+move_tags[ii].y) { room_confusion = true }
					else if (subject.x==mob.player.x+move_tags[ii].x && subject.y-8*cellsize==mob.player.y+move_tags[ii].y) { room_confusion = true }
					else if (subject.x==mob.player.x+move_tags[ii].x && subject.y+8*cellsize==mob.player.y+move_tags[ii].y) { room_confusion = true }
					
					if (room_confusion) { smob_dir = ii }
				}
			}
			if (smob_dir==dir-2 || smob_dir==dir+2) { smob_dir = true; key_dragging = true }
			else { smob_dir = false }

			//drag
			if (smob_dir && subject.force < mob.player.force && !isCollidingSta(smobs[i],dir)) {
				subject.x += move_tags[dir].x;
				subject.y += move_tags[dir].y;
			} else {
				return
			}
		}
	}
	
	mob.player.x += move_tags[dir].x;
	mob.player.y += move_tags[dir].y;
}

//OTHER MOBS
function spawnMob(m, f) {
	mob[m] = {};
	mob[m].room = mob.player.room;
	mob[m].design = mob_design[m];
	mob[m].force = f;
	mob[m].interact = "";

	//TODO: search for tile that is not occupied in a room that is not full
	mob[m].x = mob.player.x;
	mob[m].y = mob.player.y;
}