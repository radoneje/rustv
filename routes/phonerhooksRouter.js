var express = require('express');
var router = express.Router();
var axios = require('axios')

router.post('/:method', async (req, res, next) => {

    res.json(req.body);
})
router.get('/:method', async (req, res, next) => {

    res.json('ok');
});
module.exports = router;