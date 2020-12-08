
//var roomid=100;
//var eventid = 43;
var roomid=30;
var eventid = 28;
var app= new Vue({
    el: "#voteres",
    data: {
        votes: [],
    },
    methods: {
        answIsReady:function (answ) {
            return localStorage.getItem("ansv_"+answ.id)? true: false
        },
        sortedVoteAnsvers:function(arr){
            var nArr=arr.slice(0)
            return nArr.sort((a,b)=>{return a.id-b.id});
        },
        CalcAnswPercent:function (answ, vote) {
            var _this=this;
            var count=vote.answers.length;
            var total=0;
            vote.answers.forEach(a=>total=total+a.count);

            if(total==0)
                return 0;

            ret=parseFloat(answ.count/total)*100;
            return parseInt(ret);
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
        }
    },
    mounted: function () {
        this.UpdateInteractive(this);
    }
});