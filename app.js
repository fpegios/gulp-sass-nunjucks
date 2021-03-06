const express = require('express');
const http = require('http');
const nunjucks = require('nunjucks');
const app = express();
const server = http.createServer(app);
const path = require('path')
const routes = require('./app/app.routes.js')

app.set('view engine', 'html');

// Middleware to serve static assets
app.use('/dist', express.static(path.join(__dirname, '/dist')))
app.use('/app/assets', express.static(path.join(__dirname, '/app/assets')))

nunjucks.configure('app/components', {
    autoescape: true,
    express: app,
    noCache: true,
    watch: true
})

// Strip .html and .htm if provided
app.get(/\.html?$/i, function (req, res) {
    var path = req.path
    var parts = path.split('.')
    parts.pop()
    path = parts.join('.')
    res.redirect(path)
})

app.use('/', routes);

server.listen(process.env.PORT || 3000);