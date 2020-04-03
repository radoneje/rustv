var express = require('express');
var router = express.Router();
var axios= require('axios')
var nodemailer = require('nodemailer');
require('dotenv').config();
const fetch = require('isomorphic-fetch');
const { v4: uuidv4 } = require('uuid');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Сервис организации конференций' });
});
router.post('/sendSms', async (req, res, next)=> {

  const secret_key = '6LfC5uUUAAAAAFl49ps6HQys6fTmDxLTefNME3BW';
  const token = req.body.token;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;
  fetch(url, {
    method: 'post'
  })
      .then(response => response.json())
      .then(async google_response => {
        //if(!google_response.success)
        //  return res.sendStatus(404);
        var code=(parseInt(Math.random()*10000)+parseInt(10000));
        var users=await req.knex.select("*").from("t_users").where({tel:req.body.tel, isDeleted:false});
        if(users.length==0)
        {
          users=await req.knex("t_users").insert({tel:req.body.tel, smsCode:code},"*")
        }
        else
        {
          await req.knex("t_users").update({smsCode:code}).where({id:users[0].id})
        }
        console.log(req.body.tel)
        sendCodeToSms(req.body.tel,code)
        res.json({code:code, id:users[0].id});
      })
      .catch(error => res.json({ error }));




});
router.post('/checkCode',async (req, res, next)=> {
  var users=await req.knex.select("*").from("t_users").where({id:req.body.id, smsCode:req.body.code, isDeleted:false});
  if(users.length==0)
  {
    return res.json({id:null});
  }
  await req.knex("t_users").update({isConfirm:true, confirmdate:(new Date())}).where({id:users[0].id})
  req.session["user"]=users[0];
  req.session["admin"]=users[0];
  res.json({id:users[0].id});
});
router.get("/CurrUser", async (req, res, next)=> {
  if(!req.session["user"])
    return res.send(404);

  var usr=req.session["user"];
  res.json({id:usr.id, f:usr.f, i:usr.i, tel:usr.tel, countOfRooms:usr.countOfRooms, countOfEvents:usr.countOfEvents});

});

router.post("/CurrUser", async (req, res, next)=> {
  if(!req.session["user"])
    return res.send(404);

  var r=await req.knex("t_users").update({f:req.body.f, i:req.body.i}, "*").where({id:req.body.id})
  var usr=r[0];
  req.session["user"]=r[0];
  if(req.session["admin"])
    req.session["admin"]=usr;

  res.json({id:usr.id, f:usr.f, i:usr.i, tel:usr.tel, countOfRooms:usr.countOfRooms, countOfEvents:usr.countOfEvents});

});
router.get("/events", async (req, res, next)=> {
  if(!req.session["user"])
    return res.send(404);

  var r=await req.knex.select("*")
      .from("t_events")
      .where({adminId:req.session["admin"].id, isDeleted:false})
      .orderBy("id", 'desc')

  for (const item of r) {
    item.rooms=await req.knex.select("*")
        .from("t_rooms")
        .where({isDeleted:false, eventid:item.id})
        .orderBy("date","desc");
  }

  return res.json(r)
});
router.post("/events", async (req, res, next)=> {
  if(!req.session["admin"])
    return res.send(404);
  var r=await req.knex.select("*").from("t_events").where({adminId:req.session["admin"].id, isDeleted:false})
  if(r.length>=req.session["admin"].countOfEvents)
    return res.json(null)
  var r=await req.knex("t_events").insert({adminId:req.session["admin"].id}, "*");

  return res.json(r[0])
});

router.put("/events", async (req, res, next)=> {
  if(!req.session["admin"])
    return res.send(404);

  var r=await req.knex("t_events").update({title:req.body.title, regCase:req.body.regCase}, "*").where({id:req.body.id,adminId:req.session["admin"].id });
  r[0].rooms=[];
  return res.json(r[0])
});

router.post("/room", async (req, res, next)=> {
  if(!req.session["admin"])
    return res.send(404);
  var r=await req.knex.select("*").from("t_events").where({id:req.body.id,adminId:req.session["admin"].id,  isDeleted:false})
      if(r.length>=req.session["admin"].countOfRooms)
    return res.json(null)

  var count=await req.knex.select("*").from ("t_rooms").where({isDeleted:false,eventid:req.body.id })
  if(count.length>=req.session["admin"].countOfEvents)
    return res.json(null)
  var r=await req.knex("t_rooms").insert({eventid:req.body.id, title:'Сессия '+parseInt(parseInt(count.length)+1)}, "*");

  return res.json(r[0])
});

router.put("/room", async (req, res, next)=> {
  if(!req.session["admin"])
    return res.send(404);


  var r=await req.knex.select("*").from("t_events").where({id:req.body.id,adminId:req.session["admin"].id, isDeleted:false})
  if(r.length>=req.session["admin"].countOfRooms)
    return res.json(null)

  var roomId=req.body.id;
  delete req.body.id;

  var r=await req.knex("t_rooms").update(req.body, "*").where({id:roomId});

  return res.json(r[0])
});
router.post("/regtoevent", async (req, res, next)=> {
  req.session["user"+req.body.evntId]=null;
  var events=await req.knex.select("*").from("t_events").where({id:req.body.evntId, isDeleted:false})
  if(events.length<1)
    return  res.send(404)
  var evt=events[0];

  if(req.body.f.length>128 || req.body.i.length>128)
    return  res.send(404)
  var code=(parseInt(Math.random()*10000)+parseInt(10000));

  var usr=await req.knex("t_eventusers").insert({eventid:evt.id, f:req.body.f, i:req.body.i, tel:req.body.tel, email:req.body.email, smsCode:code}, "*")

  if(evt.regCase==0){
    req.session["user"+req.body.evntId]=usr[0];
    return res.json({showConfirm:false, user:{id:usr[0].id,f:usr[0].f, i:usr[0].i}})
  }
  if(evt.regCase==1)
    sendCodeToEmail(req.body.email, code);
  if(evt.regCase==2)
    await sendCodeToSms(req.body.tel, code);

  if(evt.regCase==3){
    var m = req.body.tel.match(/^\+(\d)\s\((\d\d\d)\)\s(\d\d\d)\s(\d\d\d\d)$/);
    var n = "+" + m[1] + m[2] + m[3] + m[4];
    console.log(req.body.evntId, "*"+n+"*")
    var dt=await req.knex.select("*").from("t_allowedusers")
        .where({eventid:req.body.evntId, tel:n})
    if(dt.length>0)
    {
      await sendCodeToSms(req.body.tel, code);
    }
    else
    {
      return res.json({showConfirm:false, user:null})
    }


  }

  return res.json({showConfirm:true, user:{id:usr[0].id,f:usr[0].f, i:usr[0].i}})


});
async function sendCodeToSms(tel, code){
  var m = tel.match(/^\+(\d)\s\((\d\d\d)\)\s(\d\d\d)\s(\d\d\d\d)$/);
  var n=tel;
  if(m)
   n = "+" + m[1] + m[2] + m[3] + m[4];

  var url="http://api.iqsms.ru/messages/v2/send/?phone=Access%20code:%20"+n+"&text="+code+"&login=z1519200766955&password=713595";

  var rr= await axios.get(url);
}
async function sendCodeToEmail(email, code){
  var transporter = nodemailer.createTransport({
    host: "mail.nic.ru",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "d@rustv.ru", // generated ethereal user
      pass: "Gbplfgbplf13" // generated ethereal password
    }
  });

  var mailOptions = {
    from: 'noreply@rustv.ru',
    to: email,
    subject: 'Login code to rustv.ru',
    text: 'Код для входа на rustv.ru '+code
  };
  await transporter.sendMail(mailOptions)
}

router.post("/logincheckcode", async (req, res, next)=> {


  var usr=await req.knex.select("*").from("t_eventusers")
      .where({ id:req.body.id,"smsCode":req.body.code, isDeleted:false}, "*")
  if(usr.length<1)
  {
    res.json({status:0})
    return;
  }
  await req.knex("t_eventusers").update({isConfirm:true,confirmdate:(new Date())})
      .where({id:usr[0].id});
  req.session["user"+usr[0].eventid]=usr[0];
  res.set('x-userid', usr[0].id);
  return res.json({status:1, showConfirm:false, user:{id:usr[0].id,f:usr[0].f, i:usr[0].i}})
})

router.get("/allowedUsers/:id", async (req, res, next)=> {
  if(!req.session["admin"])
    return res.send(404);

  var ret=await req.knex.select("*").from("t_allowedusers")
      .where({eventid:req.params.id})
  res.json(ret)
});

router.post("/addAllowedTels/", async (req, res, next)=> {
  if(!req.session["admin"])
    return res.send(404);
  console.log(req.body.tels,req.body.id )
  for(var tel of req.body.tels){

    var r=await req.knex.select("*").from("t_allowedusers").where({tel:tel,eventid:req.body.id });
    if(r.length<1)
      await req.knex("t_allowedusers").insert({tel:tel,eventid:req.body.id });
  }

  var ret=await req.knex.select("*").from("t_allowedusers")
      .where({eventid:req.body.id}).orderBy("tel")
  res.json(ret)
});

router.post("/addAllowedTelsDelete/", async (req, res, next)=> {
  if(!req.session["admin"])
    return res.send(404);

  await req.knex("t_allowedusers").delete().where({id:req.body.telid });

  var ret=await req.knex.select("*").from("t_allowedusers")
      .where({eventid:req.body.id}).orderBy("tel")
  res.json(ret)
});
function checkLoginToRoom(req, res, next){
  req.params.eventid=parseInt(req.params.eventid)
  if(!Number.isInteger(req.params.eventid))
    return res.send(404);

  req.params.roomid=parseInt(req.params.roomid)
  if(!Number.isInteger(req.params.roomid))
    return res.send(404);

  if(!req.session["user"+req.params.eventid])
    return res.redirect("/login/"+req.params.eventid+"?redirect="+encodeURI('/room/'+req.params.roomid))

  next();
}
router.get("/info/:eventid/:roomid", checkLoginToRoom, async (req, res, next)=> {
  var usr=req.session["user"+req.params.eventid];
  res.json({id:usr.id, f:usr.f, i:usr.i});
})
router.get("/infospk/:eventid/:roomid", checkLoginToRoom, async (req, res, next)=> {
  var usr=req.session["speaker"+req.params.roomid];
  res.json({id:usr.id, f:usr.f, i:usr.i});
})
router.get("/infomod/:eventid/:roomid", checkLoginToRoom, async (req, res, next)=> {
  var usr=req.session["moderator"+req.params.roomid];
  res.json({id:usr.id, f:usr.f, i:usr.i});
})

router.get("/users/:eventid/:roomid", checkLoginToRoom, async (req, res, next)=> {

  var ret=[];
  req.transport.clients.forEach(c=>{
    if(c.roomid==req.params.roomid && c.isActive)
      ret.push({id:c.user.id, i:c.user.i, f:c.user.f, isActive:c.isActive?true:false, isVideo:c.isVideo });
  })
  res.json(ret);
});
router.post("/quest/:eventid/:roomid",checkLoginToRoom,async (req, res, next)=> {
  var r=await req.knex("t_q").insert({text:req.body.text,roomid:req.params.roomid, userid:req.session["user"+req.params.eventid].id, date:(new Date())}, "*")

  r=await req.knex.select("*").from("v_q").where({id:r[0].id});

  req.transport.emit("qAdd",r[0], req.params.roomid);
  res.json(r[0]);
})
router.post("/chat/:eventid/:roomid",checkLoginToRoom,async (req, res, next)=> {
  var r=await req.knex("t_chat").insert({text:req.body.text,roomid:req.params.roomid, userid:req.session["user"+req.params.eventid].id, date:(new Date())}, "*")
  r=await req.knex.select("*").from("v_chat").where({id:r[0].id});
  req.transport.emit("chatAdd",r[0], req.params.roomid);
  res.json(r[0]);
})
router.get("/quest/:eventid/:roomid",checkLoginToRoom,async (req, res, next)=> {
  var r=await req.knex.select("*").from("v_q").where({roomid:req.params.roomid}).orderBy("date");// {text:req.body.text, userid:req.session["user"].id, date:(new Date())}, "*")

  res.json(r);
})
router.get("/chat/:eventid/:roomid",checkLoginToRoom, async (req, res, next)=> {
  var r=await req.knex.select("*").from("v_chat").where({roomid:req.params.roomid}).orderBy("date");// {text:req.body.text, userid:req.session["user"].id, date:(new Date())}, "*")
  res.json(r);
})

router.delete("/chatdelete/:id/:eventid/:roomid",checkLoginToRoom,async (req, res, next)=> {
  var r=await req.knex("t_chat").update({isDeleted:true}, "*").where({id:req.params.id});
  req.transport.emit("chatDelete",r[0].id, req.params.roomid);
  res.json(r[0].id)
})
router.delete("/qdelete/:id/:eventid/:roomid",checkLoginToRoom,async (req, res, next)=> {
  var r=await req.knex("t_q").update({isDeleted:true}, "*").where({id:req.params.id});
  req.transport.emit("qDelete",r[0].id, req.params.roomid);
  res.json(r[0].id)
});

router.post("/regmoderator/:eventid/:roomid", async (req, res, next)=> {

  req.params.eventid=parseInt(req.params.eventid)
  if(!Number.isInteger(req.params.eventid))
    return res.send(404);

  req.params.roomid=parseInt(req.params.roomid)
  if(!Number.isInteger(req.params.roomid))
    return res.send(404);


  var rooms=await req.knex.select("*").from("t_rooms").where({id:req.params.roomid, isDeleted:false})
  if(rooms.length<1)
    return  res.send(404)
  var room=rooms[0];

 if(room.password!=req.body.pass || req.body.pass.length<3)
   return res.json(false);

 var usr=await req.knex.select("*")
      .from("t_eventusers")
      .where({eventid:req.params.eventid, email:'moderator@rustv.ru', smsCode:999999 });

 if(usr.length==0)
   usr=await req.knex("t_eventusers")
        .insert({eventid:req.params.eventid, email:'moderator@rustv.ru', smsCode:999999,f:"Модератор", isConfirm:true, confirmdate:(new Date()) },"*")

  req.session["user"+usr[0].eventid]=usr[0];
  req.session["moderator"+req.params.roomid]=usr[0]
  console.log(req.session["moderator"+req.params.roomid])


  return res.json(usr[0].id);

});

router.post("/regspeaker/:eventid/:roomid", async (req, res, next)=> {


  req.params.eventid=parseInt(req.params.eventid)
  if(!Number.isInteger(req.params.eventid))
    return res.send(404);

  req.params.roomid=parseInt(req.params.roomid)
  if(!Number.isInteger(req.params.roomid))
    return res.send(404);


  var rooms=await req.knex.select("*").from("t_rooms").where({id:req.params.roomid, isDeleted:false})
  if(rooms.length<1)
    return  res.send(404)
  var room=rooms[0];

  if(room.password!=req.body.pass || req.body.pass.length<3)
    return res.json(false);

  var usr=await req.knex.select("*")
      .from("t_eventusers")
      .where({eventid:req.params.eventid, email:'speaker@rustv.ru', smsCode:999999 });

  if(usr.length==0)
    usr=await req.knex("t_eventusers")
        .insert({eventid:req.params.eventid, email:'speaker@rustv.ru', smsCode:999999,f:"Спикер", isConfirm:true, confirmdate:(new Date()) },"*")

  req.session["user"+usr[0].eventid]=usr[0];

  req.session["speaker"+req.params.roomid]=usr[0]

  return res.json(usr[0].id);

});


router.delete("/chatdelete/:id/:eventid/:roomid",checkLoginToRoom,async (req, res, next)=> {
  var r=await req.knex("t_chat").update({isDeleted:true}, "*").where({id:req.params.id});
  req.transport.emit("chatDelete",r[0].id, req.params.roomid);
  res.json(r[0].id)
})
router.delete("/qdelete/:id/:eventid/:roomid",checkLoginToRoom,async (req, res, next)=> {
  var r=await req.knex("t_q").update({isDeleted:true}, "*").where({id:req.params.id});
  req.transport.emit("qDelete",r[0].id, req.params.roomid);
  res.json(r[0].id)
})
router.post("/qsetStatus/:eventid/:roomid",checkLoginToRoom,async (req, res, next)=> {
  var r=await req.knex("t_q").update({isReady:req.body.status}, "*").where({id:req.body.id});
  req.transport.emit("qStatus",{id:r[0].id, isReady:r[0].isReady}, req.params.roomid);
  res.json(r[0].id)
})
router.post("/qsetStatus/:eventid/:roomid",checkLoginToRoom,async (req, res, next)=> {
  var r=await req.knex("t_q").update({isReady:req.body.status}, "*").where({id:req.body.id});
  req.transport.emit("qStatus",{id:r[0].id, isReady:r[0].isReady}, req.params.roomid);
  res.json(r[0].id)
})
router.get("/guid",async (req, res, next)=> {
  res.json(uuidv4());
});
router.get("/test", (req, res, next)=>{


    var ret=[];
    req.transport.clients.forEach(c=>{

        ret.push({iid:c.id, id:c.user.id, i:c.user.i, f:c.user.f, isActive:c.isActive?true:false, isAdmin:c.isAdmin, isSpeaker:c.isSpeaker, isVideo:c.isVideo });
    })
  var r="";
      ret.forEach(c=>{r+=JSON.stringify( c)+"<br>"})
    res.send(r);

})











module.exports = router;
