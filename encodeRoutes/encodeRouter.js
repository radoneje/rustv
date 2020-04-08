var express = require('express');
var router = express.Router();
var net = require('net');
const {spawn} = require('child_process');
var config = require('../config')
var path = require('path')
var fs = require('fs')
var axios = require('axios')

/* GET home page. */
router.get('/newvideo/:id/:port', function(req, res, next) {

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
ip=ip.replace('::ffff:', '')
    console.log("ffmpeg ready", ip, req.params.ports)

    startEncoder(req.params.port, req.params.id, ip);
    res.json(true)


});
function startEncoder(port, id, ip){
  if (!fs.existsSync(path.join(__dirname, '../'+config.encodeFolder + "/" + id))){
    fs.mkdirSync(path.join(__dirname, '../'+config.encodeFolder + "/" + id));
  }

    var addr = `tcp://${config.encoderServer}:${port}`;
    console.log('ffmpeg get from  addr', addr);
  var encParams=
      [

        '-fflags', 'nobuffer+genpts',
        '-probesize', '5000000',//'32',
        //  '-re',
        '-i', addr,
          '-c:v','libx264',
          "-an",
        '-max_muxing_queue_size', '400',
        '-flags', 'low_delay+cgop',
        "-c:v", "libx264",
        "-b:v", "1200k",
        "-r", "30",
        "-x264-params", "keyint=30:scenecut=0",
        "-preset", "ultrafast",
        "-tune", "zerolatency",
        "-profile:v", "baseline",
        "-c:a", "aac",
        "-b:a", "96k",
        "-ac", "2",
        "-hls_time", "1",
        "-hls_list_size", "3",
        "-hls_delete_threshold", "4",
        "-hls_flags", "delete_segments",
        "-y",
         path.join(__dirname,  '../'+config.encodeFolder + "/" + id +"/" + "playlist.m3u8")
      ];
  var ffmpeg = spawn(config.ffmpegPath,encParams);
  var timer=setInterval(sendCallback,5000);
  var time="00:00:00";

  ffmpeg.stderr.on('data', error => {
      var txt=new String(error)
      var m=txt.match(/time=(\d+):(\d+):(\d+).(\d+)/)
      if(m) {
          time=`${m[1]}:${m[2]}:${m[3]}`;
          console.log(`ffmpeg stderr.error ${m[1]}:${m[2]}:${m[3]}`);
      }
    //console.log('ffmpeg stderr.error', new String(error));
  });

  ffmpeg.once('exit', (code, signal) => {
      clearInterval(timer)
    console.log('ffmpeg exit');
  });

  async function sendCallback() {
      console.log('http://'+ip+":"+config.port+"/rest/api/encodeTime")
     await axios.post('http://'+ip+":"+config.port+"/rest/api/encodeTime",{id, time})
  }
  return ffmpeg;
}

module.exports = router;
