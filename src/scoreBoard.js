/** @class ScoreBoard
 * The score board in an asteroids game
 */
export default class ScoreBoard {
    constructor(){
    }

    render(ctx, state){
        var textLine = 520;
        ctx.save();
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 500, 500, 30);
        ctx.fillStyle = 'black';
        ctx.fillRect(2, 502, 496, 26);
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '18px orbitron';
        ctx.textAlign = "left";
        ctx.fillText("Asteroids!", 10, textLine);
        ctx.fillText("Score: " + state.score, 110, textLine);
        ctx.fillText("Level: " + state.level, 200, textLine);
        ctx.fillText("Lives: " + state.lives, 290, textLine);
        ctx.textAlign = "right";
        ctx.fillText("ESC to Help", 490, textLine);
        ctx.restore();
    }
}