try{
    eval("()=>{;;}")
}
catch (e) {
    document.location.href="/badbrowser"
}

window.onload=function () {



    var app = new Vue({
        el: '#loginApp',
        data: {
            codeError:false,
            user:"",
            code:"",
            cap:"" ,
            opacity:0
        },
        methods:{
            logOn:function () {
                if(this.user.length<1)
                    return document.getElementById("loginname").focus();
                if(this.code.length<1)
                    return document.getElementById("logincode").focus();
                this.cap="Регистрирую..."
                var _this=this;
                try {
                    axios.post("/rest/api/regToGpn", {user: this.user, code: this.code})
                        .then(function (e) {
                            console.log(e.data)
                            if(e.data==0){
                                _this.cap="Зарегистрироваться"
                                _this.codeError=true;
                                document.getElementById("logincode").focus();
                                _this.code="";
                            }
                            else {
                                _this.cap = "Вы зарегистрированы.<div style='font-size: 10px; line-height: 14px; margin-top:4px'>Сейчас откроется страница трансляции.</div>"
                                _this.codeError=false;
                                setTimeout(function () {
                                    document.location.href="/room/"+e.data;
                                },2000)
                            }
                        })
                        .catch(function (e) {
                            _this.cap = "Ошибка, еще раз"
                        })
                }
                catch (e) {
                    _this.cap = "Ошибка, еще раз"
                }


            }
        },
        mounted:function () {
            this.opacity=1;
            this.cap="Зарегистрироваться"
        }
    });
}