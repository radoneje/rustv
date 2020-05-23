var express = require('express');
var router = express.Router();
var axios = require('axios')

router.post('/:method', async (req, res, next) => {

    console.log("phoder rest call", req.params.method)
    switch (req.params.method) {
        case 'StreamStatusEvent':await OnStreamStatusEvent(req, res);
        default: res.json(req.body);
    }
})
router.get('/:method', async (req, res, next) => {

    res.json('ok');
});

async function OnStreamStatusEvent(req, res){
  //  console.log("phoder rest OnStreamStatusEvent", req.body)
    var socketid=req.body.name;
    var status=req.body.status=='PUBLISHING';
    if(status)
        req.transport.startVideo( socketid)
    else
        req.transport.stopVideo( socketid)

    console.log("phoder rest OnStreamStatusEvent", socketid, status);

   // res.json(req.body);


}
module.exports = router;