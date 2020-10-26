
window.onload=function () {
    var app = new Vue({

        el: "#app",
        data: {
            isStarted:false,
            results:[]

        },
        watch: {
            isError:function (val) {
                results.filter(r=>r.error).length>0
            },
        },
        methods: {},
        mounted: function () {
            setTimeout(function () {
                document.getElementById("app").style.opacity=1;
            },0)

        }
    })
};