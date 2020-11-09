window.onload=function () {
    var app = new Vue({

        el:"#app",
        data:{
            events:[],
            editRoom:null,
            allowUsers:null,
            telInput:"",
            otrasl:null,
            company:null,
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
            sendInviteNow:async function(item){
                if(confirm("Сейчас будут отправлены приглашения всем участникам")){
                    var dt=await axios.post("/rest/api/sendInviteNow", item);
                    alert('Приглашения отправлены')
                }
            },
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
                if(item.regCase==1)
                    item.isEmail=false;
                this.changeEvent(item);
            },
            changeOtrasl:function (item, regCase) {
                item.isOtrasl=!item.isOtrasl;
                this.changeEvent(item);
            },
            changeEmailText:function(item){
                item.isEmail=!item.isEmail;
                if(item.isEmail && item.regCase==1)
                    item.regCase=2;
                this.changeEvent(item);
            },
            changeCompany:function (item, regCase) {
                item.isCompany=!item.isCompany;
                if(item.isCompany)
                    item.isCompanyName=false;
                this.changeEvent(item);
            },
            changeClientCss:function (item) {
                item.isClientCss=!item.isClientCss;
                if(!item.isClientCss)
                    item.isClientCss=null;
                this.changeEvent(item);
            },
            changeClientCssText:function (item) {
                this.changeEvent(item);
            },
            changeCompanyName:function(item){
                item.isCompanyName=!item.isCompanyName;
                if(item.isCompanyName)
                    item.isCompany=false;
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
            changeRoomPriglDate:function (item, e) {
                var _this=this;

                    flatpickr(e.target, {
                        defaultDate:item.date,
                        wrap: false,
                        position:"auto center",
                        locale: "ru", // locale for this instance only
                        onChange: function (selectedDates) {

                            var selected=moment(selectedDates[0])
                            item.dateprigl=new Date(moment(item.dateprigl).date(selected.date()).month(selected.month()).year(selected.year()).unix()*1000)
                            console.log("item.dateprigl", item.dateprigl)
                            _this.changeRoom().then(function(){});
                        }
                    });

            },
            changePrigl:function(item){
                item.isPrigl=!item.isPrigl;
                _this.changeRoom().then(function(){});
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
            changeRoomPriglTime:async function (item, e) {
                var _this=this;
                flatpickr(e.target, {
                    locale: "ru", // locale for this instance only
                    defaultDate:item.date,
                    enableTime: true,
                    noCalendar: true,
                    static:true,
                    wrap: false,
                    dateFormat: "H:i",
                    time_24hr: true,
                    onChange: function (selectedDates) {
                        var selected=moment(selectedDates[0])
                        item.dateprigl=new Date(moment(item.dateprigl).hour(selected.hour()).minute(selected.minute()).unix()*1000)
                        _this.changeRoom().then(function(){});;
                    }
                });
            },

            changeRoomSect:async function(sect) {


              //  if(sect=='isQpreMod' || sect=='isPres' || sect=='isFile' || sect=='isRecord'  )
               //     return alert("Ваш тарифный план не позволяет активировать эту функцию. Пожалуйста, свяжитесь с отделом продаж info@rustv.ru");
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
            /////
            showOtrasl:async function(event){
                var dt=await axios.get('/rest/api/otrasl/'+event.id);
                this.otrasl={items:dt.data, event:event};
            },
            saveOtrasl:async function()
            {
               // await axios.post("/rest/api/otrasl", this.otrasl);
                this.otrasl=null
            },
            addOtrasl:async function(event){
              var dr=  await axios.put("/rest/api/otrasl/"+event.id);
                this.otrasl.items.push(dr.data)
            },
            saveOtraslItem:async function(item){
                var dr=  await axios.post("/rest/api/otraslItem/",item);

            },
            deleteOtraslItem:async function(item){
                var dr=  await axios.delete("/rest/api/otraslItem/"+ item.id);
                this.otrasl.items=this.otrasl.items.filter(r=>r.id!=item.id);
            },
            /////
            showCompany:async function(event){
                var dt=await axios.get('/rest/api/company/'+event.id);
                console.log(dt.data)
                this.company={items:dt.data, event:event};
            },
            saveCompany:async function()
            {
                // await axios.post("/rest/api/otrasl", this.otrasl);
                this.company=null
            },
            addCompany:async function(event){
                var dr=  await axios.put("/rest/api/company/"+event.id);
                this.company.items.push(dr.data)
            },
            saveCompanyItem:async function(item){
                var dr=  await axios.post("/rest/api/companyItem/",item);

            },
            deleteCompanyItem:async function(item){
                var dr=  await axios.delete("/rest/api/companyItem/"+ item.id);
                this.company.items=this.company.items.filter(r=>r.id!=item.id);
            },
            ///
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