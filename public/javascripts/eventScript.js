window.onload=function () {
    var app = new Vue({

        el: "#app",
        data: {
            rooms: [],
            opacity:0,
            user:usr,
            event:evt,
            rooms:[],
            activeSection:0,
            fErr:false,
            emailErr:false,
            CompanyNameErr:false,
            iErr:false,
            telErr:false,
            loader:false
        },
        watch: {
            editRoom: function (val) {
                document.body.style.overflowY = val ? "hidden" : "auto";
            },
            allowUsers: function (val) {
                document.body.style.overflowY = val ? "hidden" : "auto";
            }
        },
        methods: {
            uploadImage:async function(){
                var _this=this;
                var inp=document.createElement("input")
                inp.type="file";
                inp.style.display="none";
                inp.accept="image/*"
                inp.click()
                inp.onchange=async (e)=>{
                    var file=inp.files[0];

                    var fd = new FormData();
                    fd.append('file', file );
                    var xhr = new XMLHttpRequest();
                    xhr.onload = xhr.onerror = function() {
                        if (this.status == 200) {
                            console.log(200, _this.user.avatar);

                            _this.user.avatar=JSON.parse(xhr.response);
                            console.log(300, _this.user.avatar);
                        }
                        else
                        {
                            console.log("500", xhr.response);
                        }
                    }
                    xhr.open("POST", '/rest/api/avatarUpload/',true, );
                    //xhr.setRequestHeader("Content-Type", "multipart/form-data")
                    xhr.setRequestHeader("X-data", encodeURI( JSON.stringify({name:file.name||"",type:file.type})))

                    xhr.send(fd);
                }
            },
            enter:async function(){
                var companyNameElem=document.getElementById("CompanyNameInpit");
                if ( this.user.f.length < 2) {
                    this.fErr = true;
                } else
                    this.fErr = false
                if ( this.user.i.length < 2) {
                    this.iErr = true;
                } else
                    this.iErr = false
                if(companyNameElem){
                    if(this.user.CompanyName.length<2) {
                        this.CompanyNameErr=true;
                    }
                    else
                        this.CompanyNameErr=false;

                }
                if(this.iErr)
                    return document.getElementById("iInpit").focus();
                if(this.fErr)
                    return document.getElementById("fInpit").focus();
                if(this.CompanyNameErr)
                    return document.getElementById("CompanyNameInpit").focus();

                localStorage.setItem("f", this.user.f);
                localStorage.setItem("i", this.user.i);
                localStorage.setItem("CompanyName", this.user.CompanyName);
                this.loader=true;
                var dt= await axios.put('/rest/api/regtoevent/'
                    ,{evntId:this.event.id,id:this.user.id,avatar:this.user.avatar, f:this.user.f, i:this.user.i, CompanyName:this.user.CompanyName})
                this.loader=false;
            },
            changeSMS:async function(room){
                console.log("room", room.isSendSms)
                room.isSendSms=!room.isSendSms;
                this.updateRoomSend(room)
            },
            changeEmail:async function(room){
                room.isSendEmail=!room.isSendEmail;
                this.updateRoomSend(room)
            },
            updateRoomSend:async function(room){
                await axios.post("/rest/api/roomSendStatus",{roomid:room.id,userid:this.user.id, isSendSms:room.isSendSms,isSendEmail:room.isSendEmail} )
            },
        },
        mounted:async function () {
            this.opacity=1;
            var r=await axios.get('/rest/api/eventusersrooms/'+this.event.id+"/"+this.user.id);

            this.rooms=r.data;
            console.log(this.user);
        }
    })
}

