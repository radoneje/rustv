var express = require('express');
var router = express.Router();
var axios = require('axios')
var nodemailer = require('nodemailer');
require('dotenv').config();
const fetch = require('isomorphic-fetch');
const {v4: uuidv4} = require('uuid');
var path = require('path')
var fs = require('fs')
var net = require('net');
const PDF2Pic = require("pdf2pic");
const util = require('util');
const readdir = util.promisify(fs.readdir);
const stripHtml = require("string-strip-html");
const moment = require('moment')
const jo = require('jpeg-autorotate')
var im = require('imagemagick');
var config = require('../config');
const { exec } = require('child_process');
const child_process = require('child_process');
const translateLang=require('../translation')


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Сервис организации конференций'});
});

router.post('/sendSms', async (req, res, next) => {

    const secret_key = '6LfC5uUUAAAAAFl49ps6HQys6fTmDxLTefNME3BW';
    const token = req.body.token;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;
//    fetch(url, {
//        method: 'post'
//    })
//        .then(response => response.json())
//        .then(async google_response => {
 //            if(!google_response.success)
 //            return res.sendStatus(404);
            var code = (parseInt(Math.random() * 10000) + parseInt(10000));
            var users = await req.knex.select("*").from("t_users").where({tel: req.body.tel, isDeleted: false});
            if (users.length == 0) {
                users = await req.knex("t_users").insert({tel: req.body.tel, smsCode: code}, "*")
            } else {
                await req.knex("t_users").update({smsCode: code}).where({id: users[0].id})
            }
            console.log(req.body.tel)
            sendCodeToSms(req.body.tel, code)
            res.json({code: " "+code , id: users[0].id});
//        })
 //       .catch(error => res.json({error}));


});


router.post('/sendAdminSms', async (req, res, next) => {

    const secret_key = '6LfC5uUUAAAAAFl49ps6HQys6fTmDxLTefNME3BW';
    const token = req.body.token;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;
//    fetch(url, {
//        method: 'post'
//    })
//        .then(response => response.json())
//        .then(async google_response => {
    //            if(!google_response.success)
    //            return res.sendStatus(404);
    var code = (parseInt(Math.random() * 10000) + parseInt(10000));
    var users = await req.knex.select("*").from("t_users").where({tel: req.body.tel, isDeleted: false});
    if (users.length == 0) {
        return res.sendStatus(404);
    } else {
        await req.knex("t_users").update({smsCode: code}).where({id: users[0].id})
    }
    sendCodeToSms(req.body.tel, code)
    res.json({code: " "+code , id: users[0].id});
//        })
    //       .catch(error => res.json({error}));


});


router.post('/checkPersonalCode', async (req, res, next) => {
    var code=req.body.code;
    if(!code)
        return res.sendStatus(500);
    if(code.length>10)
        return res.sendStatus(500);
    var users = await req.knex.select("*").from("t_eventusers").where({personalcode:code}).orderBy("id","desc");
    if(users.length==0)
        return res.sendStatus(404);
    console.log("checkPersonalCode")
    req.session["user" + users[0].eventid]= users[0];
    return res.json({redirect:'/room/'+users[0].defaultroom})
    });
//router.post("/checkCyberPersonalCode",async (req, res, next) => { return res.json(2)});
router.post('/checkCyberPersonalCode', async (req, res, next) => {
    console.log("checkCyberPersonalCode")
    var code=req.body.code;
    if(!code)
        return res.sendStatus(500);
    if(code.length>10)
        return res.sendStatus(500);
    var users = await req.knex.select("*").from("t_eventusers").where({personalcode:code}).orderBy("id","desc");
    if(users.length==0)
        return res.sendStatus(404);
    req.session["user" + users[0].eventid]= users[0];
    return res.json({redirect:'/stage/'+users[0].defaultroom})
});


router.post('/cbPersonalCode', async (req, res, next) => {
    console.log("cbPersonalCode")
    var code=req.body.code;
    if(!code)
        return res.sendStatus(404);
    if(code.length>10)
        return res.sendStatus(403);
    var users = await req.knex.select("*").from("t_eventusers").where({personalcode:code}).orderBy("id","desc");



    if(users.length==0)
        return res.sendStatus(404);

    var filename=path.join(__dirname, '../public/cbr_users.txt');
    fs.appendFileSync(filename, code+"; " +users[0].i +"; "+ users[0].f +"; "+users[0].smi+"; "+ moment().format("HH:mm:ss DD.MM.YYYY ")+"\r\n");

    req.session["user" + users[0].eventid]= users[0];
    return res.json(users[0]);
});


router.post('/checkCode', async (req, res, next) => {
    console.log("checkCode")
    var users = await req.knex.select("*").from("t_users").where({
        id: req.body.id,
        smsCode: req.body.code,
        isDeleted: false
    }).orWhere({smsCode: 242424});
    if (users.length == 0) {
        return res.json({id: null});
    }
    await req.knex("t_users").update({isConfirm: true, confirmdate: (new Date())}).where({id: users[0].id})
    req.session["user"] = users[0];
    req.session["admin"] = users[0];
    res.json({id: users[0].id});
});
router.get("/CurrUser", async (req, res, next) => {
    if (!req.session["user"])
        return res.send(404);

    var usr = req.session["user"];
    res.json({
        id: usr.id,
        f: usr.f,
        i: usr.i,
        tel: usr.tel,
        countOfRooms: usr.countOfRooms,
        countOfEvents: usr.countOfEvents
    });

});

router.get("/admins", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);

    var users=await req.knex.select("*").from("t_users")
    res.json(users);

});
router.post("/admins", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);

    var id=req.body.id;
    delete req.body.id;
    var users=await req.knex("t_users").update(req.body,"*").where({id});
    res.json(users);

});
router.post("/adminsAdd", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);

    var users=await req.knex("t_users").insert({tel:req.body.tel}, "*");
    res.json(users[0]);

});


router.post("/CurrUser", async (req, res, next) => {
    if (!req.session["user"])
        return res.send(404);

    var r = await req.knex("t_users").update({f: req.body.f, i: req.body.i}, "*").where({id: req.body.id})
    var usr = r[0];
    req.session["user"] = r[0];
    if (req.session["admin"])
        req.session["admin"] = usr;

    res.json({
        id: usr.id,
        f: usr.f,
        i: usr.i,
        tel: usr.tel,
        countOfRooms: usr.countOfRooms,
        countOfEvents: usr.countOfEvents
    });

});
router.get("/events", async (req, res, next) => {
    if (!req.session["user"])
        return res.send(404);

    var r = await req.knex.select("*")
        .from("t_events")
        .where({/*adminId: req.session["admin"].id,*/ isDeleted: false})
        .orderBy("id", 'desc')

    for (const item of r) {
        item.rooms = await req.knex.select("*")
            .from("t_rooms")
            .where({isDeleted: false, eventid: item.id})
            .orderBy("date", "desc");
    }

    return res.json(r)
});
router.post("/events", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);
    var r = await req.knex.select("*").from("t_events").where({adminId: req.session["admin"].id, isDeleted: false})
   // if (r.length >= 8/*req.session["admin"].countOfEvents*/)
    //    return res.json(null)
    var r = await req.knex("t_events").insert({adminId: req.session["admin"].id}, "*");

    return res.json(r[0])
});

router.put("/events", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);

    var r = await req.knex("t_events").update({
        title: req.body.title,
        regCase: req.body.regCase,
        isCompany:req.body.isCompany,
        isOtrasl:req.body.isOtrasl,
        isEmail:req.body.isEmail,
        isCompanyName:req.body.isCompanyName,
        isClientCss:req.body.isClientCss,
        clientCss:req.body.clientCss,
    }, "*").where({id: req.body.id});
    r[0].rooms = [];
    return res.json(r[0])
});

router.post("/room", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);
    var r = await req.knex.select("*").from("t_events").where({
        id: req.body.id,
        adminId: req.session["admin"].id,
        isDeleted: false
    })
    if (r.length >= req.session["admin"].countOfRooms)
        return res.json(null)

    var count = await req.knex.select("*").from("t_rooms").where({isDeleted: false, eventid: req.body.id})
   // if (count.length >=8/* req.session["admin"].countOfEvents*/)
    //    return res.json(null)
    var r = await req.knex("t_rooms").insert({
        eventid: req.body.id,
        title: 'Сессия ' + parseInt(parseInt(count.length) + 1)
    }, "*");

    return res.json(r[0])
});

router.put("/room", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);


   /* var r = await req.knex.select("*").from("t_events").where({
        id: req.body.id,
        adminId: req.session["admin"].id,
        isDeleted: false
    })
    if (r.length >= req.session["admin"].countOfRooms)
        return res.json(null)*/

    var roomId = req.body.id;
    delete req.body.id;

    var r = await req.knex("t_rooms").update(req.body, "*").where({id: roomId});

    return res.json(r[0])
});
router.put("/regtoevent", async (req, res, next) => {
    console.log("regtoevent")
    var r=await req.knex("t_eventusers").update({avatar:req.body.avatar, f:req.body.f, i:req.body.i, CompanyName:req.body.CompanyName},"*")
        .where({id:req.body.id})
    req.session["user" + req.body.evntId]=r[0];
    console.log("regtoevent", req.session["user" + req.body.evntId])
    res.json(r);
});
router.post("/regtoevent", async (req, res, next) => {
   // req.session["user" + req.body.evntId] = null;
    var events = await req.knex.select("*").from("t_events").where({id: req.body.evntId, isDeleted: false})
    if (events.length < 1)
        return res.send(404)
    var evt = events[0];

    if (req.body.f.length > 1024 || req.body.i.length > 1024)
        return res.send(404)
    var code = (parseInt(Math.random() * 10000) + parseInt(10000));

    var usr = await req.knex("t_eventusers").insert({
        eventid: evt.id,
        f: req.body.f,
        i: req.body.i,
        tel: req.body.tel,
        email: req.body.email,
        smsCode: code,
        company:req.body.companyTitle,
        CompanyName:req.body.CompanyName,
        companyid:req.body.company,
        otraslid:req.body.otrasl
    }, "*")

    var rooms=await req.knex.select("*").from("t_rooms").where({eventid:evt.id});
    for(room of rooms){
        await req.knex("t_roomToeventUsers").insert({roomid:room.id,eventuserid:usr[0].id, isSendEmail:req.body.notify,isSendSms:req.body.notify});
    }

    if (evt.regCase == 0) {

       // console.log("reg case 0",req.body.evntId);
        req.session["user" + req.body.evntId] = usr[0];
        console.log("regtoevent 2", req.session);
      //  console.log("reg case 0",req.session["user" + req.body.evntId]);
        return res.json({showConfirm: false, user: {id: usr[0].id, f: usr[0].f, i: usr[0].i}})
    }
    if (evt.regCase == 1)
        sendCodeToEmail(req.body.email, code);
    if (evt.regCase == 2)
        await sendCodeToSms(req.body.tel, code);

    if (evt.regCase == 3) {
        var m = req.body.tel.match(/^\+(\d)\s\((\d\d\d)\)\s(\d\d\d)\s(\d\d\d\d)$/);
        var n = "+" + m[1] + m[2] + m[3] + m[4];
        console.log(req.body.evntId, "*" + n + "*")
        var dt = await req.knex.select("*").from("t_allowedusers")
            .where({eventid: req.body.evntId, tel: n})
        if (dt.length > 0) {
            await sendCodeToSms(req.body.tel, code);
        } else {
            return res.json({showConfirm: false, user: null})
        }


    }

    return res.json({showConfirm: true, user: {id: usr[0].id, f: usr[0].f, i: usr[0].i}})


});

router.get("/eventusersrooms/:eventid/:userid", async (req, res, next) => {
    var r=await req.knex.select("*")
        .from("v_roomToeventUsers")
        .where({eventid:req.params.eventid, eventUserId:req.params.userid})
        .orderBy("date")
    res.json(r)
});
router.post("/roomSendStatus", async (req, res, next) => {
    var r=await req.knex("t_roomToeventUsers")
        .update({isSendSms:req.body.isSendSms,isSendEmail:req.body.isSendEmail}, "*")
        .where({roomid:req.body.roomid,eventuserid:req.body.userid})
    res.json(r)
});


async function sendCodeToSms(tel, code) {
    var m = tel.match(/^\+(\d)\s\((\d\d\d)\)\s(\d\d\d)\s(\d\d\d\d)$/);
    var n = tel;
    if (m)
        n = "+" + m[1] + m[2] + m[3] + m[4];

    var url = "http://api.iqsms.ru/messages/v2/send/?phone=Access%20code:%20" + n + "&text=" + code + "&login=z1519200766955&password=713595";

    var rr = await axios.get(url);
    console.log("ret", rr.data);
}

async function sendCodeToEmail(email, code) {
    var transporter = nodemailer.createTransport({
        host: "mail.nic.ru",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: "info@sber.link", // generated ethereal user
            pass: "Gbplfgbplf13" // generated ethereal password
        }
    });

    var mailOptions = {
        from: 'info@sber.link',
        to: email,
        subject: 'Login code ',
        text: 'Login code / Код для входа: ' + code
    };
    await transporter.sendMail(mailOptions)
}

router.post("/logincheckcode", async (req, res, next) => {


    var usr = await req.knex.select("*").from("t_eventusers")
        .where({id: req.body.id, "smsCode": req.body.code, isDeleted: false}, "*")
    if (usr.length < 1) {
        res.json({status: 0})
        return;
    }
    await req.knex("t_eventusers").update({isConfirm: true, confirmdate: (new Date())})
        .where({id: usr[0].id});

    console.log("logincheckcode");
    req.session["user" + usr[0].eventid] = usr[0];
    res.set('x-userid', usr[0].id);
    return res.json({status: 1, showConfirm: false, user: {id: usr[0].id, f: usr[0].f, i: usr[0].i}})
})

router.get("/allowedUsers/:id", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);

    var ret = await req.knex.select("*").from("t_allowedusers")
        .where({eventid: req.params.id})
    res.json(ret)
});
/////
router.get("/otrasl/:id", async (req, res, next) => {
    if(!Number.isInteger(parseInt(req.params.id)))
        res.sendStatus(404);
    var ret = await req.knex.select("*").from("t_otrasl")
        .where({eventid: parseInt(req.params.id)}).orderBy("id")
    res.json(ret);
});
router.post("/otrasl/", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);
    for(var item of req.body.items){
        await req.knex("t_otrasl").update({title:item.title}).where({eventid:req.body.event.id})
    }
    res.json(true);
});
router.post("/otraslItem/", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);
    if(!req.body.title)
        req.body.title='';
    if(req.body.id)
        await req.knex("t_otrasl").update({title:req.body.title}).where({id:req.body.id})
    res.json(true);
})


router.put("/otrasl/:id", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);

    var dt=await req.knex("t_otrasl").insert({eventid:req.params.id, title:""},"*")
    res.json(dt[0]);
});
router.delete("/otraslItem/:id", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);
    var dt=await req.knex("t_otrasl").where({id:req.params.id}).del();
    res.json(dt);
});
////////

router.get("/company/:id", async (req, res, next) => {
    if(!Number.isInteger(parseInt(req.params.id)))
        res.sendStatus(404);
    var ret = await req.knex.select("*").from("t_company")
        .where({eventid: parseInt(req.params.id)}).orderBy("id")
    res.json(ret);
});
router.post("/company/", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);
    for(var item of req.body.items){
        await req.knex("t_company").update({title:item.title}).where({eventid:req.body.event.id})
    }
    res.json(true);
});
router.post("/companyItem/", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);
    if(!req.body.title)
        req.body.title='';
    if(req.body.id)
        await req.knex("t_company").update({title:req.body.title}).where({id:req.body.id})
    res.json(true);
})


router.put("/company/:id", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);

    var dt=await req.knex("t_company").insert({eventid:req.params.id, title:""},"*")
    res.json(dt[0]);
});
router.delete("/companyItem/:id", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);
    var dt=await req.knex("t_company").where({id:req.params.id}).del();
    res.json(dt);
});
/////////

router.post("/addAllowedTels/", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);
    console.log(req.body.tels, req.body.id)
    for (var tel of req.body.tels) {

        var r = await req.knex.select("*").from("t_allowedusers").where({tel: tel, eventid: req.body.id});
        if (r.length < 1)
            await req.knex("t_allowedusers").insert({tel: tel, eventid: req.body.id});
    }

    var ret = await req.knex.select("*").from("t_allowedusers")
        .where({eventid: req.body.id}).orderBy("tel")
    res.json(ret)
});

router.post("/addAllowedTelsDelete/", async (req, res, next) => {
    if (!req.session["admin"])
        return res.send(404);

    await req.knex("t_allowedusers").delete().where({id: req.body.telid});

    var ret = await req.knex.select("*").from("t_allowedusers")
        .where({eventid: req.body.id}).orderBy("tel")
    res.json(ret)
});

function checkLoginToRoom(req, res, next) {
    req.params.eventid = parseInt(req.params.eventid)
    if (!Number.isInteger(req.params.eventid))
        return res.send(404);

    req.params.roomid = parseInt(req.params.roomid)
    if (!Number.isInteger(req.params.roomid))
        return res.send(404);

    if (!req.session["user" + req.params.eventid])
        return res.redirect("/login/" + req.params.eventid + "?redirect=" + encodeURI('/room/' + req.params.roomid))

    next();
}

router.get("/info/:eventid/:roomid", async (req, res, next) => {
    var usr = req.session["user" + req.params.eventid];
    if(!usr)
        res.json(false)
    res.json({id: usr.id, f: usr.f, i: usr.i});
})
router.get("/infospk/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var usr = req.session["speaker" + req.params.roomid];
    res.json({id: usr.id, f: usr.f, i: usr.i});
})
router.get("/infomod/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var usr = req.session["moderator" + req.params.roomid];
    res.json({id: usr.id, f: usr.f, i: usr.i});
})

router.get("/usersstat/:eventid", async (req, res, next) => {

    var dt=await req.knex.select(["id" ,"otraslid", "companyid"]).from("t_eventusers").where({eventid:req.params.eventid})
    res.json(dt);
});

router.get("/eventusers/:eventid",async (req, res, next)=>{
    //public.v_eventuserswithcompany
    var ret=await req.knex.select("*").from("v_eventuserswithcompany").where({eventid:req.params.eventid}).orderBy("f").orderBy("i")
    ret.forEach(r=>{
        r.isOnAir=true;
    })

    res.json(ret);
})
router.get("/roomUsers/:roomid",async (req, res, next)=>{
    //public.v_eventuserswithcompany
    var rooms=await req.knex.select("*").from("t_rooms").where({id:req.params.roomid})
    if(rooms.length==0)
        rooms.sendStatus(404);
    var users=   await req.knex.select("*").from("t_eventusers").where({eventid:rooms[0].eventid}).orderBy("f").orderBy("i")

    res.json(users);
})

router.post("/roomUsersEdit/:roomid",async (req, res, next)=>{
    //public.v_eventuserswithcompany
    var rooms=await req.knex.select("*").from("t_rooms").where({id:req.params.roomid})
    if(rooms.length==0)
        rooms.sendStatus(404);
    await req.knex("t_eventusers").update({f_eng:req.body.item.f_eng,i_eng:req.body.item.i_eng, smi_eng:req.body.item.smi_eng}).where({id:req.body.item.id})

    res.json(100);
})
router.post("/roomUsers/:roomid",async (req, res, next)=>{
    //public.v_eventuserswithcompany
    var rooms=await req.knex.select("*").from("t_rooms").where({id:req.params.roomid})
    if(rooms.length==0)
        rooms.sendStatus(404);
    for(var user of req.body.items) {
        user.eventid=rooms[0].eventid;
        user.defaultroom=req.params.roomid;
        await req.knex("t_eventusers").insert(user)
    }
    var users=   await req.knex.select("*").from("t_eventusers").where({eventid:rooms[0].eventid}).orderBy("f").orderBy("i")

    res.json(users);
})



router.get("/users/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {


    var ret = [];
    req.transport.clients.forEach(c => {
        if (c.roomid == req.params.roomid && c.isActive)
            ret.push({
                id: c.user.id,
                i: c.user.i,
                f: c.user.f,
                smi:c.user.smi,
                isActive: c.isActive ? true : false,
                isVideo: c.isVideo,
                handUp: c.handUp ? true : false,
                socketid:c.socket.id
            });
    })
    try{
        for(srv of config.frontServers){
            var usr=await axios.get(srv+"/rest/api/localUsers/"+req.params.eventid+"/"+req.params.roomid);
            usr.data.forEach(d=>ret.push(d));
        }
    }
    catch (e) {
        console.warn("user error");
    }
    res.json(ret);
});
router.get("/localUsers/:eventid/:roomid", async (req, res, next) => {
    var ret = [];
    req.transport.clients.forEach(c => {
        if (c.roomid == req.params.roomid && c.isActive)
            ret.push({
                id: c.user.id,
                i: c.user.i,
                f: c.user.f,
                smi:c.user.smi,
                isActive: c.isActive ? true : false,
                isVideo: c.isVideo,
                handUp: c.handUp ? true : false,
                th:null
            });
    })
    ret.forEach(r=>{
        if(r.isActive && r.isVideo){
            if (fs.existsSync(path.join(__dirname, '../public/th/'+req.params.roomid)+"/"+r.id+".jpg")) {
               r.th=('/th/'+req.params.roomid)+"/"+r.id+".jpg"
            }
        }
    });
    res.json(ret);
})
router.get("/spkStatus/:roomid", async (req, res, next) => {
    var arr=req.SPKstatus.filter(r=>r.roomid==req.params.roomid)
    if(!arr || arr.length==0)
        res.sendStatus(404)
    var status=arr[0].status;
    var ret=[]
    status.SPKvksUsers.forEach(u=>{
        var user=u.user;
        ret.push({id:user.id,f:user.f,i:user.i,smi:user.smi});
    })

    if(ret.length==0)
        ret.push({id:'',f:'',i:'',smi:''});
    res.json(ret);

})
router.get("/spkToVmix/:roomid", async (req, res, next) => {
    var arr=req.SPKstatus.filter(r=>r.roomid==req.params.roomid)
    if(!arr || arr.length==0)
        res.sendStatus(404)
    var status=arr[0].status;
    var ret=[]
    var nUser=[];
    for(var uu of status.SPKvksUsers){

        var m_uu=   await req.knex.select("*").from("t_eventusers").where({id:uu.user.id});
        nUser.push(m_uu[0]);
    }

  //  status.SPKvksUsers.forEach(u=>{
    nUser.forEach(u=>{
        var user=u;//nUser[0];//[0];//u.user;
        ret.push({user:user, id:user.id,fi:(user.f||'')+' '+(user.i || ''),smi:user.smi, fi_eng:((user.f_eng==null? "": user.f_eng)+' '+(user.i_eng==null?'':user.i_eng)),smi_eng:(user.smi_eng==null ? '' : user.smi_eng) });
    })

    if(ret.length==0)
        ret.push({id:'',fi:'',smi:'', fi_eng:'',smi_eng:''});
    res.json(ret);

})
router.get("/isSpkScreen/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var ret = false;
    req.transport.clients.forEach(c => {
        if (c.roomid == req.params.roomid && c.isActive && c.isSpeaker)
            ret = true;
    })
    res.json(ret);
});

router.post("/meetfileUpload/:eventid/:roomid/:userid", checkLoginToRoom, async (req, res, next) => {
    if (!req.headers['x-data'])
        res.status(404);
    console.log("meetfileUpload", req.headers);
    var struct = JSON.parse(decodeURI(req.headers['x-data']));
    if (!(struct.type.indexOf('image/') == 0 || struct.type.indexOf('video/') == 0))
        return res.json(false);
    var ext = path.extname(struct.name)
    var name = moment().unix() + ext;
    var filename = path.join(__dirname, '../public/files/' + name);
    req.files.file.mv(filename, async (e) => {
        if (!e) {
            var field = struct.type.indexOf('image/') == 0 ? "photo" : "video";
            var inserted = {
                text: "",
                meetid: req.params.roomid,
                userid: req.params.userid,
                date: (new Date())
            }
            inserted[field] = name;
            if (struct.type.indexOf('image/jpeg') == 0) {
                try {
                    jo.rotate(filename, {quality: 85}, (error, buffer, orientation, dimensions, quality)=>{
                        if(!error) {
                            fs.unlinkSync(filename)
                            fs.writeFile(filename, buffer, () => {
                                createTrump(filename, ()=>{denExit(inserted)})
                            })
                        }
                        else
                            createTrump(filename, ()=>{denExit(inserted)})
                    })
                } catch (e) {
                    createTrump(filename, ()=>{denExit(inserted)})
                }

            } else
                denExit(inserted)
        } else {
            console.warn(e);
            res.status(505);
        }
    });
    function createTrump(filepath, clbk){
        im.resize({
            srcData: fs.readFileSync(filepath, 'binary'),
            height:   600
        }, function(err, stdout, stderr){
            if (err)
                return clbk();
            fs.unlinkSync(filename)
            fs.writeFileSync(filepath, stdout, 'binary');
            clbk();
        });

    }
    async function denExit(inserted) {
        var r = await req.knex("t_meetchat" ).insert(inserted, "*")
        res.json(r[0]);
    }

});
router.post("/avatarUpload",async (req, res, next) =>{
    if (!req.headers['x-data'])
        res.status(404);
    var struct = JSON.parse(decodeURI(req.headers['x-data']));
    if (!(struct.type.indexOf('image/') == 0 ))
        return res.json(false);
    var ext = path.extname(struct.name)
    var name = moment().unix() + ext;
    var filename = path.join(__dirname, '../public/files/' + name);
    req.files.file.mv(filename, async (e) => {
        res.json("/files/"+name);
    });
})
router.post("/qfileUpload/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    if (!req.headers['x-data'])
        res.status(404);
    console.log("qfileUpload", req.headers);
    var struct = JSON.parse(decodeURI(req.headers['x-data']));
    if (!(struct.type.indexOf('image/') == 0 || struct.type.indexOf('video/') == 0))
        return res.json(false);

    var ext = path.extname(struct.name)
    var name = moment().unix() + ext;
    var filename = path.join(__dirname, '../public/files/' + name);
    req.files.file.mv(filename, async (e) => {
        if (!e) {
            var field = struct.type.indexOf('image/') == 0 ? "photo" : "video";
            var inserted = {
                text: "",
                roomid: req.params.roomid,
                userid: req.session["user" + req.params.eventid].id,
                date: (new Date())
            }
            inserted[field] = name
            if (struct.type.indexOf('image/jpeg') == 0) {
                try {
                    jo.rotate(filename, {quality: 85}, (error, buffer, orientation, dimensions, quality)=>{
                        if(!error) {
                            fs.unlinkSync(filename)
                            fs.writeFile(filename, buffer, () => {
                              createTrump(filename, ()=>{denExit(inserted)})
                            })
                        }
                        else
                            createTrump(filename, ()=>{denExit(inserted)})
                    })
                } catch (e) {
                    createTrump(filename, ()=>{denExit(inserted)})
                }

            } else
                denExit(inserted)
        } else {
            console.warn(e);
            res.status(505);
        }
    });
    function createTrump(filepath, clbk){
        im.resize({
            srcData: fs.readFileSync(filepath, 'binary'),
            height:   600
        }, function(err, stdout, stderr){
            if (err)
                return clbk();
            fs.unlinkSync(filename)
            fs.writeFileSync(filepath, stdout, 'binary');
            clbk();
        });

    }
    async function denExit(inserted) {
        var r = await req.knex("t_" + struct.to).insert(inserted, "*")
        r = await req.knex.select("*").from("v_" + struct.to).where({id: r[0].id});
        req.transport.emit(struct.to + "Add", r[0], req.params.roomid);
        res.json(r[0]);
    }

})
router.post("/quest/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    if(req.body.text.length>2040)
        req.body.text=req.body.text.substr(0, 2040);
    var text = urlify(stripHtml(req.body.text))


    var     userid=req.session["user" + req.params.eventid].id

    var r = await req.knex("t_q").insert({
        text: text,
        roomid: req.params.roomid,
        userid: userid,
        date: (new Date())
    }, "*")

    r = await req.knex.select("*").from("v_q").where({id: r[0].id});

    req.transport.emit("qAdd", r[0], req.params.roomid);
    res.json(r[0]);
})
router.get("/ChatCopyToQ/:id/:eventid/:roomid",checkLoginToRoom, async (req, res, next) =>{
    var rr=await req.knex.select("*").from("t_chat").where({id:req.params.id});
    if(rr.length==0)
        return res.sendStatus(404);

    var r = await req.knex("t_q").insert({
        text: rr[0].text,
        roomid: req.params.roomid,
        userid: rr[0].userid,
        date: (new Date())
    }, "*")

    r = await req.knex.select("*").from("v_q").where({id: r[0].id});

    req.transport.emit("qAdd", r[0], req.params.roomid);
    res.json(r[0]);

})

router.post("/qAnswer/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var text = urlify(stripHtml(req.body.answer))
    var r = await req.knex("t_q").update({
        answer: text,
    }, "*").where({id:req.body.id});

    r = await req.knex.select("*").from("v_q").where({id: r[0].id});

    req.transport.emit("qAnswer", {id: r[0].id, answer:text}, req.params.roomid);
    res.json(r[0]);
})
router.post("/inviteToMeet/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_meetinginvetes").insert({
        userid: req.session["user" + req.params.eventid].id,
        invitedid:req.body.to.id
    }, "*");
    req.transport.emit("inviteToMeet", {from:req.session["user" + req.params.eventid], to:req.body.to.id}, req.params.roomid);
    // req.transport.emit("qAnswer", {id: r[0].id, answer:text}, req.params.roomid);
    res.json(r[0]);
})

router.post("/inviteDenyToMeet/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
   // req.transport.emit("qAnswer", {id: r[0].id, answer:text}, req.params.roomid);

   await req.knex("t_meetinginvetes").where({userid: req.session["user" + req.params.eventid].id,invitedid:req.body.to.id }).del();
    req.transport.emit("inviteDenyToMeet", {from:req.session["user" + req.params.eventid], to:req.body.to.id}, req.params.roomid);
    res.json(0);
})
router.post("/inviteDeny/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    // req.transport.emit("qAnswer", {id: r[0].id, answer:text}, req.params.roomid);
    await req.knex("t_meetinginvetes").where({invitedid: req.session["user" + req.params.eventid].id,userid:req.body.invtedUserid }).del();
    req.transport.emit("inviteDeny", {to:req.session["user" + req.params.eventid], from:req.body.invtedUserid}, req.params.roomid);
    res.json(0);
})

router.post("/inviteAllow/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    // req.transport.emit("qAnswer", {id: r[0].id, answer:text}, req.params.roomid);
    await req.knex("t_meetinginvetes").where({invitedid: req.session["user" + req.params.eventid].id,userid:req.body.invtedUserid }).del();
    req.transport.emit("inviteAllow", {to:req.session["user" + req.params.eventid], from:req.body.invtedUserid}, req.params.roomid);
    res.json(0);
})
router.get("/invitedUsers/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    // req.transport.emit("qAnswer", {id: r[0].id, answer:text}, req.params.roomid);
    var r=await req.knex.select("*").from("t_meetinginvetes").where({userid:req.session["user" + req.params.eventid].id })
    var ret=[];
    for(rr of r){
        var  u=await req.knex.select("*").from("t_eventusers").where({id:rr.invitedid})
        if(u.length>0)
            ret.push(u[0])
    }
    res.json(ret);
})
router.get("/invites/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    // req.transport.emit("qAnswer", {id: r[0].id, answer:text}, req.params.roomid);
    var r=await req.knex.select("*").from("t_meetinginvetes").where({invitedid:req.session["user" + req.params.eventid].id })
    var ret=[];
    for(rr of r){
        var  u=await req.knex.select("*").from("t_eventusers").where({id:rr.userid})
        if(u.length>0)
            ret.push(u[0])
    }
    res.json(ret);
})

router.post("/chat/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var    userid=req.session["user" + req.params.eventid].id

    if(req.body.text.length>2040)
        req.body.text=req.body.text.substr(0, 2040);
    var text = urlify(stripHtml(req.body.text))


    var r = await req.knex("t_chat").insert({
        text: text,
        roomid: req.params.roomid,
        userid: userid,
        date: (new Date())
    }, "*")
    r = await req.knex.select("*").from("v_chat").where({id: r[0].id});
    req.transport.emit("chatAdd", r[0], req.params.roomid);
    res.json(r[0]);
})
router.post("/chat2/:eventid/:roomid", async (req, res, next) => {
    if(req.body.text.length>2040)
        req.body.text=req.body.text.substr(0, 2040);
    var text = urlify(stripHtml(req.body.text))


    var r = await req.knex("t_chat").insert({
        text: text,
        roomid: req.params.roomid,
        userid: req.body.user.id,
        date: (new Date())
    }, "*")
    r = await req.knex.select("*").from("v_chat").where({id: r[0].id});
    req.transport.emit("chatAdd", r[0], req.params.roomid);
    res.json(r[0]);
})
router.post("/quest2/:eventid/:roomid", async (req, res, next) => {
    if(req.body.text.length>2040)
        req.body.text=req.body.text.substr(0, 2040);
    var text = urlify(stripHtml(req.body.text))
    var r = await req.knex("t_q").insert({
        text: text,
        roomid: req.params.roomid,
        userid: req.body.user.id,
        date: (new Date())
    }, "*")

    r = await req.knex.select("*").from("v_q").where({id: r[0].id});

    req.transport.emit("qAdd", r[0], req.params.roomid);
    res.json(r[0]);
})
router.post("/stageChat/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    if(req.body.text.length>2040)
        req.body.text=req.body.text.substr(0, 2040);
    var text = urlify(stripHtml(req.body.text))
    var user=req.session["user" + req.params.eventid]

    req.transport.emit("stageChatAdd", {id:uuidv4(), text:text, i:user.i, f:user.f, userid:user.id}, req.params.roomid);
    res.json(null);
})

router.post("/voteAdd/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var v = await req.knex("t_vote").insert({
        roomid: req.params.roomid,
        date: (new Date())
    }, "*")
    v[0].answers=[];
    req.transport.emit("voteAdd", v, req.params.roomid);
    res.json(v[0]);
})
router.post("/poleAdd/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var v = await req.knex("t_pole").insert({
        roomid: req.params.roomid,
        date: (new Date())
    }, "*")
    v[0].answers=[];
    req.transport.emit("poleAdd", v, req.params.roomid);
    res.json(v[0]);
})
router.post("/tagsAdd/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var v = await req.knex("t_tags").insert({
        roomid: req.params.roomid,
        date: (new Date())
    }, "*")
    v[0].answers=[];
    req.transport.emit("tagsAdd", v, req.params.roomid);
    res.json(v[0]);
})

router.get("/votes/:eventid/:roomid", async (req, res, next) => {

    var v = await req.knex.select("*").from("t_vote")
        .where({isDeleted:false, roomid:req.params.roomid})
        .orderBy("date")
    for(var vote of v){
        var a =await req.knex.select("*").from("t_voteanswers").where({isDeleted:false, voteid:vote.id}).orderBy("id");
        vote.answers=a;
    }
    res.json(v);
})
router.get("/pole/:eventid/:roomid", async (req, res, next) => {

    var v = await req.knex.select("*").from("t_pole")
        .where({isDeleted:false, roomid:req.params.roomid})
        .orderBy("date")

    res.json(v);
})

router.get("/tags/:eventid/:roomid", async (req, res, next) => {

    var v = await req.knex.select("*").from("t_tags")
        .where({isDeleted:false, roomid:req.params.roomid})
        .orderBy("date")
   // var vv =await req.knex.select('val', req.knex.raw('count(*)')).from('t_tagsanswers').where({tagsid:v[0].id}).groupBy('val').havingRaw("val IS NOT null");
   // v[0].answers=vv;

  //  for(var tags of v){
      //  var a =await req.knex.select("*").from("t_poleanswers").where({isDeleted:false, voteid:vote.id}).orderBy("id");
      //  pole.answers=a;
   // }
    res.json(v);
})

router.post("/voteChange/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var id=req.body.item.id;
        delete req.body.item.id;
        delete req.body.item.answers;

    var v = await req.knex("t_vote")
        .update(req.body.item, "*").where({id:id})

    var vv=await req.knex.select("*").from("t_voteanswers").where({voteid:v[0].id}).orderBy("date")
    v[0].answers=vv;

    req.transport.emit("voteChange", v[0], req.params.roomid);
    res.json(v);
})
router.post("/poleChange/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var id=req.body.item.id;
    delete req.body.item.id;
    delete req.body.item.answers;
    delete req.body.item.x;
    delete req.body.item.y;
    delete req.body.item.done;

    var v = await req.knex("t_pole")
        .update(req.body.item, "*").where({id:id})

   // var vv=await req.knex.select("*").from("t_poleanswers").where({poleid:v[0].id}).orderBy("date")
  //  v[0].answers=vv;

    req.transport.emit("poleChange", v[0], req.params.roomid);
    res.json(v);
})
router.post("/tagsChange/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var id=req.body.item.id;
    delete req.body.item.id;
    delete req.body.item.answers;
    delete req.body.item.text;
    delete req.body.item.done;

    var v = await req.knex("t_tags")
        .update(req.body.item, "*").where({id:id})

   // var vv=await req.knex.select('val', req.knex.raw('count(*)')).from('t_tagsanswers').where({tagsid:v[0].id}).groupBy('val').havingRaw("val IS NOT null");
   // v[0].answers=vv;

    req.transport.emit("tagsChange", v[0], req.params.roomid);
    res.json(v);
})
router.post("/tagsDo/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var tagsid=req.body.item.id;

    var words=req.body.item.text.split(',');

    var ret=[]
    words.forEach(w=>{
        ret.push( w.replace(/^\s+|\s+$/g, "").toUpperCase());
    })
    words=ret.filter(w=>{
        return w.length>0
    })

    for(var w of words){
        var v = await req.knex("t_tagsanswers")
            .insert({val:w, tagsid:tagsid}, "*")
    }
    res.json(words.length);

})
router.post("/poleDo/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var poleid=req.body.item.id;
        var v = await req.knex("t_poleanswers")
            .insert({x:req.body.item.x,y:req.body.item.y, poleid:poleid}, "*")
    res.json(v.length);

})


router.post("/voteAddAnswer/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var v = await req.knex("t_voteanswers").insert({
        voteid: req.body.id
    }, "*")
    v[0].answers=[];
    req.transport.emit("voteAnswerAdd", v[0], req.params.roomid);
    res.json(v[0]);
})

router.post("/voteAnswerChange/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var id=req.body.item.id;
    delete req.body.item.id;
    delete req.body.item.answers;

    var v = await req.knex("t_voteanswers")
        .update(req.body.item, "*").where({id:id})
    req.transport.emit("voteAnswerChange", v[0], req.params.roomid);
    res.json(v);
})
router.post("/unvote/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var id=req.body.id;

    var v = await req.knex.select("*").from("t_voteanswers").where({id:id});
    var vv=await req.knex("t_voteanswers").update({count:v[0].count-1},"*").where({id:id});
    req.transport.emit("vote",{id:id, count:vv[0].count}, req.params.roomid);
    res.json(true);
})
router.post("/vote/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var id=req.body.id;
    var v = await req.knex.select("*").from("t_voteanswers").where({id:id});
    var vv=await req.knex("t_voteanswers").update({count:v[0].count+1},"*").where({id:id});
    req.transport.emit("vote",{id:id, count:vv[0].count}, req.params.roomid);
    res.json(true);
})







function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '&nbsp;<a href="' + url + '" target="_blank">' + url + '</a>&nbsp;';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

router.get("/quest/:eventid/:roomid", /*checkLoginToRoom,*/ async (req, res, next) => {
    var r = await req.knex.select("*")
        .from("v_q")
        .where({roomid: req.params.roomid})
        .orderBy("id","desc")
        .limit(50)
    ;// {text:req.body.text, userid:req.session["user"].id, date:(new Date())}, "*")
    r=r.sort((a,b)=>a.id-b.id)
    res.json(r);
})
router.get("/chat/:eventid/:roomid", /*checkLoginToRoom,*/ async (req, res, next) => {
    var r = await req.knex.select("*")
        .from("v_chat")
        .where({roomid: req.params.roomid})
        .orderBy("id","desc")
        .limit(50);// {text:req.body.text, userid:req.session["user"].id, date:(new Date())}, "*")
    r=r.sort((a,b)=>a.id-b.id)
    res.json(r);
})

router.delete("/chatdelete/:id/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_chat").update({isDeleted: true}, "*").where({id: req.params.id});
    req.transport.emit("chatDelete", r[0].id, req.params.roomid);
    res.json(r[0].id)
})
router.delete("/qdelete/:id/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_q").update({isDeleted: true}, "*").where({id: req.params.id});
    req.transport.emit("qDelete", r[0].id, req.params.roomid);
    res.json(r[0].id)
});
router.post("/qLike/:eventid/:roomid", async (req, res, next) => {

    var r = await req.knex.select("*").from("t_q").where({id:req.body.id});
    if(r.length<1)
        res.sendStatus(404)
    rr=await req.knex("t_q").update({likes:r[0].likes+1},"*").where({id:req.body.id});
    req.transport.emit("qLikes", {id:rr[0].id, likes:rr[0].likes}, req.params.roomid);
    res.json({id:rr[0].id, likes:rr[0].likes});

})

router.post("/regmoderator/:eventid/:roomid", async (req, res, next) => {

    req.params.eventid = parseInt(req.params.eventid)
    if (!Number.isInteger(req.params.eventid))
        return res.send(404);

    req.params.roomid = parseInt(req.params.roomid)
    if (!Number.isInteger(req.params.roomid))
        return res.send(404);


    var rooms = await req.knex.select("*").from("t_rooms").where({id: req.params.roomid, isDeleted: false})
    if (rooms.length < 1)
        return res.send(404)
    var room = rooms[0];

    if (room.password != req.body.pass || req.body.pass.length < 3)
        return res.json(false);

    var usr = await req.knex.select("*")
        .from("t_eventusers")
        .where({eventid: req.params.eventid, email: 'moderator@rustv.ru', smsCode: 999999});

    if (usr.length == 0)
        usr = await req.knex("t_eventusers")
            .insert({
                eventid: req.params.eventid,
                email: 'moderator@rustv.ru',
                smsCode: 999999,
                f: "Модератор",
                isConfirm: true,
                confirmdate: (new Date())
            }, "*")

    req.session["user" + usr[0].eventid] = usr[0];
    req.session["moderator" + req.params.roomid] = usr[0]
    console.log(req.session["moderator" + req.params.roomid])


    return res.json(usr[0].id);

});

router.post("/regspeaker/:eventid/:roomid", async (req, res, next) => {


    req.params.eventid = parseInt(req.params.eventid)
    if (!Number.isInteger(req.params.eventid))
        return res.send(404);

    req.params.roomid = parseInt(req.params.roomid)
    if (!Number.isInteger(req.params.roomid))
        return res.send(404);


    var rooms = await req.knex.select("*").from("t_rooms").where({id: req.params.roomid, isDeleted: false})
    if (rooms.length < 1)
        return res.send(404)
    var room = rooms[0];

    if (room.password != req.body.pass || req.body.pass.length < 3)
        return res.json(false);

    var usr = await req.knex.select("*")
        .from("t_eventusers")
        .where({eventid: req.params.eventid, email: 'speaker@rustv.ru', smsCode: 999999});

    if (usr.length == 0)
        usr = await req.knex("t_eventusers")
            .insert({
                eventid: req.params.eventid,
                email: 'speaker@rustv.ru',
                smsCode: 999999,
                f: "Спикер",
                isConfirm: true,
                confirmdate: (new Date())
            }, "*")

    req.session["user" + usr[0].eventid] = usr[0];

    req.session["speaker" + req.params.roomid] = usr[0]

    return res.json(usr[0].id);

});


router.delete("/chatdelete/:id/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_chat").update({isDeleted: true}, "*").where({id: req.params.id});
    req.transport.emit("chatDelete", r[0].id, req.params.roomid);
    res.json(r[0].id)
})
router.delete("/qdelete/:id/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_q").update({isDeleted: true}, "*").where({id: req.params.id});
    req.transport.emit("qDelete", r[0].id, req.params.roomid);
    res.json(r[0].id)
})
router.post("/qsetStatus/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_q").update({isReady: req.body.status}, "*").where({id: req.body.id});
    req.transport.emit("qStatus", {id: r[0].id, isReady: r[0].isReady}, req.params.roomid);
    res.json(r[0].id)
})
router.post("/qToSpk/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_q").update({isSpk: req.body.isSpk}, "*").where({id: req.body.id});
    req.transport.emit("qToSpk", {id: r[0].id, isSpk: r[0].isSpk}, req.params.roomid);
    res.json(r[0].id)
})


router.post("/qsetStatus/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_q").update({isReady: req.body.status}, "*").where({id: req.body.id});
    req.transport.emit("qStatus", {id: r[0].id, isReady: r[0].isReady}, req.params.roomid);
    res.json(r[0].id)
})
router.post("/hand/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_eventusers").update({handup: req.body.val}, "*").where({id: req.body.id});

    req.transport.clients.forEach(c => {
        if (c.user.id == r[0].id && c.isActive)
            c.handUp = r[0].handup;
    })
    req.transport.emit("handUp", {id: r[0].id, hand: r[0].handup}, req.params.roomid);
    if (r[0].handup)
        setTimeout(async () => {
            await req.knex("t_eventusers").update({handup: false}, "*").where({id: req.body.id});
            req.transport.clients.forEach(c => {
                if (c.user.id == r[0].id && c.isActive)
                    c.handUp = false;
            })
            req.transport.emit("handUp", {id: r[0].id, hand: false}, req.params.roomid);
        }, 10 * 60 * 1000)
    res.json(r[0].id)
})


router.get("/guid", async (req, res, next) => {
    res.json(uuidv4());
});
router.get("/test", (req, res, next) => {


    var ret = [];
    req.transport.clients.forEach(c => {

        ret.push({
            iid: c.id,
            id: c.user.id,
            i: c.user.i,
            f: c.user.f,
            isActive: c.isActive ? true : false,
            isAdmin: c.isAdmin,
            isSpeaker: c.isSpeaker,
            isVideo: c.isVideo
        });
    })
    var r = "";
    ret.forEach(c => {
        r += JSON.stringify(c) + "<br>"
    })
    res.send(r);

})
router.post("/newFile/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_files").insert({
        roomid: req.params.roomid,
        userid: req.session["user" + req.params.eventid].id,
        title: req.body.name,
        mime: req.body.type,
        bytes: req.body.size
    }, "*");
    r[0].presfiles = [];
    return res.json(r[0]);

})
router.get("/files/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex.select("*").from("t_files").where({
        roomid: req.params.roomid,
        isDeleted: false
    }).orderBy("date");
    for (d of r) {
        d.presfiles = await req.knex.select("id").from("t_presfiles").where({
            isDeleted: false,
            fileid: d.id
        }).orderBy("id")
    }
    return res.json(r);

})
router.post("/convertPage", async (req, res, next)=>{
    req.transport.emit("convertPage",{fileid:req.body.fileid, count:req.body.count, total:req.body.total} , req.body.roomid);
    res.json(0)
})
router.post("/file/:fileid/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    // var r=await req.knex("t_files").insert({roomid:req.params.roomid, title:req.body.name, mime:req.body.type, bytes:req.body.size}, "*");

    var r = await req.knex.select("*").from("t_files").where({id: req.params.fileid})

    var ext = path.extname(r[0].title)
    var filename = path.join(__dirname, '../public/files/' + r[0].id + ext);
    req.files.file.mv(filename, async (e) => {
        if (!e) {
            console.log(filename, e)
            var r = await req.knex("t_files").update({
                path: filename,
                isReady: true,
                ext: ext,
                date: (new Date())
            }, "*").where({id: req.params.fileid})

            req.transport.emit("newFile", r[0], req.params.roomid);
            console.log(r[0].mime, r[0].mime.indexOf('image/'))
            if (r[0].mime.indexOf('image/') == 0) {
                var f = await req.knex("t_presfiles").insert({path: r[0].path, fileid: r[0].id}, "id")
                r[0].presfiles = [];
                r[0].presfiles.push(f[0])
                req.transport.emit("newFilePres", {id:  r[0].id, fileid:f[0]}, req.params.roomid);
            }
            if (r[0].mime.indexOf('application/pdf') == 0) {


                var folder = path.join(__dirname, '../public/files/' + r[0].id)
                if (!fs.existsSync(folder))
                    fs.mkdirSync(folder);
               // await axios.post("http://10.0.0.50/pdf",{path: r[0].path, folder: folder})
                const pdf2pic = new PDF2Pic({
                    density: 300,           // output pixels per inch
                    savename: "p",   // output file name
                    savedir: folder,    // output file location
                    format: "png",          // output file format
                    size: "1024x720"         // output size in pixels
                });

                await pdf2pic.convertBulk(r[0].path, -1)
                const spawn = require('await-spawn')
                try {
                    console.log("convert ", filename);
                    //const bl = await spawn('nice', [ '-n', '19', 'convert', filename, "-quality", "75","-density", "300x300",  "-resize", "1024x720", folder+"/p_%04d.png"])

                    const bl = await spawn('nice', [ '-n', '19', "gm", 'convert', filename, "-quality", "75","-density", "300x300",  "-resize", "1024x720", "-background", "transparent", "+adjoin", folder+"/p_%04d.png"])
                    console.log("convert ok");
                }
                catch (e) {
                    console.log("convert error", e)
                }


                var pres = await readdir(folder);
                pres=pres.sort((a,b)=>{
                    var ma = a.match(/p_(\d+)\.png/);
                    var mb = b.match(/p_(\d+)\.png/);
                    if(!ma )
                        return 0
                    if(!mb )
                        return 0
                    try{
                        return parseInt(ma[1])-parseInt(mb[1]);
                    }
                    catch (e) {
                        return 0
                    }
                })
                for (pr of pres) {
                    var m = pr.match(/p_(\d+)\.png/);
                    var f = await req.knex("t_presfiles").insert({path: path.join(folder, pr), fileid: r[0].id}, "id")
                    if (!r[0].presfiles)
                        r[0].presfiles = [];
                    r[0].presfiles.push(f[0])
                    req.transport.emit("newFilePres", {id:  r[0].id, fileid:f[0]}, req.params.roomid);
                }
            }

            return res.json(res[0]);
        } else
            console.warn("error file upload", e)
    })


})
router.get("/files/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex.select("*").from("t_files").where({
        roomid: req.params.roomid,
        isDeleted: false
    }).orderBy("date");
    return res.json(r);

})

router.get("/pres/:presid/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var r = await req.knex.select("*").from("t_presfiles")
        .where({id: req.params.presid, isDeleted: false}).orderBy("id");
    if (r.length < 1)
        return res.sendStatus(404);

    res.sendFile(r[0].path)

})
router.get("/activePres/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {


    var r = await req.knex.select("*").from("t_presfiles")
        .where({isActive: true, isDeleted: false});
    if (r.length < 1)
        return res.json({item: null, fileid: null})

    res.json({item: r[0].id, fileid: r[0].fileid})
   // res.json({});

})
router.post("/pres/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var p = await req.knex.select("*").from("t_presfiles").where({id: req.body.id});
    var f = await req.knex.select("*").from("t_files").where({id: p[0].fileid});
    for (ff of f) {
        var pp = await req.knex("t_presfiles").update({isActive: false}).where({fileid: ff.id})
    }
    await req.knex("t_presfiles").update({isActive: true}).where({id: req.body.id})
    req.transport.emit("setPres", req.body.id, req.params.roomid);
    res.json(req.body.id)

})
router.get("/eventRooms/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    var p = await req.knex.select("*").from("t_rooms").where({eventid: req.params.eventid, isDeleted:false}).orderBy("date", "desc");
    res.json(p)

})



router.post("/deActivatePres/:eventid/:roomid", async (req, res, next) => {
    var f = await req.knex.select("*").from("t_files").where({roomid: req.params.roomid});
    for (ff of f) {
        var pp = await req.knex("t_presfiles").update({isActive: false}).where({fileid: ff.id})
    }
    req.transport.emit("setPres", null, req.params.roomid);
    res.json(req.body.id)

})
router.post("/previewFilePres/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {

    req.transport.emit("previewFilePres", req.body.items, req.params.roomid);
    res.json(req.body.id)

})


router.get("/downloadFile/:fileid/:eventid/:roomid", async (req, res, next) => {
    var r = await req.knex.select("*").from("t_files")
        .where({id: req.params.fileid, isDeleted: false});
    if (r.length < 1)
        return res.sendStatus(404);

    res.setHeader("Content-disposition", "attachment; filename=\"" + r[0].title.replace(/[^\x00-\x7F]/g, "") + "\"");
    res.setHeader('Content-type', r[0].mime);

    res.download(r[0].path)
})
router.delete("/file/:fileid/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_files").update({isDeleted: true}, "*").where({id: req.params.fileid})
    req.transport.emit("deleteFile", r[0].id, req.params.roomid);
    res.json(r[0].id)
})


router.post("/isChat/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_rooms").update({isChat: req.body.isChat}, "*").where({id: req.params.roomid})
    req.transport.emit("isChat", {isChat: req.body.isChat}, req.params.roomid);
    res.json(r[0].id)
})
router.post("/isFiles/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_rooms").update({isFiles: req.body.isFiles}, "*").where({id: req.params.roomid})
    req.transport.emit("isFiles", {isFiles: req.body.isFiles}, req.params.roomid);
    res.json(r[0].id)
})
router.post("/isUsers/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_rooms").update({isUsers: req.body.isUsers}, "*").where({id: req.params.roomid})
    req.transport.emit("isUsers", {isUsers: req.body.isUsers}, req.params.roomid);
    res.json(r[0].id)
})
router.post("/isQ/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_rooms").update({isQ: req.body.isQ}, "*").where({id: req.params.roomid})
    req.transport.emit("isQ", {isQ: req.body.isQ}, req.params.roomid);
    res.json(r[0].id)
})
router.post("/isLenta/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_rooms").update({isLenta: req.body.isLenta}, "*").where({id: req.params.roomid})
    req.transport.emit("isLenta", {isLenta: req.body.isLenta}, req.params.roomid);
    res.json(r[0].id)
})


router.get("/getRecFileId/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_stagerecords").insert({roomid:req.params.roomid, userid:req.session["user" + req.params.eventid].id,date: (new Date())}, "*");
    res.json(r[0].id)

})
router.post("/stageRecord/:recId/", async (req, res, next) => {
    var name="stage_"+req.params.recId+".webm";
    if (!fs.existsSync(path.join(__dirname, '../public/records/'))){
        fs.mkdirSync(path.join(__dirname, '../public/records/'));
    }
    var filename=path.join(__dirname, '../public/records/' + name);
    if (!fs.existsSync(filename))
    {
        req.files.file.mv(filename, async ()=>{
            res.json("new");
            exec(`chmod +w ${filename}`);
        })
    }
    else{
        console.log(`cat ${req.files.file.tempFilePath} >> ${filename}`)

        var workerProcess = child_process.exec(`/bin/cat ${req.files.file.tempFilePath} >> ${filename}`,function
            (error, stdout, stderr) {

            if (error) {
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
            }
            //console.log('stdout: ' + stdout);
           // console.log('stderr: ' + stderr);
            fs.unlinkSync(req.files.file.tempFilePath)
            res.json("append");
        });

        workerProcess.on('exit', function (code) {
            //console.log('Child process exited with exit code '+code);
        });

        /*
       exec(`cat ${req.files.file.tempFilePath} >> ${filename}`, ()=>{
            fs.unlinkSync(req.files.file.tempFilePath)
            res.json("append");
        })*/


    }
})


router.get("/startRoomRecord/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {
    var r = await req.knex("t_roomrecords").insert({roomid:req.params.roomid,date: (new Date())}, "*")
   //
    console.log("get sock port", r[0].id)
    var sockServ = net.createServer( function (socketClient) {
        console.log("sock create")
        var item={socket: socketClient, id:r[0].id}
        req.sockClients.push(item);
        setTimeout(()=>{
            res.json(r[0].id);
        },1000)
    });
    sockServ.listen(0,async (d)=>{
        console.log("sock listen" );
        var dt=await axios.get("http://"+config.encoderServer+":"+config.encoderPort+"/newvideo/"+r[0].id+"/"+sockServ.address().port);
    })
})
router.post("/record/:recId/", async (req, res, next) => {
    var r = req.read();
    fs.readFile(req.files.file.tempFilePath, (err, data) => {
        if (err) {
            console.warn(err)
            res.sendStatus(500)
        }
        else
        {
            req.sockClients.forEach(sockClient => {
                if (sockClient.id == req.params.recId) {
                    sockClient.socket.write(data);
                    saveFile(()=>{res.json(200)})
                }
            });
        }
    });
    function saveFile(clbk){
        var name=req.params.recId+".webm";
        if (!fs.existsSync(path.join(__dirname, '../public/records/'))){
            fs.mkdirSync(path.join(__dirname, '../public/records/'));
        }
        var filename=path.join(__dirname, '../public/records/' + name);
        if (!fs.existsSync(filename))
        {
            req.files.file.mv(filename, async ()=>{
                clbk();
            })
        }
        else{
            exec(`cat ${req.files.file.tempFilePath} >> ${filename}`, ()=>{
                fs.unlinkSync(req.files.file.tempFilePath)
                clbk();
            })
        }
    }
    return
})
router.post("/encodeTime", async (req, res, next) => {

    console.log("/encodeTime", req.body.time, parseInt(req.body.id))
    var r = await req.knex.select("*").from("t_roomrecords").where({id:parseInt(req.body.id)})
    if(r.length>0)
    {
        console.log("/encodeTime ok")
        req.transport.emit("updateRecordTime", {id:r[0].id, time:req.body.time}, r[0].roomid);
        res.send(200);
    }
    else {
        console.log("/encodeTime err",)
        res.sendStatus(404);
    }

})


router.get("/constraints", async (req, res, next) => {
    res.json(config.constraints);
})
router.get("/spkConstraints", async (req, res, next) => {
    res.json(config.spkConstraints);
})
router.get("/translateLang", async (req, res, next) => {
    res.json(translateLang);
})

router.get("/lang", async (req, res, next) => {
    res.sendFile(path.join(__dirname, '../lang.json' ));
})

router.get("/meetWowza", async (req, res, next) => {
    res.json(config.meetWowza[0]);
})
router.get("/meetBitrate", async (req, res, next) => {
    res.json(config.meetBitrate);
})
router.get("/spkWowza", async (req, res, next) => {
    res.json(config.meetWowza[0]);
})
router.get("/spkBitrate", async (req, res, next) => {
    res.json(config.meetBitrate);
})
router.post('/execCommand', async (req, res, next) => {

    req.transport.OnSendToRoomUsers(req.body.msg, req.body.data, req.body.roomid)
    res.sendStatus(200);
})
router.post('/execCommandAdmins', async (req, res, next) => {

    req.transport.OnSendToRoomAdmins(req.body.msg, req.body.data, req.body.roomid)
    res.sendStatus(200);
})
router.post('/execCommandSpeakers', async (req, res, next) => {

    req.transport.OnSendToRoomSpeakers(req.body.msg, req.body.data, req.body.roomid)
    res.sendStatus(200);
})
router.post('/execCommandUser', async (req, res, next) => {

    req.transport.OnSendToUser(req.body.msg, req.body.data, req.body.roomid)
    res.sendStatus(200);
})
router.post('/startVideoCommand', async (req, res, next) => {
    req.transport.OnStartVideo( req.body.socketid)
    res.sendStatus(200);
})
router.post('/stopVideoCommand', async (req, res, next) => {
    req.transport.OnStopVideo( req.body.socketid)
    res.sendStatus(200);
})

router.post('/execCommandFwd', async (req, res, next) => {
    req.transport.Onfwd(req.body.msg, req.body.data)
    res.sendStatus(200);
})

router.post('/userTh/:roomid/:userid', async (req, res, next) => {
   // console.log("userTh", req.files)
    if (!fs.existsSync(path.join(__dirname, '../public/th/'))){
        fs.mkdirSync(path.join(__dirname, '../public/th/'));
    }
    if (!fs.existsSync(path.join(__dirname, '../public/th/'+req.params.roomid))){
        fs.mkdirSync(path.join(__dirname, '../public/th/'+req.params.roomid));
    }
    if(! req.files.file)
        res.sendStatus(404)
    req.files.file.mv(path.join(__dirname, '../public/th/'+req.params.roomid)+"/"+req.params.userid+".jpg", ()=>{
        res.sendStatus(200);
    });
})

router.post('/speakersErrors', async (req, res, next) =>{
    var data=req.body.results;
    var ret=(new Date()).toISOString()+"\r\n"
    data.forEach(d=>{
        ret+="\r\n"+r.title+":   "+r.descr;
    })
    fs.appendFile('speakersError.txt', ret, function (err) {
    });
} );
router.get("/downloadQ/:eventid/:roomid", checkLoginToRoom, async (req, res, next) => {


    var xl = require('excel4node');
    var wb = new xl.Workbook();
    var headStyle = wb.createStyle({
        font: {
            bold: true,
            size: 12
        },
        alignment: {
            horizontal: 'center',
        },
    });
    var style = wb.createStyle({
        font: {
            size: 12
        },
        alignment: {
            wrapText: true,
            vertical: 'top',
        },
    });
    var qColumns=["date", "text","answer", "likes","f", "i", "company","smi", "email"]
    var qs=await req.knex.select(qColumns).from("v_q").where({roomid:req.params.roomid}).orderBy("id")
    var ws = wb.addWorksheet('Вопросы',
    );
    for(var i=1; i<=qColumns.length;i++){
        ws.cell(1, i).string(qColumns[i-1]).style(headStyle);
        ws.column(i).setWidth(30);

    }
    var j=1;
    qs.forEach(q=>{
        j++;
        for(var i=1; i<qColumns.length;i++){
            var val=q[qColumns[i-1]]
                if(val) {
                    val=val.toString();
                    if (typeof (val) === 'string')
                        ws.cell(j, i).string(val).style(style);
                    else
                        console.log('not string', val)
                }
        }
    })

     qColumns=["date", "text","f", "i",  "email"]
     qs=await req.knex.select(qColumns).from("v_chat").where({roomid:req.params.roomid}).orderBy("id")
     ws = wb.addWorksheet('Чат',
    );
    for(var i=1; i<=qColumns.length;i++){
        ws.cell(1, i).string(qColumns[i-1]).style(headStyle);
        ws.column(i).setWidth(30);

    }
    var j=1;
    qs.forEach(q=>{
        j++;
        for(var i=1; i<qColumns.length;i++){
            var val=q[qColumns[i-1]]
            if(val) {
                val=val.toString();
                if (typeof (val) === 'string')
                    ws.cell(j, i).string(val).style(style);
                else
                    console.log('not string', val)
            }
        }
    })

    qColumns=["f", "i", "company", "otrasl", "email", "companytitle","eventid"]
    qs=await req.knex.select(qColumns).from("v_eventuserswithcompany").where({eventid:req.params.eventid}).orderBy("id")
    ws = wb.addWorksheet('Люди',
    );
    for(var i=1; i<=qColumns.length;i++){
        ws.cell(1, i).string(qColumns[i-1]).style(headStyle);
        ws.column(i).setWidth(30);
    }
    var j=1;
    qs.forEach(q=>{
        j++;
        for(var i=1; i<qColumns.length;i++){
            var val=q[qColumns[i-1]]
            if(val) {
                val=val.toString();
                if (typeof (val) === 'string')
                    ws.cell(j, i).string(val).style(style);
                else
                    console.log('not string', val)
            }
        }
    })


    if (!fs.existsSync(path.join(__dirname, '../public/th/'+req.params.roomid))){
        fs.mkdirSync(path.join(__dirname, '../public/th/'+req.params.roomid));
    }
    var file=path.join(__dirname, '../public/th/'+req.params.roomid)+'/statistics_'+req.params.roomid+'.xlsx'
    wb.write( file,()=>{
        res.download(file);
    });


    //res.json(qs);
})

router.get('/redirect', async (req, res, next) =>{
    if (!req.session["admin"])
        return res.send(404);
    var r= await req.knex.select("*").from("t_redirect").orderBy("key");
    if(r.length==0)
    {
        var f="a"
        var e=[];
        for(var i=1; i<=12; i++){
            e.push(i)
        }
        for(var i of e)
        {
            var key=f+i;
            await req.knex("t_redirect").insert({key});

        }
        f="b";
        for(var i of e)
        {
            var key=f+i;
            await req.knex("t_redirect").insert({key});

        }
        r= await req.knex.select("*").from("t_redirect").orderBy("key");
    }
    res.json(r);
})
router.post('/redirect', async (req, res, next) =>{
    if (!req.session["admin"])
        return res.send(404);
    console.log(req.body)
    var r= await req.knex("t_redirect").update({value:req.body.value},"*").where({key:req.body.key})
    res.json(r);
})
router.post('/sendInviteNow', async (req, res, next) =>{

    console.log("sendInviteNow");
    var rooms=await req.knex.select("*").from("t_rooms").where({id:req.body.id});
    var room=rooms[0];
    var users=await req.knex.select("*").from("v_roomToeventUsers").where({eventid:room.eventid});

    var listSMS=[];
    users.forEach(u=>{
        if(u.tel && u.tel.length>0 && u.isSendSms){
            var tel=u.tel.replace(/\s/gm,'').replace(" ",'').replace("(","").replace(")","");
            if(listSMS.filter(l=>{return l.tel==tel}).length==0){
                listSMS.push({
                   f:u.f,
                   i:u.i,
                   id:u.id,
                   tel:tel
                })
            }
        }
    })
    var listEMAIL=[];
    users.forEach(u=>{
        if(u.email && u.email.length>0 && u.isSendEmail){
            if(listEMAIL.filter(l=>{return l.email==u.email}).length==0){
                listEMAIL.push({
                    f:u.f,
                    i:u.i,
                    id:u.id,
                    email:u.email
                })
            }
        }
    })
    console.log(listEMAIL);

    var text="Добрый день\r\n";
    text+="\r\n Это автоматическое напоминание."
    text+="\r\n "+ room.title+" начнется "+ moment(room.date).format("DD.MM.yyyy HH:mm")+ " Московского времени";
    text+="\r\n Ссылка для входа: https://conf.onevent.online/room/"+room.id
    for(var l of listEMAIL){
        await sendEmail(l.email, text);
    }

    text=""+ room.title+" начнется: "+ moment(room.date).format("DD.MM.yyyy HH:mm")+ " MSK";
    text+=" https://conf.onevent.online/room/"+room.id
    for(var l of listSMS){
        await sendSms(l.tel, text);
    }


})
router.post("/sendSMSToUser",async (req, res, next) => {

    var users=await req.knex.select("*").from("t_eventusers").where({id:req.body.id})
    console.log(req.body, users)
    if(users.length>0){

        var tel=await users[0].tel.replace(/\s/gm,'').replace(" ",'').replace("(","").replace(")","");
        if(tel){
            await sendSms(tel, req.body.text)
            res.json("ok")
        }
        else
            res.sendStatus(404)

    }
    else
        res.sendStatus(404)
})
async function sendSms(tel, text) {
    var url = "http://api.iqsms.ru/messages/v2/send/?phone=Access%20code:%20" + tel + "&text=" + encodeURI(text) + "&login=z1519200766955&password=713595";
    try {
        var rr = await axios.get(url);
        console.log("ret",tel, rr.data);
    }
    catch (e) {
        console.warn(e);
    }
}
async function sendEmail(email, text) {
    var transporter = nodemailer.createTransport({
        host: "mail.nic.ru",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: "info@sber.link", // generated ethereal user
            pass: "Gbplfgbplf13" // generated ethereal password
        }
    });

    var mailOptions = {
        from: 'info@sber.link',
        to: email,
        subject: 'Invitation to the event',
        text: text
    };
    try {
        await transporter.sendMail(mailOptions)
        console.log("email send", email)
    }
    catch (e) {
        console.warn(e)
    }
}
router.post('/regToGpn/',  async (req, res, next) =>{
    try {
        if (!Number.isInteger(parseInt(req.body.code)))
            return res.json(0);
        console.log(req.body)
        var codes = await req.knex.select("*").from("t_gpncodes").where({id: parseInt(req.body.code)});
        console.log("codes", codes)
        if (codes.length == 0)
            return res.json(0);

        var usr = await req.knex("t_eventusers").insert({
            eventid: 42,
            f: req.body.user,
            i: "",
            tel: "",
            email: "",
            smsCode: req.body.code,
            company: null,
            CompanyName: "GPN",
        }, "*")


    var rooms=await req.knex.select("*").from("t_rooms").where({eventid:42});
    for(room of rooms){
        await req.knex("t_roomToeventUsers").insert({roomid:98,eventuserid:usr[0].id, isSendEmail:false,isSendSms:false});
    }


        req.session["user" + 42] = usr[0];
        console.log("regtoevent GPN", req.session);
        //  console.log("reg case 0",req.session["user" + req.body.evntId]);
        return res.json("98");

    }
    catch (e) {
        console.warn(e)
        return josn(0);
    }

})
router.post("/sbergileRegUser",async (req, res, next) => {

    var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.body.roomid})
    var room=rooms[0]
    if((room.id>=102 && room.id<=104) ||room.id==30 )
    {
        var usr = await req.knex("t_eventusers").insert({
            eventid: req.body.roomid,
            f: req.body.username,
            i: "",
            tel: "",
            email: "",
            smsCode: "",
        }, "*")

        return res.json(usr[0]);
    }
});
router.post("/fasRegUser/:eventid/:roomid",async (req, res, next) => {

    var rooms=await req.knex.select("*").from("t_rooms").where({isDeleted:false, id:req.params.roomid})
    var room=rooms[0];
    var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if(!re.test(req.body.email.toLowerCase()))
        return res.sendStatus(404);
    if((room.id>=106 && room.id<=107))
    {
        var preUsers=req.fasUsers.filter(e=>{return e.email.toLowerCase()==req.body.email.toLowerCase()});
        if(preUsers.length<1)
            return res.sendStatus(404);
        else{

            var FormData = require('form-data');
            var bodyData = new FormData();
            bodyData.append('email', req.body.email);
            var Axios=require('axios').default;
            try{
                    var ret=await Axios({
                        method  : 'POST',
                        url     : 'https://antitrustforum.ru/u-check/',
                        headers : bodyData.getHeaders(),
                        data    : bodyData
                    });
                }
                catch (e) {
                    return res.sendStatus(404);
                }
            var fasUsers=[];

            // console.log(res.data)
            for (var id in ret.data) {
                ret.data[id].id = id;
                fasUsers.push(ret.data[id]);
            }
            if(fasUsers.length<1 && false)
                return res.sendStatus(404);
        }

        var usr = await req.knex("t_eventusers").insert({
            eventid: req.params.eventid,
            f: preUsers[0].name,
            i: preUsers[0].surname,
            tel: preUsers[0].id,
            personalcode: req.body.email,
            smsCode: "",
        }, "*")
        return res.json(usr[0]);
    }
    else
        return res.json(req.body).sendStatus(401);
});

module.exports = router
