window.onload=function () {
    var app = new Vue({
        el: '#app',
        data: {
            passErr:false,
            pass:"",
            loader:false
        },
        methods:{
            enter:async function(){
                if ( this.pass.length < 2) {
                    this.passErr = true;
                } else
                    this.passErr = false
                if(this.passErr)
                    return document.getElementById("passInpit").focus();

                this.loader=true;

                var dt=await axios.post('/rest/api/regmoderator/'+eventid+"/"+roomid, {pass:this.pass});
                if(!dt.data){
                        this.loader = false;
                        this.passErr=true;
                        this.pass="";
                        document.getElementById("passInpit").focus();
                }
                else{
                    setTimeout(function () {
                        document.location.reload();
                    },1000)
                }

            }
        },
        mounted:function () {
            document.getElementById("app").style.opacity=1;
        }
    });
}