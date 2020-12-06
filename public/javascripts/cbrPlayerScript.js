window.onload=function () {
    var player = videojs('my-video');
    player.src('https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_640_3MG.mp4')

    var eventid=27;
    var roomid=100;

    var app= new Vue({
        el:"#app",
        data: {
            votes:[],
            currLangId:"ru",
            currLang:lang[langid],
        },
        methods:{
            answIsReady:function (answ) {
                return localStorage.getItem("ansv_"+answ.id)? true: false
            },
            UpdateInteractive:async function(_this){

                try {

                    var r = await axios.get("/rest/api/votes/" + eventid + "/" + roomid)
                    this.votes = r.data;
                    console.log("UpdateInteractive", this.votes);
                }
                catch (e) {
                    console.warn(e)
                }
                setTimeout(function () {
                    _this.UpdateInteractive(_this);
                },2000)
            },
            sortedVoteAnsvers:function(arr){
                var nArr=arr.slice(0)
                return nArr.sort((a,b)=>{return a.id-b.id});
            },
        },
        mounted:function () {
            document.getElementById("videoWrapper").style.display="block";
            this.UpdateInteractive(this);
        }
    })
}