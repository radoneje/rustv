
window.onload=function () {
    var app = new Vue({

        el: "#app",
        data: {
            isStarted:false,
            results:[],
            isError:false,

        },
        watch: {
          /*  isError:function (val) {
                return results.filter(r=>r.error).length>0
            },*/
        },
        methods: {

            checkError:function () {
                var _this=this;

            }
        },
        mounted: function () {
            setTimeout(function () {
                document.getElementById("app").style.opacity=1;
            },0);
            this.checkError();


        }
    })
};
function checkESC6() {
    try {
        eval("const func=()=>{;;}");
        _this.results.push({title:"Browser Version", status:1,error:false, descr:""})
        return
    }
    catch (e) {
        _this.results.push({title:"Browser Version", status:1,error:false, descr:""})
        return false;
    }
}