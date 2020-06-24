
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
                data.push({"x":a.x-50,"y":(100-a.y)-50})
            })
            console.log("data", data)

            var chart = anychart.scatter();
            chart.title(tag.title);
            chart.yScale().minimumGap(0).maximumGap(0);
            chart.xScale().minimumGap(0).maximumGap(0);
            chart
                .marker(data)
                .size(20)
                .stroke('none')
                .hovered({ size: 8 });

            var yAxis = chart.yAxis();
            var markerY = chart.lineMarker();
            markerY.axis(yAxis);
            markerY.value(0);

            var xAxis = chart.xAxis();
            var markerX = chart.lineMarker();
            markerX.axis(xAxis);
            markerX.value(0);

            // set container id for the chart
            chart.container('container');
            // initiate chart drawing
            chart.draw();

          /*  var chart = anychart.tagCloud(data);
            chart.title(tag.title)
            chart.angles([0])
            chart.container("container");
            chart.draw();*/
        }
    });
}
