// -------- general functions
var walls = {}

walls.character = "#";

function forEach(elements, action) {
    for(var i = 0; i < elements.length; i++) {
	action(elements[i]);
    }
}

function bind(f, o) {
    return function() {
	    f.apply(o, arguments);
    }
}

function forEachIn(object, action) {
    for(var property in object) {
	if(Object.prototype.hasOwnProperty.call(object, property))
	    action(property, object[property]);
    }
}

function elementFromChar(c) {
    if(c == " ")
	return undefined;
    else if(c == "#")
	return walls;
    else if(c == "o" || c == 'x')
	return new AliveBeing();
}

function charFromElement(element) {
    if(element == undefined)
	return " ";
    else
	return element.character;
}

// -------- the Dictionary object
function Dictionary(values) {
    this.values = values || {};
}

Dictionary.prototype.store = function(name, value) {
    this.values[name] = value;
} 

Dictionary.prototype.lookup = function(name) {
    return this.values[name];
} 

Dictionary.prototype.contains = function(name) {
    return Object.prototype.hasOwnProperty.call(this.values, name) &&
	Object.prototype.propertyIsEnumerable.call(this.values, name);
} 

Dictionary.prototype.each = function(action) {
    forEachIn(this.values, action);
} 

// -------- the Point object
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.add = function(other) {
    return new Point(this.x + other.x, this.y + other.y);
}

Point.prototype.isEqual = function(point) {
    return ( (this.x == point.x) && (this.y == point.y) );
}

Point.prototype.toString = function() {
    return "{ x: " + this.x + ", y: " + this.y + " }";
}

// -------- the Grid object
function Grid(width, height) {
    this.width = width;
    this.height = height;
    this.cells = new Array(width*height);
}

Grid.prototype.valueAt = function(position) {
    return this.cells[position.y*this.width + position.x];
}

Grid.prototype.setValueAt = function(position, value) {
    this.cells[position.y*this.width + position.x] = value;
}

Grid.prototype.hasInside = function(position) {
    return(
	position.x >= 0 && position.y >= 0 &&
	position.x < this.width && position.y < this.height
    );
} 

Grid.prototype.moveValue = function(from, to) {
    this.setValueAt(to, this.valueAt(from));
    this.setValueAt(from, undefined);
}

Grid.prototype.each = function(action) {
    for(var i=0; i < this.height; i++) {
	for(var j=0; j < this.width; j++) {
	    var point = new Point(j, i);
	    action(point, this.valueAt(point));
	}
    }
}

// -------- the Scenario data

var cave =
  ["############################",
   "#   oo oooo        oo      #",
   "#                          #",
   "#      o   oo          o   #",
   "#        o  oo             #",
   "#             o            #",
   "#   oo          o        o #",
   "#    o              o      #",
   "#            ooo       o   #",
   "# ooo         ooo          #",
   "#                          #",
   "############################"];

var directions = new Dictionary({
    "n" : new Point(0, -1),
    "ne": new Point(1, -1),
    "nw": new Point(-1, -1),
    "s": new Point(0, 1),
    "se": new Point(1, 1),
    "sw": new Point(-1, 1),
    "e": new Point(1, 0),
    "w": new Point(-1, 0)
});

// -------- Live creature
function AliveBeing() {};

AliveBeing.prototype.action = function() {
    return {type: "alive"};
}

AliveBeing.prototype.character = "o";

// -------- the World object

function World(map) {
    var grid = new Grid(map[0].length, map.length);

    for(var i=0; i < map.length; i++) {
	var line = map[i];

	for(var j=0; j < line.length; j++) {
	    grid.setValueAt(new Point(j, i), elementFromChar(line.charAt(j)));
	}
    }

    this.grid = grid;
}

World.prototype.toString = function() {
    var chars = [];
    var EOL = this.grid.width - 1;

    this.grid.each(function (point, value) {
	chars.push(charFromElement(value));

	if(point.x == EOL)
	    chars.push("\n");
    });

    return chars.join("");
}

World.prototype.listActiveEntities = function() {
    var result = [];

    this.grid.each(function (point, entity) {
	if(entity != undefined) {
	    result.push({object: entity, point: point});
	}
    });

    return result;
}

World.prototype.lookAround = function(current_position) {
    var neighbours = 0;
    var grid = this.grid;

    directions.each(function(key, value) {
    	var endpoint = current_position.add(value);
    	if(grid.hasInside(endpoint)) {
            if(charFromElement(grid.valueAt(endpoint)) == "o") {                
                neighbours += 1;
            }
        }    	
    });

    return neighbours;
}

World.prototype.activateAction = function(entity) {
    var look_around = this.lookAround(entity.point);

    // Any live cell with fewer than two live neighbours dies, as if caused by under-population.
    if(look_around < 2 && entity.object.character == 'o') {
        entity.object.character = ".";

    // Any live cell with more than three live neighbours dies, as if by overcrowding.        
    } else if( look_around > 3 && (entity.object.character == 'o' )) {
        entity.object.character = ".";
    
    // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    } else if( look_around == 3 && entity.object.character == '.') {
        entity.object.character = "o";
    }
}

World.prototype.step = function() {
    forEach(this.listActiveEntities(), bind(this.activateAction, this));
    this.print();
}

World.prototype.print = function() {
    console.log(this.toString());
}

World.prototype.start = function () {
    if(!this.running) {
        this.running = setInterval(bind(this.step, this), 2000);
    }
}

World.prototype.stop = function() {
    if(this.running) {
        clearInterval(this.running);
        this.running = null;
    }
}

var mundo = new World(cave);
mundo.print();
mundo.start();
