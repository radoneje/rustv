var express = require('express');
var router = express.Router();
var axios = require('axios')

router.post('/:method', async (req, res, next) => {

    console.log("phoder rest call", req.params.method)
    res.json(req.body);
})
router.get('/:method', async (req, res, next) => {

    res.json('ok');
});
module.exports = router;