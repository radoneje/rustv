window.onload=function () {
    var app = new Vue({
        el: '#app',
        data: {
            webCamStream:null,
            sect:[{title:"Вопросы", isActive:false, id:1}, {title:"Чат", isActive:true, id:2},{title:"Участники", isActive:false, id:3} ],
            activeSection:2,
            chat:[],
            users:[],
            q:[],
            qText:"",
            chatText:"",
            user:null,
        },
        methods:{
            qtextChange:function (e) {
                var _this=this;
                if(this.qText.length>0)
                    qtextChange(_this,e)
                else
                    document.getElementById('qText').focus()

            },
            qtextSend:function (e) {
                var _this=this;
                if(this.qText.length>0)
                    qtextSend(_this)
                else
                    document.getElementById('qText').focus()


            },
            chattextSend(_this){
                if(this.chatText.length>0)
                    chattextSend(this) ;
                else
                    document.getElementById('chatText').focus()
            },
            chattextChange:function (e) {
                var _this=this;
                if(this.chatText.length>0)
                    chattextChange(_this, e);
                else
                    document.getElementById('chatText').focus()

            },
            chatAddSmile:function () {
                this.chatText+=" :) ";
                document.getElementById("chatText").focus();
            },
            deleteChat:function (item) {
                var _this=this;
                if(confirm('Вы хотите удалть сообщение')){
                    axios.delete("/rest/api/chatdelete/"+item.id+"/"+eventid+"/"+roomid)
                        .then(function (r) {

                        })

                }
            },
            deleteQ:function (item) {
                var _this=this;
                if(confirm('Вы хотите удалть сообщение')){
                    axios.delete("/rest/api/qdelete/"+item.id+"/"+eventid+"/"+roomid)
                        .then(function (r) {

                        })

                }
            },
            QsetOld:function (item) {
                axios.post("/rest/api/qsetStatus/"+eventid+"/"+roomid,{id:item.id, status:true})
                    .then(function (r) {

                    })
            },
            QsetNew:function (item) {
                axios.post("/rest/api/qsetStatus/"+eventid+"/"+roomid,{id:item.id, status:false})
                    .then(function (r) {

                    })
            },
        },
        mounted:async function () {
            var _this=this;
            axios.get('/rest/api/info/'+eventid+"/"+roomid)
                .then(function (dt) {
                    _this.user=dt.data;
                    connect(_this,roomid);
                    axios.get("/rest/api/users/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.users=r.data;
                            console.log(_this.users)
                        })
                    axios.get("/rest/api/quest/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.q=r.data;
                        })
                    axios.get("/rest/api/chat/"+eventid+"/"+roomid)
                        .then(function (r) {
                            _this.chat=r.data;
                        })
                    document.getElementById("app").style.opacity=1;

                })
        }
    });
}