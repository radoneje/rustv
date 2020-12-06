window.onload=function () {

    try {
        eval("()=>{;;}")
    } catch (e) {
        document.location.href = "/badbrowser"
    }

    var eventid=27;
    var roomid=100;

    var app = new Vue({
        el: '#CBloginApp',
        data: {
            isLoaded:0,
            codeError:false,
            loginCode:"",
            currLangId:"ru",
            currLang:lang["ru"],
            isLogging:false,
            isLogOn:false,


            webCamStream:null,
            sect:[

                {title:"Вопросы", isActive:false, id:1, logo:'/images/logoqactive.svg', logoactive:'/images/logoq.svg'},
                {title:"Поддержка", isActive:true, id:2, logo:'/images/logochat.svg', logoactive:'/images/logochatactive.svg'},

            ],
            activeSection:1,
            chat:[],
            isChat:false,
            users:[],
            q:[],
            isQ:true,
            isLenta:false,
            qText:"",
            chatText:"",
            user:null,
            isUsers:false,
            handUp:false,
            socket:null,
            hand:false,
            handTimer:null,
            pres:null,
            files:[],
            isFiles:false,
            mainVideoMuted:false,
            eventRooms:[],
            invitedUsers:[],
            invites:[],
            videoReceivers:[],
            room:93,
            isHead:true,
            votes:[],
            userFindText:"",
            messageFromMod:"",
            messageToModText:"",
            arrVideo:  [],
            tags:[],
            pole:[],

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



                }
                catch (e) {
                    console.warn(e);
                }
                setTimeout(this.UpdateInteractive,5000);

            },
            qtextChange:function (e) {
                var _this=this;
                if(this.qText.length>0)
                    if(e.keyCode==13 && _this.qText.length>0){
                        _this.qtextSend()
                    }
                    else
                        document.getElementById('qText').focus()

            },
            chattextChange:function (e) {
                var _this=this;
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
            initRoom:function(data){
                var _this=this;
                _this.isLogOn=true;
                _this.user=data;
                console.log(_this.user);
                _this.UpdateInteractive();
            },
            changeLang:function(){
                this.currLangId=this.currLangId=="ru"?"en":"ru";
                console.log(this.currLang);
                this.currLang=lang[this.currLangId];
            },
            loginCodeSubmit: function(){
                var _this=this;
                if(_this.isLogging)
                    return;

                _this.isLogging=true;

                try {
                    var res = axios.post("/rest/api/cbPersonalCode", {code: _this.loginCode})
                        .then(function (ret){

                            _this.initRoom(ret.data);
                        })
                        .catch(function (e) {
                            _this.codeError=true;
                            _this.loginCode="";
                            _this.isLogging=false;
                            document.querySelector(".cbLoginCode").focus();
                        })


                }
                catch (e) {
                    _this.codeError=true;
                    _this.loginCode="";
                    _this.isLogging=false;
                    document.querySelector(".cbLoginCode").focus();
                }

            },
            enterKeyDown:function(e){
                if(e.keyCode==13){
                    this.cbLogin();
                }
            },
            cbLogin:async function () {
                try {
                    var res = await axios.post("/rest/api/checkPersonalCode", {code:this.code});
                    if(res.data.redirect)
                        document.location.href=res.data.redirect
                    else
                        this.codeError=true;
                    this.code="";
                }
                catch (e) {
                    this.codeError=true;
                    this.code="";
                    console.log(e)
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
        },
        mounted:function () {
            document.querySelector(".cbLoginCode").focus();
            this.isLoaded=1;
        }
    })
}