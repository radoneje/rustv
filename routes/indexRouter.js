var express = require('express');
var router = express.Router();
var moment=require('moment')
var path = require('path')
var fs = require('fs')

/* GET home page. */
router.get('/ping', function(req, res, next) {
  res.json( req.transport.clients.filter(c=>c.isActive).length);
});

router.get('/a/:id/', async function(req, res, next) {
  //res.json( req.transport.clients.filter(c=>c.isActive).length);
 // res.render('test', { title: 'AIJ test page' });
  await redirect("a",req, res)
});
router.get('/b/:id/', async function(req, res, next) {
  //res.json( req.transport.clients.filter(c=>c.isActive).length);
  //res.render('test', { title: 'AIJ test page' });
  await redirect("b",req, res)
});
async function redirect(f,req,res){

  var key=f+req.params.id;
  console.log(key)
  var r= await req.knex.select("*").from("t_redirect").where({key})
  if(r.length==0)
    return res.sendStatus(404);
  if(!r[0].value)
    r[0].value="/"
  res.redirect(r[0].value);

}
router.get('/cbplayer/:langid?', function(req, res, next) {
  if(!req.params.langid)
    req.params.langid="ru"
  res.render('cbplayer', {langid:req.params.langid, lang:require('./../lang')});
})
router.get('/', function(req, res, next) {
  console.log(req.headers.host)
     // if(req.headers.host.indexOf("localhost")>=0)
  if(req.headers.host.indexOf("cyber-polygon.club")>=0 || req.headers.host.indexOf("cyber-poligon.club")>=0)
    return res.render('cyberPolygon', { title: 'Cyber Polygon', lang:(require("../lang.json"))["en"] });

  if(req.headers.host.indexOf("cbr-online.ru")>=0)
    //return res.render('cbr-online', { title: 'Пресс-конференция Банка России' });
    return res.render('cbr-online', { title: 'Онлайн-конференция Банка России', lang:require('../lang') });
  if(req.headers.host.indexOf("gpn.onevent.online")>=0)
    return res.render('gpn', { title: 'Трансляция ДИР' });
  if(req.headers.host.indexOf("roastom.onevent.online")>=0)
    return res.render('rosatom', { title: 'Росатом', lang:(require("../lang.json"))["en"]});
  if(req.headers.host.indexOf("roastom02.onevent.online")>=0)
    return res.render('rosatom', { title: 'Росатом', lang:(require("../lang.json"))["en"]});
  if(req.headers.host.indexOf("atomday.ru")>=0)
    return res.render('rosatom', { title: 'Росатом', lang:(require("../lang.json"))["en"]});
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
  res.render('test', { title: 'AIJ test page' });
});
router.get('/test1', function(req, res, next) {
  res.json(req.session)
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

  if(req.params.id==42 && req.query.redirect && req.query.redirect.indexOf("room")>=0)
    return res.redirect('https://gpn.onevent.online/');

  var e=await req.knex.select("*").from("t_events").where({isDeleted:false, id:req.params.id})
  if(e.length<1)
    return res.send(404);

  res.render('login', { title: 'ON.event', event:e[0], lang:(require("../lang.json"))[e[0].lang||"ru"] });
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
  res.render('event', { title: 'ON.event',user:req.session["user"+req.params.id], event:event , rooms:rooms});

})
router.get('/showrecords/:eventid/:roomid',  async (req, res, next) => {
  if(!req.session["user"+req.params.eventid])
    return res.redirect("/login/"+req.params.eventid+"?redirect="+encodeURI('/showrecords/'+req.params.eventid+"/"+req.params.roomid));

  var records=await req.knex.select("*").from("t_stagerecords").where({roomid:req.params.roomid}).orderBy("date", "desc");

  var ret=[];

  for(var rec of records){
    var name="stage_"+rec.id+".webm";
    var filename=path.join(__dirname, '../public/records/' + name);
    console.log(filename)
    if (fs.existsSync(filename)) {
      ret.push(rec)
    }
  }
  console.log("exist", ret)
  res.render("stagerecords",{title:"records", records:ret, moment:moment});


});

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

  if(!req.session["user"+room.eventid] && room.id!=65)
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/room/'+req.params.id))
  if(room.id==65)
  {
    var usr = await req.knex("t_eventusers").insert({
      eventid: room.eventid,
      f: "user",
      i: "",
      tel: "",
      email: "",
      smsCode: "",
    }, "*")
    console.log("/room/:id")
    req.session["user"+room.eventid]=usr[0];
  }
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
res.header("X-Frame-Options","")
  if(room.id==98)
    res.render('roomgpn', { title: 'ON.event '+room.title, room:room , event:events[0], lang:(require("../lang.json"))[events[0].lang||"ru"]});
  else
  res.render('room', { title: 'ON.event '+room.title, room:room , event:events[0], lang:(require("../lang.json"))[events[0].lang||"ru"]});

})

router.get('/sbergile/:id',  async (req, res, next) =>{

  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    // return res.send(404);
  rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:30})

  var room=rooms[0]


  if((room.id>=102 && room.id<=104) ||room.id==30 )
  {
    var usr = await req.knex("t_eventusers").insert({
      eventid: room.eventid,
      f: "noname",
      i: "",
      tel: "",
      email: "",
      smsCode: "",
    }, "*")
    console.log("/room/:id")
    req.session["user"+room.eventid]=usr[0];
  }
  else
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/room/'+req.params.id))
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.header("X-Frame-Options","")
  if((room.id>=102 && room.id<=104) ||room.id==30 )
    res.render('sbergile', { title: 'ON.event '+room.title, room:room , event:events[0], lang:(require("../lang.json"))[events[0].lang||"ru"]});
  else
    res.render('room', { title: 'ON.event '+room.title, room:room , event:events[0], lang:(require("../lang.json"))[events[0].lang||"ru"]});

})

router.get('/chatToscreen/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]


  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.header("X-Frame-Options","")
  res.render('chatToscreen', { title: 'ON.event '+room.title, room:room , event:events[0], lang:(require("../lang.json"))[events[0].lang||"ru"]});

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
  res.render('stage', { title: 'ON.event '+room.title, room:room , event:events[0], isMod:req.session["moderator"+room.id]?true:false, lang:(require("../lang.json"))[events[0].lang||"ru"]});

})
router.get('/stageDialog/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]


  if(!req.session["user"+room.eventid])
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/stageDialog/'+req.params.id))
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.header("X-Frame-Options","")
  res.render('stageDialog', { title: 'ON.event '+room.title, room:room , event:events[0], isMod:req.session["moderator"+room.id]?true:false, lang:(require("../lang.json"))[events[0].lang||"ru"]});

})


router.get('/stage/translator/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]



  if(!req.session["user"+room.eventid])
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/stage/translator/'+req.params.id))
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.header("X-Frame-Options","")
  res.render('stageTranslator', { title: 'ON.event '+room.title, room:room , event:events[0], isMod:req.session["moderator"+room.id]?true:false, lang:(require("../lang.json"))[events[0].lang||"ru"]});

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
router.get('/stageScreen/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]

  if(!req.session["user"+room.eventid])
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/stageScreen/'+req.params.id))
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.header("X-Frame-Options","")
  res.render('stageScreen', { title: 'ON.event '+room.title, room:room , event:events[0], isMod:req.session["moderator"+room.id]?true:false});

})
router.get('/stageFive/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]

  if(!req.session["user"+room.eventid])
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/stageFive/'+req.params.id))
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.header("X-Frame-Options","")
  res.render('stageFive', { title: 'ON.event '+room.title, room:room , event:events[0], isMod:req.session["moderator"+room.id]?true:false});

})
router.get('/stagePres/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);

  var room=rooms[0]

  if(!req.session["user"+room.eventid])
    return res.redirect("/login/"+room.eventid+"?redirect="+encodeURI('/stagePres/'+req.params.id))
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.header("X-Frame-Options","")
  res.render('stagePres', { title: 'ON.event '+room.title, room:room , event:events[0], isMod:req.session["moderator"+room.id]?true:false});

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
  var room=rooms[0]
  var events=await req.knex.select("*").from("t_events").where({ id:room.eventid})


  if(!req.session["moderator"+room.id])
    return res.render('editQuestLogin',{ title: 'ON.event  '+rooms.title, room:room})
  res.render('editQuest', { title: 'ON.event  '+room.title, room:room, event:events[0]});

})
router.get('/editUsers/:id',  async (req, res, next) =>{

  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})

  if(rooms.length<1)
    return res.send(404);
  var room=rooms[0]
  var events=await req.knex.select("*").from("t_events").where({ id:room.eventid})


  if(!req.session["moderator"+room.id])
    return res.render('editQuestLogin',{ title: 'ON.event  '+rooms.title, room:room})

  res.render('editUsers', { title: 'ON.event  '+room.title, room:room, event:events[0]});

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
router.get('/tablet/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);
  var room=rooms[0]
  if(!req.session["speaker"+room.id])
    return res.render('tabletLogin',{ title: 'ON.event '+room.title, room:room})
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.render('tablet', { title: 'ON.event '+room.title, room:room, event:events[0]});

})
router.get('/mosaic/:id',  async (req, res, next) =>{
  req.params.id=parseInt(req.params.id)
  if(!Number.isInteger(req.params.id))
    return res.send(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.id})
  if(rooms.length<1)
    return res.send(404);
  var room=rooms[0]
  if(!req.session["speaker"+room.id])
    return res.render('tabletLogin',{ title: 'ON.event '+room.title, room:room})
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})
  res.render('mosaic', { title: 'ON.event '+room.title, room:room, event:events[0]});

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



router.get('/phoneVideoElem/:videoid',  async (req, res, next) =>{
  res.render("phoneVideoElem",{id:req.params.videoid})
})
router.get('/tagsres/:id',  async (req, res, next) =>{
  var vv=await req.knex.select('val', req.knex.raw('count(*)')).from('t_tagsanswers').where({tagsid:req.params.id}).groupBy('val').havingRaw("val IS NOT null");
  var tag=await req.knex.select('id','title', 'roomid').from('t_tags').where({id:req.params.id})
  if(tag.length==0)
    return res.sendStatus(404);
console.log("tags", tag)
  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:tag[0].roomid})
  if(rooms.length<1)
    return res.sendStatus(404);
  var room=rooms[0]
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})


  res.render("tagsres",{title:"results", arr:JSON.stringify(vv), tag:tag[0], event:events[0]})
})
router.get('/poleres/:id',  async (req, res, next) =>{
  var vv=await req.knex.select("x", "y").from('t_poleanswers').where({poleid:req.params.id});
  var pole=await req.knex.select('id','title', 'roomid').from('t_pole').where({id:req.params.id})
  if(pole.length==0)
    return res.sendStatus(404);

  var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:pole[0].roomid})
  if(rooms.length<1)
    return res.sendStatus(404);
  var room=rooms[0]
  var events=await req.knex.select("*").from("t_events").where({id:room.eventid})


  res.render("poleres",{title:"results", arr:JSON.stringify(vv), pole:pole[0], event:events[0]})
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
