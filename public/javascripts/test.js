
var vDevice=null;
var aDevice=null
window.onload=function () {
    var app = new Vue({

        el: "#app",
        data: {
            isStarted:false,
            results:[],
            isError:false,
            isSucсess:false,
            errorIsSended:false,
            isShowVideo:false,

        },
        watch: {
          /*  isError:function (val) {
                return results.filter(r=>r.error).length>0
            },*/
        },
        methods: {
            start:function(){
                this.isStarted=true;
                this.checkError();
            },
            sendErrors:function(){
                var _this=this;
                _this.errorIsSended=true;
                axios.post("/rest/api/speakersErrors/",{results:_this.results}).then(function () {
                    console.log("error send")
                }).catch(function (e) {
                    console.warn("error send", e)
                })
            },
            checkError:function () {
                var _this=this;
                try {
                    eval("const func=()=>{;;}");
                    _this.results.push({title:"Browser Version", status:1,error:false, descr:""});
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = '/javascripts/test2.js';
                    script.onload = function(){
                        checkStep2(_this);
                    };
                    document.body.appendChild(script);
                }
                catch (e) {
                    _this.results.push({title:"Browser Version", status:1,error:false, descr:e})
                    _this.isError=true;
                    return false;
                }
            }
        },
        mounted: function () {
            setTimeout(function () {
                document.getElementById("app").style.opacity=1;
            },0);



        }
    })
};
function checkESC6() {

}