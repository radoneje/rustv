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
            SPKalertText:""
        },
        methods:{
            showLocalVideo:function () {
                if(this.socketConnection && this.selfVideoStream){
                    var elem=document.getElementById("selfVideo")
                    elem.style.zIndex="100";
                    elem.style.opacity="1"
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
                                    })
                                    /*_this.onMyVideoStarted(video, stream,item)*/
                                });

                                axios.get("/rest/api/users/" + eventid + "/" + roomid)
                                    .then(function (r) {
                                        _this.users = r.data;
                                        console.log(_this.users)
                                    })
                                axios.get("/rest/api/quest/" + eventid + "/" + roomid)
                                    .then(function (r) {
                                        _this.q = r.data;
                                    })
                                axios.get("/rest/api/chat/" + eventid + "/" + roomid)
                                    .then(function (r) {
                                        _this.chat = r.data;
                                    })
                                _this.socketConnection = true;

                                setInterval(() => {
                                      _this.socket.emit("SPKstatus",{SPKstatus: _this.SPKstatus, SPKalert:_this.SPKalert})
                                }, 1000)
                            }

                        }, 1000);
                    }
                    })


                })
        }
    });
}