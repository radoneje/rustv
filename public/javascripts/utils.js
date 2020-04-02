var socket;
function log(text) {
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}
function log_error(text) {
    var time = new Date();
    console.trace("[" + time.toLocaleTimeString() + "] " + text);
}
var myHostname = window.location.hostname;
if (!myHostname) {
    myHostname = "localhost";
}
log("Hostname: " + myHostname);
function connect(_this, roomid, clbk){
    var serverUrl;
    var scheme = "http";
    if (document.location.protocol === "https:") {
        scheme += "s";
    }
    serverUrl = document.location.protocol + "//" + myHostname;
    log('Connecting to server:' + serverUrl);
    socket = io(serverUrl);
    socket.on('connect', function() {
        log("connection.onopen")
        socket.emit("hello",{id:_this.user.id, roomid:roomid});
        if(clbk)
            clbk(socket)
        sendToServer=function (data, type) {
            socket.emit(type||"roomVideoMessage", data);
        }
        socket.on("roomVideoMessage", function(data){
            switch(msg.type) {
                case "video-answer":  // Invitation and offer to chat
                    //handleVideoAnswerMsg(msg);
                    log("handleVideoAnswerMsg")
                    var desc = new RTCSessionDescription(msg.sdp);
                    myPeerConnection.setLocalDescription({type: "rollback"})
                        .then(function(){
                            myPeerConnection.setRemoteDescription(desc)
                                .then(function () {
                                    log("setRemoteDescription set")
                                })
                        })

                    break;
            }

        })

        socket.on("userConnnect", function(user){
            var find=false;
            console.log("userConnnect")
            _this.users.forEach(function (u) {
                if(u.id==user.id) {
                    console.log("userConnnect", user.isActive)
                    user.isActive = true;
                    find=true
                }
                return user;
            })
            if(!find) {
                user.isActive = true;
                _this.users.push(user)
            }
        });
        socket.on("userDisconnnect", function(userid){
            _this.users=_this.users.filter(u=>{return u.id!=userid})
        });

        socket.on("selfVideoStarted", function(data){
            _this.users.forEach(function (u) {
                 if(u.id==data.id) {
                     u.isVideo = true;
                     u.socketid=data.socketid
                 }
                 return u;
            })
            _this.users=_this.users.filter(f=>{return true})

        });
        socket.on("senderReady", function(data){
            console.log("senderReady receive")
            if(_this.onSenderReady)
                _this.onSenderReady(data)
        });
        socket.on("receiverReady", function(data){
            console.log("receiverReady receive")
            if(_this.onReceiverReady)
                _this.onReceiverReady(data)
        });
        socket.on("videoLink", function(data){
            console.log("videoLink receive", data.type)
            if(_this.onVideoLink)
                _this.onVideoLink(data)
        });
        socket.on("receiverPlaying", function(data){
            if(_this.receiverPlaying)
                _this.receiverPlaying(data)
        });
        socket.on("stopSendVideo", function(data){
            console.log("stopSendVideo", data.guid)
            if(stopReceiveVideo)
                stopReceiveVideo(data.guid)
        });




        socket.on("newUser", function(data){
            if(_this.users.filter(function (u) {
                return u.id==data.id
            }).length==0)
            _this.users.push(data);
        });

        socket.on("chatAdd", function(data){
            console.log("chatAdd", data);

            if(_this.chat.filter(function (u) {
                return u.id==data.id
            }).length==0)
                _this.chat.push(data);
            setTimeout(function () {
                var objDiv = document.getElementById("chatBox");
                objDiv.scrollTop = objDiv.scrollHeight;
            },0)
        });
        socket.on("chatDelete", function(data){
            _this.chat=_this.chat.filter(function (e) {return e.id!=data;});
        });
        socket.on("qAdd", function(data){
            if(_this.q.filter(function (u) {
                return u.id==data.id
            }).length==0)
                _this.q.push(data);

        });
        socket.on("qDelete", function(data){
            _this.q=_this.q.filter(function (e) {return e.id!=data;});
        });
        socket.on("qStatus", function(data){
            _this.q.forEach(function (e) {
                if(e.id==data.id) {
                    e.isReady = data.isReady;
                    console.log("qStatus", e.id, data.isReady)
                }
            })
            console.log("qStatus", _this.q)
        });
        socket.on("videoSnapshot", function(data){
            _this.users.forEach(function (user) {
                if(user.id==data.id) {
                    console.log("videoSnapshot2")
                    user.jpg = data.jpg;
                    setTimeout(function () {
                        var elem = document.getElementById('jpg_' + data.id)
                        if (elem)
                            elem.src = user.jpg;

                    }, 0)
                }
            })
           /* _this.users=_this.users.filter(function () {
                return true;
            })*/

        })
        socket.on("stopVideo", function(data) {
            _this.users.forEach(function (user) {
                if(user.id==data.id)
                    user.jpg=null;
            })
            console.log("stop Video on user");
          /*  _this.users=_this.users.filter(function () {
                return true;
            })*/
        });
        socket.on("startVideoChat", function(data) {
            var video=document.getElementById("myVideo")
            if(video  && video.srcObject)
                startBroadcast(_this, data, video);

        })
        socket.on("stopVideoChat", function(data) {
            var video=document.getElementById("myVideo")
            if(video  && video.srcObject)
                stopBroadcast(_this, data, video);

        })
        socket.on("videoOffer", function(data) {
            console.log("vf 1")
            if(typeof(_this.videoOffer)){
                console.log("vf2")
                _this.videoOffer(data)
            }
        })
        socket.on("videoAnswer", function(data){
            if(typeof(videoAnswer)!='undefined'){
                videoAnswer(data)
            }
            if(typeof(_this.videoAnswer)!='undefined'){
                _this.videoAnswer(data)
            }
        })
        socket.on("icecandidate", function(data) {

            if(typeof(videoIce)!='undefined'){
                videoIce(data)
            }
            if(typeof(_this.videoIce)!='undefined'){
                _this.videoIce(data)
            }
        })
        socket.on("icecandidate2", function(data) {
                console.log("va2 111")
            if(typeof(videoIce)!='undefined'){
                videoIce2(data)
            }
            if(typeof(_this.videoIce)!='undefined'){
                _this.videoIce2(data)
            }
        })
        socket.on("startBroadcastToClient", function(data) {
            if(typeof(_this.startBroadcastToClient)!='undefined'){
                _this.startBroadcastToClient(data)
            }
        });
        socket.on("stopBroadcastToClient", function(data) {
            if(typeof(_this.stopBroadcastToClient)!='undefined'){
                _this.stopBroadcastToClient(data)
            }
        });
        socket.on("showUploadedVideo", function(data) {
            console.log("showUploadedVideo",data)
            if(typeof(_this.StartShowUploadedVideo)!='undefined'){
                _this.StartShowUploadedVideo(data)
            }
        });

        socket.on("userHandup", function(data) {
            _this.users.forEach(function (user) {
                if(user.id==data.id)
                    user.handup=data.handup;
            })
            console.log("user Handup");
          /*  _this.users=_this.users.filter(function () {
                return true;
            })*/
        });
        socket.on("mayShowScreen", function(data) {
            console.log("mayShowScreen",data)
            if(typeof(_this.mayShowScreen)!='undefined'){
                _this.mayShowScreen(data)
            }
        });


    })
}
function chattextChange(_this, e) {

    if(e.keyCode==13 && _this.chatText.length>0){
        chattextSend(_this)
    }
}
function chattextSend(_this) {
    axios.post("/rest/api/chat/"+eventid+"/"+roomid,{text:_this.chatText})
        .then(function (e) {
            _this.chatText="";
            // _this.q.push(e.data);
            setTimeout(function () {
                var objDiv = document.getElementById("chatBox");
                objDiv.scrollTop = objDiv.scrollHeight;
            },100)
        })
}
function qtextChange(_this,e) {
    if(e.keyCode==13 && _this.qText.length>0){
        qtextSend(_this)
    }
}
function qtextSend(_this) {
    axios.post("/rest/api/quest/"+eventid+"/"+roomid,{text:_this.qText})
        .then(function (e) {
            _this.qText="";
            // _this.q.push(e.data);
            setTimeout(function () {
                var objDiv = document.getElementById("qBox");
                objDiv.scrollTop = objDiv.scrollHeight;
            },100)
        })
}
