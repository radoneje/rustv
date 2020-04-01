new Vue({
    el:"#topUserBox",
    data:{
        isLoaded:false,
        isDialogShow:false,
        usr:{}

    },
    methods:{
        saveFio:async function () {
            await axios.post("/rest/api/CurrUser", this.usr)
        }
    },
    mounted:async function () {
        var _this=this;
        this.isLoaded=true;
        document.body.addEventListener("click", function () {
            _this.isDialogShow=false;
        })
        var dt=await axios.get("/rest/api/CurrUser")
        _this.usr=dt.data;
    }
})