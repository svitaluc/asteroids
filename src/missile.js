/** @class Missile
 * The missile in an asteroids game
 */
export default class Missile {
    constructor(position, velocity, angle, time) {
        this.position = {
            x: position.x,
            y: position.y
        };
        this.velocity = {
            x: velocity.x,
            y: velocity.y
        };
        this.angle = angle;
        this.shotTime = time;
        this.missileSpeed = 2;

        this.update = this.update.bind(this);
    }

    update(){
        this.position.x += -Math.cos(this.angle) * this.missileSpeed + this.velocity.x;
        this.position.y -= Math.sin(this.angle) * this.missileSpeed + this.velocity.y;
    }

    render(ctx){
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(this.position.x,this.position.y,3,0,2*Math.PI);
        ctx.fill();
        ctx.restore();
    }
}