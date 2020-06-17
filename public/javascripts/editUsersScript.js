
window.onload=function () {

    var app = new Vue({
        el: '#app',
        data: {
            users:[],
            addText:""

        },
        methods:{

            usersAdd:async function () {
                if(this.addText.length==0)
                    return;
                var rows=this.addText.split("\n");
                console.log(rows);
                var ret=[];
                rows.forEach(r=>{
                    if(r.length>4) {
                        var col = r.split(";")
                        ret.push({f:col[0],i:col[1],smi:col[2]|| null, personalcode:col[3]||null})
                    }
                })
                var dt=await  axios.post("/rest/api/roomUsers/"+roomid, {items:ret} )
                this.users=dt.data;
                this.addText="";
            },
            changeUserEng:async function (item) {
                var dt=await  axios.post("/rest/api/roomUsersEdit/"+roomid, {item} )
            }

        },
        watch:{


        },
        mounted:async function () {
            var _this=this;
            document.getElementById("app").style.opacity = 1;
            var dt=await axios.get("/rest/api/roomUsers/"+roomid)
            this.users=dt.data;
            console.log(dt.data);
        }
    });
}
