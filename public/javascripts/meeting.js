window.onload= ()=> {
    var server = "https://rtcroom.may24.pro/rest/janus";
    //var server = "ws://rtcroom.may24.pro/janus";

    var janus = null;
    var sfutest = null;
    var opaqueId = "videoroomtest-"+Janus.randomString(12);
    var app=new Vue({
        el:"#app",
        data:{
            sect:[
                {title:"Лента", isActive:false, id:0, logo:'/images/logofeed.svg', logoactive:'/images/logofeeda.svg'},
                {title:"Чат", isActive:true, id:2, logo:'/images/logochat.svg', logoactive:'/images/logochatactive.svg'},
                {title:"Люди", isActive:false, id:3, logo:'/images/logousers.svg', logoactive:'/images/logousersa.svg'},
                {title:"Файлы", isActive:false, id:7, logo:'/images/logofiles.svg', logoactive:'/images/logofilesa.svg'}
            ],
            activeSection:2,
            eventRooms:[],
            noWebrtc:false,
            janus:null,
            handler:null,
            janusRoomId:null,
            janusPrivateId:null,
            opaqueId:"videoroomtest-" + Janus.randomString(12),
            videos:[]
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
            },
        },

        mounted:function () {
            var _this=this;
            document.getElementById("app").style.opacity=1;

            var serverUrl;
            var scheme = "http";
            if (document.location.protocol === "https:") {
                scheme += "s";
            }
            serverUrl = document.location.protocol + "//" + myHostname+"/meetingSocket";
            log('Connecting to server:' + serverUrl);
            socket = io(serverUrl);
            socket.on('connect', function() {
                log('connect success');
                _this.emit=function (type, data, ) {
                    socket.emit(type, data);
                }
            });
        }
    })

}



