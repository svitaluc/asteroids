import Ship from './ship'
import Missile from './missile'
import Asteroid from './asteroid'
import Ufo from './ufo'
import ScoreBoard from './scoreBoard'

/** @class Game
 * Represents an asteroids game
 */
export default class Game {
    constructor() {
        this.screenWidth = 500;
        this.screenHeight = 500;

        this.ship = new Ship(this.screenWidth, this.screenHeight);
        this.scoreBoard = new ScoreBoard();
        this.missiles = [];
        this.asteroids = [];
        this.state = {
            score: 0,
            level: 1,
            lives: 3
        };

        this.velocityChange = null;
        this.angleChange = null;
        this.shoot = false;
        this.helpOn = true;
        this.gameOver = false;
        this.ufoPeriod = 5000;
        this.lastUfo = new Date();
        this.ufo = null;

        this.aACollisionAudio = new Audio('a-a_collision.mp3');
        this.aSCollisionAudio = new Audio('a-s_collision.mp3');
        this.fireAudio = new Audio('fire_missile.mp3');
        this.breakAAudio = new Audio('a_break.mp3');
        this.gameOverAudio = new Audio('failure.mp3');

        // Create the back buffer canvas
        this.backBufferCanvas = document.createElement('canvas');
        this.backBufferCanvas.width = this.screenWidth;
        this.backBufferCanvas.height = this.screenHeight + 30;
        this.backBufferContext = this.backBufferCanvas.getContext('2d');

        // Create the screen buffer canvas
        this.screenBufferCanvas = document.createElement('canvas');
        this.screenBufferCanvas.width = this.screenWidth;
        this.screenBufferCanvas.height = this.screenHeight + 30;
        this.screenBufferContext = this.screenBufferCanvas.getContext('2d');
        var ctx = this.screenBufferContext;

        this.img = new Image();
        this.img.src = "space.jpg";
        var img = this.img;
        this.img.onload = function () {
            ctx.drawImage(img, 0, 0, 500, 500);
        };
        document.body.appendChild(this.screenBufferCanvas);

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.shootMissile = this.shootMissile.bind(this);
        this.resolveAsteroidAsteroidCollision = this.resolveAsteroidAsteroidCollision.bind(this);
        this.resolveAsteroidMissileCollision = this.resolveAsteroidMissileCollision.bind(this);
        this.loop = this.loop.bind(this);
        this.handleKeyDow = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.renderHelp = this.renderHelp.bind(this);
        this.renderGameOver = this.renderGameOver.bind(this);
        this.generateAsteroids = this.generateAsteroids.bind(this);
        this.getNewGame = this.getNewGame.bind(this);

        window.onkeydown = this.handleKeyDow;
        window.onkeyup = this.handleKeyUp;

        // this.generateAsteroids();
        this.loop();
    }

    generateAsteroids(){
        var amount = 10 + (5 * this.state.level);
        while (this.asteroids.length < amount) {
            var asteroid = new Asteroid(this.screenWidth, this.screenHeight);
            if (Math.pow(asteroid.position.x - this.ship.position.x, 2) + Math.pow(asteroid.position.y - this.ship.position.y, 2) > Math.pow(asteroid.radius + 20, 2)) {
                this.asteroids.push(asteroid);
            }
        }
    }

    getNewGame() {
        this.state = {
            score: 0,
            level: 1,
            lives: 3
        };
        this.gameOver = false;
        this.helpOn = false;
        this.missiles = [];
        this.asteroids = [];
        // this.generateAsteroids();
        this.gameOverAudio.pause();
        this.gameOverAudio.currentTime = 0;
        this.loop();
    }

    loop() {
        this.render();
        if (this.state.lives === 0) {
            this.gameOver = true;
            this.gameOverAudio.play();
            this.renderGameOver();
            return;
        }
        if (this.helpOn) {
            this.renderHelp();
        } else {
            this.update();
        }
        requestAnimationFrame(this.loop)
    }

    update() {
        if (this.velocityChange) this.ship.updateVelocity(this.velocityChange);
        if (this.shoot) this.shootMissile();
        if (this.angleChange) this.ship.updateAngle(this.angleChange);

        //update ship
        this.ship.update();
        //update missiles position
        for (var i = this.missiles.length - 1; i > -1; i--) {
            this.missiles[i].update();
            if ((this.missiles[i].position.x > this.screenWidth)
                || (this.missiles[i].position.x < 0)
                || (this.missiles[i].position.y > this.screenHeight)
                || (this.missiles[i].position.y < 0)) {
                this.missiles.splice(i, 1);
            }
        }

        //update level
        // if(this.asteroids.length === 0) {
        if(this.asteroids.length === 10) {
            this.state.level++;
            this.ship.restart();
            // this.generateAsteroids();
        }

        //update asteroid position + collision with ship
        let deletedAsteroid = null;
        for (var l = this.asteroids.length - 1; l > -1; l--) {
            if (this.ship.collidesWithAsteroid(this.asteroids[l])) {
                deletedAsteroid = l;
                this.state.lives--;
                this.ship.restart();
                this.aSCollisionAudio.play();
            }
            else {
                this.asteroids[l].update();
            }
        }
        if (deletedAsteroid !== null) {
            if (Math.ceil(this.asteroids[deletedAsteroid].radius / 10) > 1) {
                var newParts = this.asteroids[deletedAsteroid].breakMe();
                this.asteroids.splice(deletedAsteroid, 1);
                this.asteroids.push(newParts[0]);
                this.asteroids.push(newParts[1]);
            } else {
                this.asteroids.splice(deletedAsteroid, 1);
            }
        }

        //update asteroid-asteroid collisions
        for (var k = 0; k < this.asteroids.length - 1; k++) {
            for (var j = k + 1; j < this.asteroids.length; j++) {
                this.resolveAsteroidAsteroidCollision(this.asteroids[k], this.asteroids[j]);
            }
        }

        //update missile-asteroid collisions
        let deletedMissiles = [];
        for (i = this.missiles.length - 1; i > -1; i--) {
            for (j = this.asteroids.length - 1; j > -1; j--) {
                if (this.resolveAsteroidMissileCollision(j, i)) {
                    deletedMissiles.push(i);
                    break;
                }
            }
        }
        for (let i = deletedMissiles.length - 1; i >= 0; i--)
            this.missiles.splice(deletedMissiles[i], 1);

        if(this.ufo){
            var ufoMissile = this.ufo.update(this.ship.position);
            if (ufoMissile){
                this.missiles.push(ufoMissile);
            }
            for (k = 0; k < this.asteroids.length - 1; k++) {
                this.resolveAsteroidAsteroidCollision(this.ufo, this.asteroids[k]);
            }
        }
        else if ((new Date() - this.lastUfo) > this.ufoPeriod){
            this.ufo = new Ufo(this.screenWidth, this.screenHeight);
        }
    }

    render() {
        this.backBufferContext.drawImage(this.img, 0, 0, 500, 500);
        this.ship.render(this.backBufferContext);
        for (var i = 0; i < this.missiles.length; i++) {
            this.missiles[i].render(this.backBufferContext);
        }
        for (i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].render(this.backBufferContext);
        }
        if(this.ufo) {
            this.ufo.render(this.backBufferContext);
        }
        this.scoreBoard.render(this.backBufferContext, this.state);
        this.screenBufferContext.drawImage(this.backBufferCanvas, 0, 0);
    }

    renderGameOver() {
        var ctx = this.backBufferContext;
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight + 30);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'darkred';
        ctx.font = 'bold 30px arial';
        ctx.textAlign = 'center';
        ctx.fillText("GAME OVER", this.screenWidth / 2, 100);
        ctx.font = 'bold 27px arial';
        ctx.fillText("Your final score:", this.screenWidth / 2, 160);
        ctx.font = 'bold 35px arial';
        ctx.fillText(""+this.state.score, this.screenWidth / 2, 220);
        ctx.font = 'bold 25px arial';
        ctx.fillText("Press [Enter] to play a new game", this.screenWidth / 2, 350);

        this.screenBufferContext.drawImage(this.backBufferCanvas, 0, 0);
    }

    resolveAsteroidMissileCollision(aIndex, mIndex) {
        var asteroid = this.asteroids[aIndex];
        var missile = this.missiles[mIndex];
        var differenceX = Math.abs(asteroid.position.x - missile.position.x);
        var differenceY = Math.abs(asteroid.position.y - missile.position.y);
        if ((differenceX * differenceX + differenceY * differenceY) > Math.pow(asteroid.radius + missile.radius, 2))
            return false;

        var sizeClass = Math.ceil(asteroid.radius / 15);
        this.breakAAudio.play();

        //asteroid is small enough to be destroyed
        if (sizeClass === 1) {
            this.asteroids.splice(aIndex, 1);
            if(!missile.enemy) this.state.score += 10;
            return true;
        }

        if(!missile.enemy) this.state.score += (sizeClass === 2) ? 6 : 3;
        //divide the asteroid
        var asteroidParts = asteroid.breakMe();
        this.asteroids.splice(aIndex, 1);
        // this.missiles.splice(mIndex, 1);

        this.asteroids.push(asteroidParts[0]);
        this.asteroids.push(asteroidParts[1]);
        return true;

    }

    //this function is based on the collision solving by Nathan Bean in https://github.com/zombiepaladin/pool/blob/master/src/app.js
    resolveAsteroidAsteroidCollision(a1, a2) {
        var differenceX = Math.abs(a1.position.x - a2.position.x);
        var differenceY = Math.abs(a1.position.y - a2.position.y);
        if ((differenceX * differenceX + differenceY * differenceY) > Math.pow(a1.radius + a2.radius, 2))
            return;

        var collisionNormal = {
            x: a1.position.x - a2.position.x,
            y: a1.position.y - a2.position.y
        };

        var norm = Math.sqrt(collisionNormal.x * collisionNormal.x + collisionNormal.y * collisionNormal.y);
        collisionNormal.x /= norm;
        collisionNormal.y /= norm;

        var overlap = a1.radius + a2.radius - norm;
        a1.position.x += collisionNormal.x * overlap / 2;
        a1.position.y += collisionNormal.y * overlap / 2;
        a2.position.x -= collisionNormal.x * overlap / 2;
        a2.position.y -= collisionNormal.y * overlap / 2;

        var angle = Math.atan2(collisionNormal.y, collisionNormal.x);
        var va1 = Game.rotateVector(a1.velocity, angle);
        var va2 = Game.rotateVector(a2.velocity, angle);

        var s = va1.x;
        va1.x = va2.x;
        va2.x = s;
        va1 = Game.rotateVector(va1, -angle);
        va2 = Game.rotateVector(va2, -angle);

        a1.velocity.x = Math.round(va1.x * 100) / 100;
        a1.velocity.y = Math.round(va1.y * 100) / 100;
        a2.velocity.x = Math.round(va2.x * 100) / 100;
        a2.velocity.y = Math.round(va2.y * 100) / 100;

        this.aACollisionAudio.play();
    }

    static rotateVector(vector, angle) {
        return {
            x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
            y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
        }
    }

    shootMissile() {
        var shootDelay = 100;
        if ((this.missiles.length > 0) && ((new Date() - this.missiles[this.missiles.length - 1].shotTime) < shootDelay)) {
            return;
        }
        this.missiles.push(new Missile(this.ship.position, this.ship.velocity, this.ship.angle, new Date()));
        this.fireAudio.play();
    }

    handleKeyDown(event) {
        event.preventDefault();
        if ((this.helpOn && ((event.key !== 'Escape') && (event.key !== 'Enter'))) || (this.gameOver && (event.key !== "Enter"))) {
            return;
        }
        switch (event.key) {
            case 'a':
            case 'ArrowLeft':
                this.ship.updateAngle('l');
                this.angleChange = 'l';
                break;
            case 'd':
            case 'ArrowRight':
                this.ship.updateAngle('r');
                this.angleChange = 'r';
                break;
            case 'w':
            case 'ArrowUp':
                this.ship.updateVelocity('f');
                this.velocityChange = 'f';
                break;
            case 's':
            case 'ArrowDown':
                this.ship.updateVelocity('b');
                this.velocityChange = 'b';
                break;
            case ' ':
                this.shootMissile();
                this.shoot = true;
                break;
            case 'Escape':
                this.helpOn = !this.helpOn;
                break;
            case 'Enter':
                if (this.gameOver || this.helpOn){
                    this.getNewGame();
                }
                break;
            case 'r':
                this.ship.relocate();
        }

    }

    handleKeyUp(event) {
        event.preventDefault();
        switch (event.key) {
            case 'a':
            case 'ArrowLeft':
                this.angleChange = null;
                break;
            case 'd':
            case 'ArrowRight':
                this.angleChange = null;
                break;
            case 'w':
            case 'ArrowUp':
                this.velocityChange = null;
                break;
            case 's':
            case 'ArrowDown':
                this.velocityChange = null;
                break;
            case ' ':
                this.shoot = false;
        }
    }

    renderHelp() {
        var ctx = this.backBufferContext;
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight + 30);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#005454';
        ctx.font = 'bold 30px arial';
        ctx.textAlign = 'center';
        ctx.fillText("ASTEROIDS!", this.screenWidth / 2, 50);
        ctx.font = 'bold 22px arial';
        ctx.fillText("Destroy the asteroids and don't get hit!", this.screenWidth / 2, 90);
        ctx.font = 'bold 27px arial';
        ctx.fillText("GAME CONTROLS:", this.screenWidth / 2, 140);
        ctx.font = 'bold 20px arial';
        ctx.fillText("TURN LEFT: A or ArrowLeft", this.screenWidth / 2, 200);
        ctx.fillText("TURN RIGHT: D or ArrowRight", this.screenWidth / 2, 230);
        ctx.fillText("MOVE FORWARD: W or ArrowUp", this.screenWidth / 2, 260);
        ctx.fillText("MOVE BACKWARD: S or ArrowDown", this.screenWidth / 2, 290);
        ctx.fillText("SHOOT: Space bar", this.screenWidth / 2, 320);
        ctx.fillText("RELOCATE TO RANDOM POSITION: R", this.screenWidth / 2, 350);
        ctx.fillText("CONTINUE THE GAME: Escape", this.screenWidth / 2, 420);
        ctx.fillText("PLAY A NEW GAME: Enter", this.screenWidth / 2, 450);

        this.screenBufferContext.drawImage(this.backBufferCanvas, 0, 0);
    }
}