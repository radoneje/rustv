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
            SPKalertTimeout:null,
            isPres:false,
            files:[],
            previewPres:[],
            pres:null,
            recorder:null,
            recordTime:null,
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
                   /* videoReceivers.forEach(function (r) {
                        console.log(item);
                        stopReceiveVideo(r.guid);
                        stopSendVideo(r.pairGUID);
                        _this.socket.emit("stopSendVideo",{user:_this.user, guid:r.recguid, to:item.socketid})
                    });*/


                    modGetStream(_this, function (video, stream) {
                        _this.onMyVideoStarted(video, stream, item)

                    });
                }



            },
            onMyVideoStarted: function (video, stream, item) {
                var _this=this;
                createSender(video, stream, null, function (videoSender) {
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
                videoReceivers.forEach(r=>{
                    if(r.guid==data.item.guid){
                        var elem=document.getElementById("close"+r.guid)
                        if(elem)
                            elem.click();
                        socket.emit("disconnectDirectConnect", r.guid );
                    }
                })
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
                                        elem.style.top="90%"
                                    })
                                    _this.recorder= new Recorder(_this);
                                    _this.recorder.start(video);
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
                                    videoReceivers.forEach(r=>{SPKvksUsers.push({user:r.user, guid:r.guid})})
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