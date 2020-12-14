//Player tank
class PlayerTank extends PIXI.AnimatedSprite{
	constructor(spritesheet,turretSprite, radius = 30, x=600, y=400){
		super(spritesheet);
        this.anchor.set(0.5,0.5);
        this.scale.set(.5);
        this.radius = radius;
        this.animationSpeed = 0.3;
        this.loop = true;

        this.idle = spritesheet;

        this.x = x;
        this.y = y;
        
        // movement
		this.dx = 0; 
        this.dy = 0; 
        this.speed = 12;        
        this.fwd = getRandomUnitVector(); 

        this.isAlive = true;

        //attack stuffs
		this.isAttacking = false;
		this.attackDuration = 0;
        this.attackTimer = this.attackDuration; 
        
        this.turret = new Turret(turretSprite,this.x, this.y);
	}
    
    // used for movement
	move(dt=1/60,dirX,dirY){
		this.x += this.dx * dt*this.speed;
        this.y += this.dy * dt*this.speed;

        //turret stuff
        this.turret.rotation = Math.atan2(dirY, dirX);
        this.turret.x = this.x;
        this.turret.y = this.y;
    }

    reflectX(){
        //justtosharecode
    }

    reflectY(){
        //justtosharecode
    }
}

//Enemy tank
class EnemyTank1 extends PIXI.AnimatedSprite{
    constructor(spritesheet, turretSprite, radius = 30, x=0, y=0){
		super(spritesheet);
        this.anchor.set(0.5,0.5);
        this.scale.set(.5);
        this.radius = radius;
        this.animationSpeed = 0.3;
        this.loop = true;

        this.x = x;
        this.y = y;
        
        // movement
		this.dx = 0; 
        this.dy = 0; 
        this.speed = 100;        
        this.changeDuration = 1;
        this.maxDuration = Math.random()*2.5+.5;
        this.changeTimer = this.changeDuration;

        this.fwd = getRandomUnitVector();

        this.isAlive = true;  

        //attack stuffs
		this.isAttacking = false;
		this.attackDuration = 2+Math.random()*2;
        this.attackTimer = this.attackDuration; 
        
        this.turret = new Turret(turretSprite,this.x, this.y);
    }
    
    move(dt=1/60,dirX,dirY){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;

        //turret stuff
        this.turret.rotation = Math.atan2(dirY, dirX);
        this.turret.x = this.x;
        this.turret.y = this.y;
    }

    changeDirection(){
        let newDir = Math.random()*4;
        if(newDir>3){
            this.fwd.x = 1;
            this.fwd.y = 0;
            return new Vector(0,0,1,0);
        }
        else if(newDir>2){
            this.fwd.x = -1;
            this.fwd.y = 0;
            return new Vector(0,0,-1,0);
        }
        else if(newDir>1){
            this.fwd.x = 0;
            this.fwd.y = 1;
            return new Vector(0,0,0,1);
        }
        else{
            this.fwd.x = 0;
            this.fwd.y = -1;
            return new Vector(0,0,0,-1);
        }
    }

    reflectX(){
        this.fwd.x *= -1;
    }

    reflectY(){
        this.fwd.y *= -1;
    }
}

//Turrets for the tanks
class Turret extends PIXI.Sprite{
    constructor(texture, x=0,y=0){
        super(texture);
        this.anchor.set(0.48,0.5);
        this.scale.set(0.6);
        this.radius=0;
        this.x = x;
        this.y = y;

        this.alive=true;
    }
}

//Bullet that the characters shoot
class Bullet extends PIXI.Sprite{
    constructor(team = 0, texture, x=0,y=0, dirX = 0, dirY = 0, spd = 1, b = 0){
        super(texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.25);
        this.radius=0;
        this.x = x+dirX*45;
        this.y = y+dirY*45;
        this.bounce = b;
        // variables
        this.direction = {x:dirX*spd,y:dirY*spd};
        this.speed = 350*spd;
        this.isAlive = true;
        this.team = team;
        this.rotation = Math.atan2(this.direction.y, this.direction.x);
        Object.seal(this);
    }

    move(dt=1/60){
        this.x += this.direction.x * this.speed * dt;
        this.y += this.direction.y * this.speed * dt;
    }

    reflectX(){
        this.direction.x *= -1;
        this.rotation = Math.atan2(this.direction.y, this.direction.x);
    }

    reflectY(){
        this.direction.y *= -1;
        this.rotation = Math.atan2(this.direction.y, this.direction.x);
    }
}

//Noninteractable Obstacle
class Wall extends PIXI.Sprite {
    constructor(texture, radius = 20, x = 0, y = 0) {
        super(texture);
        this.anchor.set(0.5,0.5); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(.5);
        this.radius = radius;
        this.x = x;
        this.y = y;
    }
}

//Background Tile Image
class Tile extends PIXI.Sprite {
    constructor(texture, radius = 20, x = 0, y = 0) {
        super(texture);
        this.anchor.set(0.5,0.5); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(.5);
        this.radius = radius;
        this.x = x;
        this.y = y;
    }
}

//Menu background
class Menu extends PIXI.Sprite {
    constructor(texture, x = 0, y = 0) {
        super(texture);
        this.anchor.set(0,0); //Position, scaling, rotating, etc. are now from center of sprite
        this.scale.set(.5);
        this.x = x;
        this.y = y;
    }
}

//Level layout helper class
class LevelManager{
    constructor(){
        this.layoutarray = [
            [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
            [9, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 9],
            [9, 0, 2, 2, 3, 3, 3, 3, 4, 4, 0, 9],
            [9, 0, 2, 2, 3, 3, 3, 3, 4, 4, 0, 9],
            [9, 0, 2, 2, 3, 3, 3, 3, 4, 4, 0, 9],
            [9, 0, 5, 5, 6, 6, 6, 6, 7, 7, 0, 9],
            [9, 0, 5, 5, 6, 6, 6, 6, 7, 7, 0, 9],
            [9, 1, 1, 1, 6, 6, 6, 6, 7, 7, 0, 9],
            [9, 1, 1, 1, 6, 6, 6, 6, 0, 0, 0, 9],
            [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
        ]
        this.tileSize = 80;
        this.height = this.layoutarray.length;
        this.width = this.layoutarray[0].length;
        this.lastZone = 7;

    }

    //resets the array for each new level spawn
    resetArray(){
        this.layoutarray = [
            [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
            [9, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 9],
            [9, 0, 2, 2, 3, 3, 3, 3, 4, 4, 0, 9],
            [9, 0, 2, 2, 3, 3, 3, 3, 4, 4, 0, 9],
            [9, 0, 2, 2, 3, 3, 3, 3, 4, 4, 0, 9],
            [9, 0, 5, 5, 6, 6, 6, 6, 7, 7, 0, 9],
            [9, 0, 5, 5, 6, 6, 6, 6, 7, 7, 0, 9],
            [9, 1, 1, 1, 6, 6, 6, 6, 7, 7, 0, 9],
            [9, 1, 1, 1, 6, 6, 6, 6, 0, 0, 0, 9],
            [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
        ]
    }
}