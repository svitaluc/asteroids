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
        ctx.fillText("Score: " + state.score, 10, textLine);
        ctx.fillText("Level: " + state.level, 200, textLine);
        ctx.fillText("Lives: " + state.lives, 320, textLine);
        ctx.textAlign = "right";
        ctx.fillStyle = '#c4c4c4';
        ctx.fillText("ESC to Help", 490, textLine);
        ctx.restore();
    }
}