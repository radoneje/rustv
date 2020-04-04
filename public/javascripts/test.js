window.onload=async function() {
    var AudioContext = window.AudioContext // Default
        || window.webkitAudioContext // Safari and old versions of Chrome
        || false;

    var inputVideo=document.getElementById("srcVideo")
    inputVideo.muted="mute"


    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.font = "20px Georgia";
    var vw;
    var vh;

    inputVideo.addEventListener('loadedmetadata', function() {
        vw = this.videoWidth || this.width;   // these are on video element itself
        vh = this.videoHeight || this.height;
        canvas.width = vw
        canvas.height = vh;
    });

    inputVideo.addEventListener("play", draw, false);
    function draw() {
        if (inputVideo.paused || inputVideo.ended) {
            return;
        }
        ctx.drawImage(inputVideo, 0, 0, vw, vh);

        ctx.fillText(new Date(), 10, 50);
        requestAnimationFrame(draw);  // loop anim. using rAF
    }

    var outStream = canvas.captureStream(30);
    var inputStream= await navigator.mediaDevices.getUserMedia({audio:true, video:true});
    inputVideo.srcObject=inputStream;
    const ac = new AudioContext();
    const osc = ac.createOscillator();
    osc.frequency.value = 150;
    osc.start();

    var gainNode = ac.createGain();
    gainNode.gain.value = 0.0;
    osc.connect(gainNode);

    var inputAudioNode= ac.createMediaStreamSource(inputStream);

    var merger = ac.createChannelMerger(20);

    gainNode.connect(merger, 0, 1);
    inputAudioNode.connect(merger, 0, 0);


    const audioStreamDestination = ac.createMediaStreamDestination();
    merger.connect(audioStreamDestination);

    const newAudioTrack = audioStreamDestination.stream.getAudioTracks()[0];

    var middleVideoStream=canvas.captureStream(30)
    const newStream = new window.MediaStream();

    newStream.addTrack(newAudioTrack);
    newStream.addTrack(middleVideoStream.getVideoTracks()[0]);

    var outVideo=document.getElementById("destVideo")
    outVideo.srcObject=newStream;

var i=100;
    document.getElementById('btn').addEventListener('click',()=>{
        i+=100;
      /*  var osc = ac.createOscillator();
        osc.frequency.value =i;
        osc.start();
        osc.connect(audioStreamDestination);*/
      //  newStream.addTrack( inputStream.getAudioTracks()[0]);


    })


    const console = { log: msg => div.innerHTML += msg + "<br>" };

    (async () => {
        try {
            video.srcObject = await navigator.mediaDevices.getUserMedia({video: true});
        } catch(e) {
            console.log(e);
        }
    })();

}