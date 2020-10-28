var stream;
var sourceVideo=document.getElementById("sourceVideo") ;;
var remoteVideo;
var videoId=(new Date()).toISOString()

const checkStep2=async (_this)=>{
    if(! await checkVideo(_this))
        return;
    if(!await checkVideoPlayer(_this))
        return;
    var script = document.createElement("script");
    script.type = "text/javascript";
   // script.src = '/javascripts/phoner.js';
    script.src = '/lib/flashUtils.js';
    script.onload = async function(){
        var script2 = document.createElement("script");
        script2.type = "text/javascript";
        script2.src = '/lib/flashphoner.js';
        script2.onload = async function(){
            var script3 = document.createElement("script");
            script3.type = "text/javascript";
            script3.src = '/javascripts/phoner.js';

            script3.onload = async function(){
                await checkStep3(_this);
            }
            document.body.appendChild(script3);
        }
        document.body.appendChild(script2);
    };
    document.body.appendChild(script);

}
const checkStep3=async (_this)=>{
    if(!await checkConnectToServer(_this))
        return;
    if(!await checkSendToServer(_this))
        return;
    if(!await checkGetFromServer(_this))
        return;
}
const checkVideo=async (_this)=>{
    var itemWebCam={title:"Webcam and mic", status:0,error:false, descr:""}
    _this.results.push(itemWebCam);
    try {
        stream = await navigator.mediaDevices.getUserMedia({video: {width:640,height:360}, audio: true})
        console.log(stream)
        itemWebCam.status = 1;
        //_this.isSucсess = true;
        _this.isShowVideo=true;
        return true
    }
    catch (e) {
        itemWebCam.status = 1;
        itemWebCam.error = true;
        itemWebCam.descr = e;
        _this.isError = true;
        return false
    }
}
const checkVideoPlayer=async (_this)=>{
    sourceVideo=document.getElementById("sourceVideo") ;
    remoteVideo=document.getElementById("remoteVideo") ;
    sourceVideo.srcObject=stream;
    console.log(sourceVideo,stream);
    sourceVideo.play();
    return true;
}
const checkConnectToServer=async (_this)=>{

    let ret= new Promise(async (resolve, reject)=>{
        await initFlashServer(()=>{reject()})

        resolve();
    });
    try {
        var itemWebCam={title:"Connect to media server", status:0,error:false, descr:""}
        _this.results.push(itemWebCam);
        await ret;
       // await ret()
        itemWebCam.status = 1;
        _this.isSucсess = true;
        return  true;
    }
    catch (e) {
        console.warn(e);
        itemWebCam.status = 1;
        itemWebCam.error = true;
        itemWebCam.descr = e;
        _this.isError = true;
        return false;
    }

}
const checkSendToServer=async (_this)=>{
    let ret= new Promise(async (resolve, reject)=> {
        stream=null;
        var videoWr = sourceVideo.parentNode;
        videoWr.removeChild(sourceVideo);
        await phonePublishLocalVideo(videoWr, videoId, stream, () => {
            console.log("error")
            reject();
        }, () => {
            console.log('faliled')
            reject();
        })
        resolve();
    })

    try {
        var itemWebCam={title:"Send video to media server", status:0,error:false, descr:""}
        _this.results.push(itemWebCam);
        await ret;
        // await ret()
        itemWebCam.status = 1;
        _this.isSucсess = true;
        return  true;
    }
    catch (e) {
        console.warn(e);
        itemWebCam.status = 1;
        itemWebCam.error = true;
        itemWebCam.descr = e;
        _this.isError = true;
        return false;
    }

}
const checkGetFromServer=async (_this)=>{

    let ret= new Promise(async (resolve, reject)=> {
        stream=null;
        var videoWr = remoteVideo.parentNode;
        videoWr.removeChild(remoteVideo);
        await phoneGetRemoteVideo(videoWr, videoId,  () => {
            console.log("error")
            reject();
        })
        videoWr.querySelector('video').muted=true;
        resolve();
    })
    try {
        var itemWebCam={title:"Get video from media server", status:0,error:false, descr:""}
        _this.results.push(itemWebCam);
        await ret;
        // await ret()
        itemWebCam.status = 1;
        _this.isSucсess = true;
        return  true;
    }
    catch (e) {
        console.warn(e);
        itemWebCam.status = 1;
        itemWebCam.error = true;
        itemWebCam.descr = e;
        _this.isError = true;
        return false;
    }
}

