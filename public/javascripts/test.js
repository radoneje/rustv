app


window.onload=function () {
    var app = new Vue({

        el: "#app",
        data: {
            events: [],
            editRoom: null,
            allowUsers: null,
            telInput: "",
            otrasl: null,
            company: null,
        },
        watch: {
            editRoom: function (val) {
                document.body.style.overflowY = val ? "hidden" : "auto";
            },
            allowUsers: function (val) {
                document.body.style.overflowY = val ? "hidden" : "auto";
            }
        },
        methods: {},
        mounted: function () {
            document.getElementById("app").style.opacity=1;
        }
    })
};