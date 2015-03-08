"use strict";

/**
 * The state of the game. Initially, the state is 'PLAY'. The state will turn to 'GAME_OVER' when the player looses
 * all its lives
 */
var gameState = 'PLAY';

/**
 * The difficulty level. Starts at 0 and increases every time the player reaches the water
 * The game level has effect on the number and speed of enemies. Every level will increase the speed of
 * enemies a little bit. Every three levels this speed increase will be reset, but a new enemy will be added.
 */
var gameLevel = 0;

/**
 * Some constants that are used across the code in the game
 */
var Constants = {
    // number of enemies
    INITIAL_ENEMY_COUNT: 3,
    // number of initial player lives
    INITIAL_LIVES: 3,

    // size in pixels of the game cells
    CELL_Y_SIZE: 83,
    CELL_X_SIZE: 100,
    // y offset for correctly rendering entities in their cells
    Y_OFFSET: 20,

    // initial coordinates of the player
    INIT_PLAYER_CELL_X: 2,
    INIT_PLAYER_CELL_Y: 5,

    // these values define the range of cells through which the player is allowed to move
    MIN_PLAYER_ALLOWED_X: 0,
    MAX_PLAYER_ALLOWED_X: 100 * 4,
    MIN_PLAYER_ALLOWED_Y: 0,
    MAX_PLAYER_ALLOWED_Y: 83 * 5 - 20,

    // initial and final x coordinates for enemies
    INIT_ENEMY_X: -120,
    END_ENEMY_X: 505,

    // range of values for the speed of enemies
    MIN_ENEMY_SPEED: 100,
    MAX_ENEMY_SPEED: 350,
    SPEED_INCREASE_BY_LEVEL: 50
};


/**
 * The entity class represents all animated entities in the game (enemies and player)
 *
 * Entities have a position in the board, given by x and y values, and an alive property
 * which indicates if the entity must be displayed or not.
 *
 * All child classes of Entity must implement the initPosition function, so their
 * coordinates are initialized
 *
 * @param spriteSrc url of the sprite for drawing the entity
 * @constructor
 */
var Entity = function (spriteSrc) {
    // initialize position and other parameters for this game entity
    this.initPosition();
    // set alive to true so the entity is rendered initially
    this.alive = true;
    // The image/sprite for our entity
    this.sprite = spriteSrc;
};

/**
 * Draw the entity in the screen, based on its x and y attributes
 */
Entity.prototype.render = function () {
    // the entity is only rendered if its alive attribute is set to true
    if (this.alive) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

/**
 * Enemies our player must avoid. These are moving bugs that spawn in any of the brick rows and have varying speeds.
 *
 * The Enemy class inherits from the Entity class. It must therefore implement an initPosition function.
 */
var Enemy = function () {
    Entity.call(this, 'images/enemy-bug.png');
};
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * Initializes coordinates and speed of the enemy. The row is randomly selected from any of the 3 brick rows. The speed is also random.
 * The x is placed on the left of the canvas, so the enemy appears smoothly from the left
 */
Enemy.prototype.initPosition = function () {
    this.x = Constants.INIT_ENEMY_X;
    this.y = selectRandomBrickRow();
    this.speed = getRandomInt(Constants.MIN_ENEMY_SPEED, Constants.MAX_ENEMY_SPEED) + (gameLevel % 3) * Constants.SPEED_INCREASE_BY_LEVEL;
};

/**
 * Update the enemy's position, required method for game
 *
 * Parameter: dt, a time delta between ticks
 */
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;

    // the code checks if the bug has left the canvas, and if so initialized its position once again
    if (this.x > Constants.END_ENEMY_X) {
        this.initPosition();
    }
};

/**
 * The Player class, inheriting from the Entity class. The update method was removed since the movement of the player is totally handled in
 * the handleInput function (the designed seemed easier this way).
 */
var Player = function () {
    Entity.call(this, 'images/char-boy.png');
    // player has an additional attribute, which stores how many lives the player has
    this.lives = Constants.INITIAL_LIVES;
};
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Entity;

/**
 * Initializes coordinates of the player. Initial coordinates are always the same
 */
Player.prototype.initPosition = function () {
    this.x = Constants.CELL_X_SIZE * Constants.INIT_PLAYER_CELL_X;
    this.y = Constants.CELL_Y_SIZE * Constants.INIT_PLAYER_CELL_Y - Constants.Y_OFFSET;
};

/**
 * Handles user input and translates it into player movement. The code checks that the player can only move in the grass and brick cells
 * @param input
 */
Player.prototype.handleInput = function (input) {
    switch (input) {
        case 'up':
            if (this.y > Constants.MIN_PLAYER_ALLOWED_Y) {
                this.y -= Constants.CELL_Y_SIZE;
            }
            break;
        case 'down':
            if (this.y < Constants.MAX_PLAYER_ALLOWED_Y) {
                this.y += Constants.CELL_Y_SIZE;
            }
            break;
        case 'left':
            if (this.x > Constants.MIN_PLAYER_ALLOWED_X) {
                this.x -= Constants.CELL_X_SIZE;
            }
            break;
        case 'right':
            if (this.x < Constants.MAX_PLAYER_ALLOWED_X) {
                this.x += Constants.CELL_X_SIZE;
            }
            break;
    }
};

/**
 * Win method for the player. This function must be invoked every time the player reaches the water
 */
Player.prototype.win = function () {
    // the player is moved to its initial position
    this.initPosition();
};

/**
 * Die method for the player. This function must be invoked every time a bug "touches" the player
 */
Player.prototype.die = function () {
    // the player is moved to its initial position, and looses 1 life
    this.initPosition();
    this.lives--;
    if (this.lives === 0) {
        // if all lives are lost, the alive attribute is set to false (so it is no longer rendered) an the state of the game is switched
        // to 'GAME_OVER'
        this.alive = false;
        document.removeEventListener('keyup', myKeyListener);
        gameState = 'GAME_OVER';
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

// object instantiation (enemies + player)
var allEnemies = [];
for (var i = 0; i < Constants.INITIAL_ENEMY_COUNT; i++) {
    allEnemies.push(new Enemy());
}
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', myKeyListener);

/**
 * This function is used as listener for the key input. We need a named function to be able to detach it later
 *
 * @param e the pressed key
 */
function myKeyListener(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
}

/**
 * Selects a random brick row for spawning bugs, returning the y coordinate for the selected row
 */
function selectRandomBrickRow() {
    return Constants.CELL_Y_SIZE * getRandomInt(1, 3) - Constants.Y_OFFSET;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

