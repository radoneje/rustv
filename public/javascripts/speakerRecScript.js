window.onload=function () {
    var arrVideo=[];
    var WowzaCfg = null;
    var BitrateCfg = null;
    var wowzaRecievers=[];
    var peerConnection=null;
    var app = new Vue({
        el: '#app',
        data: {

        },
        methods:{

            OnSpkVideo:async function(data){

                console.log("OnSpkVideoOnSpkVideo", data);
                var receiverItem = {
                    id: data.streamid,
                    isMyVideo: false,
                    user: data.user,
                    streamid: data.streamid
                }
                arrVideo.push(receiverItem)
                var video = await createVideo(data.streamid, false, data.user);
                setTimeout(async () => {
                    receiverItem.elem = document.getElementById('video_' + receiverItem.id);
                    getVideoFromWowza(receiverItem, WowzaCfg.data, BitrateCfg.data,
                        async (ret) => {
                            receiverItem.elem.play();
                        })
                });
            }
        },
        watch:{


        },
        mounted:async function () {

            WowzaCfg = await axios.get('/rest/api/meetWowza')
            BitrateCfg = await axios.get('/rest/api/meetBitrate')

            var _this=this;
            var serverUrl;
            var scheme = "http";
            if (document.location.protocol === "https:") {
                scheme += "s";
            }
            serverUrl = document.location.protocol + "//" + myHostname;
            log('Connecting to server:' + serverUrl);

            socket = io(serverUrl);
            socket.on('connect', ()=> {
                log("connection.onopen")
                socket.emit("roomRecorder",{roomid:roomid})
            });
            socket.on("newSpkVideo", async function(data){
                if(_this.OnSpkVideo)
                    _this.OnSpkVideo(data)



            });
        }
    });
}
async function createVideo(id, muted, user) {

    var meetVideoBox = document.getElementById("meetVideoBox");
    var meetVideoItem = document.createElement("div");
    meetVideoItem.classList.add("meetVideoItem");
    meetVideoItem.id = 'meetVideoItem_' + id
    var dt = await axios.get('/meeting/videoElem/' + id);
    meetVideoItem.innerHTML = dt.data;
    meetVideoBox.appendChild(meetVideoItem)
    var video = document.getElementById("video_" + id)

    var cap = document.getElementById("meetVideoCap_" + id)
    cap.innerText = (user.i || "") + " " + (user.f || "")




    return video

}
