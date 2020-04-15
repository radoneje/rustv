var app;
window.onload=function () {
     app = new Vue({
        el: '#app',
        data: {
            webCamStream:null,
            sect:[
                {title:"Лента", isActive:false, id:0, logo:'/images/logofeed.svg', logoactive:'/images/logofeeda.svg'},
                {title:"Вопросы", isActive:false, id:1, logo:'/images/logoqactive.svg', logoactive:'/images/logoq.svg'},
                {title:"Чат", isActive:true, id:2, logo:'/images/logochat.svg', logoactive:'/images/logochatactive.svg'},
                {title:"Люди", isActive:false, id:3, logo:'/images/logousers.svg', logoactive:'/images/logousersa.svg'},
                {title:"Файлы", isActive:false, id:7, logo:'/images/logofiles.svg', logoactive:'/images/logofilesa.svg'}
                ],
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
            pres:null,
            files:[],
            mainVideoMuted:false,
            eventRooms:[],
            invitedUsers:[],
            invites:[],
            videoReceivers:[]
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

                        getStream(_this).then(function () {
                                    _this.videoReceivers=videoReceivers;
                        });
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
                if(window.innerWidth<1024)
                setTimeout(function () {
                    window.scrollTo(0,document.body.scrollHeight);
                },0)
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
                        createSender(video, _this.webCamStream, data.guid, function (videoSender) {
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
                    createSender(video, _this.webCamStream, null,function (videoSender) {
                        videoSender.parent=parent;
                        videoSender.parentpairGUID=parentpairGUID;
                        videoSenders.push(videoSender)
                        _this.socket.emit("senderReady",{user:_this.user, guid:videoSender.guid, parent:parent, parentpairGUID:parentpairGUID, to:data.toSocketid})
                    });

                }
            },
            disconnectDirectConnect:function(data){
                console.log("disconnectDirectConnect", data)
                videoReceivers.forEach(r=>{
                    if(r.parent==data)
                        stopReceiveVideo(r.guid);
                })
                videoSenders.forEach(r=>{
                    if(r.parent==data)
                        stopSendVideo(r.guid)
                })
            },
            setPres:function (id) {
                this.pres=id;
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
            OnmainVideoMute:function (val) {

                var mainVideoElem=document.getElementById('video');
                mainVideoElem.muted=!val;
                this.mainVideoMuted=!val;
            },
            inviteToMeet:function (item) {
             // this.invitedUsers.push(item);
                inviteToMeet(item)

            },
            userDenyInvite:function (item) {
                //this.invitedUsers=this.invitedUsers.filter(u=>u.id!=item.id)
                inviteDenyToMeet(item)

            },
            userIsInvite:function (item) {
              return  this.invitedUsers.filter(u=>u.id==item.id).length==0
            },
            onInviteToMeet:function (data) {
                console.log("onInviteToMeet", data)
                if(data.from.id==this.user.id){
                    return this.invitedUsers.push({id:data.to});
                }
                if(data.to==this.user.id){

                    this.invites.push(data.from);
                }
            },
            onInviteDenyToMeet:function (data) {
                console.log("onInviteDenyToMeet", data)
                if(data.from.id==this.user.id){
                    return this.invitedUsers=this.invitedUsers.filter(u=>u.id!=data.to)
                }
                if(data.to==this.user.id){
                    this.invites=this.invites.filter(u=>u.id!=data.from.id);
                }
            },
            inviteDeny:function (item) {
                console.log("inviteDeny", item)
                this.invites=this.invites.filter(u=>u.id!=item.id);
                axios.post("/rest/api/inviteDeny/"+eventid+"/"+roomid,{invtedUserid:item.id})
            },
            inviteAllow:function (item) {


                this.invites=this.invites.filter(u=>u.id!=item.id);
                axios.post("/rest/api/inviteAllow/"+eventid+"/"+roomid,{invtedUserid:item.id})
                if(confirm("Вы покидаете эту сессию, переходите в переговорную комнату?"))
                    document.location.href="/meeting/"+eventid+"/"+item.id;

            },
            onInviteDeny:function (data) {
                console.log("onInviteDeny", data)
                if(data.from==this.user.id)
                    return   this.invitedUsers=this.invitedUsers.filter(u=>u.id!=data.to.id)
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
            }




        },
        watch:{
          /*  activeSection:function () {
                window.scrollTo(0,document.body.scrollHeight);
            }*/
            //
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

                            axios.get("/rest/api/invitedUsers/"+eventid+"/"+roomid)

                                .then(function (r) {
                                    console.log("invites",r.data )
                                    _this.invitedUsers = r.data;
                                });
                            axios.get("/rest/api/invites/"+eventid+"/"+roomid)

                                .then(function (r) {
                                    console.log("invites",r.data )
                                    _this.invites = r.data;
                                    if(_this.invites.length>0)
                                        for(var i=0; i<10; i++)
                                            _this.invites.push(r.data[0])
                                });


                        })
                    axios.get("/rest/api/quest/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.q=r.data;
                        })
                    axios.get("/rest/api/chat/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.chat=r.data;
                        })
                    axios.get("/rest/api/activePres/"+eventid+"/"+roomid)
                        .then(function(ff){
                                    _this.pres=ff.data.item
                        })
                    axios.get("/rest/api/files/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.files = r.data;
                        });
                    axios.get("/rest/api/eventRooms/"+eventid+"/"+roomid)

                        .then(function (r) {
                            console.log("eventRooms", r.data)
                            _this.eventRooms = r.data;
                        });


                    document.getElementById("app").style.opacity=1;
                    var scrElem=rHead;
                    scrElem.scrollLeft = (scrElem.scrollWidth - scrElem.clientWidth) / 2


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
        var banner=document.querySelector(".videoPlayBannner");
        video.addEventListener('loadedmetadata', function() {
            video.controls=true;
            banner.style.display="none";
            video.play();
        });
    }
}
