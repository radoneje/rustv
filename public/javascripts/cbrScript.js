window.onload=function () {

    try {
        eval("()=>{;;}")
    } catch (e) {
        document.location.href = "/badbrowser"
    }

    var app = new Vue({
        el: '#loginApp',
        data: {
            codeError:false,
            code:null
        },
        methods:{
            cbLogin:function () {
               this.codeError=true;
                this.code="";
            }
        },
        mounted:function () {
            document.querySelector(".cbLoginRightCode").focus();
            console.log("worked")
        }
    })
}