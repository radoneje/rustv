const serverUrl = "wss://wowza02.onevent.online:8443";
var SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
var STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
var STREAM_STATUS_INFO = Flashphoner.constants.STREAM_STATUS_INFO;

function initFlashServer(errHandeler) {
    return new Promise((resolve, reject) => {
        if (Flashphoner.getSessions().length > 0)
            resolve(session);
        Flashphoner.init({flashMediaProviderSwfLocation: '../../../../media-provider.swf'});
        Flashphoner.createSession({urlServer: serverUrl}).on(SESSION_STATUS.ESTABLISHED, function (session) {
            console.log("SESSION_STATUS.ESTABLISHED")
            resolve(session);
            // onConnected(session);
        }).on(SESSION_STATUS.DISCONNECTED, function () {
            // setStatus("#connectStatus", SESSION_STATUS.DISCONNECTED);
            console.log("SESSION_STATUS.DISCONNECTED")
            if (errHandeler)
                errHandeler()
            // onDisconnected();
        }).on(SESSION_STATUS.FAILED, function () {
            //  setStatus("#connectStatus", SESSION_STATUS.FAILED);
            console.log("SESSION_STATUS.FAILED")
            if (errHandeler)
                errHandeler()
            //  onDisconnected();
        });

    })
}

function stopAllStreams() {
    var sessions = Flashphoner.getSessions();
    sessions.forEach(session => {
        var streams = session.getStreams();
        streams.forEach(stream => {
            stream.stop();
        })
        session.disconnect()
    })

}

async function publishStream(streamName, localVideo, stream, errHandeler, failedHandler) {
    var audio = true;
    // var video = {width: {  ideal: 640, },aspectRatio: {ideal:1.777777778}}
    var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    // if(iOS)
    //     video=true;
    var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    // if(isAndroid)


    video = {
        width: 640,
        height: 360,//360,
        facingMode: 'user',
        quality: 90
    }

    try {
        try {
            var supportedConstraints = navigator.mediaDevices.getSupportedConstraints()
            for (let constraint in supportedConstraints) {
                if (supportedConstraints.hasOwnProperty(constraint)) {
                    if (constraint == "facingMode")
                        video.facingMode = 'user'
                    if (constraint == "quality")
                        video.quality = 90;
                    if (constraint == "aspectRatio")
                        video.aspectRatio = 1.7777777778
                }
            }
            console.log(video)

        } catch (e) {

        }

        await navigator.mediaDevices.getUserMedia({audio: true, video})
    } catch (e) {
        console.warn("errorin usermedia", video)
        video = {
            width: {ideal: 360},
            facingMode: 'user'
        };
    }

    /* video= {
         width:{ideal:360},
         facingMode:'user'
     };*/
    // {width: {ideal: 640},quality: 100};


    /*   var dev=await navigator.mediaDevices.enumerateDevices()
       console.log("dev  ", dev)
       var fDev=null;
       dev.forEach(function(device) {
           console.log("dev find ", fDev)
           if(device.label=="vMix Video")
           {
               fDev=device;
           }

       })
       video={ deviceId:  fDev.deviceId, width: 1280, height: 720,  aspectRatio:  1.7777777778}
       console.log("dev find ", fDev)*/


    if (typeof (vDevice) == "undefined")
        vDevice = null;
    if (typeof (aDevice) == "undefined")
        aDevice = null
    if (typeof (vDevice) != 'undefined' && vDevice && vDevice.length > 0)
        video = {deviceId: vDevice, width: 1280, height: 720, aspectRatio: 1.7777777778}
    else
    // video={  width: 1280, height: 720,  aspectRatio:  1.7777777778}
        video = {width: 1280, height: 720, aspectRatio: 1.7777777778}


    if (typeof (aDevice) != 'undefined' && aDevice && aDevice.length > 0)
        audio = {deviceId: aDevice}
    else
        audio = true

    console.log("dev find ", vDevice, video)

    //video={  width: 1280, height: 720,  aspectRatio:  1.7777777778}


    //console.log("dev find ", vDevice, video)
    /*{
       // width: {ideal: 640},
       // height: {ideal: parseInt(640/1.7777777778)},
        aspectRatio:  1.7777777778,
        quality: 100
    }*/
    if (stream) {
        var tracks = stream.getTracks();
        audio = tracks.filter(t => t.kind == "audio").length > 0 ? true : false;
        video = tracks.filter(t => t.kind == "audio").length > 0 ? {width: 720} : false;
        // console.log("tracks",tracks )
        // audio:false;
        // video:true;
    }

    var constraints = {
        audio: audio,
        video: video,
    }
    console.log("constraints", constraints);
    if (stream) {
        constraints.customStream = stream;

        //if(stream.getTracks().filter(s=>s.kind=='video').length==0)
        //   constraints.video=false;
    }
    console.log("constraints", constraints)

    return new Promise((resolve, reject) => {
        var session = Flashphoner.getSessions()[0];
        session.createStream({
            name: streamName,
            display: localVideo,
            cacheLocalResources: true,
            constraints: constraints,
            cvoExtension: true,
            // stripCodecs: "h264,H264,opus,vorbis,Opus,Vorbis"
            stripCodecs: "h264,H264"
        }).on(STREAM_STATUS.PUBLISHING, function (stream) {
            // alert(1)
            var video = localVideo.querySelector('video')
            if (video) {
                try {
                    //video.controls="controls"
                    video.classList.add("mirrored")
                    console.log("video.style.transform")
                    setTimeout(() => {
                        video.play();
                    }, 500)

                } catch (e) {
                    console.warn("cant play video");
                }
            } else console.warn('noVideo')

            resolve();
        }).on(STREAM_STATUS.UNPUBLISHED, function () {

            if (errHandeler)
                errHandeler()
        }).on(STREAM_STATUS.FAILED, function () {
            //console.log("STREAM_STATUS.FAILED")
            //alert("STREAM_STATUS.FAILED")
            if (failedHandler)
                failedHandler()
            if (errHandeler)
                errHandeler()
            reject();
        }).publish();

    })
}

async function phonePublishLocalVideo(localVideo, id, stream, errHandeler, failedHandler) {
    console.log("localVideo", Flashphoner.getSessions().length, localVideo)
    if (Flashphoner.getSessions().length == 0)
        await initFlashServer(errHandeler);
    console.log("initFlashServer ok")
    if (Browser.isSafariWebRTC()) {
        console.log("safary")

        // await Flashphoner.playFirstVideo(localVideo, true, "https://wowza02.onevent.online:8444/client2/examples/demo/dependencies/media/preloader.mp4")

    }
    await publishStream(id, localVideo, stream, () => {
        if (errHandeler) errHandeler()
    }, () => {
        if (failedHandler) failedHandler()
    });

}

function phoneStopRemoteVideo(id) {

    if (Flashphoner.getSessions().length == 0)
        return res(false);
    var PlaySession = Flashphoner.getSessions()[0];
    var streams = PlaySession.getStreams();
    var find = false;
    streams.forEach(stream => {
        console.log("searf stream", stream.name(), id);
        if (stream.name() == id) {
            stream.stop();
            return;
        }
    })

}

async function phoneGetRemoteVideo(remoteVideo, id, errHandeler) {
    console.log("remotevideo", id)
    return new Promise(async (res, rej) => {
        if (Flashphoner.getSessions().length == 0)
            await initFlashServer();
        setTimeout(() => {
            var PlaySession = Flashphoner.getSessions()[0];
            PlaySession.createStream({
                name: id,
                display: remoteVideo,
                //   stripCodecs: "h264,H264,opus,vorbis,Opus,Vorbis"
                stripCodecs: "h264,H264"
            })
                .on(STREAM_STATUS.PENDING, function (stream) {
                    //  var video = document.getElementById(stream.id());
                    res(stream.id());
                    //   alert(11)
                }).on(STREAM_STATUS.PLAYING, function (stream) {
                var video = remoteVideo.querySelector('video')
                console.log("stream.videoResolution();", stream.videoResolution())
                //alert(video)
                //   alert(22)
                if (video) {
                    try {
                        video.playsinline = "playsinline";
                        video.setAttribute("playsinline", "playsinline");
                        //  video.controls="controls"
                        setTimeout(() => {
                            video.play();
                        }, 1000)

                    } catch (e) {
                        // alert("cant play video"+e);
                        console.warn(e)
                    }
                } else console.warn('noVideo')
            }).on(STREAM_STATUS.STOPPED, function () {
                //   alert(33)
                if (errHandeler)
                    errHandeler()
            }).on(STREAM_STATUS.FAILED, function (stream) {
                //  alert("remotevideo ee2"+id)
                if (errHandeler)
                    errHandeler()
            }).play();
        }, 1000)
    })
}

function videoLayout() {
    try {
        var margin = 5
        var top = 15;
        var beetwen = 10;


        var trBox = document.getElementById("meetVideoBox");
        trBox.style.position = "relative";
        var fullW = trBox.offsetWidth;//clientWidth - 0;

        if (window.innerWidth < 977) {
            var margin = 0
            var top = 5;
            var beetwen = 0;
            fullW = window.innerWidth > window.screen.width ? window.screen.width : window.innerWidth;

        }
        var pgm = arrVideo.filter(e => e.pgm == true)
        if (pgm.length > 0 && isPgm) {
            var pip = arrVideo.filter(e => e.pip == true && !e.pgm)
            var p1 = arrVideo.filter(e => e.p1 == true && !e.pgm)

            console.log("windoww", pip, p1);

            arrVideo = arrVideo.filter(a => {
                var elem = document.getElementById("meetVideoItem_" + a.id);
                if (!elem)
                    return false;
                else
                    return true;
            })
            arrVideo.forEach(a => {
                var elem = document.getElementById("meetVideoItem_" + a.id);
                elem.style.zIndex = 10;
                elem.style.display = "none";
            })

            var elem = document.getElementById("meetVideoItem_" + pgm[0].id);
            elem.style.display = "block";
            elem.style.position = "fixed";
            //elem.style.top = pip.length > 0 ? ("12.5vh") : ("0");
            elem.style.top = pip.length > 0 ? ("12.5vh") : ("0");
            elem.style.left = pip.length > 0 ? ("0%") : ("0");
            ;//'-5%';
            elem.style.width = pip.length > 0 ? ("50%") : ("100%");
            if (p1.length > 0) {
                elem.style.top = ("12.5vh");
                elem.style.left = ("0");
                elem.style.width = ("75%");
            }
            //elem.style.width = pip.length > 0 ? ("75%") : ("100%");

            elem.style.zIndex = 100;
            elem.style.display = "block";

            if (p1.length > 0) {
                var elem = document.getElementById("meetVideoItem_" + p1[0].id);
                elem.style.position = "fixed";
                elem.style.top = "62.5vh";
                elem.style.left = "75%";
                elem.style.width = ("25%");
                //elem.style.top = "12.5vh";
                //elem.style.left = "45%";
                //elem.style.width = ("60%");
                elem.style.zIndex = 200;
                elem.style.display = "block";
            } else if (pip.length > 0) {
                var elem = document.getElementById("meetVideoItem_" + pip[0].id);
                elem.style.position = "fixed";
                //   elem.style.top = "50vh";
                //   elem.style.left = "75%";
                //   elem.style.width = ("25%");
                elem.style.top = "12.5vh";
                elem.style.left = "50%";
                elem.style.width = ("50%");
                elem.style.zIndex = 200;
                elem.style.display = "block";
            }
            return;
        }

        arrVideo.forEach(a => {
            var elem = document.getElementById("meetVideoItem_" + a.id);
            elem.style.zIndex = 10;
            elem.style.display = "block";
        })
        if (arrVideo.length == 1) {
            setVideoLayout(arrVideo[0].id, 0, 0, fullW)
            trBox.style.height = ((fullW / 1.777) + 20) + 10 + "px"
        }
        if (arrVideo.length == 2) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 - margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .5 + margin, fullW * .5 - margin)
            trBox.style.height = ((fullW / 1.777) + 40) + 10 + "px"
        }
        if (arrVideo.length == 3) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 - margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .5 + margin, fullW * .5 - margin)
            setVideoLayout(arrVideo[2].id, 15 + (fullW * .5 + 10) / 1.777 + margin, fullW * .25 + margin, fullW * .5 - margin)
            trBox.style.height = (((fullW * .5 + beetwen) / 1.777) + beetwen * 2) * 2 + 10 + "px"
        }
        if (arrVideo.length == 4) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 - margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .5 + margin, fullW * .5 - margin)
            setVideoLayout(arrVideo[2].id, 15 + (fullW * .5 + margin) / 1.777 + margin, 0, fullW * .5 - margin)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .5 + margin) / 1.777 + margin, fullW * .5 + margin, fullW * .5 - margin)
            trBox.style.height = (((fullW * .5 + beetwen) / 1.777) + beetwen * 2) * 2 + 10 + "px"
        }
        if (arrVideo.length == 5) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 + margin, fullW * .3 - margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + margin, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + margin, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            trBox.style.height = (((fullW * .3 + beetwen) / 1.777) + beetwen * 2) * 3 + 10 + "px"
        }
        if (arrVideo.length == 6) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 + margin, fullW * .3 - margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + margin, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + margin, (fullW * .3 + margin) * 1, fullW * .3 - margin)
            setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 + margin, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            trBox.style.height = (((fullW * .3 + beetwen) / 1.777) + beetwen * 2) * 3 + 10 + "px"
        }
        if (arrVideo.length == 7) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 + margin, fullW * .3 - margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + margin, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + margin, (fullW * .3 + margin) * 1, fullW * .3 - margin)
            setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 + margin, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, 0, fullW * .3 - margin)
            trBox.style.height = (((fullW * .3 + beetwen) / 1.777) + beetwen * 2) * 3 + 10 + "px"
        }
        if (arrVideo.length == 8) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 + margin, fullW * .3 - margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + margin) * 2, fullW * .3 - 10)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + margin, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + margin, (fullW * .3 + margin) * 1, fullW * .3 - margin)
            setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 + margin, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .3 + margin) * 1, fullW * .3 - margin)
            trBox.style.height = (((fullW * .3 + beetwen) / 1.777) + beetwen * 2) * 3 + 10 + "px"
        }
        if (arrVideo.length == 9) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 + margin, fullW * .3 - margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + margin, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + margin, (fullW * .3 + margin) * 1, fullW * .3 - margin)
            setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 + margin, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, 0, fullW * .3 - margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .3 + margin) * 1, fullW * .3 - margin)
            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .3 + margin) * 2, fullW * .3 - margin)
            trBox.style.height = (((fullW * .3 + beetwen) / 1.777) + beetwen * 2) * 3 + 10 + "px"
        }
        if (arrVideo.length == 10) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 1, fullW * .25 - margin)

            trBox.style.height = (((fullW * .25 + beetwen) / 1.777) + beetwen * 2) * 4 + 10 + "px"
        }
        if (arrVideo.length == 11) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 2, fullW * .25 - margin)

            trBox.style.height = (((fullW * .25 + beetwen) / 1.777) + beetwen * 2) * 4 + 10 + "px"
        }
        if (arrVideo.length == 12) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            trBox.style.height = (((fullW * .25 + beetwen) / 1.777) + beetwen * 2) * 4 + 10 + "px"
        }
        if (arrVideo.length == 13) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 0, fullW * .25 - margin)

            trBox.style.height = (((fullW * .25 + beetwen) / 1.777) + beetwen * 2) * 4 + 10 + "px"
        }
        if (arrVideo.length == 14) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 1, fullW * .25 - margin)

            trBox.style.height = (((fullW * .25 + beetwen) / 1.777) + beetwen * 2) * 4 + 10 + "px"
        }
        if (arrVideo.length == 15) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[14].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            trBox.style.height = (((fullW * .25 + beetwen) / 1.777) + beetwen * 2) * 4 + 10 + "px"
        }
        if (arrVideo.length == 16) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 0, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 1, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 2, (fullW * .25 + margin) * 3, fullW * .25 - margin)

            setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 0, fullW * .25 - margin)
            setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 1, fullW * .25 - margin)
            setVideoLayout(arrVideo[14].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 2, fullW * .25 - margin)
            setVideoLayout(arrVideo[15].id, 15 + ((fullW * .3 + 10) / 1.777 + margin) * 3, (fullW * .25 + margin) * 3, fullW * .25 - margin)
            trBox.style.height = (((fullW * .25 + beetwen) / 1.777) + beetwen * 2) * 4 + 10 + "px"
        }

        arrVideo.forEach(e => {

        })
    } catch (e) {
        console.warn(e)
    }

}

function setVideoLayout(id, top, left, width) {

    var elem = document.getElementById("meetVideoItem_" + id);

    elem.style.position = "absolute";
    elem.style.top = top + "px";
    elem.style.left = (left) + "px";
    elem.style.width = width + "px";
}

function removeVideo(id) {
    console.log("removeVideo", id)
    var elem = document.getElementById('meetVideoItem_' + id);
    if (elem)
        elem.parentNode.removeChild(elem)
}
