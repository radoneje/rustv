new Vue({
    el:"#topUserBox",
    data:{
        isLoaded:false,
        isDialogShow:false,
        users:[],
        tel:"",

    },
    methods:{
        saveFio:async function () {
            await axios.post("/rest/api/CurrUser", this.usr)
        },
        saveUser:async function (user) {
            await axios.post("/rest/api/admins", user)
        },
        addUser:async function (user) {
            var r=await axios.post("/rest/api/adminsAdd", {tel:this.tel})
            this.users.push(r.data);
            this.tel="";
        }
    },
    mounted:async function () {
        var _this=this;
        this.isLoaded=true;
        document.body.addEventListener("click", function () {
            _this.isDialogShow=false;
        })
        var dt=await axios.get("/rest/api/admins")
        _this.users=dt.data;
        console.log(dt);
    }
})