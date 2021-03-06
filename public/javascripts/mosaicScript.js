arrVideo=[];
window.onload=function () {

    var peerConnection=null;
    var app = new Vue({
        el: '#app',
        data: {
             arrVideo : arrVideo,
            users:[],
        },
        methods:{

            UsersVideoStarted:async function (user) {
                console.log('UsersVideoStarted', user);
                setTimeout(async()=>{
                    await phoneGetRemoteVideo(document.getElementById("meetVideoItem_"+user.id),user.socketid,()=>{
                        console.log('error video');
                    })
                },2000)

            },
            showUsers:function () {
                console.log(this.users)
            }

        },
        computed: {
            sortedUsers:function () {
                var _this=this;
                var users=_this.users.filter(u=>{console.log(u.isVideo) ;return u.isVideo});
                if(users.length>16)
                    users=users.slice(0,15);
                return users;
            }
        },
        watch:{


        },
        mounted:async function () {
            var _this=this;
            document.getElementById("app").style.opacity = 1;
           /* axios.get("/rest/api/users/"+eventid+"/"+roomid)
                .then(function (r) {
                    console.log("users", r.data)
                    _this.users = r.data;
                });*/
            var serverUrl;
            var scheme = "http";
            if (document.location.protocol === "https:") {
                scheme += "s";
            }
            serverUrl = document.location.protocol + "//" + myHostname;
            log('Connecting to server:' + serverUrl);
            socket = io(serverUrl);
            socket.on('connect', function() {

                log("connection.onopen")
                socket.emit("helloNobody",{ roomid:roomid});
            })
            socket.on("userConnnect", (user)=>{
                var find=false;
                // receiverPlayingg("userConnnect")
                _this.users.forEach(function (u) {
                    if(u.id==user.id) {
                          console.log("userConnnect", user.isActive)
                        user.isActive = true;
                        find=true
                    }
                    return user;
                })
                if(!find) {
                    user.isActive = true;
                    _this.users.push(user)
                    if(user.isVideo){
                        setTimeout(async()=>{
                            await phoneGetRemoteVideo(document.getElementById("meetVideoItem_"+user.id),user.socketid,()=>{
                                console.log('error video');
                            })
                        },2000)
                    }
                }
            })
            socket.on("userDisconnnect", function(userid){
                _this.users=_this.users.filter(u=>{return u.id!=userid})
            });
            socket.on("selfVideoStarted", function(data){
                console.log("selfVideoStarted", data)
                _this.users.forEach(function (u) {
                    if(u.id==data.id) {
                        u.isVideo = true;
                        u.socketid=data.socketid
                        if(_this.UsersVideoStarted)
                            _this.UsersVideoStarted(u);
                    }
                    return u;
                })
                _this.users=_this.users.filter(f=>{return true})
            });

        }
    });
}
