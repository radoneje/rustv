window.onload=function () {

    try{
        eval("()=>{;;}")
    }
    catch (e) {
        document.location.href="/badbrowser"
    }

    var player;
    var app = new Vue({
        el: '#app',
        data: {
            loader: false,
            tel: localStorage.getItem("loginTel") || "",
            telErr: false,
            f:localStorage.getItem("f")|| "",
            i:localStorage.getItem("i")||"",
            fErr:false,
            iErr:false,
            email:localStorage.getItem("email") || "",
            emailErr:false,
            showCode:false,
            codeErr:false,
            code:"",
            user:null,
            userId:null,
            company:null,
            otrasl:null,
            isShowCompany:false,
            isShowOtrasl:false,
            companyTitle:null,

            sect:[

                {title:"Вопросы", isActive:false, id:1, logo:'/images/logoqactive.svg', logoactive:'/images/logoqCl.svg'},
                {title:"Чат", isActive:true, id:2, logo:'/images/logochat.svg', logoactive:'/images/logochatactiveCl.svg'}
            ],
            activeSection:2,
            chat:[],
            isChat:true,
            users:[],
            q:[],
            votes:[],
            tags:[],
            pole:[],
            isQ:true,
            isLenta:false,
            qText:"",
            chatText:"",
            activeStream:1,
            pres:[],
            selLang:"ru",
            regUserForm:false

        },
        methods:{
            setActiveStream:function(id){
                this.activeStream=id;
               // this.room.id=100+parseInt(id);
                roomid=100+parseInt(id);
                player.src(this.getplayerSrc());
                player.play();
            },
            qLike:function (item) {
                if(!localStorage.getItem("qLike"+item.id))
                    axios.post("/rest/api/qLike/"+eventid+"/"+roomid,{id:item.id}).then();
                localStorage.setItem("qLike"+item.id, true);
            },
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


                    r = await axios.get("/rest/api/votes/" + eventid + "/" + roomid)
                    _this.votes = r.data;


                    r = await axios.get("/rest/api/tags/" + eventid + "/" + roomid)
                    /*_this.tags = */var data= r.data.filter(d=>d.isactive==true);

                    var res=false;

                    res=res || _this.tags.length!=data.length;
                    _this.tags.forEach(tag=>{
                        var fin=data.filter(d=>d.id==tag.id)
                        if(fin.length !=1)
                            res=true;
                        else
                            res=fin[0].isactive!=tag.isactive || fin[0].iscompl!=tag.iscompl || fin[0].isDeleted!=tag.isDeleted

                    })
                    if(res)
                        _this.tags=data;



                    r = await axios.get("/rest/api/pole/" + eventid + "/" + roomid)
                    _this.pole = r.data;
                }
                catch (e) {
                    console.warn(e);
                }
                setTimeout(this.UpdateInteractive,5000);

            },
            qtextChange:function (e) {
                var _this=this;
                if(!_this.user)
                    return this.registerUser();
                if(this.qText.length>0)
                    if(e.keyCode==13 && _this.qText.length>0){
                        _this.qtextSend()
                    }
                    else
                        document.getElementById('qText').focus()

            },
            chattextChange:function (e) {
                var _this=this;

                if(!_this.user)
                    return this.registerUser();

                if(this.chatText.length>0)
                    if(e.keyCode==13 && _this.chatText.length>0){
                        _this.chattextSend()
                    }
                    else
                        document.getElementById('chatText').focus()

            },
            qtextSend:function(){
                var _this=this;
                if(_this.qText.length>0) {
                    var tmp= _this.qText;
                    _this.qText = "";
                    axios.post("/rest/api/quest2/" + eventid + "/" + roomid, {text:tmp, user:_this.user})
                        .then(function (e) {
                            _this.q.push(e.data);
                            //console.log(e.data)
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
            tagsResShow: function(item){

                var url='/tagsres/'+item.id
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
            answIsReady:function (answ) {
                return localStorage.getItem("ansv_"+answ.id)? true: false
            },
            sortedVoteAnsvers:function(arr){
                var nArr=arr.slice(0)
                return nArr.sort((a,b)=>{return a.id-b.id});
            },
            selectOtrasl:function(item){
                this.otrasl=item;
                this.isShowOtrasl=null;
            },
            showOtrasl:  function(){
                var _this=this;
                axios.get("/rest/api/otrasl/"+evntId).then(function (dt) {
                    _this.isShowOtrasl=dt.data;

                });

            },
            selectCompanies:function(item){
                this.company=item;
                this.isShowCompany=null;
            },
            showCompanies:  function(){
                var _this=this;
                axios.get("/rest/api/company/"+evntId).then(function (dt) {
                    _this.isShowCompany=dt.data;

                });

            },
            enter: async function () {

                var _this = this;
                var emailElem=document.getElementById("emailInpit")
                var telElem=document.getElementById("telInpit")
                if ( this.f.length < 2) {
                    this.fErr = true;
                } else
                    this.fErr = false
                if ( this.i.length < 2) {
                    this.iErr = true;
                } else
                    this.iErr = false
                if(emailElem){
                    if(!validateEmail(this.email))
                        this.emailErr=true
                    else
                        this.emailErr=false
                }
                if(telElem){
                    if (!this.tel.match(/^\+\d\s\(\d\d\d\)\s\d\d\d\s\d\d\d\d$/))
                        this.telErr=true
                    else
                        this.telErr=false
                }

                if(this.iErr)
                    return document.getElementById("iInpit").focus();
                if(this.fErr)
                    return document.getElementById("fInpit").focus();
                if(this.telErr)
                    return document.getElementById("telInpit").focus();
                if(this.emailErr)
                    return document.getElementById("emailInpit").focus();

                localStorage.setItem("f", this.f);
                localStorage.setItem("i", this.i);
                localStorage.setItem("email", this.email);
                this.loader=true;

                //  console.log("d", this.company?this.company.id:null, this.otrasl?this.otrasl.id:null,this.company, this.otrasl)

                var dt= await axios.post('/rest/api/regtoevent/'
                    ,{evntId:evntId, f:this.f, i:this.i, tel:this.tel, email:this.email, companyTitle:this.companyTitle, company:this.company?this.company.id:null, otrasl:this.otrasl?this.otrasl.id:null})

                if(!dt.data.showConfirm){
                    if(dt.data.user)
                    {
                        _this.user=dt.data.user;
                        _this.UpdateInteractive();
                        setTimeout(function(){
                            startVideo();
                            window.scrollTo(0, 0);
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
                        },0)
                    }
                    else{
                        this.loader = false;
                        this.showCode=false;
                        this.telErr=true;
                    }
                }
                else {
                    this.loader = false;
                    this.showCode=true;
                    this.userId=dt.data.user.id
                    setTimeout(()=>{
                        document.getElementById('code').focus();
                    },0)
                }




            },
            sendCode:async function () {
                if(!checkCode(this.code))
                {
                    this.codeErr=true;
                    document.getElementById('code').focus();
                    return;
                }
                this.codeErr=false;
                this.loader=true;
                var dt=await axios.post('/rest/api/logincheckcode/'
                    ,{evntId:evntId,id:this.userId, f:this.f, i:this.i, tel:this.tel, email:this.email, code:this.code});
                if(dt.data.status>0)
                    closeWnd();
                else{

                    this.code="";
                    this.loader = false;
                    this.codeErr=true;
                    document.getElementById('code').focus();
                }

            },
            closeCodeWindow:function () {
                this.codeErr=false;
                this.loader=false;
                this.showCode=false;
                this.code="";
            },
            getplayerSrc:function () {
                var src="https://front.sber.link/hls/app0"+(this.activeStream+1)+"/e_st0"+(this.activeStream+1)+"_720p/index.m3u8"
                return src;
            },
            registerUser:function () {

                this.regUserForm=true;
                setTimeout(()=>{
                    var elem=document.getElementById('regUserFormInput');
                    elem.value="";
                    elem.focus()
                },0)
            },
            regUser:async function () {
                var elem=document.getElementById('regUserFormInput');
                if(! elem.value || elem.value.length==0)
                    return;
                var ret=await axios.post("/rest/api/sbergileRegUser", {roomid:roomid, username:elem.value})
                this.user=ret.data;
                localStorage.setItem("sbergileUser", JSON.stringify(this.user));
                this.regUserForm=false;
            }

        },
        mounted:function () {
            var _this=this;
            //  var iInpit=document.getElementById("iInpit");
            // if(iInpit)
            //    iInpit.focus()
            var telElem=document.getElementById("telInpit")
            if(telElem) {
                telElem.addEventListener("input", mask, false);
                telElem.addEventListener("focus", mask, false);
                telElem.addEventListener("blur", mask, false);
            }
            document.getElementById("app").style.opacity=1;
            player= videojs('my-video');
            player.src(this.getplayerSrc());
            document.getElementById("videoWrapper").style.display="block"
            var item=localStorage.getItem("sbergileUser");
            if(item)
                this.user= JSON.parse(item)
            _this.UpdateInteractive();

        }
    })
}
function closeWnd(){
    /* if(window.opener  && window.opener.registerSuccess)
     {
         window.opener.registerSuccess(dt.data)
     }*/
    //  else
    var url = new URL(window.location.href);
    var redirect = url.searchParams.get("redirect");
    console.log(redirect);
    if(!redirect)
        redirect="/event/"+evntId

    setTimeout(document.location.href=redirect,1000)
    return
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function setCursorPosition(pos, elem) {
    elem.focus();
    if (elem.setSelectionRange) elem.setSelectionRange(pos, pos);
    else if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveEnd("character", pos);
        range.moveStart("character", pos);
        range.select()
    }
}

function mask(event) {
    var matrix = "+7 (___) ___ ____",
        i = 0,
        def = matrix.replace(/\D/g, ""),
        val = this.value.replace(/\D/g, "");
    if (def.length >= val.length) val = def;
    this.value = matrix.replace(/./g, function (a) {
        return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a
    });
    if (event.type == "blur") {
        if (this.value.length == 2) this.value = ""
    } else setCursorPosition(this.value.length, this)
};
function checkCode(code) {

    if (code.length < 5)
        return false;
//console.log("f check",Number.isInteger( parseInt(code)) )
    return Number.isInteger(parseInt(code));


}
function startVideo() {

    if(typeof(video) =="undefined")
        return;
    if( Hls.isSupported()) {

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