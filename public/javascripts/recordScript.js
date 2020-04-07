const recordConfig = {
    size:{w:1920, h:1180},
    bgImageUrl:'/images/bg_03.png'
};

class Recorder{
    constructor(_that, clbk){
        var _this=this;
        this.app=_that;
        this.canvas=document.createElement('canvas');
        this.canvas.width=recordConfig.size.w;
        this.canvas.height=recordConfig.size.h;
        this.canvas.id="recordCanvas";
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.bgImage = new Image();
        this.bgImage.src = recordConfig.bgImageUrl;
        this.bgImage.onload = function(){
            _this.ctx.beginPath();
            _this.ctx.rect(0, 0, _this.bgImage.width, _this.bgImage.height);
            _this.ctx.fillStyle = "#000000";
            _this.ctx.fill();
            _this.ctx.drawImage(_this.bgImage, 0,0,_this.bgImage.width,    _this.bgImage.height,     // source rectangle
                0, 0, _this.canvas.width, _this.canvas.height); // Or at whatever offset you like
            if(clbk)
                clbk()
        };
    }
    start(video)
    {
        this.mainVideo=video;
        this.drawVideo(this);
    }
    drawVideo(_this){
        _this.ctx.beginPath();
        _this.ctx.rect(0, 0, _this.bgImage.width, _this.bgImage.height);
        _this.ctx.fillStyle = "#000000";
        _this.ctx.fill();

        _this.ctx.drawImage(_this.bgImage, 0,0,_this.bgImage.width,    _this.bgImage.height,     // source rectangle
            0, 0, _this.canvas.width, _this.canvas.height);

        if (!_this.mainVideo.paused && !_this.mainVideo.ended) {
            _this.ctx.drawImage(_this.mainVideo, 0,0, recordConfig.size.w, recordConfig.size.h );
        }


        var clientVideoCount=videoReceivers.length;
        var mainVideoSize={w:recordConfig.size.w, h:recordConfig.size.h, top:0, coof:1}


        requestAnimationFrame(()=>{_this.drawVideo(_this)});

    }

}

function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
}