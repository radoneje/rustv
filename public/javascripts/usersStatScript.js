window.onload=function () {
    var app = new Vue({
        el: '#app',
        data: {
            otrasles:[],
            companies:[],
            users:[],
        },
        methods:{
        },
        mounted:async function () {
            var _this=this;
            var dt=await axios.get("/rest/api/otrasl/"+event.id);
            dt.data.forEach(d=>d.percent=0)
            _this.otrasles=dt.data;
            dt=await axios.get("/rest/api/company/"+event.id)
            dt.data.forEach(d=>d.percent=0)
            _this.companies=dt.data;

            document.getElementById("app").style.opacity=1;
            updateUsers();

            async function updateUsers() {

                var dt=await axios.get("/rest/api/usersstat/"+event.id);
                var users=dt.data;
                console.log(users)
                if(users.length!=0) {
                    _this.otrasles.forEach(o => {
                        o.percent = parseInt(parseFloat(users.filter(u=>u.otraslid == o.id).length / users.length) * 100)
                    })
                    _this.companies.forEach(o => {
                        o.percent = parseInt(parseFloat(users.filter(u=>u.companyid == o.id).length / users.length) * 100)
                    })
                    console.log(_this.companies)
                }
                setTimeout(async ()=>{
                    await updateUsers();
                }, 20*1000);


            }

        }
    })
}
function closeWnd(){
    if(window.opener  && window.opener.registerSuccess)
    {
        window.opener.registerSuccess(dt.data)
    }
    else
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