var app;
var arrVideo = [];
window.onload=function () {
    try{
        eval("\"use strict\";const s=()=>{;;}; s();")
    }
    catch (e) {
        document.location.href="/badbrowser"
    }
    var WowzaCfg = null;
    var BitrateCfg = null;
    var mediaRecorder=null;
    var arrAudio = [];

    var wowzaRecievers=[];
    peerConnection=null;
     app = new Vue({
        el: '#app',
        data: {
            webCamStream:null,
            sect:[],
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
            messageToModText:"",
            errorMessage:"",
            stageTimer:0,
            stageTimeout:null,
            tags:[],
            pole:[],
            selLang:'ru',
            lang:{ru:{},en:""},
                pres:null,
            previewPres:[],
            isPres:false,
            isPresFullScreen:false,

        },
        methods:{
            onPreviewFilePres:function (dt) {
                console.log("onPreviewFilePres", dt)

                this.previewPres=dt;
            },
            deactivatePres:async function(){
                await axios.post("/rest/api/deActivatePres/" + this.pres + "/" + roomid, {id:this.pres});
                this.previewPres=[];
                this.isPresFullScreen=false;
            },
            getPresBgUrl:function(pres){
                return 'url(/rest/api/pres/'+pres+'/'+eventid+'/'+roomid+')'
            },
            setPres:function (id) {
                this.pres=id;
                if(this.pres) {
                    this.isPres=true
                    var elem = document.getElementById("pres" + id)
                    if (elem)
                        elem.scrollIntoView({inline: "center", behavior: "smooth"})

                }
                else{
                    this.isPres=false;
                }
            },
            activatePres:async function (item) {
                await axios.post("/rest/api/pres/" + eventid + "/" + roomid, {id:item.id})
            },
            previewFilePres:async function(item){
                var _this=this;
                //this.previewPres=item.presfiles;
                this.isPres=true;
                await axios.post("/rest/api/deActivatePres/" + eventid + "/" + roomid, {id:item.id})
                await axios.post("/rest/api/previewFilePres/" + eventid + "/" + roomid, {items:/*_this.previewPres*/item.presfiles})
                this.isPresFullScreen=false;

            },
            OnNewFilePres:function (data) {
                console.log("OnNewFilePres", this.files, data)
                this.files.forEach(f=>{
                    if(f.id==data.id)
                        console.log("insert to pres", )
                    if(!f.presfiles)
                        f.presfiles=[];
                    f.presfiles.push({id:data.fileid, fileid:data.id});
                })
            },
            uploadFile:function(){
                uploadFile(this);
            },
            changeActiveLang: function (item) {
                this.langCh.forEach(f => {
                    f.isActive = f.lang.id == item.lang.id;
                });
                this.activateLangCh(item);
                this.showLangCh = false
            },
            activateLangCh: async function (item) {
                var _this = this;
                if (item.lang.id == 0) {
                    //removeAudioCh()
                    arrAudio.forEach(a => {
                        _this.removeAudio(a.id);
                    })
                    arrVideo.forEach(v => {
                        if (!v.isMyVideo)
                            v.muted = false
                    });
                } else {
                    arrAudio.forEach(a => {
                        _this.removeAudio(a.id);
                    })
                    var audio = document.createElement("audio");
                    audio.id = item.id
                    audio.autoplay = "autoplay";
                    //  audio.controls="controls";
                    document.body.appendChild(audio);
                    if(!WowzaCfg)
                    {
                        WowzaCfg = await axios.get('/rest/api/meetWowza')
                    }
                    if(!BitrateCfg)
                    {
                        BitrateCfg = await axios.get('/rest/api/meetBitrate')
                    }
                    var ret = await getVideoFromWowzaAync(item.id, audio, WowzaCfg.data, BitrateCfg.data);
                    var audioItem = {id: item.id, elem: audio, peerConnection: ret.peerConnection}
                    arrAudio.push(audioItem)
                    audioItem.peerConnection.onconnectionstatechange = (event) => {
                        var cs = audioItem.peerConnection.connectionState
                        console.log("cs", audioItem.peerConnection.connectionState)
                        if (cs == "disconnected" || cs == "failed" || cs == "closed") {
                            if (audioItem.peerConnection) {
                                audioItem.peerConnection.close();
                                audioItem.peerConnection = null;
                            }
                            _this.removeAudio(audioItem.id)
                            arrAudio = arrAudio.filter(r => r.id != audioItem.id);

                        }

                    }

                }

            },
            removeAudio: function (id) {
                console.log("removeAudio", id)
                var items = arrAudio.filter(r => r.id == id);
                if (items.length > 0) {
                    if (items[0].peerConnection) {
                        items[0].peerConnection.close();
                        items[0].peerConnection = null;

                        if (items[0].elem)
                            items[0].elem.parentNode.removeChild(items[0].elem);
                    }

                    if (items[0].isActive) {
                        this.langCh.forEach(f => {
                            f.isActive = f.lang.id == 0;
                        });
                        arrVideo.forEach(v => {
                            if (!v.isMyVideo)
                                v.muted = false
                        });
                    }
                    arrAudio = arrAudio.filter(r => r.id != id);
                }
            },
            presRew:function(){
                var elem=document.getElementById('presRew')
                var val=elem.classList.contains("active")
                this.socket.emit("presRew", val)
                movePres(-1)

            },
            presFow:function(){
                var elem=document.getElementById('presFow')
                var val=elem.classList.contains("active")
                this.socket.emit("presFow", val)
                movePres(1)
            },
            OnPresRew:function(val) {
                var elem=document.getElementById('presRew')
                if(!val){
                    elem.classList.add("active")
                    setTimeout(()=>{
                        elem.classList.remove("active")
                    },20*1000)
                    document.getElementById('presFow').classList.remove("active")
                }
                else
                    elem.classList.remove("active")
            },
            OnPresFow:function(val){
                var elem=document.getElementById('presFow')
                if(!val){
                    elem.classList.add("active")
                    setTimeout(()=>{
                        elem.classList.remove("active")
                    },20*1000)
                    document.getElementById('presRew').classList.remove("active")
                }
                else
                    elem.classList.remove("active")
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
            showRecords:function(){
                window.open('/showrecords/'+eventid+"/"+roomid);
            },
            StartTimer:function(){
                var _this=this;
                _this.socket.emit("startTimer", {isOn:this.stageTimeout?true:false})

            },
            OnStartTimer:function(data){
                var _this=this;
               // _this.stageTimeout=data.stageTimeout;

                if(data.isOn) {
                    clearTimeout(this.stageTimeout)
                    this.stageTimeout=null;
                }
                else {
                    if(_this.stageTimer<=0)
                    {
                        var lim=5*60;
                        var ctrl=document.getElementById("stageTimerLimit");
                        if(ctrl)
                        {
                            var val=ctrl.value;
                            var matches=val.match(/(\d\d):(\d\d):(\d\d)/);
                            console.log(matches, val);
                            if(matches.length==4)
                            {
                                lim=parseInt(matches[1]*60*60)+parseInt(matches[2]*60)+parseInt(matches[3]);
                            }
                        }
                        _this.stageTimer=lim;
                    }
                    this.stageTimeout=setTimeout(updateStageTimer,1000);
                }
                function updateStageTimer() {
                    _this.stageTimer--;
                    if(_this.stageTimer<=0)
                    {
                        clearTimeout(_this.stageTimeout)
                        _this.stageTimeout=null;
                        _this.stageTimer=0;

                    }
                    else
                    _this.stageTimeout=setTimeout(updateStageTimer,1000);
                }
            },
            ResetTimer:function(){

                var _this=this;
               // _this.stageTimer=0;
                var ctrl=document.getElementById("stageTimerLimit");
                var lim=5*60;
                if(ctrl)
                {
                    var val=ctrl.value;
                    var matches=val.match(/(\d\d):(\d\d):(\d\d)/);
                    console.log(matches, val);
                    if(matches.length==4)
                    {
                        lim=parseInt(matches[1]*60*60)+parseInt(matches[2]*60)+parseInt(matches[3]);
                    }
                }
                _this.socket.emit("resetTimer", lim)
            },
            OnResetTimer:function(data){
                var _this=this;
                console.log("OnResetTimer", data)
                 _this.stageTimer=data;

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
            sortedVoteAnsvers:function(arr){
                var nArr=arr.slice(0)
                return nArr.sort((a,b)=>{return a.id-b.id});
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
            relayoutVideo:function () {
                 socket.emit("relayoutVideo");
             },
            videoRecord:function (id) {
                console.log("startStageRecord video", id)
                socket.emit("startStageRecord", id);
            },
            stopVideoRecord:function (id) {
                console.log("stopStageRecord video", id)
                socket.emit("stopStageRecord", id);
            },
            startMyVideo:async function () {

                var _this=this;
                _this.isMyVideo=true;
                var videoItem = {id: _this.socket.id, isMyVideo: true, user: _this.user}
                arrVideo.push(videoItem);

                await createVideo(videoItem.id, videoItem.isMyVideo, _this.user, _this.videoPgm, _this.videoPIP,_this.videoP1, _this.videoMute, _this.videoRemove, _this.videoReload, _this.videoRecord, _this.stopVideoRecord);
                var videoWr=document.getElementById("meetVideoWrapperContent_" + videoItem.id);
                try {
                    await phonePublishLocalVideo(videoWr, videoItem.id, null, () => {
                            removeVideo(videoItem.id)
                        },
                        () => {
                                _this.errorMessage="Невозможно подключиться. Проверьте доступ к видеокамере, разрешите использование видеокамеры в браузере и перезагрузите страницу."
                        });

                    videoLayout();
                    videoItem.streamid = _this.socket.id;
                    videoItem.elem = videoWr.querySelector('video');
                    videoItem.elem.setAttribute("allowfullscreen", "allowfullscreen")
                    videoItem.elem.setAttribute("playsinline", "playsinline")
                    videoItem.stream = videoItem.elem.srcObject;
                    videoItem.audioElem = document.getElementById('meetVideoLevel' + videoItem.id)
                    var silentTimer = null;
                    var silent = false;
                    videoItem.analiser = await createAudioAnaliser(videoItem.stream, (val) => {
                        // console.log(val, parseFloat((val/100)*100));
                        videoItem.audioElem.style.height = parseFloat((val / 100) * 100) + "%";
                        if (val > 15) {
                            if (!silent) {
                                silent = true;
                                arrAudio.forEach(a => {
                                    a.elem.volume = .2;
                                })
                                    /*arrVideo.forEach(a => {
                                    if(!a.isMyVideo)
                                        a.elem.volume = .2;
                                    console.log("arrvideo elem", a)
                                })*/
                                console.log("silent on")
                            }
                            if (silentTimer)
                                clearTimeout(silentTimer);
                            silentTimer = setTimeout(() => {
                                arrAudio.forEach(a => {
                                    a.elem.volume = 1;
                                })
                               /* arrVideo.forEach(a => {
                                    a.elem.volume = .2;
                                })*/
                                console.log("silent off")
                                silent = false;
                            }, 1000)
                        }

                    })
                    setTimeout(() => {
                        socket.emit("newStageStream", {
                            user: _this.user,
                            isDesktop: false,
                            roomid: room.id,
                            streamid: videoItem.id
                        });

                    }, 0);
                }
                catch (e) {
                    console.log("publish video failed", e);
                }

                return ;

            },
            OnNewStageStream:async function (data) {
                console.log("OnNewStageStream", data)
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


                var video = await createVideo(data.streamid, false, data.user, _this.videoPgm, _this.videoPIP,_this.videoP1, _this.videoMute, _this.videoRemove, _this.videoReload,_this.videoRecord, _this.stopVideoRecord);
                videoLayout();

                var videoWrElem=document.getElementById('meetVideoWrapperContent_'+receiverItem.streamid);
                    var playerid=await phoneGetRemoteVideo(videoWrElem, receiverItem.streamid, ()=>{removeVideo(receiverItem.streamid)})
                    receiverItem.elem=document.getElementById(playerid)
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
                await createVideo(videoItem.id, true, _this.user, _this.videoPgm, _this.videoPIP,_this.videoP1, _this.videoMute, _this.videoRemove, _this.videoReload, _this.videoRecord,  _this.stopVideoRecord)
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
            videoP1:function (data) {
                socket.emit("videoP1", data);
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
               console.log("OnVideoMute", data, arrVideo)

                arrVideo.forEach(item=>{
                    if(item.streamid==data.streamid && !item.isMyVideo){
                        item.elem.muted=data.val;
                    }
                })
            },
            OnRelayoutVideo:function(){
                arrVideo.forEach(item=>{
                        item.pgm=false;
                        item.pip=false;
                        item.p1=false;
                        var elem=document.getElementById("pgmbtn"+item.streamid)
                        if(elem)
                            elem.classList.remove("active")
                    elem=document.getElementById("pipbtn"+item.streamid)
                    if(elem)
                        elem.classList.remove("active")
                    elem=document.getElementById("p1btn"+item.streamid)
                    if(elem)
                        elem.classList.remove("active")

                    var elems = document.querySelectorAll(".meetVideoItem");
                    elems.forEach(e=>{
                        e.classList.remove("isPIP");
                        e.classList.remove("isP1");
                        e.classList.remove("isPGM");
                    })
                })
                videoLayout();
            },
            OnVideoPIP:function (data) {
                console.log('OnVideoPIP',data.val)
                if(!isPgm)
                {
                    var elems = document.querySelectorAll(".meetVideoItem");
                    elems.forEach(e=>{
                        e.classList.remove("isPIP");
                    })
                    arrVideo.forEach(item=>{
                        if(item.streamid==data.streamid)
                        {
                            var elem = document.getElementById("meetVideoItem_" + data.streamid)
                            if(elem && data.val)
                                elem.classList.add("isPIP")
                        }
                    })
                    return
                }

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
            OnVideoP1:function (data) {
                console.log('OnVideoP1', data.val)
                if(!isPgm)
                   {
                       var elems = document.querySelectorAll(".meetVideoItem");
                       elems.forEach(e=>{
                           e.classList.remove("isP1");
                       })
                       arrVideo.forEach(item=>{
                           if(item.streamid==data.streamid)
                           {
                               var elem = document.getElementById("meetVideoItem_" + data.streamid)
                               if(elem && data.val)
                                   elem.classList.add("isP1")
                           }
                       })
                       return
                   }
                arrVideo.forEach(item=>{
                    if(item.streamid==data.streamid)
                    {
                        item.pgm=false;
                        item.p1=data.val;
                    }
                    else
                        item.p1=false;
                })
                videoLayout();
            },
            OnVideoPgm:function (data) {
                var  _this=this;
                if(!isPgm)
                {
                    var elems = document.querySelectorAll(".meetVideoItem");
                    elems.forEach(e=>{
                        e.classList.remove("isPGM");
                    })
                    arrVideo.forEach(item=>{
                        if(item.streamid==data.streamid)
                        {
                            var elem = document.getElementById("meetVideoItem_" + data.streamid)
                            if(elem && data.val)
                                elem.classList.add("isPGM")
                            var elem=document.getElementById('p1btn'+item.streamid)
                            console.log("p1btn", elem)
                            if(elem && elem.classList.contains("active")) {
                                item.p1=false
                             //   _this.videoP1(item)
                                elem.classList.remove("active")
                            }
                        }
                    })
                    return
                }

                arrVideo.forEach(item=>{
                    if(item.streamid==data.streamid)
                    {
                        item.pgm=data.val;
                        item.pip=false;
                        item.p1=false;

                    }
                    else
                        item.pgm=false;
                })
                console.log("arrVideo ", arrVideo)
                videoLayout();
            },
            initStage:async function(){
                console.log("init stage")
                var _this=this;
                _this.init=true;
               /* WowzaCfg = await axios.get('/rest/api/meetWowza')
                BitrateCfg = await axios.get('/rest/api/meetBitrate')
                var dt = await axios.get('/rest/api/constraints');
                _this.constraints = dt.data;*/
                _this.firstConnect = false;
                console.log("startMyVideo0", isMod ,  isPgm)
                if(!isMod &&  !isPgm)
                    setTimeout(() => {
                        console.log("startMyVideo")
                        _this.startMyVideo();
                    }, 400);
                setTimeout(() => {
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
            },
            OnStageRecordStarted:function(id){
                console.log("OnStageRecordStarted", id)
                var btn=document.getElementById("recbtn"+id)
                if(btn)
                {
                    btn.classList.remove("active");
                    btn.classList.add("warning");
                }
            },
            onStageRecordStopped:function(id){
                console.log("onStageRecordStopped", id)
                var btn=document.getElementById("recbtn"+id)
                if(btn)
                {
                    btn.classList.remove("active");
                    btn.classList.remove("warning");
                }
            },
            onStopStageRecord:function(id){
                var _this=this;
                console.log("onStopStageRecord")
                if(id!= _this.socket.id)
                    return;
                if(!mediaRecorder)
                    return;
                console.log("onStopStageRecord before stop")
                mediaRecorder.stop();
            },
            onStartStageRecord:function (id) {
                var _this=this;
                if(id!= _this.socket.id)
                    return;

                if(mediaRecorder)
                {
                    console.log("record in process")
                    return;
                }
                console.log("onStartStageRecord", id, _this.socket.id)
                arrVideo.forEach(async item=>{
                    if(item.isMyVideo && !item.isDesktop)
                    {
                        console.log(item);
                        var recId=await axios.get("/rest/api/getRecFileId/"+eventid+"/"+roomid)
                        console.log("stage record id=",recId.data)
                        var stream =await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280}}, audio:true});

                        mediaRecorder= new MediaRecorder(/*stream*/ item.elem.srcObject,{mimeType: 'video/webm; codecs=h264'});
                        mediaRecorder.ondataavailable = function(e) {
                           // chunks.push(e.data);
                            var fd  = new FormData();
                            fd.append('file', e.data);

                            var xhr = new XMLHttpRequest();
                            xhr.onload   = xhr.onerror= function(e) {
                                _this.socket.emit("stageRecordStarted", _this.socket.id);
                                if(xhr.status!=200)
                                {
                                    console.warn("xhr.onerror", )
                                    try{
                                        mediaRecorder.stop();
                                    }catch (e) {

                                    }
                                }
                            }
                            xhr.open("POST", '/rest/api/stageRecord/'+recId.data,true );
                            xhr.send(fd);

                        }
                        mediaRecorder.onstop=function(e){
                            mediaRecorder=null;
                            setTimeout(()=>{
                                console.log("mediaRecorder onstop")
                                _this.socket.emit("stageRecordStopped", _this.socket.id);
                            },2000);

                        }
                        mediaRecorder.start(2000);
                    }

                })
            }
            ,
            changeLang:function (selLang) {
                localStorage.setItem("selLang", selLang)
                this.selLang=selLang;
                this.sect=[
                    {title:this.lang[this.selLang].Programme, isActive:false, id:8, logo:'/images/logofeed.svg', logoactive:'/images/logofeeda.svg'},
                    {title:this.lang[this.selLang].Feed, isActive:false, id:0, logo:'/images/logofeed.svg', logoactive:'/images/logofeeda.svg'},
                    {title:this.lang[this.selLang].Questions, isActive:false, id:1, logo:'/images/logoqactive.svg', logoactive:'/images/logoq.svg'},
                    {title:this.lang[this.selLang].Chat, isActive:true, id:2, logo:'/images/logochat.svg', logoactive:'/images/logochatactive.svg'},
                    {title:this.lang[this.selLang].Users, isActive:false, id:3, logo:'/images/logousers.svg', logoactive:'/images/logousersa.svg'},
                    {title:this.lang[this.selLang].Files, isActive:false, id:7, logo:'/images/logofiles.svg', logoactive:'/images/logofilesa.svg'}
                ];


                if(roomid==52) {
                    this.sect = [
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
             },
             formatedTimeout:function () {
                 return new Date(this.stageTimer * 1000).toISOString().substr(11, 8);
             },
             activeLangCh: function () {
                 var ret = this.langCh.filter(r => r.isActive == true);
                 if (ret.length > 0)
                     return ret[0].lang
                 else
                     return 0;
             }

         },
        mounted:async function () {
            var _this=this;
            var r= await axios.get("/rest/api/lang");
            this.lang=r.data;
            this.selLang=localStorage.getItem("selLang")||"en";
            this.changeLang(this.selLang);

            setTimeout(()=>{
                var hlsVideo=document.getElementById("video")
                if(hlsVideo){
                    hlsVideo.muted=true;

                    initHLS(hlsVideo)
                    setTimeout(()=>{hlsVideo.play()},4000)

                }
                else
                if(typeof (mainVideoElem)!="undefined") {
                    mainVideoElem.muted = !val;
                }
                else
                if(this.$refs.youtube)
                {
                        this.$refs.youtube.player.mute()
                }
                else if(document.getElementById('profIframe')){
                    var elem=document.getElementById('profIframe')
                        elem.contentWindow.postMessage('mute', '*')
                }
            },1000)

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
                        axios.get("/rest/api/tags/"+eventid+"/"+roomid)
                            .then(function (r) {
                                console.log("tags", r.data)
                                _this.tags=r.data;
                            })

                        axios.get("/rest/api/pole/"+eventid+"/"+roomid)
                            .then(function (r) {
                                console.log("pole", r.data)
                                _this.pole=r.data;
                            })
                        axios.get("/rest/api/files/"+eventid+"/"+roomid)
                            .then(function (r) {
                                console.log(r.data)
                                _this.files=r.data;
                                axios.get("/rest/api/activePres/" + eventid + "/" + roomid)
                                    .then(function (ff) {
                                        // console.log("activePres", ff)
                                        if (ff.data.fileid) {
                                            try {
                                                var fl=_this.files.filter(r => r.id == ff.data.fileid);
                                                if(fl.length>0) {
                                                    _this.previewPres = fl[0].presfiles

                                                    //_this.pres = ff.data.fileid
                                                    _this.setPres(ff.data.item)
                                                    setTimeout(function () {
                                                        var elem = document.getElementById("pres" + ff.data.fileid)
                                                        if (elem)
                                                            elem.scrollIntoView({inline: "center", behavior: "smooth"})
                                                    }, 200)
                                                }
                                            }
                                            catch (e) {
                                                console.warn(e)
                                            }

                                            //  _this.pres = ff.data.item
                                            // _this.isPres = ff.data.item ? true : false
                                        } else
                                            _this.previewPres = []


                                    })

                            });


                       /* axios.get("/rest/api/activePres/" + eventid + "/" + roomid)
                            .then(function (ff) {
                                _this.pres = ff.data.item
                            })*/


                      //  var scrElem = rHead;
                      //  scrElem.scrollLeft = (scrElem.scrollWidth - scrElem.clientWidth) / 2
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
                        if(el) {
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
                    }


                    if (_this.firstConnect) {


                    }
                    //startVideo();
                    //_this.startRTC();
                })

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

    async function createVideo(id, muted, user, onPgm, onPip,onP1,onMute, onRemove, onReload, onStartRecord, onStopRecord) {
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
        cap.innerText = (user.i || "") + " " + (user.f || "")+ " " + (user.smi || "")

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
                var elem=document.getElementById("meetVideoItem_"+ id);
                if(elem.classList.contains("fullScreen"))
                    elem.classList.remove("fullScreen")
                else {
                    var elems = document.querySelectorAll(".meetVideoItem.fullScreen");
                    elems.forEach(e => {
                        e.classList.remove("fullScreen")
                    })
                    elem.classList.add("fullScreen");
                }


               /* var video = document.getElementById("meetVideoWrapperContent_" + id).querySelector('video')
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
                }*/

            })


            if(isMod){
                var recBox=document.createElement("div");
                recBox.classList.add("modRecordContollers")
                meetVideoItem.appendChild(recBox)
                var recBtn=document.createElement("div");
                recBtn.classList.add("greenBtn")
                recBtn.classList.add("clearBtn")
                recBtn.id="recbtn"+id;
                recBtn.innerHTML="REC";
                recBtn.classList.add("stageModBtn")
                recBox.appendChild(recBtn);
                recBtn.addEventListener("click",()=> {
                    if(recBtn.classList.contains("active"))
                    {
                        //recBtn.classList.remove("active")
                         return;
                    }
                    if(recBtn.classList.contains("warning"))
                    {
                        //recBtn.classList.remove("active")
                        if(confirm("Остановить запись?"))
                        {
                            if(onStopRecord)
                                onStopRecord(id);
                        }

                        return;
                    }
                    recBtn.classList.add("active");
                    if(onStartRecord)
                        onStartRecord(id);

                });


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
                            item.pip=btn2.classList.contains("active");
                            item.p1=btnP1.classList.contains("active");
                        }
                        else
                        {
                                item.pgm=false;
                                var el= document.getElementById("pgmbtn"+item.id);
                                if(el)
                                el.classList.remove("active")
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

                var btnP1=document.createElement("div");
                btnP1.classList.add("greenBtn")
                btnP1.classList.add("clearBtn")
                btnP1.classList.add("stageModBtn")
                btnP1.id="p1btn"+id;
                btnP1.innerHTML="P1"
                box.appendChild(btnP1);
                btnP1.addEventListener("click",()=>{
                    if(btn.classList.contains("active"))
                    {
                        btnP1.classList.remove("active")
                        return;
                    }
                    if(btnP1.classList.contains("active"))
                        btnP1.classList.remove("active")
                    else
                        btnP1.classList.add("active")
                    if(onP1)
                        onP1({streamid:id,val:btnP1.classList.contains("active")})
                    arrVideo.forEach(item=>{
                        if(item.streamid==id){
                            item.pgm=btn.classList.contains("active");
                            item.pip=btn2.classList.contains("active");
                            item.p1=btnP1.classList.contains("active");
                        }

                    })


                })


                var btn3=document.createElement("div");
                btn3.classList.add("greenBtn")
                btn3.classList.add("clearBtn")
                btn3.classList.add("stageModBtn")
                btn3.id="mutebtn"+id;
                btn3.innerHTML="MUTE"
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


    window.addEventListener("resize",()=>{console.log("resize");videoLayout()});
    window.addEventListener("orientationchange",()=>{console.log("orientationchange");videoLayout()});
    document.addEventListener("keydown",(e)=> {
        document.body.onkeydown = function (e) {
            if(e.code=="Escape"){
                var elems=document.querySelectorAll(".fullScreen");
                elems.forEach(elem=>{
                    elem.classList.remove("fullScreen");
                });
                app.isPresFullScreen=false;
            }
            //console.log("rl click", e)
            if(e.code=="ArrowRight" || e.code=="ArrowLeft" )
            {
                movePres(e.code=="ArrowRight"?1:-1)

            }
            
        };
    })
    function movePres(j) {
        var elems=document.querySelectorAll(".aModSectPresItem");
        for(var i=0; i<elems.length; i++){
            if(elems[i].classList.contains("active"))
            {
                if(j>0 && i<elems.length-1)
                    elems[i+1].click();
                if(j<0 && i>0)
                    elems[i-1].click();
            }
        }
    }
    var momentFormat = 'HH:mm:ss';
    if(!isPgm )
       setTimeout(()=>{
           var momentMask = IMask(document.getElementById('stageTimerLimit'), {
               mask: Date,
               pattern: momentFormat,
               lazy: false,
               min: new Date(1970, 0, 1),
               max: new Date(2030, 0, 1),

               format: function (date) {
                   return moment(date).format(momentFormat);
               },
               parse: function (str) {
                   return moment(str, momentFormat);
               },

               blocks: {
                   YYYY: {
                       mask: IMask.MaskedRange,
                       from: 1970,
                       to: 2030
                   },
                   MM: {
                       mask: IMask.MaskedRange,
                       from: 1,
                       to: 12
                   },
                   DD: {
                       mask: IMask.MaskedRange,
                       from: 1,
                       to: 31
                   },
                   HH: {
                       mask: IMask.MaskedRange,
                       from: 0,
                       to: 23
                   },
                   mm: {
                       mask: IMask.MaskedRange,
                       from: 0,
                       to: 59
                   }
                   ,
                   ss: {
                       mask: IMask.MaskedRange,
                       from: 0,
                       to: 59
                   }
               }
           });
       },200)

}



