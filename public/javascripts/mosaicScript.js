arrVideo=[];
window.onload=function () {

    var peerConnection=null;
    var app = new Vue({
        el: '#app',
        data: {
             arrVideo : arrVideo,
        },
        methods:{
            updateVideoArr:async function () {
                var _this=this;
                try {
                    var dt = await axios.get("/rest/api/localUsers/" + eventid + "/" + roomid)
                    var arr = dt.data.filter(u => {
                        return u.isVideo && u.isActive && u.th
                    });
                    arr.forEach(u => {
                        u.th += "?rnd=" + Math.random();
                    });
                    if(arr.length>16)
                        arr=arr.slice(0,15);
                    var needLayout=this.arrVideo.length != arr.length;
                    this.arrVideo = arr;
                    arrVideo = arr;
                    if(needLayout)
                    {
                        console.log("needLayout")
                        setTimeout(videoLayout, 100)
                        //videoLayout();
                    }
                }
                catch (e) {
                    console.warn(e)
                }
                console.log(this.arrVideo)
                setTimeout(()=>{this.updateVideoArr()}, 5000);

            }

        },
        watch:{


        },
        mounted:async function () {
            document.getElementById("app").style.opacity=1;
            this.updateVideoArr()

        }
    });
}
