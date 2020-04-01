const { v4: uuidv4 } = require('uuid');

class Clients{

    constructor() {
        this.clients=[];
        this.count=0;
    }
    add(data){
        var _this=this;
        data.id=uuidv4();
        data.isActive=true;
        data.date=new Date();
        this.count++;
        this.clients.push(data);
        this.emit=this.sendToRoomUsers
        _this.sendToRoomUsers("userConnnect", data.user.id,data.roomid)
        return data.id;
    }
    disActive(id){
        var _this=this;
        this.clients.forEach(c=>{
            if(c.id==id) {
                c.isActive = false;
                _this.sendToRoomUsers("userDisconnnect", c.user.id,c.roomid)
            }
        })


    }
    sendToRoomUsers(msg, data, roomid){
        this.clients.forEach(c=>{
            if(c.isActive && c.roomid==roomid)
                c.socket.emit(msg, data);
        });
    }


}

var clients= new Clients();

module.exports = clients;