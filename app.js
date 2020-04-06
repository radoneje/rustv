var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var config = require('./config.json')
var session = require('express-session');
var  fileUpload=require('express-fileupload')

var indexRouter = require('./routes/indexRouter');
var apiRouter = require('./routes/apiRouter');
const socket=require("./handlers/socketHandler")

var knex = require('knex')({
  client: 'pg',
  version: '7.2',
  connection:config.pgConnection
});


var transport = []; // array of active clients

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/*var minify = require('express-minify');
var compression=require('compression')
app.use(compression());
app.use(minify({cache:__dirname + '/cache'}));*/

const pgSession = require('connect-pg-simple')(session);
const pgStoreConfig = {conObject: config.pgConnection}
app.use(session({
  secret: (config.sha256Secret),
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 days
  store:new pgSession(pgStoreConfig),
}));
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 },
  useTempFiles : true,
  tempFileDir : path.join(__dirname, 'public/files'),
  safeFileNames: true
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", (req,res, next)=>{req.knex=knex;next();});
app.use("/", (req,res, next)=>{req.transport=transport;next();});

app.use('/modules', express.static(__dirname + '/node_modules/'));

app.use('/', indexRouter);
app.use('/rest/api', apiRouter);

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
var sockServer= new socket(server, knex);
  transport=sockServer.clients;
}

module.exports = app;
