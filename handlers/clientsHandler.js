const { v4: uuidv4 } = require('uuid');
var axios= require('axios')
var config= require('../config')

class Clients{

    constructor() {
        this.clients=[];
        this.nobody=[];
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
            this.nobody.forEach(c => {
                if (c.socket.id == id) {
                    c.isActive = false;
                }
            })
        }
    }
    SpkCount(roomid){
        return this.clients.filter(c=>{return c.isSpeaker && c.isActive && c.roomid==roomid}).length;
    }
    async startVideo(socketid) {
        console.log("startVideo",socketid )
        var _this = this;
        var find=false;
        this.clients.forEach(c => {
            if (c.socket.id == socketid) {
                c.isVideo = true;
                _this.sendToRoomAdmins("selfVideoStarted", {id:c.user.id, socketid:socketid}, c.roomid)
                find=true;
            }
        })
        if(!find)
            for( var srv of config.frontServers)
            {
                try {
                   // console.log("send " , msg, data, roomid)
                    await axios.post(srv + '/rest/api/startVideoCommand', { socketid});
                }
                catch (e) {
                    console.log(e)
                }
            }

    }
    OnStartVideo( socketid){
        this.clients.forEach(c => {
            if (c.socket.id == socketid) {
                c.isVideo = true;
                _this.sendToRoomAdmins("selfVideoStarted", {id:c.user.id, socketid:socketid}, c.roomid)
            }
        })
    }

    async stopVideo(socketid) {
        console.log("stopVideo",socketid )
        var _this = this;
        var find=false;
        this.clients.forEach(c => {
            if (c.socket.id == socketid) {
                c.isVideo = true;
                _this.sendToRoomAdmins("selfVideoStopped", {id:c.user.id, socketid:socketid}, c.roomid)
                find=true;
            }
        })
        if(!find)
            for( var srv of config.frontServers)
            {
                try {
                 //   console.log("send " , msg, data, roomid)
                    await axios.post(srv + '/rest/api/stopVideoCommand', { socketid});
                }
                catch (e) {
                    console.log(e)
                }
            }

    }
    OnStopVideo( socketid){
        this.clients.forEach(c => {
            if (c.socket.id == socketid) {
                c.isVideo = true;
                _this.sendToRoomAdmins("selfVideoStopped", {id:c.user.id, socketid:socketid}, c.roomid)
            }
        })
    }


    async sendToRoomUsers(msg, data, roomid){
        this.OnSendToRoomUsers(msg, data, roomid);
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
        this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid) {
                c.socket.emit(msg, data);
            }
        });
        this.nobody.forEach(c=>{
            if(c.isActive && c.roomid==roomid) {
                c.socket.emit(msg, data);
            }
        });
    }
    async sendToRoomAdmins(msg, data, roomid){
        this.OnSendToRoomAdmins(msg, data, roomid)
        for( var srv of config.frontServers)
        {
            try {
              //  console.log("send " , msg, data, roomid)
                await axios.post(srv + '/rest/api/execCommandAdmins', {msg, data, roomid});
            }
            catch (e) {
                console.log(e)
            }
        }
    }
    OnSendToRoomAdmins(msg, data, roomid){
        this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid && ( c.isAdmin || c.isSpeaker) ) {
                c.socket.emit(msg, data);

            }
        });
      //  console.log("OnSendToRoomAdmins", this.nobody)
        this.nobody.forEach(c=>{

            if(c.isActive && c.roomid==roomid) {
                c.socket.emit(msg, data);
            }
        });
    }
  async  sendToRoomSpeakers(msg, data, roomid){
        this.OnSendToRoomSpeakers(msg, data, roomid)
        for( var srv of config.frontServers)
        {
            try {
              //  console.log("send " , msg, data, roomid)
                await axios.post(srv + '/rest/api/execCommandSpeakers', {msg, data, roomid});
            }
            catch (e) {
                console.log(e)
            }
        }

    }
    OnSendToRoomSpeakers(msg, data, roomid){
        this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid &&  c.isSpeaker )
                c.socket.emit(msg, data);
        });
        this.nobody.forEach(c=>{
            if(c.isActive && c.roomid==roomid) {
                c.socket.emit(msg, data);
            }
        });
    }
    async sendToUser(msg, data, userid, roomid){
       this.OnSendToUser
        for( var srv of config.frontServers)
        {
            try {
              //  console.log("send " , msg, data, roomid)
                await axios.post(srv + '/rest/api/execCommandUser', {msg, data, roomid});
            }
            catch (e) {
                console.log(e)
            }
        }
    }
    OnSendToUser(msg, data, userid, roomid){


        this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid &&  c.user.id==userid )
                console.log("sentToUser!!!!", c.user.id)
            c.socket.emit(msg, data);
        });
    }

    async fwd(msg, data){

        this.Onfwd(msg, data)
        for( var srv of config.frontServers)
        {
            try {
              //  console.log("send " , msg, data, roomid)
                await axios.post(srv + '/rest/api/execCommandFwd', {msg, data});
            }
            catch (e) {
                console.log(e)
            }
        }
    }
    Onfwd(msg, data){
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