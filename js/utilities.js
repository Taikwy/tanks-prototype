	// http://paulbourke.net/miscellaneous/interpolation/
	
	// we use this to interpolate the ship towards the mouse position
	function lerp(start, end, amt){
  		return start * (1-amt) + amt * end;
	}
	
	// we didn't use this one
	function cosineInterpolate(y1, y2, amt){
  		let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
  		return (y1 * (1 - amt2)) + (y2 * amt2);
	}
	
	// we use this to keep the ship on the screen
	function clamp(val, min, max){
        return val < min ? min : (val > max ? max : val);
    }
    
    // bounding box collision detection - it compares PIXI.Rectangles
	function rectsIntersect(a,b){
		var ab = a.getBounds();
		var bb = b.getBounds();
		return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
	}
	
	// these 2 helpers are used by classes.js
	function getRandomUnitVector(){
		let x = getRandom(-1,1);
		let y = getRandom(-1,1);
		let length = Math.sqrt(x*x + y*y);
		if(length == 0){ // very unlikely
			x=1; // point right
			y=0;
			length = 1;
		} else{
			x /= length;
			y /= length;
		}
	
		return {x:x, y:y};
	}

	function getRandom(min, max) {
		return Math.random() * (max - min) + min;
    }
    
//Uses bounding box to keep kinetic objects from intersecting static ones
function AABBCollisions(a, b) {
    if (rectsIntersect(a, b)) {
        //X coord collision
        if (Math.abs(a.x - b.x) > Math.abs(a.y - b.y) ) {
            if (a.x < b.x-b.width/2) {
                a.x = b.x -  (b.width / 2+a.width/2);
            }
            else if (a.x > b.x+b.width/2) {
                a.x = b.x + (b.width/2 + a.width / 2);
            }
            else if (a.y < b.y-b.height/2) {
                a.y = b.y - (b.height/2 + a.height/2);
            }
            else if (a.y > b.y+b.height/2) {
                a.y = b.y + (b.height/2 + a.height / 2);
            }
        }
        //Y coord collision
        else {
            if (a.y < b.y-b.height/2) {
                a.y = b.y - (b.height/2 + a.height/2);
            }
            else if (a.y > b.y+b.height/2) {
                a.y = b.y + (b.height/2 + a.height / 2);
            }
            else if (a.x < b.x-b.width/2) {
                a.x = b.x -  (b.width / 2+a.width/2);
            }
            else if (a.x > b.x+b.width/2) {
                a.x = b.x + (b.width/2 + a.width / 2);
            }
        }
        return true;
    }
    return false;
}

//Uses bounding box to reflect bullets when they hit walls
function bulletCollisions(a, b) {
    if (rectsIntersect(a, b)) {
        if (Math.abs(a.x - b.x) > Math.abs(a.y - b.y) ) {
            a.reflectX();
        }
        //Y coord collision
        else {
            a.reflectY();
        }
        return true;
    }
    return false;
}

//Uses bounding box to change enemy directions when they hit walls
function tankCollisions(a, b) {
    if (rectsIntersect(a, b)) {
        if (Math.abs(a.x - b.x) > Math.abs(a.y - b.y)) {
            a.reflectX();
        }
        //Y coord collision
        else {
            a.reflectY();
        }
        return true;
    }
    return false;
}

//Used for movement of bullets in game
class Vector{
    constructor(x,y, x2, y2)
    {
        this.x = x;
        this.y = y;
        this.x2 = x2;
        this.y2 = y2;

        this.xMagnitude = x2 - x;
        this.yMagnitude = y2 - y;

        this.magnitude = Math.sqrt((this.xMagnitude*this.xMagnitude) + (this.yMagnitude*this.yMagnitude));
    }

    normalize()
    {
        this.xMagnitude = this.xMagnitude / this.magnitude;
        this.yMagnitude = this.yMagnitude / this.magnitude;
        this.magnitude = 1;    
    }

    //Subtract vect 2 from vect 1 (vect 1 - vect 2)
    subtract(vec2)
    {
        // X2 and Y2 remain the same
        this.x = vec2.x2;
        this.y = vec2.y2;
        
        //Recalculate the magnitudes
        this.xMagnitude = (this.xMagnitude - vec2.xMagnitude);
        this.yMagnitude = (this.yMagnitude - vec2.yMagnitude);
        this.magnitude = Math.sqrt((this.xMagnitude*this.xMagnitude) + (this.yMagnitude*this.yMagnitude));
    }

    //Add vector 2 to vector 1
    add(vec2)
    {
        // X and Y remain the same
        this.x2 = vec2.x2;
        this.y2 = vec2.y2;
        
        //Recalculate the magnitudes
        this.xMagnitude = (this.xMagnitude + vec2.xMagnitude);
        this.yMagnitude = (this.yMagnitude + vec2.yMagnitude);
        this.magnitude = Math.sqrt((this.xMagnitude*this.xMagnitude) + (this.yMagnitude*this.yMagnitude));
    }

    //Multiply by scalar
    multiplyBy(num)
    {
        //X and y remain the same
        this.x2 = this.x2 * num;
        this.y2 = this.y2 * num;

        //Recalculate the magnitudes
        this.xMagnitude = this.x2 - this.x;
        this.yMagnitude = this.y2 - this.y;
        this.magnitude = Math.sqrt((this.xMagnitude*this.xMagnitude) + (this.yMagnitude*this.yMagnitude));
    }
}


