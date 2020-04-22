const { v4: uuidv4 } = require('uuid');
var axios= require('axios')
var config= require('../config')

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
        if(id) {
            this.clients.forEach(c => {
                if (c.socket.id == id) {
                    c.isActive = false;
                    c.isVideo = false;
                    _this.sendToRoomUsers("userDisconnnect", c.user.id, c.roomid)
                }
            })
        }
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
    async sendToRoomUsers(msg, data, roomid){

      /*  this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid)
                c.socket.emit(msg, data);
        });*/

        for( var srv of config.frontServers)
        {
            try {

                await axios.post(srv + '/rest/api/execCommand', {msg, data, roomid});
            }
            catch (e) {
                    console.log(e)
            }
        }
    }
    OnSendToRoomUsers(msg, data, roomid){
        console.log("OnSendToRoomUsers receive " , msg, data, roomid)
        this.clients.forEach(c=>{

            if(c.isActive && c.roomid==roomid) {
                console.log("OnSendToRoomUsers inside ")
                c.socket.emit(msg, data);
            }
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
    sendToUser(msg, data, userid, roomid){
        console.log("sentToUser - ", userid)
        this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid &&  c.user.id==userid )
                console.log("sentToUser!!!!", c.user.id)
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
    /*     _this.clients.forEach(async c=> {
            if(!c.isVideo)
                c.Th=null
            else if(c.isActive){
                await _this.getUserTh(c);
            }
        })
         setTimeout(()=>{_this.collectTh(_this)}, 2*1000)*/
    }
    async getUserTh(c){
        var dt=await axios.get('/rest/api/test')
        console.log("get th", c.id)
    }




}

var clients= new Clients();

module.exports = clients;