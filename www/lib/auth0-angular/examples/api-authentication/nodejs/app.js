var express   = require('express');
var app       = express();
var jwt       = require('express-jwt');

var SECRET    = 'A92LWsdBgH6legaUm8U3uyJ7n1bdEik7WvO8nQab9LlHTtnawpRx8d-HPqW0b2g-';
var AUDIENCE  = 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT';

var authenticate = jwt({
  secret: new Buffer(SECRET, 'base64'),
  audience: AUDIENCE
});

app.use(express.logger());

app.use('/', express.static(__dirname + '/../client/'));

app.use('/api', authenticate);

app.get('/api/protected', function (req, res) {
  res.send(200, 'This API Rocks! - Hi ' + req.user.name );
});

app.listen(3000);
console.log('listening on port http://localhost:3000');
