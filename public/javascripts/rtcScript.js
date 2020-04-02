const RTPconfig = {
    iceServers: [
        {
            'urls': 'turn:re.rustv.ru:3478',
            'credential': 'user1',
            'username':"user1"
        }
    ]
};

var videoSenders=[]
var videoReceivers=[]
async function getStream(_this){
    const constraints={
        audio: true,
        video: {
            width: { min: 320, ideal: 640, max: 1920 },
            //height:{min: 180, ideal:320 , max:720},
            facingMode: "user",
            aspectRatio: 1.777777778
        }
    }
    var stream=await navigator.mediaDevices.getUserMedia(constraints);
    var video = createVideoContaiter('selfVideo', _this.user.i ||''+" "+_this.user.f);
    video.srcObject=stream;
    video.muted=true;
    video.addEventListener("play",async ()=>{
     /*   var dt=await axios.get('/rest/api/guid');
        var videoSender={guid:dt.data, myVideo:video,myStream:stream}
        videoSenders.push(videoSender);*/
        repeatSelfVideo();
       function repeatSelfVideo() {
           _this.socket.emit("selfVideoStarted",true);
           setTimeout(repeatSelfVideo, 5000);
       }
    })
    _this.webCamStream=stream;

}
function createVideoContaiter(id, caption) {
    var video = document.createElement("video");

    video.autoplay = true;
    video.width = 320;
    video.style.width="180px"
    var videoBox = document.createElement("div");
    videoBox.classList.add("videoBox")
    videoBox.id = id;
    var videoCap = document.createElement("div");
    videoCap.classList.add("videoCap")
    videoCap.innerText=caption + "<b> src='/images/close.svg'</b>";
  //  videoCap.innerHtml ="<b> src='/images/close.svg'</b>"+ videoCap.innerHtml;
   // console.log(videoCap.innerHtml)
    videoBox.appendChild(video);
    videoBox.appendChild(videoCap);
    document.getElementById("videoWr").appendChild(videoBox);
    return     video
}
async function modGetStream(_this, clbk) {

    var video=document.getElementById("selfVideo")
    if(!video) {
        const constraints = {
            audio: true,
            video: {
                width: {min: 320, ideal: 640, max: 1920},
                //height:{min: 180, ideal:320 , max:720},
                facingMode: "user",
                aspectRatio: 1.777777778
            }
        }
        _this.selfVideoStream = await navigator.mediaDevices.getUserMedia(constraints);
         video = createVideoContaiter('selfVideo', _this.user.i || '' + " " + _this.user.f);
        video.srcObject = _this.selfVideoStream ;
        video.muted = true;
        video.addEventListener("play", () => {
            clbk(video, _this.selfVideoStream);
        })
    }
    else {
        console.log("else")
        clbk(video, _this.selfVideoStream);
    }


    return  video;
}
async function createSender(video, stream, clbk){
    var dt=await axios.get('/rest/api/guid');
    var RTConn= new RTCPeerConnection(RTPconfig);
    var ret={
        guid:dt.data,
        video:video,
        stream:stream,
        RTConn:RTConn
    }
    clbk(ret);

}

async function createReceiver(data, video, socket, clbk){

    var RTConn= new RTCPeerConnection(RTPconfig);
    var ret={
        guid:data.guid,
        video:video,
        RTConn:RTConn
    };
    RTConn.onicecandidate = (event) => {
        socket.emit("videoLink",{type:"icecandidate", to:data.from, candidate:event.candidate , guid:data.guid})
    }
    RTConn.oniceconnectionstatechange = (event) => {
        if(RTConn.iceConnectionState=="disconnected")
        {
            videoReceivers=videoReceivers.filter(s=>{
                if(s.guid==data.guid)
                {
                    s.RTConn.close()
                    s.RTConn=null;
                    var elem=document.getElementById(s.guid);

                    elem.parentNode.removeChild(elem)
                    return false;
                }
                return true
            })
        }
    }
    RTConn.ontrack=(event)=>{
        console.log("receiver have a track")
        if (video.srcObject !== event.streams[0]) {
            video.srcObject = event.streams[0];
            video.play();
        }
    }
    video.addEventListener("play", ()=>{
        socket.emit("receiverPlaying",{ guid:data.guid, to:data.from})
    })
    clbk(ret);
}
async function  addSenderEvents(socket,videoSender, data, clbk){
    var RTConn=videoSender.RTConn;
    videoSender.stream.getTracks().forEach(track => RTConn.addTrack(track, videoSender.stream));
    RTConn.onicecandidate = (event) => {
        console.log("onicecandidate")
        socket.emit("videoLink",{type:"icecandidate", to:data.from, candidate:event.candidate , guid:data.guid})
    }
    RTConn.oniceconnectionstatechange = (event) => {
        if(RTConn.iceConnectionState=="disconnected")
        {
            videoSenders=videoSenders.filter(s=>{
                if(s.guid==videoSender.guid)
                {
                    s.RTConn.close()
                    s.RTConn=null;
                    return false;
                }
                return true
            })
        }
    }
    var descr=await RTConn.createOffer({offerToReceiveAudio: 1, offerToReceiveVideo: 1})
    await RTConn.setLocalDescription(descr);
    socket.emit("videoLink",{type:"videoOffer", to:data.from, descr:descr , guid:data.guid})


}
async function  onVideoLink(_this, data) {

    if(data.type=="icecandidate"){
        var s=videoSenders.filter(s=>{return s.guid==data.guid});
        if(s.length>0 && data.candidate)
            s[0].RTConn.addIceCandidate(data.candidate)
                .then(function () {
                    console.log("sender candidate set")
                })
                .catch(function (e) {
                    console.log("sender candidate err", e)
                })
        var r=videoReceivers.filter(s=>{return s.guid==data.guid});
        if(r.length>0)
            r[0].RTConn.addIceCandidate(data.candidate)
                .then(function () {
                    console.log("receiver candidate set")
                })
                .catch(function (e) {
                    console.warn("receiver candidate err", e, data.candidate)
                })
    }
    if(data.type="videoOffer"){
        var r=videoReceivers.filter(s=>{return s.guid==data.guid});

       if(r.length>0 && data.descr){

            await r[0].RTConn.setRemoteDescription(data.descr);
            var answ=await r[0].RTConn.createAnswer();
            await r[0].RTConn.setLocalDescription(answ);
           socket.emit("videoLink",{type:"videoAnswer", to:data.from, answ:answ , guid:data.guid})
           console.log("videoOffer set, videoAnswer send");

        }
    }
    if(data.type="videoAnswer"){
        var r=videoSenders.filter(s=>{return s.guid==data.guid});

        if(r.length>0){
           // console.log("on videoAnswer is ", r, data);
            if(data.answ) {
                await r[0].RTConn.setRemoteDescription(data.answ);
                console.log("on videoAnswer is set", r, data);
            }
          /*   await r[0].RTConn.setLocalDescription(answ);

*/
        }
    }

}

