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
        video:{width: {  ideal: 640, },aspectRatio: {ideal:1.777777778}} /*{
           // width: { min: 1024, ideal: 1024, max: 1920 },
            width: { min: 320, ideal: 640, max: 1920 },
            //height:{min: 180, ideal:320 , max:720},
            facingMode: "user",
            aspectRatio: 1.777777778
        }*/
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
    var canvas=document.createElement('canvas')
    canvas.width = video.width;
    canvas.height = video.width/1.7777;
    var ctx = canvas.getContext('2d');


    drawVideo()
     function drawVideo(){
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async function(blob){
            let data = new FormData();
            data.append('file', blob);
            try {
                await axios.post("/rest/api/userTh/" + roomid + "/" + _this.user.id, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                })
            }catch (e) {

            }
            setTimeout(drawVideo,5*1000)
        }, 'image/jpeg', 0.6);

    }
    _this.webCamStream=stream;

}
function createVideoContaiter(id, caption) {
    var video = document.createElement("video");

    video.autoplay = true;
    video.width = 320;
    //video.width = 1024;
    var videoBox = document.createElement("div");
    videoBox.classList.add("videoBox")
    videoBox.id = id;

    var videoBoxWr = document.createElement("div");
    videoBoxWr.classList.add("videoBoxWr")

    var videoCap = document.createElement("div");
    videoCap.classList.add("videoCap")

        videoCap.innerText = caption;// + "<img src='/images/close.svg'/>";

   // console.log(videoCap.innerHtml)
    videoBoxWr.appendChild(video);
    videoBoxWr.appendChild(videoCap);
    videoBox.appendChild(videoBoxWr);
    document.getElementById("videoWr").appendChild(videoBox);


    return     video
}
function  stopReceiveVideo(id){
    console.log("stopReceiveVideo", id, videoReceivers)
    videoReceivers=videoReceivers.filter(s=>{
        if(s.guid==id)
        {
            s.RTConn.close()
            s.RTConn=null;
            var elem=document.getElementById(s.guid);
            elem.parentNode.removeChild(elem)
            return false;
        }
        else
            return true;

    })
    if(videoReceivers.length==0)
        mainVideoMute(false)
    var elem=document.getElementById("VKS")
        if(elem && document.getElementsByClassName("roomScreen").length>0 && videoReceivers.length==0)
            elem.classList.remove('fromSpk')
    if(elem && document.getElementsByClassName("spkContaiter").length>0 && videoReceivers.length==0)
        document.getElementById("VKS").classList.add('hidden')
}
function stopSendVideo(id){
    console.log("stopSendVideo", id, videoSenders)
    videoSenders=videoSenders.filter(s=>{
        if(s.guid==id)
        {
            s.RTConn.close()
            s.RTConn=null;
            console.log("videoSender stopped")
            return false;

        }
        return true
    })

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
        _this.selfVideoStream = await navigator.mediaDevices.getUserMedia(/*constraints*/{video:true, audio:true});
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
async function createSender(video, stream, guid, clbk,){
    if(!guid)
    {
        var dt=await axios.get('/rest/api/guid');
        guid=dt.data;
    }
    var dt=await axios.get('/rest/api/guid');
    var RTConn= new RTCPeerConnection(RTPconfig);
    var ret={
        guid:guid,
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
            console.log("oniceconnectionstatechange", data.guid)
            stopReceiveVideo(data.guid);
            setReceiversHeight();
        }
    }
    RTConn.ontrack=(event)=>{
        //console.log("receiver have a track")
        if (video.srcObject !== event.streams[0]) {
            video.srcObject = event.streams[0];
            video.play();
        }
    }
    video.addEventListener("play", ()=>{
        socket.emit("receiverPlaying",{ guid:data.guid, parent:data.parent, to:data.from})
        mainVideoMute(true)
    })
    clbk(ret);
}
function mainVideoMute(val){

    var mainVideoElem=document.getElementById('video');
    if(mainVideoElem)
    {
        mainVideoElem.muted=val?true:false;
      //  mainVideoElem.style.opacity=val?0:1

        app.mainVideoMuted=mainVideoElem.muted;
    }

    var ytPl=document.getElementById('YT');
    if(ytPl){
        console.log("ytPl", ytPl.src)
        if(ytPl.src.indexOf("/blank")<0)
            ytPl.src='/blank'
        else
            ytPl.src='https://www.youtube.com/embed/f8SzXeXt9Qc?enablejsapi=1'

    }
}
async function  addSenderEvents(socket,videoSender, data, clbk){
    var RTConn=videoSender.RTConn;
    videoSender.stream.getTracks().forEach(track => RTConn.addTrack(track, videoSender.stream));
    RTConn.onicecandidate = (event) => {
        socket.emit("videoLink",{type:"icecandidate", to:data.from, candidate:event.candidate , guid:data.guid})
    }
    RTConn.oniceconnectionstatechange = (event) => {
        if(RTConn.iceConnectionState=="disconnected")
        {
            stopSendVideo(data.guid);

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

                })
                .catch(function (e) {
                    console.warn("sender candidate err", e)
                })
        var r=videoReceivers.filter(s=>{return s.guid==data.guid});
        if(r.length>0)
            r[0].RTConn.addIceCandidate(data.candidate)
                .then(function () {

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

        }
    }
    if(data.type="videoAnswer"){
        var r=videoSenders.filter(s=>{return s.guid==data.guid});

        if(r.length>0){
           // console.log("on videoAnswer is ", r, data);
            if(data.answ) {
                await r[0].RTConn.setRemoteDescription(data.answ);
             //   console.log("on videoAnswer is set", r, data);
            }
          /*   await r[0].RTConn.setLocalDescription(answ);

*/
        }
    }

}
function setReceiversHeight(){
    var count=1;
    if(videoReceivers.length>3)
        count+=1;
    if(videoReceivers.length>6)
        count+=1;
    if(videoReceivers.length>9)
        count+=1;
    if(videoReceivers.length>12)
        count+=1;

    //console.log("count height", count, videoReceivers.length,document.querySelectorAll(".videoBox").length );
    document.querySelectorAll(".videoBox").forEach(v=>{
        if(v.id!='selfVideo'){
            v.style.height="calc((100vh - 56px)/"+count+")"
        }
    })
}
function setRoomReceiversHeight()
{
    var count=1;
    if(videoReceivers.length>2)
        count+=1;
    if(videoReceivers.length>5)
        count+=1;
    if(videoReceivers.length>8)
        count+=1;
    if(videoReceivers.length>11)
        count+=1;

    //console.log("count height", count, videoReceivers.length,document.querySelectorAll(".videoBox").length );
    document.querySelectorAll(".videoBox").forEach(v=>{
       // if(v.id!='selfVideo'){
            v.style.height= 100/count +"%";// calc(100%  / "+count+")"
            console.log("height", 100/count +"%", v.style.height)
       // }
    })
}

