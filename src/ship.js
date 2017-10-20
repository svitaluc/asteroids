/** @class Ship
 * The ship in an asteroids game
 */
export default class Ship {
    constructor(width, height) {
        this.position = {
            x: width / 2,
            y: height / 2
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.angle = Math.PI / 2;
        this.engineSpeed = 0.5;
        this.maxSpeed = 3;
        this.invulnerable = new Date();

        this.screenWidth = width;
        this.screenHeight = height;

        this.update = this.update.bind(this);
        this.updateAngle = this.updateAngle.bind(this);
        this.updateVelocity = this.updateVelocity.bind(this);
        this.collidesWithAsteroid = this.collidesWithAsteroid.bind(this);
        this.restart = this.restart.bind(this);
        this.render = this.render.bind(this);
    }

    update() {
        if(this.invulnerable && ((new Date() - this.invulnerable) > 4000)) {
            this.invulnerable = false;
        }
        this.position.x += this.velocity.x;
        this.position.y -= this.velocity.y;

        if (this.position.x > this.screenWidth) {
            this.position.x -= this.screenWidth;
        }
        if (this.position.x < 0) {
            this.position.x += this.screenWidth;
        }
        if (this.position.y < 0) {
            this.position.y += this.screenHeight;
        }
        if (this.position.y > this.screenHeight) {
            this.position.y -= this.screenHeight;
        }
    }

    restart(){
        this.invulnerable = new Date();
        this.position.x = this.screenWidth / 2;
        this.position.y = this.screenHeight / 2;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.angle = Math.PI / 2;
    }

    collidesWithAsteroid(asteroid){
        if(this.invulnerable) {
            return false;
        }
        var centerX = 0 + this.position.x;
        var centerY = 5 + this.position.y;
        if ((Math.pow(centerX-asteroid.position.x, 2) + Math.pow(centerY-asteroid.position.y, 2)) > (Math.pow(5 + asteroid.radius, 2))) {
            return false;
        }
        if (((Math.pow(this.position.x-asteroid.position.x, 2) + Math.pow(this.position.y-5-asteroid.position.y, 2)) <= (Math.pow(asteroid.radius, 2)))
            || ((Math.pow(this.position.x+3-asteroid.position.x, 2) + Math.pow(this.position.y+5-asteroid.position.y, 2)) <= (Math.pow(asteroid.radius, 2)))
            || ((Math.pow(this.position.x-3-asteroid.position.x, 2) + Math.pow(this.position.y+5-asteroid.position.y, 2)) <= (Math.pow(asteroid.radius, 2)))
            || ((Math.pow(this.position.x+0-asteroid.position.x, 2) + Math.pow(this.position.y+0-asteroid.position.y, 2)) <= (Math.pow(asteroid.radius, 2)))) {
            return true;
        }
        return false;
    }

    updateAngle(direction) {
        var difference = Math.PI / 16;
        this.angle = (direction === 'l') ? this.angle - difference : this.angle + difference;
    }

    updateVelocity(direction) {
        var aX = -Math.cos(this.angle) * this.engineSpeed;
        var aY = Math.sin(this.angle) * this.engineSpeed;

        this.velocity.x = (direction === 'f') ? this.velocity.x + aX : this.velocity.x - aX;
        this.velocity.y = (direction === 'f') ? this.velocity.y + aY : this.velocity.y - aY;

        if ((this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y) > (this.maxSpeed * this.maxSpeed)) {
            let magnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            this.velocity.x = this.velocity.x / magnitude * this.maxSpeed;
            this.velocity.y = this.velocity.y / magnitude * this.maxSpeed;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'brown';
        if(this.invulnerable && (new Date().getMilliseconds() % 200 < 100)){
            ctx.strokeStyle = 'grey';
            ctx.fillStyle = 'yellow';
        }
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle - Math.PI / 2);
        ctx.moveTo(0, -5);
        ctx.lineTo(3, 5);
        ctx.lineTo(-3, 5);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
}