window.onload=function () {
    var player = videojs('my-video');
    player.src('https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_640_3MG.mp4')

    var eventid=27;
    var roomid=100;

    var app= new Vue({
        el:"app",
        data: {
            votes:[]
        },
        methods:{
            UpdateInteractive:async function(){
                try {
                }
                catch (e) {
                    var r = await axios.get("/rest/api/votes/" + eventid + "/" + roomid)
                    this.votes = r.data;
                }
            }
        },
        mounted:function () {
            document.getElementById("videoWrapper").style.display="block";
            this.UpdateInteractive();
        }
    })
}