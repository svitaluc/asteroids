import Ship from './ship'
import Missile from './missile'
import Asteroid from './asteroid'
import ScoreBoard from './scoreBoard'

/** @class Game
 * Represents an asteroids game
 */
export default class Game {
    constructor(){
        this.screenWidth = 500;
        this.screenHeight = 500;

        this.ship = new Ship(this.screenWidth, this.screenHeight);
        this.scoreBoard = new ScoreBoard();
        this.missiles = [];
        this.asteroids = [];
        for(var i = 0; i < 15; i++){
            //TODO osetrit, ze neni na lodi!
            this.asteroids.push(new Asteroid(this.screenWidth, this.screenHeight));
        }
        this.state = {
            score: 0,
            level: 1,
            lives: 3
        };

        this.velocityChange = null;
        this.angleChange = null;
        this.shoot = false;
        this.helpOn = false;

        // Create the back buffer canvas
        this.backBufferCanvas = document.createElement('canvas');
        this.backBufferCanvas.width = this.screenWidth;
        this.backBufferCanvas.height = this.screenHeight+30;
        this.backBufferContext = this.backBufferCanvas.getContext('2d');

        // Create the screen buffer canvas
        this.screenBufferCanvas = document.createElement('canvas');
        this.screenBufferCanvas.width = this.screenWidth;
        this.screenBufferCanvas.height = this.screenHeight+30;
        this.screenBufferContext = this.screenBufferCanvas.getContext('2d');
        var ctx = this.screenBufferContext;

        this.img = new Image();
        this.img.src = "space.jpg";
        var img = this.img;
        this.img.onload = function() {
            ctx.drawImage(img, 0, 0, 500, 500);
        };
        document.body.appendChild(this.screenBufferCanvas);

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.shootMissile = this.shootMissile.bind(this);
        this.resolveAsteroidCollision = this.resolveAsteroidCollision.bind(this);
        this.loop = this.loop.bind(this);
        this.handleKeyDow = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.renderHelp = this.renderHelp.bind(this);

        window.onkeydown = this.handleKeyDow;
        window.onkeyup = this.handleKeyUp;


        this.loop();
    }

    loop(){
        // this.update();
        this.render();
        if(this.helpOn) {
            this.renderHelp();
        } else {
            this.update();
            // this.render();
        }
        requestAnimationFrame(this.loop);
    }

    update(){
        this.ship.update();
        for(var i = this.missiles.length-1; i > -1 ; i--){
            this.missiles[i].update();
            if((this.missiles[i].position.x > this.screenWidth)
                || (this.missiles[i].position.x < 0)
                || (this.missiles[i].position.y > this.screenHeight)
                || (this.missiles[i].position.y < 0)){
                this.missiles.splice(i, 1);
            }
        }
        for(i = 0; this.asteroids.length-1; i++){
            for(var j = i+1; j < this.asteroids.length; j++){
                this.resolveAsteroidCollision(this.asteroids[i], this.asteroids[j]);
            }
        }
        for(i = this.asteroids.length-1; i > -1; i--){
            this.asteroids[i].update();
        }
    }

    render(){
        this.backBufferContext.drawImage(this.img, 0, 0, 500, 500);
        this.ship.render(this.backBufferContext);
        for(var i = 0; i < this.missiles.length; i++){
            this.missiles[i].render(this.backBufferContext);
        }
        for(i = 0; i < this.asteroids.length; i++){
            this.asteroids[i].render(this.backBufferContext);
        }
        this.scoreBoard.render(this.backBufferContext, this.state);
        this.screenBufferContext.drawImage(this.backBufferCanvas,0,0);
    }

    //this function is based on the collision solving by Nathan Bean in https://github.com/zombiepaladin/pool/blob/master/src/app.js
    resolveAsteroidCollision (a1, a2){
        var differenceX = Math.abs(a1.position.x - a2.position.x);
        var differenceY = Math.abs(a1.position.y - a2.position.y);
        var distance = Math.sqrt(differenceX*differenceX + differenceY*differenceY);
        if(distance > (a1.radius + a2.radius))
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
        var va1 = this.rotateVector(a1.velocity, angle);
        var va2 = this.rotateVector(a2.velocity, angle);

        var s = va1.x;
        va1.x = va2.x;
        va2.x = s;
        va1 = this.rotateVector(va1, -angle);
        va2 = this.rotateVector(va2, -angle);

        a1.velocity = va1;
        a2.velocity.x = va2;
    }

    rotateVector(vector, angle) {
        return {
            x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
            y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
        }
    }

    shootMissile(){
        var shootDelay = 100;
        if ((this.missiles.length > 0) && ((new Date() - this.missiles[this.missiles.length-1].shotTime) < shootDelay)){
            return;
        }
        this.missiles.push(new Missile(this.ship.position, this.ship.velocity, this.ship.angle, new Date()))
    }

    handleKeyDown(event){
        event.preventDefault();
        if(this.helpOn && event.key != 'Escape'){
            return;
        }
        switch (event.key) {
            case 'a':
            case 'ArrowLeft':
                this.ship.updateAngle('l');
                this.angleChange = 'l';
                if (this.velocityChange) this.ship.updateVelocity(this.velocityChange);
                if (this.shoot) this.shootMissile();
                break;
            case 'd':
            case 'ArrowRight':
                this.ship.updateAngle('r');
                this.angleChange = 'r';
                if (this.velocityChange) this.ship.updateVelocity(this.velocityChange);
                if (this.shoot) this.shootMissile();
                break;
            case 'w':
            case 'ArrowUp':
                this.ship.updateVelocity('f');
                this.velocityChange = 'f';
                if (this.angleChange) this.ship.updateAngle(this.angleChange);
                if (this.shoot) this.shootMissile();
                break;
            case 's':
            case 'ArrowDown':
                this.ship.updateVelocity('b');
                this.velocityChange = 'b';
                if (this.angleChange) this.ship.updateAngle(this.angleChange);
                if (this.shoot) this.shootMissile();
                break;
            case ' ':
                this.shootMissile();
                this.shoot = true;
                if (this.velocityChange) this.ship.updateVelocity(this.velocityChange);
                if (this.angleChange) this.ship.updateAngle(this.angleChange);
                break;
            case 'Escape':
                this.helpOn = !this.helpOn;
        }

    }

    handleKeyUp(event){
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

    renderHelp(){
        var ctx = this.backBufferContext;
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight+30);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.font = '30px orbitron arial';
        ctx.textAlign = 'center';
        ctx.fillText("HELP", this.screenWidth/2, 100);
        ctx.fillText("GAME CONTROLS:", this.screenWidth/2, 140);
        ctx.font = '27px orbitron arial';
        ctx.fillText("TURN LEFT: A or ArrowLeft", this.screenWidth/2, 200);
        ctx.fillText("TURN RIGHT: D or ArrowRight", this.screenWidth/2, 250);
        ctx.fillText("MOVE FORWARD: W or ArrowUp", this.screenWidth/2, 300);
        ctx.fillText("MOVE BACKWARD: S or ArrowDown", this.screenWidth/2, 350);
        ctx.fillText("SHOOT: Space bar", this.screenWidth/2, 400);
        ctx.fillText("EXIT/ENTER HELP: Escape", this.screenWidth/2, 450);

        this.screenBufferContext.drawImage(this.backBufferCanvas,0,0);
    }
}