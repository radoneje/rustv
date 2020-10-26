
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
                try {
                    exec("setTimeout(()=>{console.log('esc6')},0)");
                    _this.results.push({title:"Browser Version", status:1,error:false, descr:""})
                }
                catch (e) {
                    _this.results.push({title:"Browser Version", status:1,error:false, descr:""})
                    return;
                }
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