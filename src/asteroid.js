/** @class Asteroid
 * The asteroid in an asteroids game
 */
export default class Asteroid {
    constructor(screenWidth, screenHeight){
        this.sidesNr = 5 + (Math.round(Math.random()*10) % 4);
        this.radius = 10 + Math.round(Math.random()*30);
        this.position = {
            x: Math.round(Math.random()*screenWidth),
            y: Math.round(Math.random()*screenHeight)
        };
        if(this.radius % 10 > 2){
            var velocityFactor = 1;
        } else if (this.radius % 10 > 1){
            velocityFactor = 1.5;
        } else {
            velocityFactor = 1;
        }

        this.velocity = {
            x: Math.round(Math.random() * velocityFactor * 100)/100,
            y: Math.round(Math.random() * velocityFactor * 100)/100
        };
        if (Math.random() > 0.5) this.velocity.x *= -1;
        if (Math.random() > 0.5) this.velocity.y *= -1;

        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.update = this.update.bind(this);
    }

    update(){
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

    render(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "#00cccc";
        ctx.strokeStyle = "black";
        ctx.moveTo (this.position.x +  this.radius * Math.cos(0), this.position.y +  this.radius *  Math.sin(0));
        for (var i = 1; i <= this.sidesNr; i++) {
            ctx.lineTo (
                this.position.x + this.radius * Math.cos(i * 2 * Math.PI / this.sidesNr),
                this.position.y + this.radius * Math.sin(i * 2 * Math.PI / this.sidesNr));
        }
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fill();
    }
}