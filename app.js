
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes');

var app = module.exports = express.createServer();

var redis = require('redis').createClient();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res) {
    res.render('showUA', {
        ua: req.headers['user-agent'],
        title: 'UA'
    });
});

app.get('/save', function(req, res) {
    //1. generate the unique id
    var uuid = require('uuid-pure');
    var newId = uuid.newId();

    //2. save the current UA as value, with the key of `id`
    redis.set(newId, req.headers['user-agent']);

    //3. redirect to the `id` based URL and show the current id
    res.redirect('/ua/' + newId);
});

app.get('/ua/:id', function(req, res) {
    redis.get(req.params.id, function(err, reply) {
        res.render('compareUA', {
            oldUa: reply,
            ua: req.headers['user-agent'],
            title: "UA"
        });
    });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
