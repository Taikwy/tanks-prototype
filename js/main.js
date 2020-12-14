// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 1200,
    height: 800
});
document.body.appendChild(app.view);
let gameScreen = document.querySelector("#gameScreen");
gameScreen.appendChild(app.view);


// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load the images
app.loader.baseUrl = "images";
app.loader.
    add([
        "explosions.png",
        "playertank1.png",
        "enemytank1.png",
        "wall.png",
        "tile.png",
        "playerBullet.png",
        "enemyBullet.png",
        "menu.png",
        "playerturret.png",
        "enemyturret.png",
        "titlescreen.png",
        "levelclear.png",
        "youdied.png",
        "bulletexplosion.png",
        "tankexplosion.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

//texture shortcut
let TextureCache = PIXI.utils.TextureCache

//Scene and label variables
let startScene, titleScreen;
let gameScene, waveLabel, lifeLabel;
let nextLevelScene, levelClear;
let gameOverScene, waveLabel2, scoreLabel, youDied;

//music and sound variables
let music, playerShot, enemyShot, bulletExpl, tankExpl;

//Mouse position shortcut
let mousePosition;

//Level geometry and layout variables
let levelManager;
let walls = [];
let tiles = [];
let tileSize = 160;
let levelX = 12*80
let levelY = 10*80;

//Player variables
let playerTankSheet = {};
let playerTank;
let playerBullets = [];

//Enemy variables
let enemyTanksheet = {};
let enemyTanks = [];
let bullets = [];

//Spritesheets
let bulletExplosions = [];
let bulletExplosionTextures;

let tankExplosions = [];
let tankExplosionTextures;

//Basic game variables
let score = 0;
let life = 5;
let waveNum = 1;
let paused = true;


function setup() {
    stage = app.stage;
    //Create the start scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
    //Create and add the title screen background
    let texture = app.loader.resources["titlescreen.png"].texture;
    titleScreen = new PIXI.Sprite(texture);
    titleScreen.anchor.set(0);
    startScene.addChild(titleScreen);

    //Create the game scene
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    //Create the next level scene
    nextLevelScene = new PIXI.Container();
    nextLevelScene.visible = false;
    stage.addChild(nextLevelScene);
    //Create and add the next level background
    texture = app.loader.resources["levelclear.png"].texture;
    levelClear = new PIXI.Sprite(texture);
    levelClear.anchor.set(0);
    nextLevelScene.addChild(levelClear);

    //Create the game over scene
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    //Create and add the game over background
    texture = app.loader.resources["youdied.png"].texture;
    youDied = new PIXI.Sprite(texture);
    youDied.anchor.set(0);
    gameOverScene.addChild(youDied);

    //Create and add the labels for all the scenes
    createLabelsAndButtons();

    //Sets the sound variables
    loadMusic();

    //Plays the bgm
    music.play();

    //Creates the explosion textures
    let bulletExplosionTexture = new PIXI.BaseTexture.from("bulletexplosion.png");
    bulletExplosionTextures = loadSpriteSheet(bulletExplosionTexture, 0, 32,32,8);
    let tankExplosionTexture = new PIXI.BaseTexture.from("tankexplosion.png");
    tankExplosionTextures = loadSpriteSheet(tankExplosionTexture, 0, 354,342,7);

    //Creates the player
    createPlayer();    

    //Creates the level layout helpes variable
    levelManager = new LevelManager();

    //Start the update loop
    app.ticker.add(gameLoop);
}

//Creates and adds all the labels and buttons across all the scenes
function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 120,
        fontFamily: "Verdana"
    });

    //Start game button
    let startButton = new PIXI.Text("Start");
    startButton.style = buttonStyle;
    startButton.x = 440;
    startButton.y = 525;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e => e.target.alpha = 0.3);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    //Adds the menu image to the game scene
    let menu = app.loader.resources["menu.png"].texture;
    let m = new Menu(menu);
    gameScene.addChild(m);

    let waveStyle = new PIXI.TextStyle({
        fill: 0xff0000,
        fontSize: 42,
        fontFamily: 'Verdana'
    })
    let lifeStyle = new PIXI.TextStyle({
        fill: 0x08ff00,
        fontSize: 42,
        fontFamily: 'Verdana'
    })

    //Life remaining
    lifeLabel = new PIXI.Text();
    lifeLabel.style = lifeStyle;
    lifeLabel.x = 70;
    lifeLabel.y = 420;
    gameScene.addChild(lifeLabel);
    lifeLabel.text = `HP ${life}`;

    //Wave Count
    waveLabel = new PIXI.Text();
    waveLabel.style = waveStyle;
    waveLabel.x = 40;
    waveLabel.y = 250;
    gameScene.addChild(waveLabel);

    //Gamescene
    let bigText = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 42,
        fontFamily: 'Verdana'
    })

    //Wave Count
    scoreLabel = new PIXI.Text();
    scoreLabel.style = waveStyle;
    scoreLabel.x = 45;
    scoreLabel.y = 200;
    gameOverScene.addChild(scoreLabel);
    scoreLabel.text = "Hi Score";

    //Wave Count 2
    waveLabel2 = new PIXI.Text();
    waveLabel2.style = waveStyle;
    waveLabel2.x = 45;
    waveLabel2.y = 250;
    gameOverScene.addChild(waveLabel2);    

    //Continue
    let nextLevelLabel = new PIXI.Text("Press Space to continue");
    nextLevelLabel.style = bigText;
    nextLevelLabel.x = 340;
    nextLevelLabel.y = 580;
    nextLevelScene.addChild(nextLevelLabel);

    //Back to
    let backLabel = new PIXI.Text("Back to");
    backLabel.style = bigText;
    backLabel.x = 54;
    backLabel.y = 655;
    gameOverScene.addChild(backLabel);

    //Button for returning to menu
    let playAgainButton = new PIXI.Text("Menu");
    playAgainButton.style = bigText;
    playAgainButton.x = 74;
    playAgainButton.y = 705;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", loadMenu); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);

    //retry
    let retryLabel = new PIXI.Text("Press Space to retry");
    retryLabel.style = bigText;
    retryLabel.x = 385;
    retryLabel.y = 580;
    gameOverScene.addChild(retryLabel);
}

//Assigns the proper sound files to all the sound variables
function loadMusic(){
    music = new Howl({
        src: ['sounds/bgm.wav'],
        volume: .05
    });

    playerShot = new Howl({
        src: ['sounds/smallshot.wav'],
        volume: .075
    });

    enemyShot = new Howl({
        src: ['sounds/shot.wav'],
        volume: .03
    });

    bulletExpl = new Howl({
        src: ['sounds/shortexpl.wav'],
        volume: .05
    });

    tankExpl = new Howl({
        src: ['sounds/longexpl.wav'],
        volume: .07
    });
}

//Creates the sprite arrays for the player
function createPlayer() {
    let playerSpritesheet = new PIXI.BaseTexture.from("playertank1.png");
    let w = 120;
    let h = 120;

    playerTankSheet["idleUp"] = [new PIXI.Texture(playerSpritesheet, new PIXI.Rectangle(0 * w, 0 * h, w, h))];
    playerTankSheet["idleDown"] = [new PIXI.Texture(playerSpritesheet, new PIXI.Rectangle(0 * w, 1 * h, w, h))];
    playerTankSheet["idleLeft"] = [new PIXI.Texture(playerSpritesheet, new PIXI.Rectangle(0 * w, 2 * h, w, h))];
    playerTankSheet["idleRight"] = [new PIXI.Texture(playerSpritesheet, new PIXI.Rectangle(0 * w, 3 * h, w, h))];

    playerTankSheet["moveUp"] = loadSpriteSheet(playerSpritesheet, 0, w, h, 4);
    playerTankSheet["moveDown"] = loadSpriteSheet(playerSpritesheet, 1, w, h, 4);
    playerTankSheet["moveLeft"] = loadSpriteSheet(playerSpritesheet, 2, w, h, 4 );
    playerTankSheet["moveRight"] = loadSpriteSheet(playerSpritesheet, 3, w, h, 4);

    let turret = app.loader.resources["playerturret.png"].texture;
    playerTank = new PlayerTank(playerTankSheet.moveUp, turret);
    playerTank.attackTimer = 0;  
}

//Creates the sprite arrays for the enemies
function createEnemySheet() {
    let enemySpritesheet = new PIXI.BaseTexture.from("enemytank1.png");
    let w = 120;
    let h = 120;

    enemyTanksheet["idleUp"] = [new PIXI.Texture(enemySpritesheet, new PIXI.Rectangle(0 * w, 0 * h, w, h))];
    enemyTanksheet["idleDown"] = [new PIXI.Texture(enemySpritesheet, new PIXI.Rectangle(0 * w, 1 * h, w, h))];
    enemyTanksheet["idleLeft"] = [new PIXI.Texture(enemySpritesheet, new PIXI.Rectangle(0 * w, 2 * h, w, h))];
    enemyTanksheet["idleRight"] = [new PIXI.Texture(enemySpritesheet, new PIXI.Rectangle(0 * w, 3 * h, w, h))];

    enemyTanksheet["moveUp"] = loadSpriteSheet(enemySpritesheet, 0, w, h, 4);
    enemyTanksheet["moveDown"] = loadSpriteSheet(enemySpritesheet, 1, w, h, 4);
    enemyTanksheet["moveLeft"] = loadSpriteSheet(enemySpritesheet, 2, w, h, 4 );
    enemyTanksheet["moveRight"] = loadSpriteSheet(enemySpritesheet, 3, w, h, 4);
}

//Goes back to the main menu
function loadMenu(){
    gameOverScene.visible = false;
    gameScene.visible = false;
    startScene.visible = true;
}

//Starts a new game/run
function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    waveNum = 1;
    score = 0;
    life = 5;
    updateWaveNumber();

    playerTank.x = 3*80+240+40;
    playerTank.y = 7*80+40;
    loadLevel();
}

//Updates the wave number
function updateWaveNumber() {
    waveLabel.text = `Wave ${waveNum}`;
}

//Decreases life by 1 hp
function decreaseLifeBy() {
    life--;
    lifeLabel.text = `HP ${life}`;
}


//Primary game loop
function gameLoop() {
    if(!music.playing())
        music.play();
        
    if (keys[keyboard.SPACE]) {
        if(nextLevelScene.visible)
            loadLevel();
        if(gameOverScene.visible)
            startGame()
    }
    if (paused) return; // keep this commented out for now

    //Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;    
    
    //---------------------------------------------Check WASD for player movement----------------------------
    //Diagonal xy components are divided by sqrt2 to maintain same speeds in diagonals
    // if(keys[keyboard.RIGHT]){
    //     if(keys[keyboard.DOWN]){
    //         playerTank.dy = playerTank.speed / Math.sqrt(2);
    //         playerTank.dx = playerTank.speed / Math.sqrt(2);
    //     }
    //     else if(keys[keyboard.UP]) {
    //         playerTank.dy = -playerTank.speed / Math.sqrt(2);
    //         playerTank.dx = playerTank.speed / Math.sqrt(2);
    //     }
    //     else
    //         playerTank.dx = playerTank.speed;
    // }
    // else if(keys[keyboard.LEFT]) {
    //     if(keys[keyboard.DOWN]){
    //         playerTank.dy = playerTank.speed / Math.sqrt(2);
    //         playerTank.dx = -playerTank.speed / Math.sqrt(2);
    //     }
    //     else if(keys[keyboard.UP]) {
    //         playerTank.dy = -playerTank.speed / Math.sqrt(2);
    //         playerTank.dx = -playerTank.speed / Math.sqrt(2);
    //     }
    //     else
    //         playerTank.dx = -playerTank.speed;
    // }
    // else{
    //     playerTank.dx = 0;
    // }

    // if(keys[keyboard.DOWN]){
    //     playerTank.dy = playerTank.speed;
    // }
    // else if(keys[keyboard.UP]) {
    //     playerTank.dy = -playerTank.speed;
    // }
    // else{
    //     playerTank.dy = 0;
    // }   


    //----------------------------------------------Player Movement using WASD-----------------------------
    playerTank.dx = 0;
    playerTank.dy = 0;
    if(keys[keyboard.RIGHT]){
            playerTank.dx = playerTank.speed;
    }
    else if(keys[keyboard.LEFT]) {
            playerTank.dx = -playerTank.speed;
    }
    else if(keys[keyboard.DOWN]){
        playerTank.dy = playerTank.speed;
    }
    else if(keys[keyboard.UP]) {
        playerTank.dy = -playerTank.speed;
    }

    //--------------------------------------------Animation/texture swapping-----------------------------
    //Up anim
    if (playerTank.dy < 0) {
        if (!playerTank.playing || playerTank.textures != playerTankSheet.moveUp) {
            playerTank.textures = playerTankSheet.moveUp;
            playerTank.idle = playerTankSheet.idleUp;
            playerTank.play();
        }
    }    
    //Down anim
    else if (playerTank.dy > 0) {
        if (!playerTank.playing || playerTank.textures != playerTankSheet.moveDown) {
            playerTank.textures = playerTankSheet.moveDown;
            playerTank.idle = playerTankSheet.idleDown;
            playerTank.play();
        }
    }
    //Left anim
    else if (playerTank.dx < 0 && playerTank.dy == 0) {
        if (!playerTank.playing || playerTank.textures != playerTankSheet.moveLeft) {
            playerTank.textures = playerTankSheet.moveLeft;
            playerTank.idle = playerTankSheet.idleLeft;
            playerTank.play();
        }
    }
    //Right anim
    else if (playerTank.dx > 0 && playerTank.dy == 0) {
        if (!playerTank.playing || playerTank.textures != playerTankSheet.moveRight) {
            playerTank.textures = playerTankSheet.moveRight;
            playerTank.idle = playerTankSheet.idleRight;
            playerTank.play();
        }
    }    
    //Switches to idle animation in the most recent direction
    else if(playerTank.dx == 0 && playerTank.dy == 0){
        if (!playerTank.playing || playerTank.textures != playerTank.idle){
            playerTank.textures = playerTank.idle;
            playerTank.play();
        }        
    }

    //-----------------------------------------------Player Attacking--------------------------------------
    mousePosition = app.renderer.plugins.interaction.mouse.global;
    let fireVect = new Vector(playerTank.x,playerTank.y,mousePosition.x,mousePosition.y);
    fireVect.normalize();
    playerTank.attackTimer -= dt;

    //--------------------------------------------Actually moving the player--------------------------------
    playerTank.move(dt,fireVect.xMagnitude,fireVect.yMagnitude);
    for(let w of walls){
        AABBCollisions(playerTank,w);
    }    
    for(let et of enemyTanks){
        AABBCollisions(playerTank,et);
    }   

    //--------------------------------------Enemy tank movement and attacking-------------------------------
    for (let et of enemyTanks) {
        let fireVect = new Vector(et.x, et.y, playerTank.x,playerTank.y);
        fireVect.normalize();

        //Checks whehther the enemy should change direction
        et.changeTimer -= dt;
        if(et.changeTimer <= 0){
            et.changeDirection();
            et.changeTimer = et.maxDuration*Math.random();
        }
        //Moves the enemy
        et.move(dt,fireVect.xMagnitude,fireVect.yMagnitude);
        
        //--------------------------------------------Animation/texture swapping-----------------------------
        if (et.fwd.y < 0) {
            if (!et.playing || et.textures != enemyTanksheet.moveUp) {
                et.textures = enemyTanksheet.moveUp;
                et.play();
            }
        }    
        else if (et.fwd.y > 0) {
            if (!et.playing || et.textures != enemyTanksheet.moveDown) {
                et.textures = enemyTanksheet.moveDown;
                et.play();
            }
        }
        else if (et.fwd.x > 0 && et.fwd.y == 0) {
            if (!et.playing || et.textures != enemyTanksheet.moveRight) {
                et.textures = enemyTanksheet.moveRight;
                et.play();
            }
        }
        else if (et.fwd.x < 0 && et.fwd.y == 0) {
            if (!et.playing || et.textures != enemyTanksheet.moveLeft) {
                et.textures = enemyTanksheet.moveLeft;
                et.play();
            }
        }

        //Enemy attacking
        et.attackTimer -= dt;
			if(et.attackTimer <= 0)
			{                
                let enemyBullet = app.loader.resources["enemyBullet.png"].texture;
                let b = new Bullet(1, enemyBullet, et.x, et.y,fireVect.xMagnitude,fireVect.yMagnitude, 1);
                bullets.push(b);
                gameScene.addChild(b);
                et.attackTimer = et.attackDuration;
                enemyShot.play();
			}
    }

    //Move Bullets
    for (let b of bullets) {
        b.move(dt);
    }

    //-----------------------------------------Enemy tank collisions---------------------------------------
    for (let et of enemyTanks) {
        //Changes tank direction if they collide with other enemy tank
        for(let et2 of enemyTanks){
            if(et != et2){
                if(tankCollisions(et,et2)){
                    et.move(dt);
                } 
            }
        }
        for (let b of bullets) {
            //If the enemy hits a bullet then they die
            if (rectsIntersect(et, b)) {
                if(b.team ==0){
                createExplosion(bulletExplosionTextures, bulletExplosions, b.x,b.y,32,32, 5, 1.5);
                createExplosion(tankExplosionTextures, tankExplosions, et.x,et.y,354,342, 5, .5);
                gameScene.removeChild(et);
                et.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                tankExpl.play();
                bulletExpl.play();
                }                
            }
        }

        //If enemy collides with player they change direction
        if (et.isAlive && rectsIntersect(et, playerTank)) {
            tankCollisions(et,playerTank);
            et.move(dt);
        }

        //If enemy collides with level geometry they change directions
        for(let w of walls){
            if(AABBCollisions(et,w)){
                et.reflectX();
                et.reflectY();
                et.move(dt);
            } 
        }
    }

    //----------------------------------------------Bullet collisions--------------------------------------
    let collidedBullets = [];
    for (let b of bullets) {      
        //If the player is hit by an enemy bullet, take damage  
        if (rectsIntersect(playerTank, b)) {
            if(b.team ==1){
            bulletExpl.play();
            gameScene.removeChild(b);
            createExplosion(bulletExplosionTextures, bulletExplosions, b.x,b.y,32,32, 5, 1.5);
            b.isAlive = false;
            decreaseLifeBy();
            }                
        }
        //If 2 bullets hit each other, they cancel out
        for (let b2 of bullets) {
            if (b2 != b && rectsIntersect(b, b2)) {
                if(!collidedBullets.includes(b) && !collidedBullets.includes(b2)){
                    collidedBullets.push(b);
                    collidedBullets.push(b2);
                    createExplosion(bulletExplosionTextures, bulletExplosions, b.x,b.y,32,32, 5, 1.5);
                    createExplosion(bulletExplosionTextures, bulletExplosions, b.x,b.y,32,32, 5, 1.5);
                    bulletExpl.play();
                }             
            }
        }
        //Checks if the bullet will bounce or explode
        for(let w of walls){
            if(bulletCollisions(b,w)){
                if(b.bounce>0){
                    b.bounce--
                    b.move(dt);
                }
                else{
                    collidedBullets.push(b);
                    createExplosion(bulletExplosionTextures, bulletExplosions, b.x,b.y,32,32, 5, 1.5);
                    bulletExpl.play();
                }
            }                
        }
    }

    //Removes collided bullets
    for(let cb of collidedBullets){
        gameScene.removeChild(cb);
        cb.isAlive = false;
        cb.isAlive = false;
    }

    //Cleans up anything dead
    bullets = bullets.filter(b => b.isAlive);
    playerBullets = playerBullets.filter(pb => pb.isAlive);
    for(let et of enemyTanks){
        if(!et.isAlive)
            gameScene.removeChild(et.turret);
    }
    bullets = bullets.filter(b=>b.isAlive);
    enemyTanks = enemyTanks.filter(et => et.isAlive);
    bulletExplosions = bulletExplosions.filter(be => be.isAlive);
    tankExplosions = tankExplosions.filter(te => te.isAlive);

    // Check if player died
    if (life <= 0) {
        end();
        return;
    }

    //If all enemies were cleared, proceed to next level
    if (enemyTanks.length == 0) {
        nextLevel();
    }

    //Start listening for click events on the canvas
    app.view.onclick = fireBullet;
}

//When the player dies, reset variabels and show game over
function end() {
    paused = true;

    life = 5;
    lifeLabel.text = `HP ${life}`;

    //Empty all the arrays
    enemyTanks.forEach(et => gameScene.removeChild(et));
    enemyTanks = [];

    bullets.forEach(b => gameScene.removeChild(b));
    bullets = [];

    playerBullets.forEach(pb => gameScene.removeChild(pb));
    bullets = [];

    bulletExplosions.forEach(be => gameScene.removeChild(be));
    bulletExplosions = [];

    tankExplosions.forEach(te=>gameScene.removeChild(te));
    tankExplosions = [];
    
    waveLabel2.text = `Wave ${waveNum}`;

    gameOverScene.visible = true;
    gameScene.visible = false;
}

//If the player clears the level, reset variables and let them proceed
function nextLevel(){
    
    paused = true;

    enemyTanks.forEach(et => gameScene.removeChild(et));
    enemyTanks = [];

    bullets.forEach(b => gameScene.removeChild(b));
    bullets = [];

    playerBullets.forEach(pb => gameScene.removeChild(pb));
    playerBullets = [];

    nextLevelScene.visible = true;
    gameScene.visible = false;
    waveNum++;
    updateWaveNumber();
}

//Fires bullet from player
function fireBullet(e){
    if (paused||playerBullets.length>=5||playerTank.attackTimer>0) return;  
    
    mousePosition = app.renderer.plugins.interaction.mouse.global;
    let fireVect = new Vector(playerTank.x,playerTank.y,mousePosition.x,mousePosition.y);
    fireVect.normalize();
    let playerBullet = app.loader.resources["playerBullet.png"].texture;
    let b = new Bullet(0, playerBullet, playerTank.x, playerTank.y,fireVect.xMagnitude,fireVect.yMagnitude,1.2, 2);
    bullets.push(b);
    playerBullets.push(b);
    gameScene.addChild(b);
    playerTank.attackTimer = playerTank.attackDuration;

    playerShot.play();
}

//---------------------------------------Loads stuff for the level-----------------------------------------
function loadLevel() {
    
    paused = false;

    //Creates level geometry
    levelManager.resetArray();
    walls = [];
    createOutterWalls();
    createWalls();
    createEnemies(waveNum + 2 + waveNum/2);

    //Resets the player
    playerTank.x = 3*80+240+40;
    playerTank.y = 7*80+40;
    playerTank.play();
    gameScene.addChild(playerTank);
    gameScene.addChild(playerTank.turret);
    gameOverScene.visible = false;
    nextLevelScene.visible = false;
    gameScene.visible = true;
}


//Creates and spawns the enemies
function createEnemies(numEnemies) {
    createEnemySheet();
    let turret = app.loader.resources["enemyturret.png"].texture;
    if(numEnemies >8)
        numEnemies = 8;

        let zone2Enemies = 0;
        let zone3Enemies = 0;
        let zone4Enemies = 0;
        let zone5Enemies = 0;
        let zone6Enemies = 0;
        let zone7Enemies = 0;

    for (let r = 0; r < levelManager.height; r ++) {
        for (let c = 0; c < levelManager.width; c ++) {
            if(levelManager.layoutarray[r][c] == 2){      
                if(zone2Enemies<=1){
                    if(Math.random()* 4> 3){
                        let et = new EnemyTank1(enemyTanksheet.moveDown,turret, 30, 240+c*tileSize/2+30,r*tileSize/2+30);
                        et.changeDirection();
                        enemyTanks.push(et);
                        gameScene.addChild(et);
                        gameScene.addChild(et.turret);
                        zone2Enemies++;
                        numEnemies--;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 3){      
                if(zone3Enemies<=2){
                    if(Math.random()* 12> 10){
                        let et = new EnemyTank1(enemyTanksheet.moveDown,turret, 30, 240+c*tileSize/2+30,r*tileSize/2+30);
                        et.changeDirection();
                        enemyTanks.push(et);
                        gameScene.addChild(et);
                        gameScene.addChild(et.turret);
                        zone3Enemies++;
                        numEnemies--;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 4){      
                if(zone4Enemies<=1){
                    if(Math.random()* 4>3){
                        let et = new EnemyTank1(enemyTanksheet.moveDown,turret, 30, 240+c*tileSize/2+30,r*tileSize/2+30);
                        et.changeDirection();
                        enemyTanks.push(et);
                        gameScene.addChild(et);
                        gameScene.addChild(et.turret);
                        zone4Enemies++;
                        numEnemies--;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 5){      
                if(zone5Enemies<=1){
                    if(Math.random()* 4> 3){
                        let et = new EnemyTank1(enemyTanksheet.moveDown,turret, 30, 240+c*tileSize/2+30,r*tileSize/2+30);
                        et.changeDirection();
                        enemyTanks.push(et);
                        gameScene.addChild(et);
                        gameScene.addChild(et.turret);
                        zone5Enemies++;
                        numEnemies--;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 6){      
                if(zone6Enemies<=2){
                    if(Math.random()* 12>10){
                        let et = new EnemyTank1(enemyTanksheet.moveDown,turret, 30, 240+c*tileSize/2+30,r*tileSize/2+30);
                        et.changeDirection();
                        enemyTanks.push(et);
                        gameScene.addChild(et);
                        gameScene.addChild(et.turret);
                        zone6Enemies++;
                        numEnemies--;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 7){      
                if(zone7Enemies<=1){
                    if(Math.random()* 4>3){
                        let et = new EnemyTank1(enemyTanksheet.moveDown,turret, 30, 240+c*tileSize/2+30,r*tileSize/2+30);
                        et.changeDirection();
                        enemyTanks.push(et);
                        gameScene.addChild(et);
                        gameScene.addChild(et.turret);
                        zone7Enemies++;
                        numEnemies--;
                    }                        
                }                
            }
            if(numEnemies<=0)
                return;
        }
    }
}

//Creates stones as a boundary around the map
function createOutterWalls() {
    let wallSprite = app.loader.resources["wall.png"].texture;
    let tileSprite = app.loader.resources["tile.png"].texture;
    for (let r = 0; r < levelManager.height; r ++) {
        for (let c = 0; c < levelManager.width; c ++) {
            if(levelManager.layoutarray[r][c] == 9){
                let w = new Wall(wallSprite, tileSize, 240+c*tileSize/2+tileSize/4, r*tileSize/2+tileSize/4);
                walls.push(w);
                gameScene.addChild(w);
            }
            else{
                let t = new Tile(tileSprite, tileSize, 240+c*tileSize/2+tileSize/4, r*tileSize/2+tileSize/4);
                tiles.push(t);
                gameScene.addChild(t);
            }
        }
    }
}

//Creates stones randomly across the level
function createWalls() {
    let wallSprite = app.loader.resources["wall.png"].texture;
    let zone2Walls = 0;
    let zone4Walls = 0;
    let zone5Walls = 0;
    let zone7Walls = 0;
    let zone3Walls = 0;
    let zone6Walls = 0;

    for (let r = 0; r < levelManager.height; r ++) {
        for (let c = 0; c < levelManager.width; c ++) {
            if(levelManager.layoutarray[r][c] == 2){      
                if(zone2Walls<=2){
                    if(Math.random()* 6> 5){
                        let w = new Wall(wallSprite, tileSize, 240+c*tileSize/2+tileSize/4, r*tileSize/2+tileSize/4);
                        walls.push(w);
                        gameScene.addChild(w);
                        zone2Walls++;
                        levelManager.layoutarray[r][c] = 9;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 3){      
                if(zone3Walls<=4){
                    if(Math.random()* 16> 14.5){
                        let w = new Wall(wallSprite, tileSize, 240+c*tileSize/2+tileSize/4, r*tileSize/2+tileSize/4);
                        walls.push(w);
                        gameScene.addChild(w);
                        zone3Walls++;
                        levelManager.layoutarray[r][c] = 9;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 4){      
                if(zone4Walls<=2){
                    if(Math.random()* 6> 5){
                        let w = new Wall(wallSprite, tileSize, 240+c*tileSize/2+tileSize/4, r*tileSize/2+tileSize/4);
                        walls.push(w);
                        gameScene.addChild(w);
                        zone4Walls++;
                        levelManager.layoutarray[r][c] = 9;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 5){      
                if(zone5Walls<=2){
                    if(Math.random()* 4> 3.5){
                        let w = new Wall(wallSprite, tileSize, 240+c*tileSize/2+tileSize/4, r*tileSize/2+tileSize/4);
                        walls.push(w);
                        gameScene.addChild(w);
                        zone5Walls++;
                        levelManager.layoutarray[r][c] = 9;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 6){      
                if(zone6Walls<=4){
                    if(Math.random()* 16> 14.5){
                        let w = new Wall(wallSprite, tileSize, 240+c*tileSize/2+tileSize/4, r*tileSize/2+tileSize/4);
                        walls.push(w);
                        gameScene.addChild(w);
                        zone6Walls++;
                        levelManager.layoutarray[r][c] = 9;
                    }                        
                }                
            }
            else if(levelManager.layoutarray[r][c] == 7){      
                if(zone7Walls<=2){
                    if(Math.random()* 6> 5){
                        let w = new Wall(wallSprite, tileSize, 240+c*tileSize/2+tileSize/4, r*tileSize/2+tileSize/4);
                        walls.push(w);
                        gameScene.addChild(w);
                        zone7Walls++;
                        levelManager.layoutarray[r][c] = 9;
                    }                        
                }                
            }
        }
    }
}

//Loads a sprite sheet given specifications
function loadSpriteSheet(texture, row, w, h, frames) {    
    let width = w;
    let height = h;
    let numFrames = frames;
    let textures = [];
    
    for (let i = 0; i < numFrames; i++) {
        let sprite = new PIXI.Texture(texture, new PIXI.Rectangle(i * width, row*height, width, height));
        
        textures.push(sprite);
    }    
    return textures;
}

//Creates the explosions
function createExplosion(texture, explArray, x, y, frameWidth, frameHeight, speed, scale) {
    let expl = new PIXI.AnimatedSprite(texture);
    expl.x = x;
    expl.y = y ;
    expl.animationSpeed = 1 / speed;
    expl.scale.set(scale);
    expl.anchor.set(0.5,0.5);
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explArray.push(expl);
    gameScene.addChild(expl);
    expl.play();
}