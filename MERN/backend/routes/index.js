var express = require('express');
var router = express.Router();
var request = require('request');

var key = 'removed';


/* GET home page. */
router.get('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  var url = "https://api.openweathermap.org/data/2.5/weather?appid="+ key +"72208111c0f93a90b5d79e167ab2bd01""&q="+req.query.search;
request(url, function(error,response,body){
  if (error) {
    console.log('There was an Error')      
  } else {
    var data = JSON.parse(body);
    var weather = (data.weather[0].main);
    var temp = (Math.trunc(data.main.temp * 1.8 - 459.67));
    res.send({weather,temp});
    
  }
})
});




module.exports = router;