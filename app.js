var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var config = require('./config.json')
var session = require('express-session');
var  fileUpload=require('express-fileupload')
const axios=require('axios')

var indexRouter = require('./routes/indexRouter');

var apiRouter = require('./routes/apiRouter');
var phonerhooksRouter=require('./routes/phonerhooksRouter')
const socket=require("./handlers/socketHandler")

async function sendInvite(knex){
  return;
  var rooms=await knex.select("*").from("t_rooms").where({isPrigl:true});
  var currTime=(new Date()).setSeconds(0,0);
  for(var room of rooms){
    if(room.dateprigl) {
      var date = room.dateprigl.setSeconds(0,0);
      if(date==currTime){
        console.log("send Invite to "+room.title)
        await axios.post("/rest/api/sendInviteNow", room);
      }
    }
  }

 // indexRouter.invites();
  setTimeout(async()=>{await sendInvite(knex)},60*1000);
}

var SPKstatus=[];
console.log(config.pgConnection)
var knex = require('knex')({
  client: 'pg',
  version: '7.2',
  connection:config.pgConnection,
  pool: { min: 0, max: 40 }
});

var sockClients=[];
var transport = []; // array of active clients

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
/*
var minify = require('express-minify');
var compression=require('compression')
app.use(compression());
app.use(minify({
  jsMatch: /javascripts/,
  cssMatch: /stylesheets/
}));*/

const pgSession = require('connect-pg-simple')(session);
const pgStoreConfig = {conObject: config.pgConnection}
app.use(session({
  secret: (config.sha256Secret),


  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 10 * 24 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  }, // 10 days
  store:new pgSession(pgStoreConfig),
}));
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 },
  useTempFiles : true,
  tempFileDir : path.join(__dirname, 'public/files'),
  safeFileNames: true
}));




//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


app.use("/", (req,res, next)=>{req.SPKstatus=SPKstatus;next();});
app.use("/", (req,res, next)=>{req.sockClients=sockClients;next();});
app.use("/", (req,res, next)=>{req.knex=knex;next();});
app.use("/", (req,res, next)=>{req.transport=transport;next();});
sendInvite(knex);
app.use('/modules', express.static(__dirname + '/node_modules/'));

app.use('/', indexRouter);
app.use('/rest/api', apiRouter);
app.use('/phonerhooks', phonerhooksRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.onListen=(server)=>{
var sockServer= new socket(server, knex, SPKstatus);
  transport=sockServer.clients;
}



module.exports = app;
