// -------- general functions
var walls = {}

window.onload = function() {
    var mundo = new World(cave);
    mundo.start()
}

World.prototype.printHTML = function() {
    var chars = [];
    var EOL = this.grid.width - 1;

    var holder = document.getElementById("world");

    while (holder.hasChildNodes()) {
        holder.removeChild(holder.lastChild);
    }
    
    var table = document.createElement("table");
    table.setAttribute("id", "world_table");

    var cell, row;

    for(var i=0; i < this.grid.width; i++) {
        row = document.createElement("tr");
        for(var j=0; j < this.grid.height; j++) {
            cell = document.createElement("td");
            cell.appendChild(document.createTextNode(this.grid.valueAt(new Point(i, j)).character));
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    holder.appendChild(table);
}

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
    if(c == "#")
	   return walls;
    else if(c == "o")
	   return new Cell(c, "alive");
    else if(c == ' ')
        return new Cell(c, "dead");
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
   "#                          #",
   "#                          #",
   "#                          #",
   "#                          #",
   "#                          #",
   "#        ooooooooo         #",
   "#                          #",
   "#                          #",
   "#                          #",
   "#                          #",
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
function Cell(char, state) {
    this.character = char;
    this.state = state;
};

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
    	if(entity != undefined && entity.state) {    	    
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

World.prototype.activateStates = function(entity) {
    if(entity.object.state == "alive") {
        entity.object.character = "o";
    } else if(entity.object.state == "dead") {
        entity.object.character = " ";
    }
}

World.prototype.updateStates = function(entity) {
    var neighbours = this.lookAround(entity.point);

    if(neighbours == 3) {
        entity.object.state = "alive";
    } else if( (neighbours == 2 || neighbours == 3) && entity.object.state == "alive") {
        entity.object.state = "alive";
    } else {
        entity.object.state = "dead";
    }
}

World.prototype.step = function() {
    forEach(this.listActiveEntities(), bind(this.activateStates, this));
    forEach(this.listActiveEntities(), bind(this.updateStates, this));
    this.printHTML();
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