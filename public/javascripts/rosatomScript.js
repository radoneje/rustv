window.onload=function () {

    try{
        eval("()=>{;;}")
    }
    catch (e) {
        document.location.href="/badbrowser"
    }

    var evntId=30;
    var roomId=66
    var evntid=30;
    var roomid=66
    var app = new Vue({
        el: '#app',
        data: {
            loader: false,
            tel: localStorage.getItem("loginTel") || "",
            telErr: false,
            f:localStorage.getItem("f")|| "",
            i:localStorage.getItem("i")||"",
            fErr:false,
            iErr:false,
            email:localStorage.getItem("email") || "",
            emailErr:false,
            showCode:false,
            codeErr:false,
            code:"",
            user:null,
            userId:null,
            company:null,
            otrasl:null,
            isShowCompany:false,
            isShowOtrasl:false,
            companyTitle:null,

            sect:[

                {title:"Вопросы", isActive:false, id:1, logo:'/images/logoqactive.svg', logoactive:'/images/logoq.svg'},
                {title:"Чат", isActive:true, id:2, logo:'/images/logochat.svg', logoactive:'/images/logochatactive.svg'}
            ],
            activeSection:2,
            chat:[],
            isChat:true,
            users:[],
            q:[],
            votes:[],
            tags:[],
            pole:[],
            isQ:true,
            isLenta:false,
            qText:"",
            chatText:"",


        },
        methods:{
            qtextChange:function (e) {
                var _this=this;
                if(this.qText.length>0)
                    if(e.keyCode==13 && _this.qText.length>0){
                        _this.qtextSend()
                    }
                else
                    document.getElementById('qText').focus()

            },
            chattextChange:function (e) {
                var _this=this;
                if(this.chatText.length>0)
                    if(e.keyCode==13 && _this.qText.length>0){
                        _this.chattextSend()
                    }
                else
                    document.getElementById('chatText').focus()

            },
            qtextSend:function(){

                axios.post("/rest/api/quest/"+eventid+"/"+roomid,{text:_this.qText})
                    .then(function (e) {
                        _this.qText="";
                        // _this.q.push(e.data);
                        console.log(e.data)
                        setTimeout(function () {
                            var objDiv = document.getElementById("qBox");
                            objDiv.scrollTop = objDiv.scrollHeight;
                        },100)
                    })
            },
            chattextSend:function(){},
            sectActive:function (item) {
                var _this=this;
                this.sect.forEach(function (e) {
                    e.isActive=(item.id==e.id);
                    if(e.isActive){
                        _this.activeSection=e.id

                        setTimeout(()=>{
                            var parentElem=document.querySelector(".rContentWr");
                            if(parentElem){
                                var elem=parentElem.querySelector(".rBody");
                                if(elem)
                                    elem.scrollTop = elem.scrollHeight;

                            }
                        },0)
                    }
                    // return e;
                })
                if(window.innerWidth<1024)
                    setTimeout(function () {
                        window.scrollTo(0,document.body.scrollHeight);
                    },0)
            },
            selectOtrasl:function(item){
                this.otrasl=item;
                this.isShowOtrasl=null;
            },
            showOtrasl:  function(){
                var _this=this;
                axios.get("/rest/api/otrasl/"+evntId).then(function (dt) {
                    _this.isShowOtrasl=dt.data;

                });

            },
            selectCompanies:function(item){
                this.company=item;
                this.isShowCompany=null;
            },
            showCompanies:  function(){
                var _this=this;
                axios.get("/rest/api/company/"+evntId).then(function (dt) {
                    _this.isShowCompany=dt.data;

                });

            },
            enter: async function () {

                var _this = this;
                var emailElem=document.getElementById("emailInpit")
                var telElem=document.getElementById("telInpit")
                if ( this.f.length < 2) {
                    this.fErr = true;
                } else
                    this.fErr = false
                if ( this.i.length < 2) {
                    this.iErr = true;
                } else
                    this.iErr = false
                if(emailElem){
                    if(!validateEmail(this.email))
                        this.emailErr=true
                    else
                        this.emailErr=false
                }
                if(telElem){
                    if (!this.tel.match(/^\+\d\s\(\d\d\d\)\s\d\d\d\s\d\d\d\d$/))
                        this.telErr=true
                    else
                        this.telErr=false
                }

                if(this.iErr)
                    return document.getElementById("iInpit").focus();
                if(this.fErr)
                    return document.getElementById("fInpit").focus();
                if(this.telErr)
                    return document.getElementById("telInpit").focus();
                if(this.emailErr)
                    return document.getElementById("emailInpit").focus();

                localStorage.setItem("f", this.f);
                localStorage.setItem("i", this.i);
                localStorage.setItem("email", this.email);
                this.loader=true;

                //  console.log("d", this.company?this.company.id:null, this.otrasl?this.otrasl.id:null,this.company, this.otrasl)

                var dt= await axios.post('/rest/api/regtoevent/'
                    ,{evntId:evntId, f:this.f, i:this.i, tel:this.tel, email:this.email, companyTitle:this.companyTitle, company:this.company?this.company.id:null, otrasl:this.otrasl?this.otrasl.id:null})

                if(!dt.data.showConfirm){
                    if(dt.data.user)
                    {
                        _this.user=dt.data.user;
                    }
                    else{
                        this.loader = false;
                        this.showCode=false;
                        this.telErr=true;
                    }
                }
                else {
                    this.loader = false;
                    this.showCode=true;
                    this.userId=dt.data.user.id
                    setTimeout(()=>{
                        document.getElementById('code').focus();
                    },0)
                }




            },
            sendCode:async function () {
                if(!checkCode(this.code))
                {
                    this.codeErr=true;
                    document.getElementById('code').focus();
                    return;
                }
                this.codeErr=false;
                this.loader=true;
                var dt=await axios.post('/rest/api/logincheckcode/'
                    ,{evntId:evntId,id:this.userId, f:this.f, i:this.i, tel:this.tel, email:this.email, code:this.code});
                if(dt.data.status>0)
                    closeWnd();
                else{

                    this.code="";
                    this.loader = false;
                    this.codeErr=true;
                    document.getElementById('code').focus();
                }

            },
            closeCodeWindow:function () {
                this.codeErr=false;
                this.loader=false;
                this.showCode=false;
                this.code="";
            }

        },
        mounted:function () {
            var _this=this;
            //  var iInpit=document.getElementById("iInpit");
            // if(iInpit)
            //    iInpit.focus()
            var telElem=document.getElementById("telInpit")
            if(telElem) {
                telElem.addEventListener("input", mask, false);
                telElem.addEventListener("focus", mask, false);
                telElem.addEventListener("blur", mask, false);
            }
            document.getElementById("app").style.opacity=1;

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