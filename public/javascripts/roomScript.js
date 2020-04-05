window.onload=function () {
    var app = new Vue({
        el: '#app',
        data: {
            webCamStream:null,
            sect:[{title:"Вопросы", isActive:false, id:1}, {title:"Чат", isActive:true, id:2},{title:"Участники", isActive:false, id:3} ],
            activeSection:2,
            chat:[],
            users:[],
            q:[],
            qText:"",
            chatText:"",
            user:null,
            handUp:false,
            socket:null,
            hand:false,
            handTimer:null,
        },
        methods:{
            isWebRtc:function(){
                var isChrome = /chrome/.test(navigator.userAgent.toLowerCase()) && /google inc/.test(navigator.vendor.toLowerCase());
                var ya =/yabrowser/.test(navigator.userAgent.toLowerCase()) ;
                var safari =/safari/.test(navigator.userAgent.toLowerCase()) ;

                var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
                var isRTC=typeof(RTCPeerConnection)=="function"
                return  ((isChrome || ya || safari) && !isMobile && isRTC);
            },
            isEsc6:function () {
                try { eval('"use strict";const s=()=>{;;}; s();'); return true}
                catch (e)
                { //console.log(e);
                    return false
                }
            },
            startRTC:function () {
                var _this = this;
                if (typeof (initCam) == 'undefined') {
                    var s = document.createElement('script');
                    s.src = "/javascripts/rtcScript.js";
                    s.type = "text/javascript";
                    s.async = false;
                    s.onload = function () {
                        getStream(_this).then();
                    }// <-- this is important
                    document.getElementsByTagName('head')[0].appendChild(s);
                } else
                    getStream()(_this).then();
            },
            sectActive:function (item) {
                var _this=this;
                this.sect.forEach(function (e) {

                    e.isActive=(item.id==e.id);
                    if(e.isActive)
                        _this.activeSection=e.id
                    // return e;
                })
            },
            qtextChange:function (e) {
                var _this=this;
                if(this.qText.length>0)
                    qtextChange(_this,e)
                else
                    document.getElementById('qText').focus()

            },
            qtextSend:function (e) {
                var _this=this;
                if(this.qText.length>0)
                    qtextSend(_this)
                else
                    document.getElementById('qText').focus()


            },
            chattextSend(_this){
                if(this.chatText.length>0)
                    chattextSend(this) ;
                else
                    document.getElementById('chatText').focus()
            },
            chattextChange:function (e) {
                var _this=this;
                if(this.chatText.length>0)
                    chattextChange(_this, e);
                else
                    document.getElementById('chatText').focus()

            },
            chatAddSmile:function () {
                this.chatText+=" :) ";
                document.getElementById("chatText").focus();
            },
            onSenderReady:function (data) {
                var _this=this
              //  console.log("createReceiver", data, socket);
                var video=createVideoContaiter(data.guid, (data.user.i||"") +" "+ data.user.f)
                console.log("onSenderReady", data. parent)
                if(videoReceivers.length<4)
                    createReceiver(data, video, _this.socket, function (ret) {
                        ret.parent=data.parent;
                        videoReceivers.push(ret)
                        //console.log("data from spk", data.isSpk)
                        if(data.isSpk)
                            document.getElementById("VKS").classList.add('fromSpk')

                        _this.socket.emit("receiverReady",{user:_this.user, guid:data.guid, parent:data.parent, to:data.from})
                        setRoomReceiversHeight();
                    })
            },
            onVideoLink:function (data) {
                onVideoLink(this, data)
            },
            receiverPlaying:function (data) {
                var _this=this;
                        var video=document.getElementById('selfVideo');
                        if(!data.parent || videoSenders.filter(e=>{return e.parent==data.parent}).length==0)
                        createSender(video, _this.webCamStream, function (videoSender) {
                            videoSender.parent=data.parent;
                            videoSender.parentpairGUID=data.parentpairGUID;
                            videoSenders.push(videoSender)
                            _this.socket.emit("senderReady",{user:_this.user, guid:videoSender.guid, parent:data.parent, recguid:data.guid, to:data.from})
                        });
            },
            onReceiverReady:function (data) {
                console.log("onReceiverReady", data.parent)
                var _this=this;
                var videoSender=videoSenders.filter(s=>{return s.guid==data.guid})[0];
                addSenderEvents(_this.socket,videoSender, data, function () {
                })

            },
            OnhandUp:function () {
                var _this=this;
                clearTimeout(_this.handTimer);
                _this.hand=!_this.hand;
                if(_this.hand)
                    _this.handTimer=setTimeout(function () {
                        _this.hand=false;
                        axios.post('/rest/api/hand/'+eventid+"/"+roomid, {val:_this.hand, id:_this.user.id}).then()
                    },10*60*1000)
                axios.post('/rest/api/hand/'+eventid+"/"+roomid, {val:_this.hand, id:_this.user.id}).then()

            },
            onStartDirectConnect:function (data) {
                if(this.user.id==data.to.id) {
                    console.log("onStartDirectConnect", data);
                    var parent=data.guid;
                     var parentpairGUID= data.pairGUID
                    //data.toSocketid = кому посылаем команду

                    var _this=this;
                    var video=document.getElementById('selfVideo');
                    createSender(video, _this.webCamStream, function (videoSender) {
                        videoSender.parent=parent;
                        videoSender.parentpairGUID=parentpairGUID;
                        videoSenders.push(videoSender)
                        _this.socket.emit("senderReady",{user:_this.user, guid:videoSender.guid, parent:parent, parentpairGUID:parentpairGUID, to:data.toSocketid})
                    });

                }
            }

        },
        watch:{

        },
        mounted:async function () {
            var _this=this;
            axios.get('/rest/api/info/'+eventid+"/"+roomid)
                .then(function (dt) {
                    _this.user=dt.data;
                    connect(_this,roomid, function (socket) {
                        _this.socket=socket;
                    });
                    axios.get("/rest/api/users/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.users=r.data;
                         //   console.log(_this.users)
                        })
                    axios.get("/rest/api/quest/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.q=r.data;
                        })
                    axios.get("/rest/api/chat/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.chat=r.data;
                        })
                    document.getElementById("app").style.opacity=1;
                    startVideo();
                    _this.startRTC();
                })
        }
    })
}
function startVideo() {
    if (Hls.isSupported()) {

        var hls = new Hls();
        console.log("init HLS")
        hls.loadSource(video.src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log("MANIFEST_PARSED")
            var banner=document.querySelector(".videoPlayBannner");
            banner.style.display="flex";
            banner.onclick=function () {
                console.log("PLAY")
                video.play();
                banner.style.display="none";
            }
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        // try to recover network error
                        console.warn("fatal network error encountered, try to recover");
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.warn("fatal media error encountered, try to recover");
                        hls.recoverMediaError();
                        break;
                    default:
                        // cannot recover
                        hls.destroy();
                        break;
                }
            }
        });
    }
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        //video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
        video.addEventListener('loadedmetadata', function() {

            video.controls=true;
            banner.style.display="none";
            video.play();
        });
    }
}
