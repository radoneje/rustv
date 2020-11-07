


document.addEventListener('DOMContentLoaded', function () {
    var SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
    var STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
    var PRELOADER_URL = "../../dependencies/media/preloader.mp4";
    const serverUrl="wss://wowza02.onevent.online:8443";
    var remoteVideo;
    var conferenceStream;
    var publishStream;
    var currentVolumeValue = 50;
    var localDisplay;

    var login=Math.random()*1000;
    try {
        Flashphoner.init({
            flashMediaProviderSwfLocation: '../../../../media-provider.swf'
        });
    } catch (e) {
       console.warn("Your browser doesn't support Flash or WebRTC technology needed for this example");
        return;
    }
    console.log("innit ok")
    remoteVideo = document.getElementById("remoteVideo");
    localDisplay = document.getElementById("localVideo");
    start();
    
    function start() {
        if (Flashphoner.getSessions().length > 0) {
            var session = Flashphoner.getSessions()[0];
            if (session.getServerUrl() == url) {
                startStreaming(session);
                return;
            } else {
                //remove session DISCONNECTED and FAILED callbacks
                session.on(SESSION_STATUS.DISCONNECTED, function () {
                });
                session.on(SESSION_STATUS.FAILED, function () {
                });
                session.disconnect();
            }
        }
        Flashphoner.createSession({urlServer: serverUrl}).on(SESSION_STATUS.ESTABLISHED, function (session) {
            setStatus(session.status());
            //session connected, start playback
            startStreaming(session);
        }).on(SESSION_STATUS.DISCONNECTED, function () {
            setStatus(SESSION_STATUS.DISCONNECTED);
            onStopped();
        }).on(SESSION_STATUS.FAILED, function () {
            setStatus(SESSION_STATUS.FAILED);
            onStopped();
        });
    }
    function onStopped() {
        console.log("onStopped")
    }
    function setStatus(status, mess) {
        console.log("status", status, mess)
    }
    document.getElementById("startSecond").addEventListener("click", ()=>{
        startSecond();
    })
    function startSecond() {
        var session=Flashphoner.getSessions()[0];
        var c={
            "audio": true,
            "video": {
                width: 640,
                height: 360,
                aspectRatio:  1.7777777778
            }
        }

        var publishStream2 = session.createStream({
            name: Math.random()+"#123",
            display: localDisplay,
            receiveVideo: false,
            receiveAudio: false,
            constraints: c
        }).on(STREAM_STATUS.PUBLISHING, function (publishStream2) {
            //play preview
            console.log("stram2 is published")

        }).on(STREAM_STATUS.UNPUBLISHED, function () {
            onStopped();
        }).on(STREAM_STATUS.FAILED, function (stream) {
            setStatus(STREAM_STATUS.FAILED, "This login is already in use. Please change login");
            onStopped();
        });
        publishStream2.publish();
    }
    function startStreaming(session) {
        console.log("startStreaming", session)
        var roomName = "room1";

        var streamName = login + "#" + roomName;
        var c={
            "audio": true,
            "video": {
                width: 640,
                height: 360,
                aspectRatio:  1.7777777778
            }
        }
        publishStream = session.createStream({
            name: "streamName#123",
            display: localDisplay,
            receiveVideo: false,
            receiveAudio: false,
            constraints: c
        }).on(STREAM_STATUS.PUBLISHING, function (publishStream) {
            //play preview
            console.log("stram is published")
            playStream(session);
        }).on(STREAM_STATUS.UNPUBLISHED, function () {
            onStopped();
        }).on(STREAM_STATUS.FAILED, function (stream) {
            setStatus(STREAM_STATUS.FAILED, "This login is already in use. Please change login");
            onStopped();
        });
        publishStream.publish();

    }
    function playStream(session) {
       // return;
        console.log("playStream")
        var roomName = "room1";

       // var streamName = login + "#" + roomName;

        var streamName = "123-streamName123";//roomName + "-" + login + roomName;



        conferenceStream = session.createStream({
            name: streamName,
            display: remoteVideo,
            constraints: {audio:true, video:{width: 1280, height: 720,  aspectRatio:  1.7777777778}},
            flashShowFullScreenButton: true
        }).on(STREAM_STATUS.PENDING, function (stream) {
            var video = document.getElementById(stream.id());
            if (!video.hasListeners) {
                video.hasListeners = true;
                //don't resize html5 video
                if (video.nodeName.toLowerCase() !== "video") {
                    video.addEventListener('resize', function (event) {
                        resizeVideo(event.target);
                    });
                }
            }
        }).on(STREAM_STATUS.PLAYING, function (stream) {
            setStatus(stream.status());
            onStarted();

        }).on(STREAM_STATUS.STOPPED, function () {

            setStatus(STREAM_STATUS.STOPPED);
            onStopped();
        }).on(STREAM_STATUS.FAILED, function (stream) {
            setStatus(STREAM_STATUS.FAILED, stream.getInfo());
            onStopped();
        }).on(STREAM_STATUS.NOT_ENOUGH_BANDWIDTH, function (stream) {
            console.log("Not enough bandwidth, consider using lower video resolution or bitrate. Bandwidth " + (Math.round(stream.getNetworkBandwidth() / 1000)) + " bitrate " + (Math.round(stream.getRemoteBitrate() / 1000)));
        });
        conferenceStream.play();
    }
    function onStarted() {
        conferenceStream.setVolume(100);
    }



});




