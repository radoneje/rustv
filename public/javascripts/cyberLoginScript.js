window.onload=function () {

    try{
        eval("()=>{;;}")
    }
    catch (e) {
        document.location.href="/badbrowser"
    }

    var app = new Vue({
        el: '#app',
        data: {
            loader: false,

            codeErr:false,
            code:"",

        },
        methods:{


            enter: async function () {

                var _this = this;
                var codeElem=document.getElementById("codeInpit")
                this.codeErr = false;
                if ( this.code.length < 2) {
                    this.codeErr = true;
                }

                if(this.codeErr)
                    return document.getElementById("codeInpit").focus();


                localStorage.setItem("code", this.code);

                this.loader=true;


              //  /rest/api/info/11/19
                try {
                    var res = await axios.post('/rest/api/checkCyberPersonalCode', {code: this.code})
                    if (res.data.redirect)
                        document.location.href = res.data.redirect
                    else
                        throw "not found"
                }
                catch (e) {
                    console.log("catch")
                    _this.code = "";
                    _this.loader=false;
                    _this.codeError = true;
                    return document.getElementById("codeInpit").focus();
                }

            },


        },
        mounted:function () {

            document.getElementById("app").style.opacity=1;
            document.getElementById("codeInpit").focus();

        }
    })
}
function closeWnd(){
   /* if(window.opener  && window.opener.registerSuccess)
    {
        window.opener.registerSuccess(dt.data)
    }*/
  //  else
        var url = new URL(window.location.href);
        var redirect = url.searchParams.get("redirect");
         console.log(redirect);
         if(!redirect)
             redirect="/event/"+evntId

        setTimeout(document.location.href=redirect,1000)
    return
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
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