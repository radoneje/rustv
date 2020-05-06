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
            cbLogin:async function () {
                try {
                    var res = await axios.post("/rest/api/checkPersonalCode", {code:this.code});
                    if(res.data.redirect)
                        document.location.href=res.data.redirect
                    else
                        this.codeError=true;
                    this.code="";
                }
                catch (e) {
                    this.codeError=true;
                    this.code="";
                    console.log(e)
                }

            }
        },
        mounted:function () {
            document.querySelector(".cbLoginRightCode").focus();
            console.log("worked")
        }
    })
}