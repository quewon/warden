var room_color = [];
room_color[0] = 'transparent';
room_color[1] = style.getPropertyValue('--tertiary');
var r = [];
var room_base = [
	[1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1]
];
var rooms = [];

function drawRoom() {
	let r_shape = deepCopyFunction(room_base); //what the hell .. .

	r = map[int.player.room].room_shape; //-> e.g. 'T'
	r = r.split("");
	r = [...new Set(r)];

	if (r.length==1) { //e.g. 'T'
		for (let i=0; i<2; i++) {
			let y = room_carver[r[0]][i][0];
			let x = room_carver[r[0]][i][1];
			r_shape[y][x] = 0;
		}
	} else if (r.length>1) { //e.g. 'TLBR'
		for (let i=0; i<r.length; i++) {
			let mold = r[i];  //'T'
			for (let ii=0; ii<2; ii++) {
				let y = room_carver[mold][ii][0];
				let x = room_carver[mold][ii][1];
				r_shape[y][x] = 0;
			}
		}
	}

	r = r_shape;

	let x=0, y=0;
	for (let i=0; i<8; i++) {
		for (let ii=0; ii<8; ii++) {
			let el=r[i][ii];

			if (room_color[el]) {
				c.fillStyle = room_color[el];
				c.fillRect(x,y,cellsize,cellsize);
			}
			x += cellsize;
		}
		x=0;
		y+=cellsize;
	}
}

//MAP GEN
var room_shapes = ['T', 'L', 'B', 'R', 'TL', 'TB', 'LB', 'LR', 'BR', 'TLB', 'TLR', 'TBR', 'LBR', 'TLBR'];
var room_carver = { // y, x
	T: [[0, 3], [0, 4]],
	L: [[3, 0], [4, 0]],
	B: [[7, 3], [7, 4]],
	R: [[3, 7], [4, 7]]
};
var room_tags = {
	T: 'B',
	L: 'R',
	B: 'T',
	R: 'L'
}
var map = {};

function mapGen() {
	//GENERATE ACTUAL MAP
	map = {
		dock: { x:0, y:0, room_shape: '' },
		lobby: { x:null, y:null, room_shape: '' },
		cabins: { x:null, y:null, room_shape: '' },
		ctrl: { x:null, y:null, room_shape: '' },
		engine: { x:null, y:null, room_shape: '' },
		cargo: { x:null, y:null, room_shape: '' }
	};

	//get orientation of dock
	let dock = Math.floor(Math.random()*4);
	let dockpos = Math.floor(Math.random()*4);
	
	//posiion dock & lobby
	if (dock==0) { //T
		map.lobby.x = map.dock.x; map.lobby.y = map.dock.y-1;
	} else if (dock==1) { //L
		map.lobby.x = map.dock.x-1; map.lobby.y = map.dock.y;
	} else if (dock==2) { //B
		map.lobby.x = map.dock.x; map.lobby.y = map.dock.y+1;
	} else if (dock==3) { //R
		map.lobby.x = map.dock.x+1; map.lobby.y = map.dock.y;
	}
	map.dock.room_shape = room_shapes[dock];

	let lobby = Math.round(Math.random());
	map.lobby.room_shape = 'TLBR';
	let empty_cells = findEmptyAdjCells(map.lobby.x, map.lobby.y);

	//position other rooms
	if (lobby==0) { //lobby has four exits
		//fill rooms
		let fill_rooms = shuffle(['ctrl', 'engine', 'cabins']);
		for (let i=0; i<fill_rooms.length; i++) {
			map[fill_rooms[i]].x = empty_cells[i].x;
			map[fill_rooms[i]].y = empty_cells[i].y;
			map[fill_rooms[i]].room_shape = empty_cells[i].room_shape;
		}

		//place cargo
		let cargo = Math.round(Math.random());
		if (cargo==0) { placeCargo('engine') }
		else { placeCargo('ctrl') }
	} else if (lobby==1) { //lobby has 3 exits
		//fill rooms
		let fill_rooms = shuffle(['ctrl', 'engine']);
		let remaining_room = fill_rooms[1];
		fill_rooms.pop();
		fill_rooms.unshift('cabins');
		let prev_room = fill_rooms[1];
		empty_cells = shuffle(empty_cells);

		for (let i=0; i<fill_rooms.length; i++) {
			map[fill_rooms[i]].x = empty_cells[i].x;
			map[fill_rooms[i]].y = empty_cells[i].y;
			map[fill_rooms[i]].room_shape = empty_cells[i].room_shape;
		}

		//add remaining room
		fill_rooms = findEmptyAdjCells(map[fill_rooms[1]].x, map[fill_rooms[1]].y);
		fill_rooms = shuffle(fill_rooms);
		map[remaining_room].x = fill_rooms[0].x;
		map[remaining_room].y = fill_rooms[0].y;
		map[remaining_room].room_shape = fill_rooms[0].room_shape;

		//carve route from room to remaining room
		map[prev_room].room_shape += room_tags[map[remaining_room].room_shape];

		//place cargo
		placeCargo(remaining_room);

		//block off route that leads nowhere
		let fill = findEmptyAdjCells(map.lobby.x, map.lobby.y);
		if (fill.length==0) { //cargo room is adjacent to lobby
			if (map.cargo.y<map.lobby.y) { fill = 'B' }
			else if (map.cargo.x<map.lobby.x) { fill = 'R' }
			else if (map.cargo.y>map.lobby.y) { fill = 'T' }
			else if (map.cargo.x>map.lobby.x) { fill = 'L' }
		}
		else { fill = fill[0].room_shape }
		map.lobby.room_shape = map.lobby.room_shape.replace(room_tags[fill],'');
	}

	int.player.room = 'dock';

	function placeCargo(room) {
		let empty_cell = findEmptyAdjCells(map[room].x, map[room].y);
		if (empty_cell.length==1) { empty_cell = empty_cell[0] }
		else {
			empty_cell = empty_cell[Math.floor(Math.random())*empty_cell.length];
		}
		map.cargo.x = empty_cell.x;
		map.cargo.y = empty_cell.y;
		map.cargo.room_shape = empty_cell.room_shape;
		
		//carve path from room to cargo
		map[room].room_shape += room_tags[map.cargo.room_shape];

		//if cargo is next to both engine & ctrl, cargo may have another door
		if (findEmptyAdjCells(map.cargo.x, map.cargo.y).length <= 2) {
			let chance = Math.round(Math.random());
			if (chance==1) {
				//TODO
			}
		}
	}

	//FILL ROOMS WITH room_colorTIC INTS

	//GENERATE INTS
	intGen();
}

function findEmptyAdjCells(xc, yc) {
	let e = [ //adjacent cells
		{x: xc, y: yc-1, room_shape: 'B'},
		{x: xc+1, y: yc, room_shape: 'L'},
		{x: xc, y: yc+1, room_shape: 'T'},
		{x: xc-1, y: yc, room_shape: 'R'}
	];
	let o = [];

	let map_names = Object.getOwnPropertyNames(map);
	for (let i=0; i<4; i++) { //checking each cell
		for (let ii=0; ii<map_names.length; ii++) { //checking each room
			let map_room = map[map_names[ii]];
			if (e[i].x==map_room.x && e[i].y==map_room.y) {
				o.push(i);
				break
			}
		}
	}

	for (let i=o.length-1; i>=0; i--) {
		e.splice(o[i],1);
	}
	return e
}

function drawMap() {
	let room_names = Object.getOwnPropertyNames(map);
	let mapr;
	for (var v=0; v<room_names.length; v++) {
		let r_shape = deepCopyFunction(room_base); //what the hell .. .

		mapr = map[room_names[v]].room_shape; //-> e.g. 'T'
		mapr = mapr.split("");
		mapr = [...new Set(mapr)];

		if (mapr.length==1) { //e.g. 'T'
			for (let i=0; i<2; i++) {
				let y = room_carver[mapr[0]][i][0];
				let x = room_carver[mapr[0]][i][1];
				r_shape[y][x] = 0;
			}
		} else if (mapr.length>1) { //e.g. 'TLBR'
			for (let i=0; i<mapr.length; i++) {
				let mold = mapr[i];  //'T'
				for (let ii=0; ii<2; ii++) {
					let y = room_carver[mold][ii][0];
					let x = room_carver[mold][ii][1];
					r_shape[y][x] = 0;
				}
			}
		}

		mapr = r_shape;

		let x = map[room_names[v]].x*cellsize + width/2 - 4*pixelsize;
		let y = map[room_names[v]].y*cellsize + height/2 - 4*pixelsize;
		for (let i=0; i<8; i++) {
			for (let ii=0; ii<8; ii++) {
				let el=mapr[i][ii];

				if (room_color[el]) {
					map_c.fillStyle = room_color[el];
					map_c.fillRect(x,y,pixelsize,pixelsize);
				}
				x += pixelsize;
			}
			x=map[room_names[v]].x*cellsize + width/2 - 4*pixelsize;
			y+=pixelsize;
		}
	}
}


//TOOLS
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

const deepCopyFunction = (inObject) => {
  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
    value = inObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopyFunction(value)
  }

  return outObject
}