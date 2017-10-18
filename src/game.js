
/** @class Game
 * Represents an asteroids game
 */
export default class Game {
    constructor(){
        // Create the back buffer canvas
        this.backBufferCanvas = document.createElement('canvas');
        this.backBufferCanvas.width = 500;
        this.backBufferCanvas.height = 500;
        this.backBufferContext = this.backBufferCanvas.getContext('2d');

        // Create the screen buffer canvas
        this.screenBufferCanvas = document.createElement('canvas');
        this.screenBufferCanvas.width = 500;
        this.screenBufferCanvas.height = 500;
        this.screenBufferContext = this.screenBufferCanvas.getContext('2d');
        var ctx = this.screenBufferContext;

        var img = new Image();
        img.src = "space.jpg";
        img.onload = function() {
            ctx.drawImage(img, 0, 0, 500, 500);
        };

        document.body.appendChild(this.screenBufferCanvas);
    }
}