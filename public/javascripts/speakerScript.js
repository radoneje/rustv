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
            selfVideoStream:null,
            socket,
            socketConnection:false,
            SPKanotherConnectError:false,
            SPKstatus:1,
            SPKalert:false,
            SPKalertText:"",
            SPKalertTimeout:null
        },
        methods:{
            onHandUp:function(data){
                this.users.forEach(u=>{
                    if(u.id==data.id) {
                        u.handUp = data.hand
                    }
                })
                this.users=this.users.filter(r=>{return true})
            },
            showLocalVideo:function () {
                if(this.socketConnection && this.selfVideoStream){
                    var elem=document.getElementById("selfVideo")
                    elem.style.zIndex="100";
                    elem.style.opacity="1"
                }
            },
            setSpkStatus:function (data) {

                this.SPKstatus=data;
            },
            setSpkAlert:function (data) {
                console.warn("setSpkAlert",data )

                this.SPKalert=data.SPKalert;
                this.SPKalertText=data.SPKalertText;
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
            deleteQ:function (item) {
                var _this=this;
                if(confirm('Вы хотите удалть сообщение')){
                    axios.delete("/rest/api/qdelete/"+item.id+"/"+eventid+"/"+roomid)
                        .then(function (r) {

                        })

                }
            },
            QsetOld:function (item) {
                axios.post("/rest/api/qsetStatus/"+eventid+"/"+roomid,{id:item.id, status:true})
                    .then(function (r) {

                    })
            },
            QsetNew:function (item) {
                axios.post("/rest/api/qsetStatus/"+eventid+"/"+roomid,{id:item.id, status:false})
                    .then(function (r) {

                    })
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
            deleteChat:function (item) {
                var _this=this;
                if(confirm('Вы хотите удалть сообщение')){
                    axios.delete("/rest/api/chatdelete/"+item.id+"/"+eventid+"/"+roomid)
                        .then(function (r) {

                        })

                }
            },
            spkStartVks:function(data){
                console.log("spkStartVksspkStartVks")
               var item=null;
               var _this=this;
               var items=this.users.filter(u=>u.id==data.user.id)
                if(items.length>0) {
                    _this.stopVKS();
                    setTimeout(()=>{
                        _this.startVideoChat(items[0]);
                    },500)

                }
            },
            startVideoChat:async function(item){
                var _this=this;

                var avatar=document.getElementById('videoAvatar'+item.id);
                if(avatar) {
                    if (avatar.classList.contains("clicked"))
                        return;

                    avatar.classList.add("clicked")
                    setTimeout(function () {
                        avatar.classList.remove("clicked")
                    }, 500)
                }
                if (typeof (createVideoContaiter) == 'undefined') {
                    var s = document.createElement('script');
                    s.src = "/javascripts/rtcScript.js";
                    s.type = "text/javascript";
                    s.async = false;
                    s.onload = function () {
                        modGetStream(_this,function(video, stream){ _this.onMyVideoStarted(video, stream,item)});
                    }// <-- this is important
                    document.getElementsByTagName('head')[0].appendChild(s);
                } else {
                    videoReceivers.forEach(function (r) {
                        console.log(item);
                        stopReceiveVideo(r.guid);
                        stopSendVideo(r.pairGUID);
                        _this.socket.emit("stopSendVideo",{user:_this.user, guid:r.recguid, to:item.socketid})
                    });
                    modGetStream(_this, function (video, stream) {
                        _this.onMyVideoStarted(video, stream, item)
                    });
                }



            },
            onMyVideoStarted: function (video, stream, item) {
                var _this=this;
                createSender(video, stream, function (videoSender) {
                    videoSenders.push(videoSender)
                    _this.socket.emit("senderReady",{user:_this.user, guid:videoSender.guid, to:item.socketid, isSpk:true})

                    // addSenderEvents(_this.socket,item.socketid, videoSender);
                });
                /*var remoteVideo=document.createElement("video")
                remoteVideo.controls=true;
                remoteVideo.width="240"
                remoteVideo.autoplay=true;
                document.getElementById('videoWr_'+item.id).appendChild(remoteVideo);*/

            },
            onReceiverReady:function (data) {
                var _this=this;
                var videoSender=videoSenders.filter(s=>{return s.guid==data.guid})[0];

                addSenderEvents(_this.socket,videoSender, data, function () {
                    console.log("invite Send")
                })

            },
            onSenderReady:function (data) {
                var _this=this
                console.log("createReceiver", data, socket);
                var video=createVideoContaiter(data.guid, (data.user.i||"") +" "+ data.user.f)
                createReceiver(data, video, _this.socket, function (ret) {
                    ret.pairGUID=data.recguid
                    ret.user=data.user;
                    videoReceivers.push(ret)
                    _this.socket.emit("receiverReady",{user:_this.user, guid:data.guid, to:data.from})
                    _this.SPKstatus=6;
                })


                var videoBox=document.getElementById(data.guid)
                var videoCap=videoBox.querySelector(".videoCap")
                videoCap.innerHTML = "<img src='/images/close.svg'/>" + videoCap.innerHTML;
                {
                    videoCap.querySelector("img").addEventListener("click", ()=>{
                        console.log("stopReceiveVideo", data.guid, data.recguid )
                        stopReceiveVideo(data.guid);
                        stopSendVideo(data.recguid);
                        _this.socket.emit("stopSendVideo",{user:_this.user, guid:data.recguid, to:data.from})
                        _this.SPKstatus=1;
                    })
                }

            },
            onVideoLink:function (data) {

                onVideoLink(this, data)

            },
            stopVKS:function () {
                var elem=document.querySelector(".spkContaiter .videoBox:not(#selfVideo) .videoCap img")
                if(elem)
                    elem.click();
            }

        },
        watch:{
            SPKalert:function () {
               var _this=this;
                if(this.SPKalert) {
                    _this.SPKalertTimeout = setTimeout(() => {
                        _this.SPKalert = false
                    }, 10 * 1000);
                }
                else
                    clearTimeout(_this.SPKalertTimeout);
            },
            SPKstatus:function () {
                if(this.SPKstatus!=6 && videoReceivers.length>0 ){
                    this.stopVKS();
                }
            }
        },
        mounted:async function () {
            var _this=this;
            axios.get('/rest/api/infospk/'+eventid+"/"+roomid)
                .then(function (dt) {
                    _this.user=dt.data;
                    var isSocketConnected=false;
                    connect(_this,roomid, function (socket) {
                        _this.socket = socket;
                        if (!isSocketConnected)
                        {
                            isSocketConnected = true;
                        _this.socket.on("disconnect", () => {
                            _this.socketConnection = false;
                        })
                        _this.socket.on("connect", () => {
                            _this.socketConnection = true;
                        })
                        _this.socket.on("SPKanotherConnectError", () => {

                            _this.SPKanotherConnectError = true;
                        })
                        setTimeout(() => {
                            console.warn("continue")
                            document.getElementById("app").style.opacity = 1;
                            if (!_this.SPKanotherConnectError) {
                                modGetStream(_this, function (video, stream) {
                                    video.width = 320;
                                    video.style.width = "320px"
                                    var elem = document.getElementById("selfVideo")

                                    elem.addEventListener("click", () => {
                                        elem.style.zIndex = "-1";
                                        elem.style.opacity = "0"
                                    })
                                    /*_this.onMyVideoStarted(video, stream,item)*/
                                });

                                axios.get("/rest/api/users/" + eventid + "/" + roomid)
                                    .then(function (r) {
                                         _this.users = r.data;
                                    })
                                axios.get("/rest/api/quest/" + eventid + "/" + roomid)
                                    .then(function (r) {
                                        _this.q = r.data;
                                    })
                                axios.get("/rest/api/chat/" + eventid + "/" + roomid)
                                    .then(function (r) {
                                        _this.chat = r.data;
                                    })
                                _this.socketConnection = true;

                                setInterval(() => {
                                      _this.socket.emit("SPKstatus",{SPKstatus: _this.SPKstatus, SPKalert:_this.SPKalert})
                                }, 1000)
                            }

                        }, 1000);
                    }
                    })


                })
        }
    });
}