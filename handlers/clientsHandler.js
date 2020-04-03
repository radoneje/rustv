const { v4: uuidv4 } = require('uuid');
var axios= require('axios')

class Clients{

    constructor() {
        this.clients=[];
        this.collectTh(this)
    }
    add(data){
        var _this=this;
        data.id=uuidv4();
        data.isActive=true;
        data.user.isActive=true;
        data.date=new Date();
        data.isVideo=false;
        this.clients.push(data);
        this.emit=this.sendToRoomUsers
        setTimeout(()=>{_this.sendToRoomUsers("userConnnect",  data.user,data.roomid)}, 0);
        return data.id;
    }
    disActive(id){
        var _this=this;
        this.clients.forEach(c=>{
            if(c.socket.id==id) {
                c.isActive = false;
                c.isVideo=false;
                _this.sendToRoomUsers("userDisconnnect", c.user.id,c.roomid)
            }
        })
    }
    SpkCount(roomid){
        return this.clients.filter(c=>{return c.isSpeaker && c.isActive && c.roomid==roomid}).length;
    }
    startVideo(id, socketid) {
        var _this = this;
        this.clients.forEach(c => {
            if (c.id == id) {
                c.isVideo = true;
                _this.sendToRoomAdmins("selfVideoStarted", {id:c.user.id, socketid:socketid}, c.roomid)
            }
        })
    }
    sendToRoomUsers(msg, data, roomid){
        this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid)
                c.socket.emit(msg, data);
        });
    }
    sendToRoomAdmins(msg, data, roomid){
        this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid && ( c.isAdmin || c.isSpeaker) ) {
                c.socket.emit(msg, data);

            }
        });
    }
    sendToRoomSpeakers(msg, data, roomid){
        this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid &&  c.isSpeaker )
                c.socket.emit(msg, data);
        });
    }
    fwd(msg, data){
        this.clients.forEach(c=>{
            if(c.isActive && c.socket.id==data.to )
                c.socket.emit(msg, data);
        });
    }
     collectTh(_this){
         _this.clients.forEach(async c=> {
            if(!c.isVideo)
                c.Th=null
            else if(c.isActive){
                await _this.getUserTh(c);
            }
        })
         setTimeout(()=>{_this.collectTh(_this)}, 2*1000)
    }
    async getUserTh(c){
        var dt=await axios.get('/rest/api/test')
        console.log("get th", c.id)
    }




}

var clients= new Clients();

module.exports = clients;