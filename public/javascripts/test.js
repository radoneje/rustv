
window.onload=function () {
    var app = new Vue({

        el: "#app",
        data: {
            isStarted:false,
            results:[],
            isError:false,
            isSucсess:false,
            errorIsSended:false,

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
                    _this.results.push({title:"Browser Version", status:1,error:false, descr:""})
                }
                catch (e) {
                    _this.results.push({title:"Browser Version", status:1,error:false, descr:""})
                    _this.isError=true;
                    return false;
                }
                var itemWebCam={title:"Webcam and mic", status:0,error:false, descr:""}
                _this.results.push(itemWebCam)
                navigator.mediaDevices.getUserMedia({ video: true, audio:true })
                    .then(function (stream) {
                        itemWebCam.status=1;
                        _this.isSucсess=true;
                        console.log("_this.isSucсess", _this.isSucсess)
                    })
                    .catch(function (err0r) {
                        itemWebCam.status=1;
                        itemWebCam.error=true;
                        _this.isError=true;
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