const serverUrl="wss://wowza02.onevent.online:8443";
var SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
var STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
var STREAM_STATUS_INFO = Flashphoner.constants.STREAM_STATUS_INFO;

function initFlashServer(errHandeler){
    return new Promise((resolve,reject)=>{
        if(Flashphoner.getSessions().length>0)
            resolve(session);
        Flashphoner.init({flashMediaProviderSwfLocation: '../../../../media-provider.swf'});
        Flashphoner.createSession({urlServer: serverUrl}).on(SESSION_STATUS.ESTABLISHED, function (session) {
            console.log("SESSION_STATUS.ESTABLISHED")
            resolve(session);
            // onConnected(session);
        }).on(SESSION_STATUS.DISCONNECTED, function () {
            // setStatus("#connectStatus", SESSION_STATUS.DISCONNECTED);
            console.log("SESSION_STATUS.DISCONNECTED")
            if(errHandeler)
                errHandeler()
            // onDisconnected();
        }).on(SESSION_STATUS.FAILED, function () {
            //  setStatus("#connectStatus", SESSION_STATUS.FAILED);
            console.log("SESSION_STATUS.FAILED")
            if(errHandeler)
                errHandeler()
            //  onDisconnected();
        });

    })
}
function publishStream(streamName, localVideo, stream,errHandeler) {
    var audio=true;
    var video = true;// {quality: 100};
    if(stream) {
        var tracks=stream.getTracks();
        audio = tracks.filter(t => t.kind == "audio").length > 0 ? true : false;
        video=tracks.filter(t => t.kind == "audio").length > 0 ? true/*{quality: 100}*/ : false;
    }

    var constraints={
        audio: audio,
        video: video,
    }
    if(stream)
        constraints.customStream=stream;
    console.log("constraints", constraints)

    return new Promise((resolve, reject) => {
        var session = Flashphoner.getSessions()[0];
        session.createStream({
            name: streamName,
            display: localVideo,
            cacheLocalResources: true,
            constraints: constraints,
            cvoExtension: true,
            stripCodecs: "h264,H264"
        }).on(STREAM_STATUS.PUBLISHING, function (stream) {
            resolve();
        }).on(STREAM_STATUS.UNPUBLISHED, function () {
            console.log("STREAM_STATUS.UNPUBLISHED")
            if(errHandeler)
                errHandeler()
        }).on(STREAM_STATUS.FAILED, function () {
            console.log("STREAM_STATUS.FAILED")
            if(errHandeler)
                errHandeler()
        }).publish();

    })
}
async function phonePublishLocalVideo(localVideo, id, stream, errHandeler){
    console.log("localVideo", localVideo)
    if(Flashphoner.getSessions().length==0)
        await initFlashServer(errHandeler);

    if (Browser.isSafariWebRTC()) {
        console.log("safary")
        await Flashphoner.playFirstVideo(localVideo, true, "https://wowza02.onevent.online:8444/client2/examples/demo/dependencies/media/preloader.mp4")
    }
    await publishStream(id,localVideo, stream,errHandeler);
}
async function  phoneGetRemoteVideo(remoteVideo,id, errHandeler) {
    if(Flashphoner.getSessions().length==0)
        await initFlashServer();
    var PlaySession = Flashphoner.getSessions()[0];
    PlaySession.createStream({
        name: id,
        display: remoteVideo,
        stripCodecs: "h264,H264"
    })
    .on(STREAM_STATUS.PENDING, function (stream) {
          //  var video = document.getElementById(stream.id());
    }).on(STREAM_STATUS.PLAYING, function (stream) {

    }).on(STREAM_STATUS.STOPPED, function () {
        if(errHandeler)
            errHandeler()
    }).on(STREAM_STATUS.FAILED, function (stream) {
        if(errHandeler)
            errHandeler()
    }).play();
}
