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
        },
        methods:{
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
            deleteChat:function (item) {
                var _this=this;
                if(confirm('Вы хотите удалть сообщение')){
                    axios.delete("/rest/api/chatdelete/"+item.id+"/"+eventid+"/"+roomid)
                        .then(function (r) {

                        })

                }
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

            startVideoChat:async function(item){
                var _this=this;

                if (typeof (createVideoContaiter) == 'undefined') {
                    var s = document.createElement('script');
                    s.src = "/javascripts/rtcScript.js";
                    s.type = "text/javascript";
                    s.async = false;
                    s.onload = function () {
                        modGetStream(_this,function(video, stream){ _this.onMyVideoStarted(video, stream,item)});
                    }// <-- this is important
                    document.getElementsByTagName('head')[0].appendChild(s);
                } else
                    modGetStream(_this, function(video, stream){ _this.onMyVideoStarted(video, stream,item)});



            },
            onMyVideoStarted: function (video, stream, item) {
                var _this=this;
                createSender(video, stream, function (videoSender) {
                    videoSenders.push(videoSender)
                    _this.socket.emit("senderReady",{user:_this.user, guid:videoSender.guid, to:item.socketid})

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
                    videoReceivers.push(ret)
                    _this.socket.emit("receiverReady",{user:_this.user, guid:data.guid, to:data.from})
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
                    })
                }

            },
            onVideoLink:function (data) {

                onVideoLink(this, data)

            }

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
                            console.log(_this.users)
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

                })
        }
    });
}