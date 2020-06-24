
window.onload=function () {
    var app = new Vue({
        el: '#app',
        data: {

        },
        methods:{
        },
        computed: {
        },
        watch:{
        },
        mounted:async function () {
            var _this=this;
            document.getElementById("app").style.opacity = 1;
            var data=[]
            arr.forEach(a=>{
                data.push({"x":a.val,"value":a.count})
            })
            console.log("data", data)
            var chart = anychart.tagCloud(data);
            chart.title(tag.title)
            chart.angles([0])
            chart.container("container");
            chart.draw();
        }
    });
}
