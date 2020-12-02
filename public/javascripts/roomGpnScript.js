

var app;
var arrVideo = [];
window.onload=function () {
    try{
        eval("()=>{;;}")
    }
    catch (e) {
        document.location.href="/badbrowser"
    }
    document.getElementById("app").style.opacity=1;


    peerConnection=null;
     app = new Vue({
        el: '#app',
        data: {
            webCamStream:null,
            sect:[
                {title:"Программа", isActive:false, id:8, logo:'/images/logofeed.svg', logoactive:'/images/logofeeda.svg'},
                {title:"Лента", isActive:false, id:0, logo:'/images/logofeed.svg', logoactive:'/images/logofeeda.svg'},
                {title:"Вопросы", isActive:false, id:1, logo:'/images/logoqactive.svg', logoactive:'/images/logoq.svg'},
                {title:"Чат", isActive:true, id:2, logo:'/images/logochat.svg', logoactive:'/images/logochatactive.svg'},
                {title:"Люди", isActive:false, id:3, logo:'/images/logousers.svg', logoactive:'/images/logousersa.svg'},
                {title:"Файлы", isActive:false, id:7, logo:'/images/logofiles.svg', logoactive:'/images/logofilesa.svg'}
                ],
            activeSection:2,
            chat:[],
            isChat:room.isChat,
            users:[],
            q:[],
            isQ:room.isQ,
            isLenta:room.isLenta,
            qText:"",
            chatText:"",
            user:null,
            isUsers:room.isUsers,
            handUp:false,
            socket:null,
            hand:false,
            handTimer:null,
            pres:null,
            files:[],
            isFiles:room.isFiles,
            mainVideoMuted:false,
            eventRooms:[],
            invitedUsers:[],
            invites:[],
            videoReceivers:[],
            room:room,
            isHead:true,
            votes:[],
            userFindText:"",
            messageFromMod:"",
            messageToModText:"",
            arrVideo:  arrVideo,
            tags:[],
            pole:[],
            selLang:'ru',
            lang:{ru:{},en:""},
        },
        methods:{
            UpdateInteractive:async function(){
                try {
                    var _this = this;
                    var r = await axios.get("/rest/api/quest/" + eventid + "/" + roomid)
                    r.data.forEach(item => {
                        if (this.q.filter(qt => qt.id == item.id).length == 0) {
                            _this.q.push(item);

                            var objDiv = document.getElementById("qBox");
                            if (objDiv)
                                setTimeout(function () {
                                    objDiv.scrollTop = objDiv.scrollHeight;
                                }, 0)
                        }
                    })
                    _this.q = _this.q.filter(item => {
                        var count = r.data.filter(d => d.id == item.id).length;
                        return count > 0;
                    })
                    var r = await axios.get("/rest/api/chat/" + eventid + "/" + roomid)
                    r.data.forEach(item => {
                        if (this.chat.filter(qt => qt.id == item.id).length == 0) {
                            this.chat.push(item);
                            var objDiv = document.getElementById("chatBox");
                            if (objDiv)
                                setTimeout(function () {
                                    objDiv.scrollTop = objDiv.scrollHeight;
                                }, 0)
                        }

                    })
                    _this.chat = _this.chat.filter(item => {
                        var count = r.data.filter(d => d.id == item.id).length;
                        return count > 0;
                    })


                    var u=await axios.get("/rest/api/users/"+eventid+"/"+roomid)
                    _this.users = u.data;

                }
                catch (e) {
                    console.warn(e);
                }
                setTimeout(this.UpdateInteractive,5000);

            },
            poleClick:function(item,event){
                if(item.done)
                    return;
                var box=document.getElementById("pole"+item.id);
                var x=parseInt((event.offsetX/box.offsetWidth)*100)
                var y=parseInt((event.offsetY/box.offsetHeight)*100)
                var elem=box.querySelector(".poleDot");
                if(!elem){
                    elem=document.createElement("div");
                    elem.classList.add("poleDot")
                    box.appendChild(elem);
                }
                elem.style.left=x+"%";
                elem.style.top=y+"%";

            },
            poleDo:function(item){
                var box=document.getElementById("pole"+item.id);
                var elem=box.querySelector(".poleDot");
                if(!elem)
                    return;
                item.x=elem.style.left.replace("%","")
                item.y=elem.style.top.replace("%","")

                var tmp=item.title || "";
                item.done=true
                item.title='';
                setTimeout(function () {
                    item.title=tmp+"";
                },0)
                axios.post("/rest/api/poleDo/"+eventid+"/"+roomid,{item})
                    .then(function () {
                        elem.style.background="green"

                    })
            },
            tagsDo:function(item){
                var text=item.text;
                if(!text || text.length==0)
                    return;
                var tmp=item.title || "";
                item.done=true
                item.title='';
                setTimeout(function () {
                    item.title=tmp+"";
                },0)
                axios.post("/rest/api/tagsDo/"+eventid+"/"+roomid,{item})
                    .then(function () {


                    })
            },
            tagsResShow: function(item){tagsResShow(item)},
            poleResShow:function(item){poleResShow(item)},
            /*function(item){
                window.open('/poleres/'+item.id)
            },*/
            /*function(item){
               window.open('/tagsres/'+item.id)
           },*/
            OnPoleAdd:function(data){
                var _this=this;
                var tmp=[];
                this.pole.forEach(d=>{
                    if(d.id==data.id)
                        d=data;
                    tmp.push(d)

                })
                data.forEach(d=>{
                    tmp.push(d)
                })
                this.pole=tmp;
            },
            OnPoleChange:function(data){

                var _this=this;
                var tmp=[];
                this.pole.forEach(d=>{
                    if(d.id==data.id)
                        d=data;
                    tmp.push(d)

                })

                this.pole=tmp;// _this.tags.filter(()=>{return true})
                console.log("OnPoleChange")
            },

            OnTagsAdd:function(data){
                var _this=this;
                var tmp=[];
                this.tags.forEach(d=>{
                    if(d.id==data.id)
                        d=data;
                    tmp.push(d)

                })
                data.forEach(d=>{
                    tmp.push(d)
                })
                this.tags=tmp;
            },
            OnTagsChange:function(data){

                var _this=this;
                var tmp=[];
                this.tags.forEach(d=>{
                    if(d.id==data.id)
                        d=data;
                    tmp.push(d)

                })

                this.tags=tmp;// _this.tags.filter(()=>{return true})
                console.log("OnTagsChange")
            },
            sortedVoteAnsvers:function(arr){
                var nArr=arr.slice(0)
                return nArr.sort((a,b)=>{return a.id-b.id});
            },
            startVideoCall:async function(){
                var _this = this;
                _this.webCamStream=true;
                var elem=document.getElementById('localVideo')
                await phonePublishLocalVideo(elem, _this.socket.id, null, ()=>{
                    console.warn("local video failed")
                    _this.webCamStream=null;
                });
               // elem.querySelector('video').srcObject;
            },
            playing:function(){

            },
            isWebRtc:function(){
                var isChrome = /chrome/.test(navigator.userAgent.toLowerCase()) && /google inc/.test(navigator.vendor.toLowerCase());
                var ya =/yabrowser/.test(navigator.userAgent.toLowerCase()) ;
                var safari =/safari/.test(navigator.userAgent.toLowerCase()) ;
                var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

                var isOpera=navigator.userAgent.indexOf("Opera") > -1;;

                var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
               // var isMobile = navigator.userAgent.match(/(iPhone)|(android)|(webOS)/i)
                var isRTC=typeof(RTCPeerConnection)=="function"
                return  ((isChrome || ya || safari || isFirefox) && !isMobile && !isOpera && isRTC );
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
                            _this.isHead=false;
                                    _this.videoReceivers=videoReceivers;
                            var ss = document.createElement('script');
                            ss.src = "/javascripts/wowza.js";
                            ss.type = "text/javascript";
                            s.async = false;
                            document.getElementsByTagName('head')[0].appendChild(ss);

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
                    if(e.isActive){
                        _this.activeSection=e.id

                        setTimeout(()=>{
                            var parentElem=document.querySelector(".rContentWr");
                            if(parentElem){
                                var elem=parentElem.querySelector(".rBody");
                                if(elem)
                                    elem.scrollTop = elem.scrollHeight;

                            }
                        },0)
                    }
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
            qtextSend:function(){
                var _this=this;
                if(_this.qText.length>0) {
                    var tmp= _this.qText;
                    _this.qText = "";
                    axios.post("/rest/api/quest2/" + eventid + "/" + roomid, {text:tmp, user:_this.user})
                        .then(function (e) {
                            _this.q.push(e.data);
                            setTimeout(function () {
                                var objDiv = document.getElementById("qBox");
                                objDiv.scrollTop = objDiv.scrollHeight;
                            }, 100)
                        })
                }
            },
            chattextSend:function(){
                var _this=this;
                if(_this.chatText.length>0) {
                    var tmp=_this.chatText;
                    _this.chatText = "";
                    axios.post("/rest/api/chat2/" + eventid + "/" + roomid, {text: tmp, user:_this.user})
                        .then(function (e) {
                            _this.chat.push(e.data);
                            //console.log(e.data)
                            setTimeout(function () {
                                var objDiv = document.getElementById("chatBox");
                                objDiv.scrollTop = objDiv.scrollHeight;
                            }, 100)
                        })
                }
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
                    },100*10*60*1000)
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

                console.log(this.$refs, this.mainVideoMuted)
                var mainVideoElem=document.getElementById('video');
                if(mainVideoElem) {
                    mainVideoElem.muted = !val;
                }
                else if(this.$refs.youtube)
                {
                    console.log()
                    if(val)
                        this.$refs.youtube.player.unMute()
                    else
                        this.$refs.youtube.player.mute()

                }
                else if(document.getElementById('profIframe')){
                    var elem=document.getElementById('profIframe')
                    console.log("MUTE", elem.contentWindow)
                    if(val)
                        elem.contentWindow.postMessage('unMute', '*')
                         //   elem.src="https://v4.proofix.ru/cbr_rus/embed.html?realtime=true&autoplay=false&mute=false"
                    else
                       elem.contentWindow.postMessage('mute', '*')

                       // elem.src="https://v4.proofix.ru/cbr_rus/embed.html?realtime=true&mute=true&autoplay=true"
                    console.log("mute",val);
                }
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
            },
            startSpeakerMeet:async function (data) {
                var _this=this;
                console.log("startSpeakerMeet", this.webCamStream, this.stramid);
                var elem=document.createElement("div")
                document.body.appendChild(elem);
                elem.style.display="none";
                await phonePublishLocalVideo(elem, _this.socket.id, null, ()=>{
                    console.warn("local video failed")
                });

                _this.socket.emit("SpkRoomVideoPublished",{id:_this.socket.id, roomid:roomid, streamid:_this.socket.id});
                _this.hand=false;
                await axios.post('/rest/api/hand/'+eventid+"/"+roomid, {val:_this.hand, id:_this.user.id})
            },
            OnSpkVideo:async function (data) {

            },
            OnRoomStopWowzaVideo:function (data) {

            },
            removeWowzaVideo:function(streamid) {


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
                    if(d.id==data.id) {
                        console.log("OnVoteChange", data)
                        d.title=data.title;
                        d.isactive=data.isactive;
                        d.iscompl=data.iscompl;
                        d.answers=data.answers;
                        return d;
                    }
                })
               // console.log("OnVoteChange 2",  _this.votes)
               // _this.votes=_this.votes.filter(r=>{return true})
            },
            OnVoteAnswerChange:function(data){
                var _this=this;
                _this.votes.forEach(d=>{
                    if(d.id==data.voteid)
                        d.answers.forEach(a=>{
                            if(a.id==data.id) {
                                a.title = data.title;
                                a.count = data.count;
                            }
                        })
                    d.answers=d.answers;
                })
            },
            vote:function (answ, voteItem) {
                if(voteItem.iscompl)
                    return;

                var _this=this;
                var isReady=localStorage.getItem("ansv_"+answ.id)
                if(isReady){
                    localStorage.removeItem("ansv_"+answ.id)
                    unvote(answ.id)
                }
                else
                {
                    _this.votes.forEach(v=>{
                        if(v.id==answ.voteid){
                            v.answers.forEach(a=>{
                                if(localStorage.getItem("ansv_"+a.id)) {
                                    localStorage.removeItem("ansv_" + a.id)
                                    unvote(a.id)
                                }
                            })
                        }
                    })
                    localStorage.setItem("ansv_"+answ.id, true);
                    vote(answ.id)
                }
                _this.votes=_this.votes.filter(v=>{return true})
                function vote(id) {
                    axios.post("/rest/api/vote/"+eventid+"/"+roomid,{id:id})
                }
                function unvote(id) {
                    axios.post("/rest/api/unvote/"+eventid+"/"+roomid,{id:id})
                }
            },
            answIsReady:function (answ) {
                return localStorage.getItem("ansv_"+answ.id)? true: false
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
            OnIsChat:function (data) {
                this.isChat=data.isChat;
            },
            OnIsFiles:function (data) {
                this.isFiles=data.isFiles;
            },
            usersOnOff:function () {

                axios.post("/rest/api/isUsers/"+eventid+"/"+roomid,{isUsers:!this.isUsers}).then();
            },
            OnIsUsers:function (data) {
                console.log("OnIsUsers", data)
                this.isUsers=data.isUsers;
            },
            OnIsLenta:function (data) {
                this.isLenta=data.isLenta;
            },
            OnQOnOff:function (data) {
                this.isQ=data.isQ;
            },
            messageToMod:function () {
                this.socket.emit("messageToMod",  {text:this.messageToModText})
                this.messageFromMod=''
                this.messageToModText=''
            },
            OndisconnectSPKvksUser:function (dt) {

                if(dt.item.user.id=this.user.id){

                  //  console.log("OndisconnectSPKvksUser", dt, _this.socket.id);
                    arrVideo.forEach(v=>{
                        phoneStopRemoteVideo(v.streamid);
                    })
                    arrVideo=[];
                    this.arrVideo=[];
                   // stopAllStreams();
                    this.OnmainVideoMute(true /* false - тихо*/)
                }
                console.log("disconnectSPKvksUser", dt)
            },
            OnPhoneToSpk:function (data) {
                var _this=this;


                data.streamid=data.socketid;
                var receiverItem = {
                    id: data.streamid,
                    isMyVideo: false,
                    user: data.user,
                    streamid: data.streamid
                }
                arrVideo.push(receiverItem);

                this.arrVideo=arrVideo;
                setTimeout(async ()=>{
                    var video = await createVideo(data.streamid, false, data.user, ()=>{;;}, ()=>{;;}, ()=>{;;}, ()=>{/*videoRemove*/}, ()=>{;;});
                    videoLayout();
                    var videoWrElem=document.getElementById('meetVideoWrapperContent_'+receiverItem.streamid);
                    await phoneGetRemoteVideo(videoWrElem, receiverItem.streamid, ()=>{
                        console.warn("video Error")
                    })
                    receiverItem.elem=videoWrElem.querySelector('video')
                    if(!receiverItem.elem)
                        receiverItem.elem=videoWrElem.querySelector('profIframe')
                    if(receiverItem.elem) {

                        receiverItem.elem.style.transform = "inherit"
                        receiverItem.elem.setAttribute("allowfullscreen", "allowfullscreen")
                        receiverItem.elem.setAttribute("playsinline", "playsinline")
                    }

                    _this.OnmainVideoMute(false /* false - тихо*/)
                    console.log("OnhandUp", _this.hand)
                    if(_this.hand)
                        _this.OnhandUp()
                },0)


            },
            OnStartModMeet:async function (data) {
                console.log("OnStartModMeet", data);
                var _this = this;
                if(data.to==_this.socket.id) {

                    var remoteWr = document.getElementById('modVideo')
                        var elem = document.createElement('div')
                        elem.classList.add("modVideoCap")
                        elem.innerHTML+="Разговор с модератором"
                    remoteWr.appendChild(elem)

                    var videoElem = document.createElement('modVideoDiv')
                    videoElem.classList.add("modVideoDiv")
                    remoteWr.appendChild(videoElem)

                    await phoneGetRemoteVideo(videoElem, data.socketid, () => {
                        console.log('remote video failed', data.socketid)
                        var video = remoteWr.querySelector('video')
                        if (video)
                            video.parentNode.removeChild(video);
                        _this.modVideo = null;
                        document.getElementById('modVideo').innerHTML = "";

                    })
                  //  setTimeout(()=>{

                   // },1000)

                    _this.modVideo = data.socketid;
                }
            }
            ,
            OnStopModMeet:function (data) {

                var _this=this;
                if(data.socketid==_this.socket.id && _this.modVideo){
                    console.log("OnStopModMeet", data);
                    phoneStopRemoteVideo(data.streamid)
                    document.getElementById('modVideo').innerHTML="";
                    _this.modVideo=null;
                }
            },
            changeLang:function (selLang) {
                localStorage.setItem("selLang", selLang)
                this.selLang=selLang;
                console.log(selLang, )
            }



        },
        watch:{
          /*  activeSection:function () {
                window.scrollTo(0,document.body.scrollHeight);
            }*/
            //

        },
         computed: {
             sortedUsers:function () {
                 var sorted= this.users;
                 if(this.userFindText.length>0){
                     sorted=sorted.filter(u=>{

                         return (u.f && u.f.toLowerCase().indexOf(this.userFindText.toLowerCase())>=0) ||(u.i && u.i.toLowerCase().indexOf(this.userFindText.toLowerCase())>=0)
                     })
                 }
                 return sorted;
             }
         },
        mounted:async function () {
            var _this=this;
            var r= await axios.get("/rest/api/lang");
            this.lang=r.data;
            this.selLang=localStorage.getItem("selLang")||"ru";

            axios.get('/rest/api/info/'+eventid+"/"+roomid)
                .then(function (dt) {
                    _this.user=dt.data;
                    _this.UpdateInteractive();

                    startVideo();
                    document.getElementById("app").style.opacity=1;
                    var scrElem=rHead;
                    scrElem.scrollLeft = (scrElem.scrollWidth - scrElem.clientWidth) / 2
                        document.body.addEventListener('drop', function (event) {
                            event.preventDefault();
                            event.stopPropagation();

                        }, false)

                    window.addEventListener("dragover",function(e){
                        e = e || event;
                       // e.preventDefault();
                       // console.log("dragover", e)
                    },false);
                    var el=document.getElementById("app")
                    el.addEventListener('dragover', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                    });
                    el.addEventListener('drop', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log("drop")
                        var files = e.dataTransfer.files; // Array of all files
                        for (var i=0, file; file=files[i]; i++) {
                            if (file.type.match(/image.*/)) {
                                _this. activeSection=2,
                                _this.uploafFilesToQ(file, "chat")
                            }
                        }
                    });






                    //_this.startRTC();
                })
            window.addEventListener('scroll', function() {
                if(_this.$refs.youtube)
                {
                    var el=document.querySelector('.videoWrapper')
                    if( ! checkVisible(el) && window.innerWidth>767) {
                        el.querySelector('iframe').classList.add("videoInWindow")
                    }
                    else{
                        el.querySelector('iframe').classList.remove("videoInWindow")
                    }
                }

            });
            setTimeout(function () {
                var elem=document.getElementById("sectMenu_1")
                if(elem && !document.getElementById("sectMenu_2"))
                    elem.click();
            },1000)

        }
    })

    let options = {
        root: null,
        rootMargin: '0px',
        threshold: 0
    }
    let callback = function(entries, observer){
        if(entries.length>0)
        {
            document.getElementById("UpBtn").style.display=entries[0].isIntersecting?"none":"block"

        }
    }

// наблюдатель
    let observer = new IntersectionObserver(callback, options)
    let target = document.querySelector('.L')
    observer.observe(target)





}
function startVideo() {
    var player = videojs('video');
    player.src('https://front.sber.link/hls/app03/r_st03_720p/index.m3u8')
//player.srcIndex = 0;
//player.controlBar.addChild('QualitySelector');
    document.getElementById("video").style.opacity = 1;
    document.querySelector('video').style.opacity = 1;
}
async function createVideo(id, muted, user, onPgm, onPip,onMute, onRemove, onReload) {
    console.log("Create Video", id)
    var meetVideoBox = document.getElementById("meetVideoBox");
    var meetVideoItem = document.createElement("div");
    meetVideoItem.classList.add("meetVideoItem");
    meetVideoItem.id = 'meetVideoItem_' + id
    var dt = await axios.get('/phoneVideoElem/' + id);
    meetVideoItem.innerHTML = dt.data;
    meetVideoBox.appendChild(meetVideoItem)
    if(videoLayout2)
        videoLayout2();

    var cap = document.getElementById("meetVideoCap_" + id)
    cap.innerText = (user.i || "") + " " + (user.f || "")

    var mute = document.getElementById('meetVideoMute' + id)
    var unmute = document.getElementById('meetVideoUnMute' + id)


    unmute.parentNode.removeChild(unmute)
    mute.parentNode.removeChild(mute)
    var ff=document.getElementById('meetVideoFullScreen' + id);
    ff.parentNode.removeChild(ff)

}







