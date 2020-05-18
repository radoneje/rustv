arrVideo=[];
window.onload=function () {

    var peerConnection=null;
    var app = new Vue({
        el: '#app',
        data: {
            q:[],
            user:null,
            socket,
            SPKalertText:"",
            SPKalert:false,
            SPKalertTimeout:null,

        },
        methods:{

            setSpkAlert:function (data) {

                this.SPKalert=data.SPKalert;
                this.SPKalertText=data.SPKalertText;
            },


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

        },
        mounted:async function () {


            var _this=this;
            axios.get('/rest/api/infospk/'+eventid+"/"+roomid)
                .then(function (dt) {
                    _this.user=dt.data;

                    var serverUrl;
                    var scheme = "http";
                    if (document.location.protocol === "https:") {
                        scheme += "s";
                    }
                    serverUrl = document.location.protocol + "//" + myHostname;
                    log('Connecting to server:' + serverUrl);
                    socket = io(serverUrl);
                    socket.on('connect', function() {
                        socket.emit("helloNobody", {id: _this.user.id, roomid: roomid});
                        console.log("connect")

                    })
                    socket.on("setSpkAlert", function(data){
                        if(_this.setSpkAlert)
                            _this.setSpkAlert(data)
                    });
                    socket.on("qAdd", function(data){
                        _this.q.push(data);

                    });
                    socket.on("qAnswer", function(data){
                        console.log("qAnswer")
                        _this.q.forEach(function (e) {
                            if(e.id==data.id) {
                                e.answer = data.answer;

                            }
                        })

                    });
                    socket.on("qDelete", function(data){
                        _this.q=_this.q.filter(function (e) {return e.id!=data;});
                    });
                    socket.on("qStatus", function(data){
                        _this.q.forEach(function (e) {
                            if(e.id==data.id) {
                                e.isReady = data.isReady;

                            }
                        })

                    });
                    socket.on("qToSpk", function(data) {

                        _this.q.forEach(function (e) {
                            if (e.id == data.id) {
                                e.isSpk = data.isSpk;
                            }
                        })
                    })

                    axios.get("/rest/api/quest/" + eventid + "/" + roomid)
                        .then(function (r) {
                            _this.q = r.data;
                        })
                    document.getElementById("app").style.opacity = 1;


                    })



        }
    });
}
