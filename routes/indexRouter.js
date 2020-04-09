var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ON.event' });
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
  res.render('room', { title: 'ON.event '+room.title, room:room });

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








module.exports = router;
