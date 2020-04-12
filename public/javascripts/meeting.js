window.onload= ()=> {
    var server = "https://rtcroom.may24.pro/rest/janus";
    //var server = "ws://rtcroom.may24.pro/janus";

    var janus = null;
    var sfutest = null;
    var opaqueId = "videoroomtest-"+Janus.randomString(12);

    var app=new Vue({
        el:"#app",
        data:{
            noWebrtc:false,
            janus:null,
            handler:null,
            janusRoomId:null,
            janusPrivateId:null,
            opaqueId:"videoroomtest-" + Janus.randomString(12),
            videos:[]
        },
        methods:{},

        mounted:function () {
            var _this=this;
            console.log("VUE IS WORK!")
            Janus.init({debug: "all", callback: function() {
                    if(!Janus.isWebrtcSupported()) {
                        noWebrtc:true;
                        return;
                    }
                    _this.janus = new Janus({
                            server:server,
                        success: ()=>{ onJanusCreate(_this)},
                        error: (error) =>{console.warn("error", error)},
                        destroyed: ()=> {window.location.reload();}
                        }
                    );

                }});
            document.getElementById("app").style.opacity=1;
        }
    })

}
function onJanusCreate(_this){
    _this.janus.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: _this.opaqueId,
            success:(pluginHandle)=>{JanusCreated(pluginHandle, _this)},
            error:(error)=>{console.warn("error", error)},
            consentDialog:(on)=>{console.log("consentDialog")},
            mediaState:(medium, on)=>{console.log("mediaState")},
            webrtcState:(on)=>{console.log("webrtcState", on)},
            onmessage:(msg, jsep)=>{messageHandler(msg, jsep, _this);},
            onlocalstream:(stream)=>{onLocalStream(stream, _this);},
            onremotestream:(stream)=>{console.log("onremotestream")},
            oncleanup:()=>{console.warn("oncleanup")}
        }

    )
}
function messageHandler(msg, jsep, _this) {
    console.log("onmessage", msg, jsep)
    if(msg.error_code==426)
        createRoom(_this);
    if(msg.videoroom != undefined && msg.videoroom != null)
    {
        if(msg.videoroom === "joined")
            publishMyVideo(msg,_this )
        if(jsep !== undefined && jsep !== null) {
            console.log("ansver is received", jsep)
            _this.handler.handleRemoteJsep({jsep: jsep});
        }
    }
    if(msg.publishers){
        msg.publishers.forEach(p=>{
            addRemoteVideo(p, _this)
        })
    }
}
function JanusCreated(pluginHandle, _this) {
    console.log("JanusCreated");
    _this.handler=pluginHandle;
    joinRoom(_this)
}
function joinRoom(_this) {
    var prm = { "request": "join", "room": meetRoomid, "ptype": "publisher", "display": user.i+" " +user.f };
    _this.handler.send({"message": prm});
}
function createRoom(_this) {
    var prm={
        "request": "create",
        "room":meetRoomid,
        "permanent" :false,
        "description" : "onEvent meet room",
        //"secret" : "<password required to edit/destroy the room, optional>",
        //"pin" : "<password required to join the room, optional>",
        "is_private" : false,
        //"allowed" : [ array of string tokens users can use to join this room, optional],
        "fir_freq":5,
        videoorient_ext:true,
        bitrate:512000
    }
    _this.handler.send({"message": prm});
    console.log("room create");
    setTimeout(()=>{joinRoom(_this)}, 1000);
}
function publishMyVideo(msg,_this) {
    console.log("publishMyVideo")
    _this.janusRoomId=msg.id;
     _this.janusPrivateId=msg.private_id;
    _this.handler.createOffer(
        {
            media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },	// Publishers are sendonly
            doSimulcast: false,
            success: (jsep)=> {
                console.warn("createOffer Scc")
                console.log("Got publisher SDP!");
                var dt = { "request": "configure", "audio": true, "video": true };
                _this.handler.send({"message": dt, "jsep": jsep});
                _this.handler.send({"message": { "request": "configure", "bitrate": 512000 }});

            },
            error: (error) =>{console.warn("createOffer", error)}
        });
}
function onLocalStream(stream, _this) {
    var id=Janus.randomString(12)
    _this.videos.push({isMyVideo:true, id:id, name: user.i+" "+ user.f, handler:_this.handler})
    setTimeout(()=>{
        Janus.attachMediaStream( document.getElementById(id), stream);
    }, 0)
    console.log("onlocalstream")
}
function addRemoteVideo(item, _this) {
   // _this.videos.push({isMyVideo:false, id:item.id, name:item.display, audio:item.audio_codec, video:item.video_codec })
    var remoteFeed = null;
    _this.janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: _this.opaqueId,
        success:(pluginHandle)=>{
            console.warn("!! client success !!! ", item )
            remoteFeed = pluginHandle;
            remoteFeed.simulcastStarted = false;
            var subscribe = { "request": "join", "room": meetRoomid, "ptype": "subscriber", "feed": item.id, "private_id": _this.janusPrivateId };

            if(Janus.webRTCAdapter.browserDetails.browser === "safari" &&
                (item.video_codec === "vp9" || (item.video_codec === "vp8" && !Janus.safariVp8))) {
                if(item.video_codec)
                    item.video_codec = item.video_codec.toUpperCase()
                subscribe["offer_video"] = false;
            }
            remoteFeed.videoCodec = item.video_codec;
            console.log("subscribe", subscribe)
            remoteFeed.send({"message": subscribe});
            /*var id = list[f]["id"];
                                                        var display = list[f]["display"];
                                                        var audio = list[f]["audio_codec"];
                                                        var video = list[f]["video_codec"];*/
        },
        error:(error)=>{console.warn("client error", error)},
        consentDialog:(on)=>{console.log("client consentDialog")},
        mediaState:(medium, on)=>{console.log("client mediaState")},
        webrtcState:(on)=>{console.log("client webrtcState", on)},
        onmessage:(msg, jsep)=>{
            if(msg.videoroom=="attached"){
                _this.videos.push({isMyVideo:false, id:msg.id, name:msg.display, audio:item.audio_codec, video:item.video_codec, handler:remoteFeed })
            }
            if(jsep)
            {
                remoteFeed.createAnswer(
                    {
                        jsep: jsep,
                        // Add data:true here if you want to subscribe to datachannels as well
                        // (obviously only works if the publisher offered them in the first place)
                        media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                        success: function(jsep) {
                            var body = { "request": "start", "room": meetRoomid };
                            remoteFeed.send({"message": body, "jsep": jsep});
                        },
                        error: function(error) {
                            console.warn("WebRTC error:", error);
                        }
                    });
            }


        },
        onlocalstream:(stream)=>{console.log("client onremotestream")},
        onremotestream:(stream)=>{

            Janus.attachMediaStream(document.getElementById(item.id), stream);
            setInterval(()=>{
                document.getElementById('bitrate').innerHTML=remoteFeed.getBitrate();
            }, 500)
        },
        oncleanup:()=>{console.warn("client oncleanup");
            _this.videos=_this.videos.filter(r=>r.id!=item.id)
        }

    });
}


