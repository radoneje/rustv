var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MAY24:ONevent' });
});
router.get('/adminpanel', function(req, res, next) {
  if(!req.session["admin"])
    return res.redirect("/");

  res.render('adminpanel', { title: 'MAY24:ONevent' });
});
router.get('/test', function(req, res, next) {
  res.render('test', { title: 'Express' });
});
router.get('/regtoevent/:id', async (req, res, next) =>{
  var e=await req.knex.select("*").from("t_events").where({isDeleted:false, id:req.params.id})
  if(e.length<1)
    return res.send(404);

  var isRegistered=req.session["user"+req.params.id];

  res.render('regtoevent', { title: 'MAY24:ONevent', event:e[0], isRegistered:isRegistered });
});
router.get('/login/:id', async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var e=await req.knex.select("*").from("t_events").where({isDeleted:false, id:req.params.id})
  if(e.length<1)
    return res.send(404);

  res.render('login', { title: 'MAY24:ONevent', event:e[0] });
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
  res.render('event', { title: 'MAY24:ONevent::'+event.title, event:event , rooms:rooms});

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
  res.render('room', { title: 'MAY24:ONevent::'+rooms.title, room:room });

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
    return res.render('moderatorLogin',{ title: 'MAY24:ONevent::'+rooms.title, room:room})
  res.render('moderator', { title: 'MAY24:ONevent::'+rooms.title, room:room});

})








module.exports = router;
