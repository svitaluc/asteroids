import Missile from './missile'
import Game from './game'
/** @class Ufo
 * The ufo in an asteroids game
 */
export default class Ufo {
    constructor(screenWidth, screenHeight){
        this.position = {
            x: (Math.random() < 0.5) ? 0 : Math.random()*screenWidth,
            y: 0
        };
        if (this.position.x === 0) this.position.y = Math.random() * screenHeight;
        this.velocity = {
            x: Math.round(Math.random() * 80)/100,
            y: Math.round(Math.random() * 80)/100,
        };
        if (Math.random() > 0.5) this.velocity.x *= -1;
        if (Math.random() > 0.5) this.velocity.y *= -1;
        this.radius = 20;
        this.lastMissile = new Date();
        this.missileInterval = 1000;

        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    update(shipPosition){
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
        var missile = null;
        if((new Date() - this.lastMissile) > this.missileInterval){
            var diffVector = {
                x: -shipPosition.x + this.position.x,
                y: shipPosition.y - this.position.y
            };
            var norm = Math.sqrt(diffVector.x * diffVector.x + diffVector.y * diffVector.y);
            var missileVelocity = {
                x: Math.round((-diffVector.x / norm) * 100) / 100,
                y: Math.round((-diffVector.y / norm) * 100) / 100
            };
            var angle = -Math.atan2(diffVector.y, diffVector.x);
            missile = new Missile(this.position, missileVelocity, angle, new Date());
            missile.enemy = true;
            this.lastMissile = new Date();
        }
        return missile;
    }

    render(ctx){
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.position.x, this.position.y);
        ctx.fillStyle = '#ccffe5';
        ctx.arc(0, -10, 10, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#ccffff';
        ctx.arc(-15, 8, 4, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 11, 4, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(15, 8, 4, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.scale(2, 1);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#66cc00';
        ctx.fill();
        ctx.restore();
    }
}