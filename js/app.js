/**
 * The state of the game. Initially, the state is 'PLAY'. The state will turn to 'GAME_OVER' when the player looses
 * all its lives
 */
var gameState = 'PLAY';

/**
 * Some constants that are used across the code in the game
 */
var Constants = {
    ENEMY_COUNT: 3,
    INITIAL_LIVES: 3,

    CELL_Y_SIZE: 83,
    CELL_X_SIZE: 100,
    Y_OFFSET: 20,

    INIT_PLAYER_CELL_X: 2,
    INIT_PLAYER_CELL_Y: 5,

    MIN_PLAYER_ALLOWED_X: 0,
    MAX_PLAYER_ALLOWED_X: 100 * 4,
    MIN_PLAYER_ALLOWED_Y: 83,
    MAX_PLAYER_ALLOWED_Y: 83 * 5 - 20,

    INIT_ENEMY_X: -120,
    END_ENEMY_X: 505,

    MIN_ENEMY_SPEED: 150,
    MAX_ENEMY_SPEED: 450
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


// Enemies our player must avoid
var Enemy = function () {
    Entity.call(this, 'images/enemy-bug.png');
};
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.initPosition = function () {
    this.x = Constants.INIT_ENEMY_X;
    this.y = selectRandomBrickRow();
    this.speed = getRandomInt(Constants.MIN_ENEMY_SPEED, Constants.MAX_ENEMY_SPEED);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;

    if (this.x > Constants.END_ENEMY_X) {
        this.initPosition();
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function () {

    Entity.call(this, 'images/char-boy.png');

    // player has an additional attribute, which stores how many lives the player has
    this.lives = Constants.INITIAL_LIVES;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
};
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Entity;
Player.prototype.initPosition = function () {
    this.x = Constants.CELL_X_SIZE * Constants.INIT_PLAYER_CELL_X;
    this.y = Constants.CELL_Y_SIZE * Constants.INIT_PLAYER_CELL_Y - Constants.Y_OFFSET;
};
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
Player.prototype.die = function () {
    this.initPosition();
    this.lives--;
    if (this.lives === 0) {
        this.alive = false;
        gameOver();
    }
};


var gameOver = function () {
    gameState = 'GAME_OVER';
    ctx.font = "30pt Impact";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.fillText("GAME OVER", 505 / 2, 606 / 2);
    ctx.lineWidth = 2;
    ctx.strokeText("GAME OVER", 505 / 2, 606 / 2);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];
for (var i = 0; i < Constants.ENEMY_COUNT; i++) {
    allEnemies.push(new Enemy());
}

var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

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

