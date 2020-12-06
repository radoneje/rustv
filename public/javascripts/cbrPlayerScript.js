window.onload=function () {
    var player = videojs('my-video');
    player.src('https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_640_3MG.mp4')


    var app= new Vue({
        el:"app",
        data: {},
        methods:{},
        mounted:function () {
            document.getElementById("videoWrapper").style.display="block";
        }
    })
}