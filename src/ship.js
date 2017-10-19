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

        this.screenWidth = width;
        this.screenHeight = height;

        this.update = this.update.bind(this);
        this.updateAngle = this.updateAngle.bind(this);
        this.updateVelocity = this.updateVelocity.bind(this);
        this.render = this.render.bind(this);
    }

    update() {
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