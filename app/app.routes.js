const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.render('home/index');
})

router.get('/about', function (req, res) {
    res.render('about/index');
})

router.get('/contact', function (req, res) {
    res.render('contact/index');
})

module.exports = router;