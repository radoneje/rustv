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
            vote:function (answ, voteItem) {
                if(voteItem.iscompl)
                    return;

                var _this=this;
                var isReady=localStorage.getItem("ansv_"+answ.id)
                if(isReady){
                    localStorage.removeItem("ansv_"+answ.id)
                    unvote(answ.id)
                }
                else
                {
                    _this.votes.forEach(v=>{
                        if(v.id==answ.voteid){
                            v.answers.forEach(a=>{
                                if(localStorage.getItem("ansv_"+a.id)) {
                                    localStorage.removeItem("ansv_" + a.id)
                                    unvote(a.id)
                                }
                            })
                        }
                    })
                    localStorage.setItem("ansv_"+answ.id, true);
                    vote(answ.id)
                }
                _this.votes=_this.votes.filter(v=>{return true})
                function vote(id) {
                    axios.post("/rest/api/vote/"+eventid+"/"+roomid,{id:id})
                }
                function unvote(id) {
                    axios.post("/rest/api/unvote/"+eventid+"/"+roomid,{id:id})
                }

            },
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