window.onload=function () {
    var wowzaRecievers=[];
    var peerConnection=null;
    var app = new Vue({
        el: '#app',
        data: {
            webCamStream:null,
            sect:[{title:"Вопросы", isActive:false, id:1}, {title:"Чат", isActive:true, id:2},{title:"Участники", isActive:false, id:3}, {title:"Голосования", isActive:false, id:4} ],
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
            SPKalertTimeout:null,
            isPres:false,
            files:[],
            previewPres:[],
            pres:null,
            recorder:null,
            recordTime:null,
            newStream:null,
            votes:[],
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
                    elem=document.getElementById("selfVideo")
                    elem.style.position="fixed";
                    elem.style.top= 0;
                    elem.style.opacity= 1;
                    elem.style.zIndex=100;

                   /* var elem=document.getElementById("selfVideo")
                    elem.style.zIndex="100";
                    elem.style.opacity="1"
                    var video=document.createElement('video')
                    video.muted=true;
                    video.srcObject=this.selfVideoStream;
                    video.id="mirrorVideo";
                    video.autoplay=true
                    document.body.appendChild(video)
                    video.addEventListener('click',()=>{
                        (video).parentNode.removeChild(video);
                    })*/
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
                  //  _this.stopVKS();
                    setTimeout(()=>{
                        _this.startVideoChat(items[0]);
                    },500)

                }
            },
            startVideoChat:async function(item){
                document.getElementById("VKS").classList.remove('hidden')
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
                if(typeof (wowzaIsLoad)=="undefined" )
                {
                    var s = document.createElement('script');
                    s.src = "/javascripts/wowza.js";
                    s.type = "text/javascript";
                    s.async = false;
                    s.onload = async ()=> {
                        var canvas = document.createElement("canvas");
                        canvas.width=16*40;
                        canvas.height=9*40;
                        var context = canvas.getContext('2d');
                        var imgElem=document.createElement("img")
                        imgElem.src="/images/camera.svg"

                        var localTracks=_this.selfVideoStream.getTracks()
                        var videoTrack=localTracks.filter(t=>t.kind=="video")[0]
                        draw(document.getElementById('spkVideo'),context, videoTrack, imgElem )

                        var canvasStream=await canvas.captureStream(30)
                        var canvasTracks=canvasStream.getTracks()
                        _this.newStream= new MediaStream();


                        canvasTracks.forEach(t=>{if(t.kind=="video")_this.newStream.addTrack(t)})
                        localTracks.forEach(t=>{if(t.kind=="audio")_this.newStream.addTrack(t)})
                        console.log(_this.newStream.getTracks())
                        await publishMyVideoToWowza()

                    }// <-- this is important
                    document.getElementsByTagName('head')[0].appendChild(s);
                }
                else
                    await publishMyVideoToWowza()
                async function publishMyVideoToWowza() {


                    if(typeof (_this.WowzaCfg)=="undefined" || _this.WowzaCfg==null) {
                        _this.WowzaCfg = await axios.get('/rest/api/spkWowza')
                        _this.BitrateCfg = await axios.get('/rest/api/spkBitrate')
                        await publishVideoToWowza(_this.socket.id,_this.newStream /*_this.selfVideoStream*/, _this.WowzaCfg.data, _this.BitrateCfg.data, (ret)=>{
                            console.log("my Video Published", ret)
                            peerConnection=ret.peerConnection
                            setTimeout(async ()=>{
                              _this.socket.emit("SpkRoomVideoPublished",{id:_this.socket.id, roomid:roomid});
                                addUserToSpeakerRoom();
                            }, 2000)

                        }, (err)=>{
                            console.warn(err)
                        })

                    }
                    else
                        addUserToSpeakerRoom();
                }
                async function addUserToSpeakerRoom() {
                    _this.socket.emit("addUserToSpeakerRoom",{userid:item.id,roomid:roomid });
                }

                /*
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
                    modGetStream(_this, function (video, stream) {
                        _this.onMyVideoStarted(video, stream, item)
                    });
                }
*/

            },
            onMyVideoStarted: function (video, stream, item) {
                var _this=this;
              /*  createSender(video, stream, null, function (videoSender) {
                    videoSenders.push(videoSender)
                    _this.socket.emit("senderReady",{user:_this.user, guid:videoSender.guid, to:item.socketid, isSpk:true})

                    // addSenderEvents(_this.socket,item.socketid, videoSender);
                });*/

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
                    if(videoReceivers.length>0){
                        var i=1;
                        videoReceivers.forEach(r=>{
                        setTimeout(()=>{
                            _this.socket.emit("startDirectConnect",{user:r.user, guid:data.recguid, pairGUID:ret.pairGUID, to:data.user})
                        },1000*i)
                            i++;
                        })
                    }
                    videoReceivers.push(ret)
                    _this.socket.emit("receiverReady",{user:_this.user, guid:data.guid, to:data.from})
                    _this.SPKstatus=6;
                })


                var videoBox=document.getElementById(data.guid)
               var videoCap=videoBox.querySelector(".videoCap")
                videoCap.innerHTML = "<img src='/images/close.svg' class='closeIcon' id='close"+data.guid+"'/>" + videoCap.innerHTML;
                {
                    document.getElementById("close"+data.guid).addEventListener("click", ()=>{
                        console.log("stopReceiveVideo", data.guid, data.recguid )
                        stopReceiveVideo(data.guid);
                        stopSendVideo(data.recguid);
                        _this.socket.emit("stopSendVideo",{user:_this.user, guid:data.recguid, to:data.from})
                        setReceiversHeight();
                        if(videoReceivers.length==0)
                        {
                            if(_this.pres)
                                _this.SPKstatus=7;
                            else
                                _this.SPKstatus=1;
                        }

                    })
                }
                setReceiversHeight();

            },
            onVideoLink:function (data) {

                onVideoLink(this, data)

            },
            stopVKS:function () {
                var elem=document.querySelector(".spkContaiter .videoBox:not(#selfVideo) .videoCap img")
                if(elem)
                    elem.click();
            },
            disconnectSPKvksUser:function (data, event) {
                this.removeWowzaVideo(data.item.guid)
                /*
                videoReceivers.forEach(r=>{
                    if(r.guid==data.item.guid){
                        var elem=document.getElementById("close"+r.guid)
                        if(elem)
                            elem.click();
                        socket.emit("disconnectDirectConnect", r.guid );
                    }
                })*/
            },
            setPres:function (id) {
                console.log("setPres", id)
                this.pres=id;
                if(this.pres) {
                    this.isPres=true
                    var elem = document.getElementById("pres" + id)
                    if (elem)
                        elem.scrollIntoView({inline: "center", behavior: "smooth"})
                    this.SPKstatus=7;
                }
                else{
                    this.isPres=false;
                    if(videoReceivers.length==0)
                        this.SPKstatus=1
                    else
                        this.SPKstatus=9
                }
            },
            activatePres:async function (item) {
                await axios.post("/rest/api/pres/" + eventid + "/" + roomid, {id:item.id})
            },
            OnNewFilePres:function (data) {
                console.log("OnNewFilePres", this.files, data)
                this.files.forEach(f=>{
                    if(f.id==data.fileid)
                        f.presfiles.push(f);
                })
            },
            onPreviewFilePres:function (dt) {
                console.log("onPreviewFilePres", dt)

                    this.previewPres=dt;
            },
            newFile(data){
                console.log("new file", data, this.files)
                if(this.files.filter(f=>f.id==data.id).length==0)
                    this.files.push(data)
                else
                    this.files.forEach(f=>{
                        if(f.id==data.id)
                            f=data;
                    })

            },
            downloadFile:function(item){
                downloadFile(item.id);
            },
            fileLink:function(item){
                copyText("https://conf.rustv.ru/rest/api/file/"+item.id+"/" + eventid + "/" + roomid)
            },
            onDeleteFile:function (id) {
                this.files=this.files.filter(r=>r.id!=id)
            },
            qFileClick:function(){
                var _this=this;
                var elem= document.createElement("input");
                elem.type="file"
                elem.style.display="none";
                elem.accept="video/*;capture=camcorder";
                elem.onchange=function(){
                    _this.uploafFilesToQ(elem.files[0], "q", function () {
                        elem.parentNode.removeChild(elem)
                    })

                }
                document.body.appendChild(elem);
                elem.click();

            },
            uploafFilesToQ:function(file, to, clbk){
                var _this=this;
                if(!(file.type.indexOf('image/')==0 ||file.type.indexOf('video/')==0 ))
                    return  alert("Можно загрузить только фото или видео")
                var fd = new FormData();
                fd.append('file', file );

                var xhr = new XMLHttpRequest();
                var progressElem=document.querySelector(".fileLoadProgress")
                xhr.upload.onprogress = function(event) {
                    console.log(parseFloat(event.loaded/event.total));
                    if(progressElem)
                        progressElem.style.width=parseFloat(event.loaded/event.total)*100+"%"
                }
                xhr.onload = xhr.onerror = function() {

                    if (this.status == 200) {
                        setTimeout(function () {
                            var objDiv = document.getElementById(to+"Box");
                            objDiv.scrollTop = objDiv.scrollHeight;
                        }, 100)
                        setTimeout(()=>{
                            var progressElem=document.querySelector(".fileLoadProgress")
                            if(progressElem)
                                progressElem.style.width=0;
                        }, 4*1000)
                    } else {
                        if(progressElem) {
                            progressElem.style.width = "100%";
                            progressElem.classList.add('error')
                        }
                        setTimeout(()=>{
                            var progressElem=document.querySelector(".fileLoadProgress")
                            if(progressElem) {
                                progressElem.style.width = 0;
                                progressElem.classList.remove('error')
                            }
                        }, 4*1000)
                        console.warn("error " + this.status);
                    }
                    if(clbk)
                        clbk(this.status)
                };
                xhr.open("POST", '/rest/api/qfileUpload/'+eventid+"/"+roomid,true, );
                //xhr.setRequestHeader("Content-Type", "multipart/form-data")
                xhr.setRequestHeader("X-data", encodeURI( JSON.stringify({to:to,name:file.name||"",type:file.type})))

                xhr.send(fd);


            },
            qTextOnPaste:function (event) {
                var _this=this;
                var items = event.clipboardData.items;
                if(items == undefined)
                    return;

                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") == -1) continue;
                    if (items[i].kind === 'file') {
                        _this.uploafFilesToQ(items[i].getAsFile(), "q")
                    }
                }
            },
            chatTextOnPaste:function (event) {
                var _this=this;
                var items = event.clipboardData.items;
                if(items == undefined)
                    return;

                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") == -1) continue;
                    if (items[i].kind === 'file') {
                        _this.uploafFilesToQ(items[i].getAsFile(), "chat")
                    }
                }
            },
            onStartRecord:function () {
                console.log("onStartRecord",this.recorder )
                if(this.recorder)
                    this.recorder.startRec(()=>{;;});
            },
            onUpdateRecordTime:function (data) {
                this.recordTime=data.time;
            },
            qLike:function (item) {
                if(!localStorage.getItem("qLike"+item.id))
                    axios.post("/rest/api/qLike/"+eventid+"/"+roomid,{id:item.id}).then();
                localStorage.setItem("qLike"+item.id, true);
            },
            OnQLikes:function (data) {
                this.q.forEach(q=>{
                    if(q.id==data.id)
                        q.likes=data.likes;
                })
            },
            OnSpkVideo:function (data) {
                var _this=this;
                console.log("OnSpkVideo", data)
                if(data.streamid==_this.socket.id)
                    return;// мое видео не показываем

                var video=createVideoContaiter(data.streamid, (data.user.i||"") +" "+ data.user.f)
                getSpkConfig()
                    .then(function (wCfg) {
                        var item={id:data.streamid, elem:video}
                        getVideoFromWowza(item,  wCfg.WowzaCfg.data, wCfg.BitrateCfg.data, function (ret) {
                            console.log("remote video play", ret)
                            var receiverItem={id:data.streamid, isMyVideo:false, user:data.user, streamid:data.streamid}
                            receiverItem.peerConnection=ret.peerConnection;
                            receiverItem.peerConnection.onconnectionstatechange=(event)=> {
                                var cs = receiverItem.peerConnection.connectionState
                                console.log("cs", receiverItem.peerConnection.connectionState)
                                if (cs == "disconnected" || cs == "failed" || cs == "closed") {

                                    _this.removeWowzaVideo(receiverItem.streamid)
                                    //arrVideo = arrVideo.filter(r => r.streamid != receiverItem.streamid);

                                }
                            }
                            wowzaRecievers.push(receiverItem)
                            _this.SPKstatus=6;
                        })
                    });

            },
             removeWowzaVideo:function(streamid) {
                    var _this=this;
                    console.log("removeWowzaVideo",(streamid))
                    wowzaRecievers.forEach(r=>{
                        if(r.streamid==streamid)
                        {
                            if (r.peerConnection) {
                                r.peerConnection.close();
                                r.peerConnection = null;
                            }
                            _this.socket.emit("roomStopWowzaVideo",{streamid:streamid});
                            var elem=document.getElementById(streamid);
                            if(elem)
                                elem.parentNode.removeChild(elem);
                        }
                    })
                    wowzaRecievers= wowzaRecievers.filter(r=>{
                        return r.streamid!=streamid
                    });
                    if(wowzaRecievers.length==0)
                    {
                        _this.WowzaCfg=null;
                        peerConnection.close();
                        peerConnection = null;
                        _this.SPKstatus=1;

                    }


    },
            OnVote:function(data){
                var _this=this;
                _this.votes.forEach(d=>{
                    d.answers.forEach(a=>{
                        if(a.id==data.id) {
                            a.count = data.count;
                        }
                    })
                    d.answers=d.answers;
                })
                _this.votes=_this.votes.filter(v=>{return true})
            },
            CalcAnswPercent:function (answ, vote) {
                var _this=this;
                var count=vote.answers.length;
                var total=0;
                vote.answers.forEach(a=>total=total+a.count);

                if(total==0)
                    return 0;

                ret=parseFloat(answ.count/total)*100;
                return parseInt(ret);
            },
            caclAnswCount:function(item){
                var total=0;
                item.answers.forEach(a=>total+=a.count);
                return total;
            },
            voteAdd:function(){
                axios.post("/rest/api/voteAdd/"+eventid+"/"+roomid,{})
            },
            voteChange:function(item){
                axios.post("/rest/api/voteChange/"+eventid+"/"+roomid,{item})
            },
            OnVoteAdd:function(data){

                var _this=this;
                data.forEach(d=>{
                    _this.votes.push(d)
                })
            },
            OnVoteChange:function(data){
                var _this=this;
                _this.votes.forEach(d=>{
                    if(d.id==data.id)
                        d=data;
                })
            },
            voteAddAnswer:function(item){
                axios.post("/rest/api/voteAddAnswer/"+eventid+"/"+roomid,{id:item.id})
            },
            OnVoteAnswerAdd:function(data){
                var _this=this;
                console.log("OnVoteAnswerAdd", data)
                _this.votes.forEach(d=>{
                    if(d.id==data.voteid)
                        d.answers.push(data);
                })
                _this.votes=_this.votes.filter(r=>{return true})
            },
            voteAnswerChange:function(item){
                axios.post("/rest/api/voteAnswerChange/"+eventid+"/"+roomid,{item})
            },
            OnVoteAnswerChange:function(data){
                var _this=this;
                _this.votes.forEach(d=>{
                    if(d.id==data.voteid)
                        d.answers.forEach(a=>{
                            if(a.id==data.id)
                                a=data;
                        })
                })
            },
            voteStart:function(item){
                item.isactive=!item.isactive
                axios.post("/rest/api/voteChange/"+eventid+"/"+roomid,{item})
            },
            voteShowResult:function(item){
                item.iscompl=!item.iscompl
                axios.post("/rest/api/voteChange/"+eventid+"/"+roomid,{item})
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
                if(this.SPKstatus<6 && videoReceivers.length>0 ){
                    this.stopVKS();
                }
            },


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
                            document.getElementById("app").style.opacity = 1;
                        setTimeout(async () => {
                            console.warn("continue")
                            var dt= await axios.get('/rest/api/constraints');
                            var constraints=dt.data;
                            var video=SpkcreateVideoContaiter('selfVideo', _this.user.i ||''+" "+_this.user.f);
                            video.width = 320;
                            video.style.width = "320px"
                            _this.selfVideoStream = await navigator.mediaDevices.getUserMedia(constraints);
                            video.id="spkVideo"
                            video.srcObject=_this.selfVideoStream;
                            video.muted=true;

                           /* video.addEventListener("click", () => {
                                video.style.zIndex = "-1";
                                video.style.opacity = "0"
                                video.style.top="90%"
                            })*/
                            _this.recorder= new Recorder(_this);
                            _this.recorder.start(video);

                            if (!_this.SPKanotherConnectError) {

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
                                axios.get("/rest/api/votes/"+eventid+"/"+roomid)
                                    .then(function (r) {
                                        console.log("votes", r.data)
                                        _this.votes=r.data;
                                    })
                                axios.get("/rest/api/files/"+eventid+"/"+roomid)
                                    .then(function (r) {
                                        console.log(r.data)
                                        _this.files=r.data;
                                    axios.get("/rest/api/activePres/" + eventid + "/" + roomid)
                                        .then(function (ff) {
                                            // console.log("activePres", ff)
                                            if (ff.data.fileid) {
                                                _this.previewPres = _this.files.filter(r => r.id == ff.data.fileid)[0].presfiles
                                                //_this.pres = ff.data.fileid
                                                _this.setPres(ff.data.item)
                                                setTimeout(function () {
                                                    var elem = document.getElementById("pres" + ff.data.fileid)
                                                    if (elem)
                                                        elem.scrollIntoView({inline: "center", behavior: "smooth"})
                                                }, 200)

                                              //  _this.pres = ff.data.item
                                               // _this.isPres = ff.data.item ? true : false
                                            } else
                                                _this.previewPres = []


                                    })
                            })

                                _this.socketConnection = true;

                                setInterval(() => {
                                    var SPKvksUsers=[]
                                   // videoReceivers.forEach(r=>{SPKvksUsers.push({user:r.user, guid:r.guid})})
                                    wowzaRecievers.forEach(r=>{SPKvksUsers.push({user:r.user, guid:r.id})})
                                      _this.socket.emit("SPKstatus",{SPKstatus: _this.SPKstatus, SPKalert:_this.SPKalert, SPKvksUsers:SPKvksUsers})
                                }, 1000)
                                document.addEventListener("keydown",(e)=>{
                                    if(e.code=="ArrowRight" || e.code=="ArrowLeft" && this.isPres)
                                    {
                                        var elems=document.querySelectorAll(".aModSectPresItem");
                                        for(var i=0; i<elems.length; i++){
                                            if(elems[i].classList.contains("active"))
                                            {
                                                if(e.code=="ArrowRight" && i<elems.length-1)
                                                    elems[i+1].click();
                                                if(e.code=="ArrowLeft" && i>0)
                                                    elems[i-1].click();
                                            }
                                        }
                                    }
                                })
                            }

                        }, 1000);
                    }
                    })


                })
        }
    });
}
function SpkcreateVideoContaiter(id, caption) {
    var video = document.createElement("video");

    video.autoplay = true;
    video.width = 320;
    //video.width = 1024;
    var videoBox = document.createElement("div");
    videoBox.classList.add("videoBox")
    videoBox.id = id;

    var videoBoxWr = document.createElement("div");
    videoBoxWr.classList.add("videoBoxWr")

    var videoCap = document.createElement("div");
    videoCap.classList.add("videoCap")

    videoCap.innerText = caption;// + "<img src='/images/close.svg'/>";

    // console.log(videoCap.innerHtml)
    videoBoxWr.appendChild(video);
    videoBoxWr.appendChild(videoCap);
    videoBox.appendChild(videoBoxWr);
    document.getElementById("videoWr").appendChild(videoBox);
    return video;
}
function draw(v,c, videoTrack, img){



    if((!v.paused || !v.ended ) && videoTrack.enabled)
    {
        c.fillStyle = "#282D33";
        c.fillRect(0, 0, c.canvas.width, c.canvas.height);

        if(v.videoWidth>v.videoHeight) {
            var coof = c.canvas.width / v.videoWidth;
            c.drawImage(v, 0, 0, v.videoWidth * coof, v.videoHeight * coof);
        }
        else
        {
            var coof = c.canvas.height / v.videoHeight;
            c.drawImage(v, (c.canvas.width-(v.videoWidth * coof))/2, 0, v.videoWidth * coof, v.videoHeight * coof);
        }

        //videoWidth
        // drawImageProp(c,v);
    }
    else
    {
        var coof = c.canvas.width / img.width;
        c.drawImage(img, 0,0,img.width* coof,img.height* coof);
    }

    setTimeout(()=>{draw(v,c, videoTrack,img)},1000/30)
}
