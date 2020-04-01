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
        },
        methods:{
            isWebRtc:function(){
                var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
                var ya =/YaBrowser/.test(navigator.userAgent) ;
                var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
                var isRTC=typeof(RTCPeerConnection)=="function"
                return  ((isChrome || ya) && !isMobile && isRTC);
            },
            isEsc6:function () {
                try { eval('"use strict";const s=()=>{;;}; s();'); return true}
                catch (e)
                { console.log(e);
                    return false
                }
            },
            sectActive:function (item) {
                var _this=this;
                this.sect.forEach(function (e) {

                    e.isActive=(item.id==e.id);
                    if(e.isActive)
                        _this.activeSection=e.id
                    // return e;
                })
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

        },
        mounted:async function () {
            var _this=this;
            axios.get('/rest/api/info/'+eventid+"/"+roomid)
                .then(function (dt) {
                    _this.user=dt.data;
                    connect(_this,roomid);
                    axios.get("/rest/api/users/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.users=r.data;
                            console.log(_this.users)
                        })
                    axios.get("/rest/api/quest/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.q=r.data;
                        })
                    axios.get("/rest/api/chat/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.chat=r.data;
                        })

                })
        }
    })
}
