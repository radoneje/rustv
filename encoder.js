var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var config = require('./config.json')
const http = require('http');


var sockets=[];

var app = express();
// view engine setup


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/modules', express.static(__dirname + '/node_modules/'));
var encodeRouter = require('./encodeRoutes/encodeRouter');
app.use('/', (req, res, next)=>{req.sockets=sockets;next();});
app.use('/', encodeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

var server = http.createServer(app);
server.listen(config.encoderPort, ()=>{
  console.log("encoder server listen on "+ config.encoderPort)
})
