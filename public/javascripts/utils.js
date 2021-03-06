var socket;
function log(text) {
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}
function log_error(text) {
    var time = new Date();
    console.trace("[" + time.toLocaleTimeString() + "] " + text);
}
window.addEventListener( "pageshow", function ( event ) {
    var historyTraversal = event.persisted ||
        ( typeof window.performance != "undefined" &&
            window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
        // Handle page restore.
        window.location.reload();
    }
});

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
            console.log("userConnnect")
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
                     if(_this.UsersVideoStarted)
                         _this.UsersVideoStarted(data);
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
    socket.on("spkStartPhone", function(data){
        if(_this.spkStartPhone)
            _this.spkStartPhone(data)
    });
        socket.on("startSpeakerMeet", function(data){
            if(_this.startSpeakerMeet)
                _this.startSpeakerMeet(data)
        });
    socket.on("startModMeet", function(data){
        if(_this.OnStartModMeet)
            _this.OnStartModMeet(data)
    });
    socket.on("stopModMeet", function(data){
        if(_this.OnStopModMeet)
            _this.OnStopModMeet(data)
    });
    socket.on("newSpkVideo", function(data){
        if(_this.OnSpkVideo)
            _this.OnSpkVideo(data)
    });
    socket.on("roomStopWowzaVideo", function(data){
        if(_this.OnRoomStopWowzaVideo)
            _this.OnRoomStopWowzaVideo(data)
    });

    socket.on("voteAdd", function(data){
        if(_this.OnVoteAdd)
            _this.OnVoteAdd(data)
    });
    socket.on("poleAdd", function(data){
        if(_this.OnPoleAdd)
            _this.OnPoleAdd(data)
    });
    socket.on("tagsAdd", function(data){
        if(_this.OnTagsAdd)
            _this.OnTagsAdd(data)
    });

    socket.on("voteChange", function(data){
        if(_this.OnVoteChange)
            _this.OnVoteChange(data)
    });
    socket.on("voteAnswerAdd", function(data){
        if(_this.OnVoteAnswerAdd)
            _this.OnVoteAnswerAdd(data)
    });
    socket.on("poleChange", function(data){
        if(_this.OnPoleChange)
            _this.OnPoleChange(data)
    });
    socket.on("presRew", function(data){
        if(_this.OnPresRew)
            _this.OnPresRew(data)
    });
    socket.on("presFow", function(data){
        if(_this.OnPresFow)
            _this.OnPresFow(data)
    });
    socket.on("tagsChange", function(data){
        if(_this.OnTagsChange)
            _this.OnTagsChange(data)
    });
    socket.on("voteAnswerChange", function(data){
        if(_this.OnVoteAnswerChange)
            _this.OnVoteAnswerChange(data)
    });
    socket.on("vote", function(data){
        if(_this.OnVote)
            _this.OnVote(data)
    });

    socket.on("startPhoneToSpk", function(data){
        if(_this.OnPhoneToSpk)
            _this.OnPhoneToSpk(data)
    });









    socket.on("disconnectSPKvksUser", function(data){
        if(_this.OndisconnectSPKvksUser)
            _this.OndisconnectSPKvksUser(data)
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
    socket.on("newStageStream", function(data){

        if(_this.OnNewStageStream)
            _this.OnNewStageStream(data)
    });
    socket.on("closeStageStream", function(data){

        if(_this.onCloseStageStream)
            _this.onCloseStageStream(data)
    });
    socket.on("startStageRecord", function(data){

        if(_this.onStartStageRecord)
            _this.onStartStageRecord(data)
    });
    socket.on("stopStageRecord", function(data){

        if(_this.onStopStageRecord)
            _this.onStopStageRecord(data)
    });



    socket.on("stageRecordStarted", function(data){

        if(_this.OnStageRecordStarted)
            _this.OnStageRecordStarted(data)
    });
    socket.on("stageRecordStopped", function(data){

        if(_this.onStageRecordStopped)
            _this.onStageRecordStopped(data)
    });
    socket.on("resetTimer", function(data){

        if(_this.OnResetTimer)
            _this.OnResetTimer(data)
    });
    socket.on("startTimer", function(data){

        if(_this.OnStartTimer)
            _this.OnStartTimer(data)
    });


    socket.on("reload", function(data){
        if(_this.socket.id==data.streamid)
            document.location.reload(true);
    });
    socket.on("redirect", function(data){
        if(_this.socket.id==data.streamid) {
            document.location.href = data.url;
        }
    });
    socket.on("videoMute", function(data){
        if(_this.OnVideoMute)
            _this.OnVideoMute(data)
    });
    socket.on("videoPgm", function(data){

        if(_this.OnVideoPgm)
            _this.OnVideoPgm(data)
    });
    socket.on("videoPIP", function(data){
        if(_this.OnVideoPIP)
            _this.OnVideoPIP(data)
    });
    socket.on("videoP1", function(data){
        if(_this.OnVideoP1)
            _this.OnVideoP1(data)
    });
    socket.on("relayoutVideo", function(data){
        if(_this.OnRelayoutVideo)
            _this.OnRelayoutVideo(data)
    });

    socket.on("redirectToStage", function(data){
        document.location.href=data.url;
    });
    socket.on("messageToUser", function(data){
        console.log("messageToUser",typeof (_this.messageFromMod)=="string" , data.userid==_this.user.id )
        if(typeof (_this.messageFromMod)=="string" && data.userid==_this.user.id  ){
            _this.messageFromMod=data.text;

        }

    });
    socket.on("messageToMod", function(data){
        if(_this.OnMessageToMod)
            _this.OnMessageToMod(data)
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
           var objDiv = document.getElementById("chatBox");
            var needScrool=false;
            if(objDiv)

            if(objDiv && objDiv.scrollTop> objDiv.scrollHeight-130) {
                needScrool=true;
            }
            if(_this.chat.filter(c=>c.id==data.id).length<1) {
                _this.chat.push(data);
                // if(needScrool || true) {
                setTimeout(function () {
                    objDiv.scrollTop = objDiv.scrollHeight;
                }, 100)
                // }
            }
        });
    socket.on("stageChatAdd", function(data){
        if(_this.stageChat.filter(function (u) {
            return u.id==data.id
        }).length==0)
            _this.stageChat.push(data);
        setTimeout(function () {
            var objDiv = document.getElementById("stageBox");
            if(objDiv)
                objDiv.scrollTop = objDiv.scrollHeight;
        },0)
    });



        socket.on("chatDelete", function(data){
            _this.chat=_this.chat.filter(function (e) {return e.id!=data;});
        });
        socket.on("qAdd", function(data){
            console.log("qAdd")
            var objDiv = document.getElementById("qBox");
            var needScrool=false;




            if(_this.q.filter(c=>c.id==data.id).length<1) {
                console.log(data.id)
                _this.q.push(data);
                // if(needScrool || true) {
                if(objDiv && objDiv.scrollTop> objDiv.scrollHeight-230) {
                    needScrool=true;
                }
                // }
            }

            if(needScrool) {
                setTimeout(function () {
                    objDiv.scrollTop = objDiv.scrollHeight;
                }, 0)
            }

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
    socket.on("qToSpk", function(data){

        _this.q.forEach(function (e) {
            if(e.id==data.id) {
                e.isSpk = data.isSpk;
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
    socket.on("convertPage", function(data) {
        if(typeof(_this.OnConvertPage)!='undefined'){
            _this.OnConvertPage(data)
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
    socket.on("inviteDenyToMeet", function(data) {
        if(typeof(_this.onInviteDenyToMeet)!='undefined'){
            _this.onInviteDenyToMeet(data)
        }
    });
    socket.on("inviteToMeet", function(data) {
        if(typeof(_this.onInviteToMeet)!='undefined'){
            _this.onInviteToMeet(data)
        }
    });
    socket.on("inviteDeny", function(data) {
        if(typeof(_this.onInviteDeny)!='undefined'){
            _this.onInviteDeny(data)
        }
    });
    socket.on("qLikes", function(data) {
        if(typeof(_this.OnQLikes)!='undefined'){
            _this.OnQLikes(data)
        }
    });
    socket.on("isChat", function(data) {
        if(typeof(_this.OnIsChat)!='undefined'){
            _this.OnIsChat(data)
        }
    });

    socket.on("isFiles", function(data) {
        if(typeof(_this.OnIsFiles)!='undefined'){
            _this.OnIsFiles(data)
        }
    });
    socket.on("isUsers", function(data) {
        if(typeof(_this.OnIsUsers)!='undefined'){
            _this.OnIsUsers(data)
        }
    });
    socket.on("isLenta", function(data) {
        if(typeof(_this.OnIsLenta)!='undefined'){
            _this.OnIsLenta(data)
        }
    });
    socket.on("isQ", function(data) {
        if(typeof(_this.OnQOnOff)!='undefined'){
            _this.OnQOnOff(data)
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
        socket.on('newLangCh', async (data) => {
            console.log("newLangCh received", data)
            if(_this.langCh) {
                if (_this.langCh.length == 0) {
                    _this.langCh.push({lang: {title: "original", id: 0}, isActive: true})
                }
                var find = _this.langCh.filter(f => f.lang.id == data.lang.id)
                if (find.length == 0) {
                    data.isActive = false;
                    _this.langCh.push(data);

                }
            }
            console.log("newLangCh received", data)
        });
    socket.on('langChClose', async (data) => {

        if( _this.langCh) {
            var items = _this.langCh.filter(l => l.id == data.id)
            console.log('langChClose', items, data)
            if (items.length == 0)
                return;
            if (items[0].isActive) {
                _this.langCh[0].isActive = true;
                _this.activateLangCh({lang: {id: 0}});
            }
            console.log("lang close");
            _this.langCh = _this.langCh.filter(l => l.id != data.id);
        }
    });



}
function chattextChange(_this, e) {

    if(e.keyCode==13 && _this.chatText.length>0){
        chattextSend(_this)
    }
}

function stageChattextChange(_this, e) {

    if(e.keyCode==13 && _this.stageChatText.length>0){
        stageChattextSend(_this)
    }
}
function qItemAnswerChange(item, _this){
    axios.post("/rest/api/qAnswer/"+eventid+"/"+roomid,{answer:item.answer, id:item.id}).then(function () {;;})
}
function chattextSend(_this) {
    axios.post("/rest/api/chat/"+eventid+"/"+roomid+"?userid="+_this.user.id,{text:_this.chatText})
        .then(function (e) {
            _this.chatText="";
            // _this.q.push(e.data);
            setTimeout(function () {
                var objDiv = document.getElementById("chatBox");
                objDiv.scrollTop = objDiv.scrollHeight;
            },100)
        })
}
function stageChattextSend(_this) {
    axios.post("/rest/api/stageChat/"+eventid+"/"+roomid,{text:_this.stageChatText})
        .then(function (e) {
            _this.stageChatText="";
            // _this.q.push(e.data);
            setTimeout(function () {
                var objDiv = document.getElementById("stageLBox");
                if(objDiv)
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
    axios.post("/rest/api/quest/"+eventid+"/"+roomid+"?userid="+_this.user.id,{text:_this.qText})
        .then(function (e) {
            _this.qText="";
            // _this.q.push(e.data);
            setTimeout(function () {
                var objDiv = document.getElementById("qBox");
                objDiv.scrollTop = objDiv.scrollHeight;
            },100)
        })
}
function inviteToMeet(to){
    axios.post("/rest/api/inviteToMeet/"+eventid+"/"+roomid,{to:to})
}
function inviteDenyToMeet(to){
    axios.post("/rest/api/inviteDenyToMeet/"+eventid+"/"+roomid,{to:to})
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
function checkVisible(elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}
function initHLS(video) {

    if( Hls.isSupported()) {

        var hls = new Hls();
        console.log("init HLS")
        hls.loadSource(video.src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log("MANIFEST_PARSED")
            var banner=document.querySelector(".videoPlayBannner");
            if(banner) {
                banner.style.display = "flex";
                banner.onclick = function () {
                    console.log("PLAY")
                    video.play();
                    banner.style.display = "none";
                }
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
        var banner=document.querySelector(".videoPlayBannner");
        video.addEventListener('loadedmetadata', function() {
            video.controls=true;
            if(banner)
                banner.style.display="none";
            video.play();
        });
    }
}
function tagsResShow(item){
    resWindowOpen('/tagsres/'+item.id)
}
function poleResShow(item){
    resWindowOpen('/poleres/'+item.id)
}
function resWindowOpen(url) {
    console.log("resWindowOpen", url)
    var container=document.createElement("div");
    container.classList.add("resWr")
    var containerInside=document.createElement("div");
    containerInside.classList.add("resInside")
    var iframe=document.createElement("iframe");
    iframe.classList.add("resIframe");
    iframe.border=0;
    iframe.src=url;

    var clickDiv=document.createElement("div");
    clickDiv.classList.add("resClick")
    containerInside.appendChild(iframe)
    containerInside.appendChild(clickDiv)
    container.appendChild(containerInside)

    document.body.appendChild(container)
    container.addEventListener("click", function () {
        container.parentNode.removeChild(container)
    })

}
function videoLayout2() {
    //videoLayout()
    var container=document.getElementById("meetVideoBox")
    //container.style.flexWrap="inherit"
    if(container) {
        var elems = container.querySelectorAll(".meetVideoItem");
        var flex = "0 0 calc(20% - 10px)";
        if (elems.length <= 9)
            flex = "0 0 calc(33% - 10px)";
        if (elems.length <= 4)
            flex = "0 0 calc(50% - 10px)";
        if (elems.length <= 1)
            flex = "inherit"

        elems.forEach(elem => {
            console.log("elem", elem)
            elem.style.width = "inherit"
            elem.style.margin = "5px"
            elem.style.flex = flex;
        })
    }
}


