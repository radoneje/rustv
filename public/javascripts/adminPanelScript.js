window.onload=function () {
    var app = new Vue({

        el:"#app",
        data:{
            events:[],
            editRoom:null,
            allowUsers:null,
            telInput:""
        },
        watch:{
            editRoom:function (val) {
                    document.body.style.overflowY=val?"hidden":"auto";
            },
            allowUsers:function (val) {
                document.body.style.overflowY=val?"hidden":"auto";
            }
        },
        methods:{
            addEvent:async function () {
                var dt=await axios.post("/rest/api/events");
                if(dt.data) {
                    dt.data.rooms = [];
                    this.events.push(dt.data);
                }
                else
                    alert("Ваш тарифный план не позволяет активировать эту функцию. Пожалуйста, свяжитесь с отделом продаж info@rustv.ru")
            },
            changeEventCase:function (item, regCase) {
                item.regCase=regCase;
                this.changeEvent(item);
            },
            changeEvent:async function(item){
                await axios.put("/rest/api/events", item);
            },
            addRoom:async function(item){
                var dt=await axios.post("/rest/api/room", item);
                if(dt.data) {
                    item.rooms.push(dt.data);
                }
                else
                    alert("Ваш тарифный план не позволяет активировать эту функцию. Пожалуйста, свяжитесь с отделом продаж info@rustv.ru")
            },
            changeRoomDate:function (item, e) {
                var _this=this;
                flatpickr(e.target, {
                    defaultDate:item.date,
                    locale: "ru", // locale for this instance only
                    onChange: function (selectedDates) {
                        var selected=moment(selectedDates[0])
                        item.date=new Date(moment(item.date).date(selected.date()).month(selected.month()).year(selected.year()).unix()*1000)
                         _this.changeRoom().then(function(){});
                    }
                });
            },
            changeRoomTime:async function (item, e) {
                var _this=this;
                flatpickr(e.target, {
                    locale: "ru", // locale for this instance only
                    defaultDate:item.date,
                    enableTime: true,
                    noCalendar: true,
                    dateFormat: "H:i",
                    time_24hr: true,
                    onChange: function (selectedDates) {
                        var selected=moment(selectedDates[0])
                        item.date=new Date(moment(item.date).hour(selected.hour()).minute(selected.minute()).unix()*1000)
                         _this.changeRoom().then(function(){});;
                    }
                });
            },
            changeRoomSect:async function(sect) {


                if(sect=='isQpreMod' || sect=='isPres' || sect=='isFile' || sect=='isRecord'  )
                    return alert("Ваш тарифный план не позволяет активировать эту функцию. Пожалуйста, свяжитесь с отделом продаж info@rustv.ru");
                    this.editRoom[sect]=! this.editRoom[sect];
                //
                await this.changeRoom();
            },
            changeRoom:async function(){
                axios.put('/rest/api/room',this.editRoom);
            },
            showAllowedUsers:async function(event){

                var dt=await axios.get('/rest/api/allowedUsers/'+event.id);
                this.allowUsers={id:event.id, users:dt.data};


            },
            addAllowedTels:async function (item) {
                var m = this.telInput.match(/(\+\d\d\d\d\d\d\d\d\d\d\d)/gm);
                var arr=[]
                if(m) {
                    for (var i = 0; i < m.length; i++) {
                        arr.push(m[i]);
                    }
                    arr = arr.sort((a, b) => {
                        return a.localeCompare(b)
                    })

                    var dt = await axios.post('/rest/api/addAllowedTels', {id: item.id, tels: arr});
                    this.allowUsers = {id: item.id, users: dt.data};
                }
                this.telInput = "";
            }
            ,deleteAlowedTel:async function (id, telid) {
                var dt=await axios.post('/rest/api/addAllowedTelsDelete', {id:id, telid:telid});
                this.allowUsers={id:id, users:dt.data};
            }

        },
        mounted:async function () {
            var dt=await axios.get("/rest/api/events");
            this.events=dt.data;
            document.getElementById("app").style.opacity=1;
        }
    });
}