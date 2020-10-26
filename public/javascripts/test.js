
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
            start:function(){
                isStarted=true;
                this.checkError();
            },

            checkError:function () {
                var _this=this;
                try {
                    eval("const func=()=>{;;}");
                    _this.results.push({title:"Browser Version", status:1,error:false, descr:""})
                }
                catch (e) {
                    _this.results.push({title:"Browser Version", status:1,error:false, descr:""})
                    return false;
                }
                var itemWebCam={title:"Webcam and mic", status:0,error:false, descr:""}
                _this.results.push(itemWebCam)
                navigator.mediaDevices.getUserMedia({ video: true, audio:true })
                    .then(function (stream) {
                        itemWebCam.status=1;
                    })
                    .catch(function (err0r) {
                        itemWebCam.status=1;
                        itemWebCam.error=true;
                    });
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