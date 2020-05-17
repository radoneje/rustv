var app;
window.onload=function () {
    try{
        eval("\"use strict\";const s=()=>{;;}; s();")
    }
    catch (e) {
        document.location.href="/badbrowser"
    }
    var WowzaCfg = null;
    var BitrateCfg = null;
    var arrVideo = [];
    var arrAudio = [];

    var wowzaRecievers=[];
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
            stageChatText:"",
            stageChat:[],
            user:null,
            isUsers:room.isUsers,
            handUp:false,
            socket:null,
            files:[],
            isFiles:room.isFiles,
            eventRooms:[],
            invitedUsers:[],
            invites:[],
            videoReceivers:[],
            room:room,
            isHead:true,
            votes:[],
            userFindText:"",
            langCh: [],
            showLangCh: false,
            constraints:null,
            firstConnect: true,
            isMyVideo:false,
            isMyVideoEnabled:false,
            isMyMute:false,
            isMyDtShow:false,
            isMod:isMod,
            init:false,
            messageFromMod:"",
            messageToModText:""
        },
        methods:{

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
            StagechattextSend(_this){

                if(this.stageChatText.length>0)
                    stageChattextSend(this) ;
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
            stageChatTextChange:function(e){

                var _this=this;
                if(this.stageChatText.length>0)
                    stageChattextChange(_this, e);
                else
                    document.getElementById('stageChatText').focus()
            },
            chatAddSmile:function () {
                this.chatText+=" :) ";
                document.getElementById("chatText").focus();
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
            startMyVideo:async function () {
                var _this=this;
                _this.isMyVideo=true;
                var videoItem = {id: _this.socket.id, isMyVideo: true, user: _this.user}
                arrVideo.push(videoItem);
                await createVideo(videoItem.id, videoItem.isMyVideo, _this.user, _this.videoPgm, _this.videoPIP, _this.videoMute, _this.videoRemove, _this.videoReload);
                var videoWr=document.getElementById("meetVideoWrapperContent_" + videoItem.id);
                await phonePublishLocalVideo(videoWr, videoItem.id, null, ()=>{removeVideo(videoItem.id)});

                videoLayout();
                videoItem.streamid = _this.socket.id;
                videoItem.elem = videoWr.querySelector('video');
                videoItem.elem.setAttribute("allowfullscreen","allowfullscreen")
                videoItem.elem.setAttribute("playsinline","playsinline")
                videoItem.stream = videoItem.elem.srcObject;
                videoItem.audioElem = document.getElementById('meetVideoLevel' + videoItem.id)
                videoItem.analiser = await createAudioAnaliser(videoItem.stream, (val) => {
                    // console.log(val, parseFloat((val/100)*100));
                    videoItem.audioElem.style.height = parseFloat((val / 100) * 100) + "%"
                })
                setTimeout(() => {
                    socket.emit("newStageStream", {
                        user: _this.user,
                        isDesktop: false,
                        roomid: room.id,
                        streamid: videoItem.id
                    });

                }, 0);

                return ;

            },
            OnNewStageStream:async function (data) {
                console.log("OnNewStageStream")
                var _this=this;
                if (roomid != data.roomid)
                    return; //видео чужих комнат
                var ff = arrVideo.filter(v => v.streamid == data.streamid)
                if (ff.length > 0)
                    return;//убираем повтор моего видео
                console.log("OnNewStageStream ALLOW")
                var receiverItem = {
                    id: data.streamid,
                    isMyVideo: false,
                    user: data.user,
                    streamid: data.streamid
                }
                arrVideo.push(receiverItem)


                var video = await createVideo(data.streamid, false, data.user, _this.videoPgm, _this.videoPIP, _this.videoMute, _this.videoRemove, _this.videoReload);
                videoLayout();

                var videoWrElem=document.getElementById('meetVideoWrapperContent_'+receiverItem.streamid);
                await phoneGetRemoteVideo(videoWrElem, receiverItem.streamid, ()=>{removeVideo(receiverItem.streamid)})
                receiverItem.elem=videoWrElem.querySelector('video')
                receiverItem.elem.style.transform="inherit"
                receiverItem.elem.setAttribute("allowfullscreen","allowfullscreen")
                receiverItem.elem.setAttribute("playsinline","playsinline")

                return ;




            },
            onCloseStageStream:function (streamid) {
                console.log("onCloseStageStream", streamid, arrVideo)
                arrVideo.forEach(receiverItem=>{
                    if(receiverItem.streamid==streamid){
                        removeVideo(receiverItem.streamid)
                    }
                })
                arrVideo=arrVideo.filter(r=>{return r.streamid!=streamid});
                videoLayout();
            },
            myVideoMute: function () {
                var _this = this;
                var els = arrVideo.filter(r => r.isMyVideo && !r.isDesktop)
                if (els.length == 0)
                    return;
                var item = els[0];
                _this.isMyMute = !_this.isMyMute;
                item.stream.getTracks().forEach(tr => {
                    if (tr.kind == "audio") {
                        tr.enabled = !_this.isMyMute;
                    }
                })
            },
            myVideoBlack: function () {
                var _this = this;
                var els = arrVideo.filter(r => r.isMyVideo && !r.isDesktop)
                if (els.length == 0)
                    return;
                var item = els[0];
                _this.isMyVideoEnabled = !_this.isMyVideoEnabled;
                item.stream.getTracks().forEach(tr => {
                    if (tr.kind == "video") {
                        tr.enabled = !_this.isMyVideoEnabled;
                    }
                })
            },
            showDesktop: async function () {
                var _this = this;
                var stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: false});
                var videoItem = {id: 2, isMyVideo: true, isDesktop: true, user: _this.user}
                arrVideo.push(videoItem)
                videoItem.stream = stream;
                videoItem.streamid = socket.id + createUUID(4)+"Dt";
                videoItem.id = videoItem.streamid ;
                await createVideo(videoItem.id, true, _this.user, _this.videoPgm, _this.videoPIP, _this.videoMute, _this.videoRemove, _this.videoReload)
                var videoWr=document.getElementById("meetVideoWrapperContent_" + videoItem.id);
                await phonePublishLocalVideo(videoWr, videoItem.id, stream, ()=>{removeVideo(videoItem.id)});
                videoLayout();
                videoItem.elem = videoWr.querySelector('video');
                videoItem.elem.setAttribute("allowfullscreen","allowfullscreen")
                videoItem.elem.setAttribute("playsinline","playsinline")

                videoItem.elem.style.transform="inherit"
                videoItem.stream = videoItem.elem.srcObject;
                setTimeout(() => {
                    socket.emit("newStageStream", {
                        user: _this.user,
                        isDesktop: true,
                        roomid: room.id,
                        streamid: videoItem.id
                    });

                }, 0);
                _this.isMyDtShow = true;

                stream.getVideoTracks()[0]
                    .addEventListener('ended', () => {
                        _this.hideDesktop();
                    })

                return ;

            },
            hideDesktop: function () {
                var _this = this;
                var v = arrVideo.filter(r => r.isMyVideo && r.isDesktop);
                if (v.length > 0) {

                    v[0].elem.srcObject.getTracks().forEach(tr=>{tr.stop()})
                    _this.isMyDtShow = false;
                    socket.emit("closeStageStream", v[0].streamid);
                }


            },
            videoPgm:function (data) {
                socket.emit("videoPgm", data);
            },
            videoPIP:function (data) {
                socket.emit("videoPIP", data);
            },
            videoMute:function (data) {
                socket.emit("videoMute", data);
            },
            videoRemove:function (data) {
                if(confirm("Вывести пользователя?"))
                    socket.emit("videoRemove", data);
            },
            videoReload:function (data) {
                if(confirm("Перезагрузить страницу у пользователя?"))
                    socket.emit("videoReload", data);
            },
            OnVideoMute:function (data) {
               console.log("OnVideoMute", data)
                arrVideo.forEach(item=>{
                    if(item.streamid==data.streamid && !item.isMyVideo){
                        item.elem.muted=data.val;
                    }
                })
            },
            OnVideoPIP:function (data) {
                if(!isPgm)
                    return;
                arrVideo.forEach(item=>{
                    if(item.streamid==data.streamid)
                    {
                        item.pgm=false;
                        item.pip=data.val;
                    }
                    else
                        item.pip=false;
                })
                videoLayout();
            },
            OnVideoPgm:function (data) {
                console.log("PGM")
                if(!isPgm)
                    return;
                console.log("PGM 1")
                arrVideo.forEach(item=>{
                    if(item.streamid==data.streamid)
                    {
                        item.pgm=data.val;
                        item.pip=false;
                        console.log("PGM2")
                    }
                    else
                        item.pgm=false;
                })
                console.log("arrVideo ", arrVideo)
                videoLayout();
            },
            initStage:async function(){
                var _this=this;
                _this.init=true;
                WowzaCfg = await axios.get('/rest/api/meetWowza')
                BitrateCfg = await axios.get('/rest/api/meetBitrate')
                var dt = await axios.get('/rest/api/constraints');
                _this.constraints = dt.data;
                _this.firstConnect = false;
                if(!isMod &&  !isPgm)
                    _this.startMyVideo();
                setTimeout(() => {
                    console.log("getMeetingVideos");
                    socket.emit("getStageVideos");
                }, 0);
            },
            messageToUser:function (item) {
                item.messageToUser="";

                this.socket.emit("messageToUser", {userid:item.id, text:item.messageToUserText})
                item.messageToUserText=""
            },
            OnMessageToMod:function(data){
                console.log("OnMessageToMod", data)
                this.users.forEach(u=>{
                    if(u.id==data.user.id) {
                        u.messageToUser = data.text;
                        var f=u.f;
                        u.f="";
                        setTimeout(()=>{u.f=f},0)
                    }

                })
            },
            messageToMod:function () {
                this.socket.emit("messageToMod",  {text:this.messageToModText})
                this.messageFromMod=''
                this.messageToModText=''
            },
            setUserSteaker:function(item){
                if(typeof (item.color)=="undefined")
                    item.color = 1;
                else
                {
                    item.color++;
                    if(item.color>3)
                        item.color=0;
                }
                var f=item.f;
                item.f="";
                setTimeout(()=>{item.f=f},0)
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
            if(roomid==52) {
                _this.sect = [
                    {
                        title: "Программа",
                        isActive: false,
                        id: 8,
                        logo: '/images/logofeed.svg',
                        logoactive: '/images/logofeedaCl.svg'
                    },
                    {
                        title: "Лента",
                        isActive: false,
                        id: 0,
                        logo: '/images/logofeed.svg',
                        logoactive: '/images/logofeedaCl.svg'
                    },
                    {
                        title: "Вопросы",
                        isActive: false,
                        id: 1,
                        logo: '/images/logoqactive.svg',
                        logoactive: '/images/logoqCl.svg'
                    },
                    {
                        title: "Чат",
                        isActive: true,
                        id: 2,
                        logo: '/images/logochat.svg',
                        logoactive: '/images/logochatactiveCl.svg'
                    },
                    {
                        title: "Люди",
                        isActive: false,
                        id: 3,
                        logo: '/images/logousers.svg',
                        logoactive: '/images/logousersaCl.svg'
                    },
                    {
                        title: "Файлы",
                        isActive: false,
                        id: 7,
                        logo: '/images/logofiles.svg',
                        logoactive: '/images/logofilesaCl.svg'
                    }
                ];
            }
            if(roomid==61) {
                _this.sect = [
                    // {title:"Программа", isActive:false, id:8, logo:'/images/logofeed.svg', logoactive:'/images/logofeeda.svg'},
                    //{title:"Лента", isActive:false, id:0, logo:'/images/logofeed.svg', logoactive:'/images/logofeeda.svg'},
                    {
                        title: "Вопросы",
                        isActive: false,
                        id: 1,
                        logo: '/images/logoqactive.svg',
                        logoactive: '/images/logoq.svg'
                    },
                    {
                        title: "Чат",
                        isActive: true,
                        id: 2,
                        logo: '/images/logochat.svg',
                        logoactive: '/images/logochatactive.svg'
                    },
                    {
                        title: "Люди",
                        isActive: false,
                        id: 3,
                        logo: '/images/logousers.svg',
                        logoactive: '/images/logousersa.svg'
                    },
                    {
                        title: "Файлы",
                        isActive: false,
                        id: 7,
                        logo: '/images/logofiles.svg',
                        logoactive: '/images/logofilesa.svg'
                    }
                ]
            }
            axios.get('/rest/api/info/'+eventid+"/"+roomid)
                .then(async (dt)=> {
                    _this.user=dt.data;
                    connect(_this,roomid, function (socket) {
                        _this.socket=socket;
                        document.getElementById("app").style.opacity=1;
                    });

                    if(!isPgm) {
                        axios.get("/rest/api/users/" + eventid + "/" + roomid)
                            .then(function (r) {
                                _this.users = r.data;
                                //   console.log(_this.users)

                                axios.get("/rest/api/invitedUsers/" + eventid + "/" + roomid)

                                    .then(function (r) {
                                        console.log("invites", r.data)
                                        _this.invitedUsers = r.data;
                                    });
                                axios.get("/rest/api/invites/" + eventid + "/" + roomid)

                                    .then(function (r) {
                                        console.log("invites", r.data)
                                        _this.invites = r.data;
                                        if (_this.invites.length > 0)
                                            _this.invites.push(r.data[0])
                                    });


                            })
                        axios.get("/rest/api/quest/" + eventid + "/" + roomid)
                            .then(function (r) {
                                _this.q = r.data;
                            })
                        axios.get("/rest/api/chat/" + eventid + "/" + roomid)
                            .then(function (r) {
                                _this.chat = r.data;
                            })
                        axios.get("/rest/api/activePres/" + eventid + "/" + roomid)
                            .then(function (ff) {
                                //  _this.pres=ff.data.item
                            })
                        axios.get("/rest/api/files/" + eventid + "/" + roomid)
                            .then(function (r) {
                                _this.files = r.data;
                            });
                        axios.get("/rest/api/eventRooms/" + eventid + "/" + roomid)

                            .then(function (r) {
                                console.log("eventRooms", r.data)
                                _this.eventRooms = r.data;
                            });
                        axios.get("/rest/api/votes/" + eventid + "/" + roomid)
                            .then(function (r) {
                                console.log("votes", r.data)
                                _this.votes = r.data;
                            })


                        var scrElem = rHead;
                        scrElem.scrollLeft = (scrElem.scrollWidth - scrElem.clientWidth) / 2
                        document.body.addEventListener('drop', function (event) {
                            event.preventDefault();
                            event.stopPropagation();

                        }, false)

                        window.addEventListener("dragover", function (e) {
                            e = e || event;
                            // e.preventDefault();
                            // console.log("dragover", e)
                        }, false);
                        var el = document.getElementById("app")
                        el.addEventListener('dragover', function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'copy';
                        });
                        el.addEventListener('drop', function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log("drop")
                            var files = e.dataTransfer.files; // Array of all files
                            for (var i = 0, file; file = files[i]; i++) {
                                if (file.type.match(/image.*/)) {
                                    _this.activeSection = 2,
                                        _this.uploafFilesToQ(file, "chat")
                                }
                            }
                        });
                    }


                    if (_this.firstConnect) {


                    }
                    //startVideo();
                    //_this.startRTC();
                })
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
            var elem=document.getElementById("UpBtn")
                if(elem)
                elem.style.display=entries[0].isIntersecting?"none":"block"

        }
    }

// наблюдатель
    let observer = new IntersectionObserver(callback, options)
    let target = document.querySelector('.L')
    if(target)
        observer.observe(target)

    async function createVideo(id, muted, user, onPgm, onPip,onMute, onRemove, onReload) {
        console.log("Create Video", id)
        var meetVideoBox = document.getElementById("meetVideoBox");
        if(isPgm)
            meetVideoBox.classList.add("pgm")
        var meetVideoItem = document.createElement("div");
        meetVideoItem.classList.add("meetVideoItem");
        meetVideoItem.id = 'meetVideoItem_' + id
        var dt = await axios.get('/phoneVideoElem/' + id);
        meetVideoItem.innerHTML = dt.data;
        meetVideoBox.appendChild(meetVideoItem)


        var cap = document.getElementById("meetVideoCap_" + id)
        cap.innerText = (user.i || "") + " " + (user.f || "")

        var mute = document.getElementById('meetVideoMute' + id)
        var unmute = document.getElementById('meetVideoUnMute' + id)


        unmute.classList.add('btnHidden')
        mute.addEventListener('click', function (e) {
            var video = document.getElementById("meetVideoWrapperContent_" + id).querySelector('video')
            video.muted = true;
            unmute.classList.remove('btnHidden')
            mute.classList.add('btnHidden')
        })
        unmute.addEventListener('click', function (e) {

            var video = document.getElementById("meetVideoWrapperContent_" + id).querySelector('video')
            video.muted = false;
            mute.classList.remove('btnHidden')
            unmute.classList.add('btnHidden')
        })
        if (muted) {

            mute.parentNode.removeChild(mute)
            unmute.parentNode.removeChild(unmute)
        }
            document.getElementById('meetVideoFullScreen' + id).addEventListener("click", function () {
                console.log("requestFullscreen0", id)
                var video = document.getElementById("meetVideoWrapperContent_" + id).querySelector('video')
                console.log("requestFullscreen", video)
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.mozRequestFullScreen) {
                    video.mozRequestFullScreen();
                } else if (video.webkitRequestFullscreen) {
                    video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) {
                    video.msRequestFullscreen();
                } else if (video.webkitEnterFullScreen) {
                    video.msRequestFullscreen();
                }

            })


            if(isMod){
                var box=document.createElement("div");
                box.classList.add("modContollers")

                var btn=document.createElement("div");
                btn.classList.add("greenBtn")
                btn.classList.add("clearBtn")
                btn.id="pgmbtn"+id;
                btn.innerHTML="PGM";
                btn.classList.add("stageModBtn")
                btn.addEventListener("click",()=>{
                    if(btn2.classList.contains("active"))
                    {
                        btn2.classList.remove("active")
                       // return;
                    }

                    if(btn.classList.contains("active"))
                        btn.classList.remove("active")
                    else
                        btn.classList.add("active")
                    if(onPgm)
                        onPgm({streamid:id,val:btn.classList.contains("active")})

                    arrVideo.forEach(item=>{
                        if(item.id==id){
                            item.pgm=btn.classList.contains("active");
                            item.pip=btn2.classList.contains("active");
                        }
                        else
                        {
                                item.pgm=false;
                                document.getElementById("pgmbtn"+item.id).classList.remove("active")
                        }
                    })

                })
                box.appendChild(btn);

                var btn2=document.createElement("div");
                btn2.classList.add("greenBtn")
                btn2.classList.add("clearBtn")
                btn2.classList.add("stageModBtn")
                btn2.id="pipbtn"+id;
                btn2.innerHTML="PIP"
                box.appendChild(btn2);
                btn2.addEventListener("click",()=>{
                    if(btn.classList.contains("active"))
                    {
                        btn2.classList.remove("active")
                        return;
                    }
                    if(btn2.classList.contains("active"))
                        btn2.classList.remove("active")
                    else
                        btn2.classList.add("active")
                    if(onPip)
                        onPip({streamid:id,val:btn2.classList.contains("active")})
                    arrVideo.forEach(item=>{
                        if(item.streamid==id){
                            item.pgm=btn.classList.contains("active");
                            item.pip=btn2.classList.contains("active");
                        }

                    })


                })

                var btn3=document.createElement("div");
                btn3.classList.add("greenBtn")
                btn3.classList.add("clearBtn")
                btn3.classList.add("stageModBtn")
                btn3.id="mutebtn"+id;
                btn3.innerHTML="MUTE to All"
                box.appendChild(btn3);
                btn3.addEventListener("click",()=>{

                    if(btn3.classList.contains("active"))
                        btn3.classList.remove("active")
                    else
                        btn3.classList.add("active")
                    if(onMute) {
                        onMute({streamid: id, val: btn3.classList.contains("active")})
                    }
                    arrVideo.forEach(item=>{
                        if(item.streamid==id){
                            item.allMuted=btn3.classList.contains("active");
                        }

                    })

                })
                if(id!=0 ) {
                    var btn4 = document.createElement("div");
                    btn4.classList.add("greenBtn")
                    btn4.classList.add("warning")
                    btn4.classList.add("clearBtn")
                    btn4.classList.add("stageModBtn")
                    btn4.id = "banbtn" + id;
                    btn4.innerHTML = "remove"
                    box.appendChild(btn4);
                    btn4.addEventListener("click", () => {
                        if(onRemove)
                            onRemove({streamid:id})
                    })
                }
                var btn5 = document.createElement("div");
                btn5.classList.add("greenBtn")
                btn5.classList.add("warning")
                btn5.classList.add("clearBtn")
                btn5.classList.add("stageModBtn")
                btn5.id = "banbtn" + id;
                btn5.innerHTML = "reload"
                box.appendChild(btn5);
                btn5.addEventListener("click", () => {
                    console.log("onReload", onReload)
                    if(onReload)
                        onReload({streamid:id})
                })


                meetVideoItem.appendChild(box)

            }

    }
    async function createAudioAnaliser(stream, clbk) {
        try {
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;
            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);
            javascriptNode.onaudioprocess = function () {
                var array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                var values = 0;
                var length = array.length;
                for (var i = 0; i < length; i++) {
                    values += (array[i]);
                }
                var average = values / length;
                //console.log(Math.round(average ));
                clbk(average)
            }

            return audioContext;
        } catch (e) {
            return null
        }
    }

    function draw(v, c, videoTrack, img) {


        if ((!v.paused || !v.ended) && videoTrack.enabled) {
            c.fillStyle = "#282D33";
            c.fillRect(0, 0, c.canvas.width, c.canvas.height);

            if (v.videoWidth > v.videoHeight) {
                var coof = c.canvas.width / v.videoWidth;
                c.drawImage(v, 0, 0, v.videoWidth * coof, v.videoHeight * coof);

            } else {
                var coof = c.canvas.height / v.videoHeight;
                c.drawImage(v, (c.canvas.width - (v.videoWidth * coof)) / 2, 0, v.videoWidth * coof, v.videoHeight * coof);
            }

            //videoWidth
            // drawImageProp(c,v);
        } else {
            var coof = c.canvas.width / img.width;
            c.drawImage(img, 0, 0, img.width * coof, img.height * coof);
        }

        setTimeout(() => {
            draw(v, c, videoTrack, img)
        }, 1000 / 30)


    }
    function removeVideo(id) {
        console.log("removeVideo", id)
        var elem = document.getElementById('meetVideoItem_' + id);
        if (elem)
            elem.parentNode.removeChild(elem)
    }
   /* function videoLayout() {
        try {
            var trBox = document.getElementById("meetVideoBox");
            trBox.style.position = "relative";
            var fullW = trBox.clientWidth - 20;

            var pgm = arrVideo.filter(e => e.pgm == true)
            if (pgm.length > 0 && isPgm) {
                var pip = arrVideo.filter(e => e.pip == true)
                arrVideo.forEach(a => {
                    var elem = document.getElementById("meetVideoItem_" + a.id);
                    elem.style.zIndex = 10;
                    elem.style.display = "none";
                })

                var elem = document.getElementById("meetVideoItem_" + pgm[0].id);
                elem.style.position = "fixed";
                elem.style.top = pip.length > 0 ? ("12.5vh") : ("0");
                elem.style.left = 0;
                elem.style.width = pip.length > 0 ? ("75%") : ("100%");
                elem.style.zIndex = 100;
                elem.style.display = "block";

                if (pip.length > 0) {
                    var elem = document.getElementById("meetVideoItem_" + pip[0].id);
                    elem.style.position = "fixed";
                    elem.style.top = "50vh";
                    elem.style.left = "75%";
                    elem.style.width = ("25%");
                    elem.style.zIndex = 200;
                    elem.style.display = "block";
                }
                return;
            }

            arrVideo.forEach(a => {
                var elem = document.getElementById("meetVideoItem_" + a.id);
                elem.style.zIndex = 10;
                elem.style.display = "block";
            })
            if (arrVideo.length == 1) {
                setVideoLayout(arrVideo[0].id, 0, fullW * .05, fullW * .9)
                trBox.style.height = ((fullW / 1.777) + 20) + "px"
            }
            if (arrVideo.length == 2) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 - 5)
                setVideoLayout(arrVideo[1].id, 15, fullW * .5 + 5, fullW * .5 - 5)
                trBox.style.height = ((fullW / 1.777) + 40) + "px"
            }
            if (arrVideo.length == 3) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 - 5)
                setVideoLayout(arrVideo[1].id, 15, fullW * .5 + 5, fullW * .5 - 5)
                setVideoLayout(arrVideo[2].id, 15 + (fullW * .5 + 10) / 1.777 + 5, fullW * .25 + 5, fullW * .5 - 5)
                trBox.style.height = ((fullW * .5 + 5 / 1.777) + 20) * 2 + "px"
            }
            if (arrVideo.length == 4) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 - 5)
                setVideoLayout(arrVideo[1].id, 15, fullW * .5 + 5, fullW * .5 - 5)
                setVideoLayout(arrVideo[2].id, 15 + (fullW * .5 + 5) / 1.777 + 5, 0, fullW * .5 - 5)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .5 + 5) / 1.777 + 5, fullW * .5 + 5, fullW * .5 - 5)
                trBox.style.height = (((fullW * .5 + 5) / 1.777) + 20) * 2 + "px"
            }
            if (arrVideo.length == 5) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 + 5, fullW * .3 - 5)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + 5) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + 5, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + 5, (fullW * .3 + 5) * 2, fullW * .3 - 5)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 6) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 + 5, fullW * .3 - 5)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + 5) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + 5, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + 5, (fullW * .3 + 5) * 1, fullW * .3 - 5)
                setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 + 5, (fullW * .3 + 5) * 2, fullW * .3 - 5)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 7) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 + 5, fullW * .3 - 5)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + 5) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + 5, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + 5, (fullW * .3 + 5) * 1, fullW * .3 - 5)
                setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 + 5, (fullW * .3 + 5) * 2, fullW * .3 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, 0, fullW * .3 - 5)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 8) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 + 5, fullW * .3 - 5)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + 5) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + 5, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + 5, (fullW * .3 + 5) * 1, fullW * .3 - 5)
                setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 + 5, (fullW * .3 + 5) * 2, fullW * .3 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .3 + 5) * 1, fullW * .3 - 5)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 9) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 + 5, fullW * .3 - 5)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 + 5) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 + 5, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 + 5, (fullW * .3 + 5) * 1, fullW * .3 - 5)
                setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 + 5, (fullW * .3 + 5) * 2, fullW * .3 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, 0, fullW * .3 - 5)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .3 + 5) * 1, fullW * .3 - 5)
                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .3 + 5) * 2, fullW * .3 - 5)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 10) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 1, fullW * .25 - 5)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 11) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 2, fullW * .25 - 5)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 12) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 13) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 0, fullW * .25 - 5)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 14) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 1, fullW * .25 - 5)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 15) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[14].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 16) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 0, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 1, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 2, (fullW * .25 + 5) * 3, fullW * .25 - 5)

                setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 0, fullW * .25 - 5)
                setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 1, fullW * .25 - 5)
                setVideoLayout(arrVideo[14].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 2, fullW * .25 - 5)
                setVideoLayout(arrVideo[15].id, 15 + ((fullW * .3 + 10) / 1.777 + 5) * 3, (fullW * .25 + 5) * 3, fullW * .25 - 5)
                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }

            arrVideo.forEach(e => {

            })
        }
        catch (e) {
            console.warn(e)
        }

    }*/
    window.addEventListener("resize", videoLayout());
    function videoLayout() {
        try {
            var margin=5
            var top=15;
            var beetwen=10;



            var trBox = document.getElementById("meetVideoBox");
            trBox.style.position = "relative";
            var fullW = trBox.clientWidth - 20;
            if( window.innerWidth<977)
            {
                var margin=0
                var top=5;
                var beetwen=0;
                fullW=window.innerWidth
            }

            var pgm = arrVideo.filter(e => e.pgm == true)
            if (pgm.length > 0 && isPgm) {
                var pip = arrVideo.filter(e => e.pip == true)
                arrVideo.forEach(a => {
                    var elem = document.getElementById("meetVideoItem_" + a.id);
                    elem.style.zIndex = 10;
                    elem.style.display = "none";
                })

                var elem = document.getElementById("meetVideoItem_" + pgm[0].id);
                elem.style.position = "fixed";
                elem.style.top = pip.length > 0 ? ("12.5vh") : ("0");
                elem.style.left = 0;
                elem.style.width = pip.length > 0 ? ("75%") : ("100%");
                elem.style.zIndex = 100;
                elem.style.display = "block";

                if (pip.length > 0) {
                    var elem = document.getElementById("meetVideoItem_" + pip[0].id);
                    elem.style.position = "fixed";
                    elem.style.top = "50vh";
                    elem.style.left = "75%";
                    elem.style.width = ("25%");
                    elem.style.zIndex = 200;
                    elem.style.display = "block";
                }
                return;
            }

            arrVideo.forEach(a => {
                var elem = document.getElementById("meetVideoItem_" + a.id);
                elem.style.zIndex = 10;
                elem.style.display = "block";
            })
            if (arrVideo.length == 1) {
                setVideoLayout(arrVideo[0].id, 0, 0, fullW )
                trBox.style.height = ((fullW / 1.777) + 20) + "px"
            }
            if (arrVideo.length == 2) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 -margin)
                setVideoLayout(arrVideo[1].id, 15, fullW * .5 +margin, fullW * .5 -margin)
                trBox.style.height = ((fullW / 1.777) + 40) + "px"
            }
            if (arrVideo.length == 3) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 -margin)
                setVideoLayout(arrVideo[1].id, 15, fullW * .5 +margin, fullW * .5 -margin)
                setVideoLayout(arrVideo[2].id, 15 + (fullW * .5 + 10) / 1.777 +margin, fullW * .25 +margin, fullW * .5 -margin)
                trBox.style.height = ((fullW * .5 +margin / 1.777) + 20) * 2 + "px"
            }
            if (arrVideo.length == 4) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 -margin)
                setVideoLayout(arrVideo[1].id, 15, fullW * .5 +margin, fullW * .5 -margin)
                setVideoLayout(arrVideo[2].id, 15 + (fullW * .5 +margin) / 1.777 +margin, 0, fullW * .5 -margin)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .5 +margin) / 1.777 +margin, fullW * .5 +margin, fullW * .5 -margin)
                trBox.style.height = (((fullW * .5 +margin) / 1.777) + 20) * 2 + "px"
            }
            if (arrVideo.length ==margin) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 6) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 1, fullW * .3 -margin)
                setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 7) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 1, fullW * .3 -margin)
                setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, 0, fullW * .3 -margin)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 8) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 1, fullW * .3 -margin)
                setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .3 +margin) * 1, fullW * .3 -margin)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 9) {
                setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
                setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
                setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 1, fullW * .3 -margin)
                setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, 0, fullW * .3 -margin)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .3 +margin) * 1, fullW * .3 -margin)
                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .3 +margin) * 2, fullW * .3 -margin)
                trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
            }
            if (arrVideo.length == 10) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 11) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 12) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 13) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 0, fullW * .25 -margin)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 14) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 1, fullW * .25 -margin)

                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 15) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[14].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }
            if (arrVideo.length == 16) {

                setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

                setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 0, fullW * .25 -margin)
                setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 1, fullW * .25 -margin)
                setVideoLayout(arrVideo[14].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 2, fullW * .25 -margin)
                setVideoLayout(arrVideo[15].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 3, fullW * .25 -margin)
                trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
            }

            arrVideo.forEach(e => {

            })
        }
        catch (e) {
            console.warn(e)
        }

    }
    function setVideoLayout(id, top, left, width) {
        console.log("meetVideoItem_" + id)
        var elem = document.getElementById("meetVideoItem_" + id);

        elem.style.position = "absolute";
        elem.style.top = top + "px";
        elem.style.left = (10+left) + "px";
        elem.style.width = width+"px";
    }


}


