var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.headers.host)
     // if(req.headers.host.indexOf("localhost")>=0)
    if(req.headers.host.indexOf("cbr-online.ru")>=0)
    return res.render('cbr-online', { title: 'Пресс-конференция Банка России' });
  res.render('index', { title: 'ON.event' });
});
router.get('/badbrowser', function(req, res, next) {
  res.render('badbrowser', { title: 'ON.event' });
});
router.get('/userstat/:id', async function(req, res, next) {
  var e=await req.knex.select("*").from("t_events").where({isDeleted:false, id:req.params.id})
  if(e.length<1)
    return res.send(404);

  res.render('userstat', { title: 'ON.event', event:e[0] });
});
router.get('/adminpanel', function(req, res, next) {
  if(!req.session["admin"])
    return res.redirect("/");

  res.render('adminpanel', { title: 'ON.event' });
});
router.get('/test', function(req, res, next) {
  res.render('test', { title: 'Express' });
});
router.get('/regtoevent/:id', async (req, res, next) =>{
  var e=await req.knex.select("*").from("t_events").where({isDeleted:false, id:req.params.id})
  if(e.length<1)
    return res.send(404);

  var isRegistered=req.session["user"+req.params.id];

  res.render('regtoevent', { title: 'ON.event', event:e[0], isRegistered:isRegistered });
});
router.get('/login/:id', async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var e=await req.knex.select("*").from("t_events").where({isDeleted:false, id:req.params.id})
  if(e.length<1)
    return res.send(404);

  res.render('login', { title: 'ON.event', event:e[0] });
});

router.get('/event/:id',  async (req, res, next) =>{

  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var evnts=await req.knex.select("*").from("t_events").where({isDeleted:false, id:req.params.id})
  if(evnts.length<1)
    return res.send(404);

  if(!req.session["user"+req.params.id])
    return res.redirect("/login/"+req.params.id)

  var event=evnts[0]
  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, eventid:req.params.id}).orderBy("date","desc")
  res.render('event', { title: 'ON.event', event:event , rooms:rooms});

})
router.get('/blank/',  async (req, res, next) =>{
  res.send("");
})

router.get('/room/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]

  if(!req.session["user"+room.eventid])
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/room/'+req.params.id))
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
res.header("X-Frame-Options","")
  res.render('room', { title: 'ON.event '+room.title, room:room , event:events[0]});

})
router.get('/stage/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]

  if(!req.session["user"+room.eventid])
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/stage/'+req.params.id))
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.header("X-Frame-Options","")
  res.render('stage', { title: 'ON.event '+room.title, room:room , event:events[0], isMod:req.session["moderator"+room.id]?true:false});

})
router.get('/stagePgm/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]

  if(!req.session["user"+room.eventid])
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/stagePgm/'+req.params.id))
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.header("X-Frame-Options","")
  res.render('stagePgm', { title: 'ON.event '+room.title, room:room , event:events[0], isMod:req.session["moderator"+room.id]?true:false});

})
router.get('/meeting/:eventid/:meetingId',  async (req, res, next) =>{
    req.params.eventid=parseInt(req.params.eventid)
    if(!Number.isInteger(req.params.eventid))
        return res.send(404);


    var users=await req.knex.select("*").from("t_eventusers").where({isDeleted:false, eventid:req.params.eventid})
    if(users.length<1)
        return res.send(404);

    var curruser=await req.knex.select("*").from("t_eventusers").where({isDeleted:false, id:req.params.meetingId})
  if(curruser.length<1)
        var user=users[0];

    if(!req.session["user"+user.eventid])
        return res.redirect("/login/"+req.params.eventid+"?redirect="+encodeURI('/meeting/'+req.params.eventid+"/"+req.params.meetingId))
    res.render('meeting', { title: 'ON.event Переговорная комната',eventid:user.eventid, meetRoomid:req.params.meetingId, user: req.session["user"+user.eventid]});

})

router.get('/moderator/:id',  async (req, res, next) =>{

  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]

  if(!req.session["moderator"+room.id])
    return res.render('moderatorLogin',{ title: 'ON.event  '+rooms.title, room:room})
  res.render('moderator', { title: 'ON.event  '+room.title, room:room});

})
router.get('/longtext/',  async (req, res, next) =>{
  res.render("elements/longText");
});
router.get('/editQuest/:id',  async (req, res, next) =>{

  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  if(rooms.length<1)
    return res.send(404);
  var room=rooms[0]
  var events=await req.knex.select("*").from("t_events").where({ id:room.eventid})


  if(!req.session["moderator"+room.id])
    return res.render('editQuestLogin',{ title: 'ON.event  '+rooms.title, room:room})
  res.render('editQuest', { title: 'ON.event  '+room.title, room:room, event:events[0]});

})
router.get('/speaker/:id',  async (req, res, next) =>{

  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]

  if(!req.session["speaker"+room.id])
    return res.render('speakerLogin',{ title: 'ON.event '+room.title, room:room})
  res.render('speaker', { title: 'ON.event '+room.title, room:room});

})
router.get('/speakerRec/:id',  async (req, res, next) =>{

  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]


  res.render('speakerRec', { title: 'ON.event '+room.title, room:room});

})
/*
router.get('/meeting/:eventid',  async (req, res, next) =>{
  if(!req.session["user"+req.params.eventid])
    res.sendStatus(404);
  console.log(req.session["user"+req.params.eventid])
  //{ title: 'Express' , meetRoomid:123, user:{f:"shevchenko", i:"denis", id:1}}
  res.render('meeting', { title: 'ON.event meeting room', meetRoomid:123, user:{f:req.session["user"+req.params.eventid].f, i:req.session["user"+req.params.eventid].i, id:1}});
})*/








module.exports = router;
