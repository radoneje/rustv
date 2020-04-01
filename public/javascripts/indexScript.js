

window.onload=function () {


    var app = new Vue({
        el: '#app',
        data: {
            isLoading: false,
            tel:localStorage.getItem("loginTel"),
            telErr:false,
            showSmsCode:false,
            codeErr:false,
            userId:null,
            code:"",
            token:null,
        },
        methods: {
            sendSms:async function () {
                var _this=this;
                if(!_this.userId) {
                    var tel = this.tel.replace(/\s/g, "");
                    tel = tel.replace(/[\(\)]/g, '');
                    if (tel.length < 12) {
                        this.telErr = true;
                        document.querySelector("#smsNo").focus();
                        return;
                    }
                    this.isLoading = true;
                    localStorage.setItem("loginTel", this.tel);
                    var dt = await axios.post('/rest/api/sendSms', {tel: tel, token:this.token});
                    this.showSmsCode = dt.data.code;
                    this.userId = dt.data.id;
                    setTimeout(function () {
                        _this.isLoading = false;
                        var input=document.getElementById("smsCode")
                         input.focus();
                        input.addEventListener("keydown", (e)=>{
                            if(e.keyCode==13)
                                _this.sendSms();
                        }, false);
                    }, 0)
                }
                else{
                    if(!checkCode(this.code)){
                        this.codeErr=true;
                        document.getElementById("smsCode").focus();
                        return;
                    }
                    _this.isLoading = true;
                    var dt = await axios.post('/rest/api/checkCode', {id: _this.userId, code:_this.code});
                    if(!dt.data.id)
                    {
                        _this.isLoading = false;
                        _this.codeErr=true;
                        _this.code="";

                        document.getElementById("smsCode").focus();
                        return;
                    }
                    document.location.href="/adminpanel";
                }

            },
            noRobot:function (token) {
                this.token=token;
            }
        },
        mounted: function () {
            var _this=this;
            var input = document.querySelector("#smsNo");

            if (input) {
                input.addEventListener("input", mask, false);
                input.addEventListener("focus", mask, false);
                input.addEventListener("blur", mask, false);
                input.addEventListener("keydown", (e)=>{
                    console.log("keyDown", e)
                    if(e.keyCode==13)
                        _this.sendSms();
                }, false);
                input.focus()
            }

          /*  var socket = io('');
            socket.on('connect', function () {
                console.log("socket connected")
            })*/
           // grecaptcha.execute();
            grecaptcha.render('sendSmsPlaceHolder', {
                'sitekey' : '6LfC5uUUAAAAAPN7shWL_ri1HGB-StMKv_onH2Vj',
                'callback' : _this.noRobot
            });

            /*grecaptcha.ready(function () {
              grecaptcha.execute('6LfC5uUUAAAAAPN7shWL_ri1HGB-StMKv_onH2Vj', {action: 'enter'})
                   .then(function (token) {
                       console.log("get token", token)
                       _this.token=token;
                   });

            });*/
            document.getElementById("app").style.opacity=1;
        }

    })
}
function onSubmit(token) {
    console.log('success!', token);
}

function setCursorPosition(pos, elem) {
    elem.focus();
    if (elem.setSelectionRange) elem.setSelectionRange(pos, pos);
    else if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveEnd("character", pos);
        range.moveStart("character", pos);
        range.select()
    }
}
function mask(event) {
    var matrix = "+7 (___) ___ ____",
        i = 0,
        def = matrix.replace(/\D/g, ""),
        val = this.value.replace(/\D/g, "");
    if (def.length >= val.length) val = def;
    this.value = matrix.replace(/./g, function (a) {
        return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a
    });
    if (event.type == "blur") {
        if (this.value.length == 2) this.value = ""
    } else setCursorPosition(this.value.length, this)
};
function checkCode(code) {

    if (code.length < 5)
        return false;
//console.log("f check",Number.isInteger( parseInt(code)) )
    return Number.isInteger(parseInt(code));


}

