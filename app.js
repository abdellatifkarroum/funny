var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require("mysql");
var fs = require("fs");
var pathPass = "pass.json";
var params = fs.readFileSync(pathPass,"utf8");
var dat = JSON.parse(params);
pool = mysql.createPool({
  multipleStatements: true,
  connectionLimit : 100,
  host : 'localhost',
  user : dat[0],
  password : dat[1],
  database : 'portfolio'
});
var routes = require('./routes/index');
var funnypictures = require('./routes/funnypictures');
var funnygifs = require('./routes/funnygifs');
var flashgames = require('./routes/flashgames');
var funnyjokes = require('./routes/funnyjokes');
var twig = require('twig');

var app = express();

/*pool.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});*/

app.set("twig options", {
    strict_variables: false,
    cache           : false
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/funnypictures', funnypictures);
app.use('/funnygifs', funnygifs);
app.use('/flashgames', flashgames);
app.use('/funnyjokes', funnyjokes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
