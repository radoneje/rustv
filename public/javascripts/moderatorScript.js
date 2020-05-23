window.onload=async function () {
    Vue.component('autosize-teztarea', {
        props: ['item', "onChange" ,],
        data: function () {

        },
        created: function () {
            setTimeout(()=>{
                autosize(document.getElementById("item.answer"+this.item.id));
            }, 100)

        },
        template: '<textarea  :id="\'item.answer\'+item.id" v-model="item.answer" placeholder="Напишите здесь текст ответа" v-on:change="$emit(\'change\')" ></textarea>'
        //textarea( :id="'qAnswerText'+item.id" placeholder="Напишите здесь текст ответа" v-model="item.answer" v-on:change="qItemAnswerChange(item)")
    })
    var lt=await axios.get("/longtext");
    console.log(lt.data);
    Vue.component('long-text', {
        props: ['itemtext', "isOpen" ],
        data: function () {

        },
        model: {
            isOpen: false,
            smallText: ''
        },
        created: function () {
            if(this.itemtext.length>=100);
            {
                console.log(this)
                this.isOpen=false;
                this.smallText =this.itemtext.substr(0,100);
            }
        },
        template: lt.data
        //textarea( :id="'qAnswerText'+item.id" placeholder="Напишите здесь текст ответа" v-model="item.answer" v-on:change="qItemAnswerChange(item)")
    })


    var app = new Vue({
        el: '#app',
        data: {
            webCamStream:null,
            sect:[{title:"Вопросы", isActive:true, id:1}, {title:"Чат", isActive:true, id:2},{title:"Участники", isActive:false, id:3},,{title:"Голосования", isActive:false, id:4} ],
            activeSection:2,
            chat:[],
            isChat:room.isChat,
            users:[],
            q:[],
            qText:"",
            chatText:"",
            files:[],
            isFiles:room.isFiles,
            pres:null,
            user:null,
            isUsers:room.isUsers,
            isQ:room.isQ,
            isLenta:room.isLenta,
            selfVideoStream:null,
            remoteVideoStream:null,
            socket,
            SPKvksUsers:[],
            SPKstatus:1,
            SPKalert:null,
            SPKalertText:"",
            isSpkScreen:false,
            centerSectActiveIndex:1,
            lSectActiveIndex:2,
            isPres:false,
            previewPres:[],
            room:room,
            votes:[],
            userFindText:"",
            messageFromMod:"",
            messageToModText:""
        },
        methods:{
            onHandUp:function(data){

                this.users.forEach(u=>{
                    if(u.id==data.id) {
                        console.log("user handUp")
                        u.handUp = data.hand;
                        var i= u.i;
                        u.i="";
                        setTimeout(()=>{u.i=i},0)
                    }
                })
            },
            sendSpkAleret:function(data){
                this.SPKalert=!this.SPKalert;
                this.socket.emit("setSpkAlert",{SPKalert:this.SPKalert, SPKalertText:this.SPKalertText});
            },
            sendSpkStatus:function(data){
                this.socket.emit("setSpkStatus",data);
                if(data==0){
                    this.clearPres();
                }
            },
            onSPKstatus:function(data){
                var _this=this;
                this.SPKstatus=data.SPKstatus;
                this.SPKalert=data.SPKalert;
                this.SPKvksUsers=data.SPKvksUsers;
                setTimeout(()=>{
                    _this.SPKvksUsers.forEach(u=>{
                        document.getElementById('VKSboxItemBtn'+u.guid).classList.remove("removing")
                    })
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
            qItemAnswerChange:function(item){
                console.log("qItemAnswerChange")
                var _this=this;
                if(item.answer.length>0)
                    qItemAnswerChange(item,_this)
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
            qToSpk:function (item) {
                console.log(item.isSpk)
                axios.post("/rest/api/qToSpk/"+eventid+"/"+roomid,{id:item.id, isSpk:!item.isSpk})
                    .then(function (r) {

                    })
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
            },
            startVideoChat:async function(item){
                var _this=this;

                var avatar=document.getElementById('videoAvatar'+item.id);
                if(avatar.classList.contains("clicked"))
                    return ;

                avatar.classList.add("clicked")
                setTimeout(function () {
                    avatar.classList.remove("clicked")
                }, 500)

                if(!_this.selfVideoStream){
                    var loader=document.getElementById("localVideoLoader");
                    loader.classList.add("loader")
                    await  phonePublishLocalVideo(document.getElementById('localVideoWr'),_this.socket.id, null, () => {
                        var video=document.getElementById('localVideoWr').querySelector('video')
                        if(video)
                            video.parentNode.removeChild(video);
                        _this.selfVideoStream=null;
                        loader.classList.remove("loader")
                    });
                    var video=document.getElementById('localVideoWr').querySelector('video')
                        if(video)
                        video.classList.remove("mirrored");
                    console.log('local video is Published', _this.socket.id)
                    _this.selfVideoStream=true;
                    loader.classList.remove("loader")
                }

                if(_this.remoteVideoStream)
                {
                    await stopPhone();
                    remoteWr.innerHTML="";
                    //disconnect remote video stream
                }
                console.log('local video ready to connect', item)
                var loader=document.getElementById("remoteVideoLoader");
                loader.classList.add("loader")

                var remoteWr=document.getElementById('remoteVideoWr')
                await phoneGetRemoteVideo(remoteWr,item.socketid, ()=>{
                    console.log('remote video failed', _this.socket.id)
                    var video=remoteWr.querySelector('video')
                    if(video)
                        video.parentNode.removeChild(video);
                    _this.remoteVideoStream=null;
                })

                var videoCap=document.createElement('div');
                videoCap.classList.add("videoCap")
                remoteWr.appendChild(videoCap);

                videoCap.innerHTML ='<div class="videoCatHer">'
                    +(item.i||'') +' '+ (item.f||'') +' ' + (item.smi||'')+
                    "</div><div class='videotoSpkWr'><span class='videotoSpk' id='videotoSpk"+item.socketid+"' >на экран</span><span class='videotoSpk' id='videotoStage"+item.socketid+"' >на сцену</span>"+"<img src='/images/close.svg'  class='closeIcon'  id='close"+item.socketid+"'/></div>";
                if(roomid==61)
                    videoCap.innerHTML ='<div class="videoCatHer">'
                        +videoCap.innerText +
                        "</div><div class='videotoSpkWr'><span class='videotoSpk' id='videotoSpk"+item.socketid+"' >на экран</span>"+"<img src='/images/close.svg'  class='closeIcon'  id='close"+item.socketid+"'/></div>";

                document.getElementById("close"+item.socketid).addEventListener("click", async ()=>{
                    console.log("stopReceiveVideo", item.socketid )
                    await stopPhone();
                    remoteWr.innerHTML="";
                })

                document.getElementById("videotoSpk"+item.socketid).addEventListener("click", async ()=>{
                    await stopPhone();
                    remoteWr.innerHTML="";
                    _this.socket.emit("spkStartPhone",{socketid:item.socketid, user:item})
                })
                var elem=document.getElementById("videotoStage"+item.socketid)
                if(elem)
                    elem.addEventListener("click", async()=>{
                        await stopPhone();
                        remoteWr.innerHTML="";
                        _this.socket.emit("redirectToStage",{user:_this.user, guid:item.socketid, to:item.socketid})
                    })


                async function stopPhone() {
                   await phoneStopRemoteVideo(item.socketid);

                }


                loader.classList.remove("loader")
                return ;
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

            onMyVideoStarted: function (video, stream, item) {
                var _this=this;
                console.log("videoSender", videoSenders.length);
                if(videoSenders.length>0)
                    return;
                createSender(video, stream, null, function (videoSender) {
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
                     ret.user=data.user;
                    videoReceivers.push(ret)
                    _this.socket.emit("receiverReady",{user:_this.user, guid:data.guid, to:data.from})
                })


                var videoBox=document.getElementById(data.guid)
                var videoCap=videoBox.querySelector(".videoCap")
                videoCap.innerHTML ='<div class="videoCatHer">'
                    +videoCap.innerText +
                    "</div><div class='videotoSpkWr'><span class='videotoSpk' id='videotoSpk"+data.guid+"' >на экран</span><span class='videotoSpk' id='videotoStage"+data.guid+"' >на сцену</span>"+"<img src='/images/close.svg'  class='closeIcon'  id='close"+data.guid+"'/></div>";
               if(roomid==61)
                   videoCap.innerHTML ='<div class="videoCatHer">'
                       +videoCap.innerText +
                       "</div><div class='videotoSpkWr'><span class='videotoSpk' id='videotoSpk"+data.guid+"' >на экран</span>"+"<img src='/images/close.svg'  class='closeIcon'  id='close"+data.guid+"'/></div>";
                {
                    document.getElementById("close"+data.guid).addEventListener("click", ()=>{
                        console.log("stopReceiveVideo", data.guid, data.recguid )
                        stopReceiveVideo(data.guid);
                        stopSendVideo(data.recguid);
                        _this.socket.emit("stopSendVideo",{user:_this.user, guid:data.recguid, to:data.from})
                    })

                    document.getElementById("videotoSpk"+data.guid).addEventListener("click", ()=>{
                        stopReceiveVideo(data.guid);
                        stopSendVideo(data.recguid);
                        console.log(data);
                        _this.socket.emit("stopSendVideo",{user:_this.user, guid:data.recguid, to:data.from})
                        _this.socket.emit("spkStartVks",{user:data.user})
                    })
                    var elem=document.getElementById("videotoStage"+data.guid)
                    if(elem)
                        elem.addEventListener("click", ()=>{
                        stopReceiveVideo(data.guid);
                        stopSendVideo(data.recguid);
                        _this.socket.emit("redirectToStage",{user:_this.user, guid:data.recguid, to:data.from})
                        })
                }

            },
            onVideoLink:function (data) {

                onVideoLink(this, data)

            },
            disconnectSPKvksUser:function(discinnecredUser){

                console.log("disconnectSPKvksUser", discinnecredUser);
                var ctrl=document.getElementById('VKSboxItemBtn'+discinnecredUser.item.guid)
                console.log("disconnectSPKvksUser2", ctrl);
                if(ctrl.classList.contains('removing')) {
                    return;
                }
                console.log("discinnecredUser", discinnecredUser)
                this.socket.emit("disconnectSPKvksUser", {item:discinnecredUser})
                ctrl.classList.add('removing')

            },
            uploadFile:function(){
                uploadFile(this);
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
            deleteFile:async function(item){
                if(confirm('Вы хотите удалить файл?'))
                await axios.delete("/rest/api/file/"+item.id+"/" + eventid + "/" + roomid)

            },
            onDeleteFile:function (id) {
                this.files=this.files.filter(r=>r.id!=id)
            },
            fileLink:function(item){
                copyText("https://conf.rustv.ru/rest/api/file/"+item.id+"/" + eventid + "/" + roomid)
            },
            OnNewFilePres:function (data) {
               console.log("OnNewFilePres", this.files, data)
                this.files.forEach(f=>{
                    if(f.id==data.id)
                        console.log("insert to pres", )
                        f.presfiles.push({id:data.fileid, fileid:data.id});
                })
            },
            previewFilePres:async function(item){
                var _this=this;
                this.previewPres=item.presfiles;
                this.isPres=true;
                await axios.post("/rest/api/deActivatePres/" + eventid + "/" + roomid, {id:item.id})
                await axios.post("/rest/api/previewFilePres/" + eventid + "/" + roomid, {items:_this.previewPres})


            },
            activatePres:async function (item) {
                console.log("activatePres")
                await axios.post("/rest/api/pres/" + eventid + "/" + roomid, {id:item.id})
            },
            setPres:function (id) {
               this.pres=id;
               var elem=document.getElementById("pres"+id)
                if(elem)
                    elem.scrollIntoView({inline: "center", behavior: "smooth"})
            },
            clearPres:async function () {
                await axios.post("/rest/api/deActivatePres/" + eventid + "/" + roomid, )
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
            chatOnOff:function () {

                axios.post("/rest/api/isChat/"+eventid+"/"+roomid,{isChat:!this.isChat}).then();
            },
            OnIsChat:function (data) {
                this.isChat=data.isChat;
            },
            filesOnOff:function () {

                axios.post("/rest/api/isFiles/"+eventid+"/"+roomid,{isFiles:!this.isFiles}).then();
            },
            OnIsFiles:function (data) {
                this.isFiles=data.isFiles;
            },
            usersOnOff:function () {

                axios.post("/rest/api/isUsers/"+eventid+"/"+roomid,{isUsers:!this.isUsers}).then();
            },
            OnIsUsers:function (data) {
                this.isUsers=data.isUsers;
            },
            //
            qOnOff:function () {

                axios.post("/rest/api/isQ/"+eventid+"/"+roomid,{isQ:!this.isQ}).then();
            },
            OnQOnOff:function (data) {
                this.isQ=data.isQ;
            },
            lentaOnOff:function () {

                axios.post("/rest/api/isLenta/"+eventid+"/"+roomid,{isLenta:!this.isLenta}).then();
            },
            OnIsLenta:function (data) {
                this.isLenta=data.isLenta;
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
        computed: {
            sortedUsers:function () {
                var sorted= this.users.sort((a,b)=>{
                    if(a.handUp && b.handUp)
                        return 0;
                    if(a.handUp && !b.handUp)
                        return -1;
                    if(!a.handUp && b.handUp)
                        return 1;
                })
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
            axios.get('/rest/api/infomod/'+eventid+"/"+roomid)
                .then(function (dt) {
                    _this.user=dt.data;
                    connect(_this,roomid, function (socket) {
                        _this.socket=socket;
                        checkSpeakerScreen(_this);
                    });

                    startVideo(document.getElementById("translationVideo"))
                    axios.get("/rest/api/users/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.users=r.data;
                            console.log(_this.users)
                        })
                    axios.get("/rest/api/quest/"+eventid+"/"+roomid)
                        .then(function (r) {
                            console.log(r.data)
                            _this.q=r.data;
                        })
                    axios.get("/rest/api/chat/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.chat=r.data;
                        })
                    axios.get("/rest/api/votes/"+eventid+"/"+roomid)
                        .then(function (r) {
                            console.log("votes", r.data)
                            _this.votes=r.data;
                        })
                    axios.get("/rest/api/files/"+eventid+"/"+roomid)
                        .then(function (r) {

                            _this.files=r.data;

                            axios.get("/rest/api/activePres/"+eventid+"/"+roomid)
                                .then(function(ff){
                                   // console.log("activePres", ff)
                                    if(ff.data.fileid) {
                                        _this.previewPres = _this.files.filter(r => r.id == ff.data.fileid)[0].presfiles
                                        _this.pres=ff.data.fileid
                                            setTimeout(function(){
                                            var elem=document.getElementById("pres"+ff.data.fileid)
                                            if(elem)
                                                elem.scrollIntoView({inline: "center", behavior: "smooth"})
                                        },200)

                                        _this.pres=ff.data.item
                                        _this.isPres=ff.data.item?true:false
                                    }
                                    else
                                        _this.previewPres =[]


                                })
                        })
                    document.getElementById("app").style.opacity=1;

                })
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

    });
}

function checkSpeakerScreen(_this){
     axios.get('/rest/api/isSpkScreen/'+eventid+"/"+roomid)
         .then(function (r) {
                 _this.isSpkScreen=r.data
             setTimeout(function () {
                 checkSpeakerScreen(_this);
             },5*1000)
         })
         .catch(function () {
             setTimeout(function () {
                 checkSpeakerScreen(_this);
             },5*1000)
         })
}
function startVideo(video) {
    if(!video)
        return;
    if (Hls.isSupported()) {

        var hls = new Hls();
        console.log("init HLS")
        hls.loadSource(video.src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log("MANIFEST_PARSED")

        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        // try to recover network error
                        console.log("fatal network error encountered, try to recover");
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.log("fatal media error encountered, try to recover");
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
        video.addEventListener('loadedmetadata', function() {

            video.controls=true;
            banner.style.display="none";
            video.play();
        });
    }
}
