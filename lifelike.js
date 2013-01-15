// -------- general functions
function forEachIn(object, action) {
    for(var property in object) {
	if(Object.prototype.hasOwnProperty.call(object, property))
	    action(property, object[property]);
    }
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

Point.prototype.add = function(o_x, o_y) {
    return new Point(this.x + o_x, this.y + o_y);
}

Point.prototype.isEqual = function(point) {
    return ( (this.x == point.x) && (this.y == point.y) );
}

Point.prototype.toString = function() {
    return "{ x: " + this.x + ", y: " + this.y + " }";
}

