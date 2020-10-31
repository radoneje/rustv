new Vue({
    el:"#topRedirect",
    data:{

        isLoaded:false,
        isDialogShow:false,
        usr:{},
        items:[],
    },
    methods:{
        formatKey:function (txt) {
            txt=txt.replace("a","/a/")
            txt=txt.replace("b","/b/")
            return txt;
        },
        saveRedirect:async function(item){
            var r=await axios.post("/rest/api/redirect", item);
        }
    },
    mounted:async function () {
        var _this=this;
        this.isLoaded=true;
        var r=await axios.get("/rest/api/redirect");
        this.items=r.data;
    }
})