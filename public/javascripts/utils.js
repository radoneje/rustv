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
    })
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
           // receiverPlayingg("userConnnect")
            _this.users.forEach(function (u) {
                if(u.id==user.id) {
                  //  console.log("userConnnect", user.isActive)
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

            if(_this.onSenderReady)
                _this.onSenderReady(data)
        });
        socket.on("receiverReady", function(data){

            if(_this.onReceiverReady)
                _this.onReceiverReady(data)
        });
        socket.on("videoLink", function(data){

            if(_this.onVideoLink)
                _this.onVideoLink(data)
        });
        socket.on("receiverPlaying", function(data){
            if(_this.receiverPlaying)
                _this.receiverPlaying(data)
        });
        socket.on("handUp", function(data){
            if(_this.onHandUp)
                _this.onHandUp(data)
        });

        socket.on("stopSendVideo", function(data){
            if(stopReceiveVideo)
                stopReceiveVideo(data.guid)
        });

        socket.on("SPKstatus", function(data){
            if(_this.onSPKstatus)
                _this.onSPKstatus(data)
        });
        socket.on("setSpkStatus", function(data){

            if(_this.setSpkStatus)
                _this.setSpkStatus(data)
        });
        socket.on("setSpkAlert", function(data){
            if(_this.setSpkAlert)
                _this.setSpkAlert(data)
        });
    socket.on("spkStartVks", function(data){
        if(_this.spkStartVks)
            _this.spkStartVks(data)
    });
    socket.on("disconnectSPKvksUser", function(data){

        if(_this.disconnectSPKvksUser)
            _this.disconnectSPKvksUser(data)
    });
    socket.on("startDirectConnect", function(data){
        if(_this.onStartDirectConnect)
            _this.onStartDirectConnect(data)
    });
    socket.on("disconnectDirectConnect", function(data){
        console.log("utils disconnectDirectConnect", data)
        if(_this.disconnectDirectConnect)
            _this.disconnectDirectConnect(data)
    });








        socket.on("newUser", function(data){
            if(_this.users.filter(function (u) {
                return u.id==data.id
            }).length==0)
            _this.users.push(data);
        });

        socket.on("chatAdd", function(data){


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
    socket.on("qAnswer", function(data){
        console.log("qAnswer")
        _this.q.forEach(function (e) {
            if(e.id==data.id) {
                e.answer = data.answer;

            }
        })

    });


        socket.on("qDelete", function(data){
            _this.q=_this.q.filter(function (e) {return e.id!=data;});
        });
        socket.on("qStatus", function(data){
            _this.q.forEach(function (e) {
                if(e.id==data.id) {
                    e.isReady = data.isReady;

                }
            })

        });
        socket.on("videoSnapshot", function(data){
            _this.users.forEach(function (user) {
                if(user.id==data.id) {

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

            if(typeof(_this.videoOffer)){

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
        socket.on("newFile", function(data) {
            if(typeof(_this.newFile)!='undefined'){
                _this.newFile(data)
            }
        });
    socket.on("deleteFile", function(data) {
        if(typeof(_this.onDeleteFile)!='undefined'){
            _this.onDeleteFile(data)
        }
    });
    socket.on("newFilePres", function(data) {
        if(typeof(_this.OnNewFilePres)!='undefined'){
            _this.OnNewFilePres(data)
        }
    });
    socket.on("setPres", function(data) {
        if(typeof(_this.setPres)!='undefined'){
            _this.setPres(data)
        }
    });
    socket.on("rr", function(data) {
        console.log("utils rr", data)
    });
    socket.on("previewFilePres", function(data) {
        console.log("utils previewFilePres", data)
        if(typeof(_this.onPreviewFilePres)!='undefined'){
            _this.onPreviewFilePres(data)
        }
    });
    socket.on("updateRecordTime", function(data) {
        if(typeof(_this.onUpdateRecordTime)!='undefined'){
            _this.onUpdateRecordTime(data)
        }
    });











        socket.on("userHandup", function(data) {
            _this.users.forEach(function (user) {
                if(user.id==data.id)
                    user.handup=data.handup;
            })

          /*  _this.users=_this.users.filter(function () {
                return true;
            })*/
        });
        socket.on("mayShowScreen", function(data) {

            if(typeof(_this.mayShowScreen)!='undefined'){
                _this.mayShowScreen(data)
            }
        });



}
function chattextChange(_this, e) {

    if(e.keyCode==13 && _this.chatText.length>0){
        chattextSend(_this)
    }
}
function qItemAnswerChange(item, _this){
    axios.post("/rest/api/qAnswer/"+eventid+"/"+roomid,{answer:item.answer, id:item.id}).then(function () {;;})
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
function inviteDenyToMeet(to){
    axios.post("/rest/api/inviteDenyToMeet/"+eventid+"/"+roomid,{to:to})
}
function inviteToMeet(to){
    axios.post("/rest/api/inviteToMeet/"+eventid+"/"+roomid,{to:to})
}

 function  uploadFile(_this) {
    var input= document.createElement("input")
    input.type="file";
    input.multiple=true;
    input.style.display="none"
    input.onchange=async function (e) {
        var files=input.files
        console.log(input.files);
        for(var i=0; i<files.length; i++) {

                var data = new FormData();
                data.append('file', files[i]);
                var dt = await axios.post('/rest/api/newFile/' + eventid + "/" + roomid,{name:files[i].name, size:files[i].size, type:files[i].type})
                _this.files.push(dt.data);
            setTimeout(function () {
                    var objDiv = document.getElementById("fileBox");
                    objDiv.scrollTop = objDiv.scrollHeight;

                    var xhr = new XMLHttpRequest();
                    xhr.upload.onprogress = function(event) {
                        console.log(parseFloat(event.loaded/event.total));
                        document.getElementById("fileloader"+dt.data.id).style.width=parseFloat(event.loaded/event.total)*100+"%"
                    }
                    xhr.onload = xhr.onerror = function() {
                        if (this.status == 200) {
                            setTimeout(()=>{
                                document.getElementById("fileloader"+dt.data.id).style.width=0;
                            }, 4*1000)
                        } else {
                            document.getElementById("fileloader"+dt.data.id).style.width=100;
                            document.getElementById("fileloader"+dt.data.id).classList.add('error')
                            console.warn("error " + this.status);
                        }
                    };
                 xhr.open("POST", "/rest/api/file/"+dt.data.id+"/" + eventid + "/" + roomid,true);
                 xhr.send(data);
            },100)

        }
        input.parentNode.removeChild(input);
    }
    document.body.appendChild(input)
    input.click()

}
async function downloadFile(id) {

    var iframe=document.createElement('iframe')
    iframe.src="/rest/api/downloadFile/"+id+"/" + eventid + "/" + roomid;
    console.log(iframe.src)
   document.body.append(iframe);
   setTimeout(()=>{
       iframe.parentNode.removeChild(iframe);
   },200)
}
 function copyText(txt) {

    var textArea=document.createElement('textarea')
     textArea.value = txt;
     document.body.appendChild(textArea);
     textArea.focus();
     textArea.select();
     var successful=document.execCommand('copy');
     if(successful)
         alert("Ссылка скопирована в буфер обмена.")
     setTimeout(()=>{
         textArea.parentNode.removeChild(textArea);
     },200)

}
