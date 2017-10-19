import Ship from './ship'
import Missile from './missile'

/** @class Game
 * Represents an asteroids game
 */
export default class Game {
    constructor(){
        this.screenWidth = 500;
        this.screenHeight = 500;

        this.ship = new Ship(this.screenWidth, this.screenHeight);
        this.missiles = [];

        this.velocityChange = null;
        this.angleChange = null;
        this.shoot = false;

        // Create the back buffer canvas
        this.backBufferCanvas = document.createElement('canvas');
        this.backBufferCanvas.width = this.screenWidth;
        this.backBufferCanvas.height = this.screenHeight;
        this.backBufferContext = this.backBufferCanvas.getContext('2d');

        // Create the screen buffer canvas
        this.screenBufferCanvas = document.createElement('canvas');
        this.screenBufferCanvas.width = this.screenWidth;
        this.screenBufferCanvas.height = this.screenHeight;
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
        this.loop = this.loop.bind(this);
        this.handleKeyDow = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        window.onkeydown = this.handleKeyDow;
        window.onkeyup = this.handleKeyUp;


        this.loop();
    }

    loop(){
        this.update();
        this.render();
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
    }

    render(){
        this.backBufferContext.drawImage(this.img, 0, 0, 500, 500);
        this.ship.render(this.backBufferContext);
        for(var i = 0; i < this.missiles.length; i++){
            this.missiles[i].render(this.backBufferContext);
        }
        this.screenBufferContext.drawImage(this.backBufferCanvas,0,0);
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
}