const service = require('./service');
var schedule = require('node-schedule');
const express =  require('express');
const app = express();
const bodyParser    = require('body-parser');
const PORT =  process.env.PORT || 3000;

app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
});

app.use(function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "https://synergy.vision");
     res.header("Access-Control-Allow-Methods", "POST, DELETE");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     next();
   });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/user', require('./routes/admin'));

schedule.scheduleJob("*/35 * * * *", function() {
     var today = new Date();
     var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
     console.log(time)
 });

// service.all().then(() =>{ 
//      console.log('All worked'); 
//      var today = new Date();
//      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
//      console.log(time);
// });
// var j = schedule.scheduleJob('0 12 * * *', function () {
//     service.all().then(() =>{ console.log('All worked'); 
//     var today = new Date();
//     var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
//     console.log(time);
// });
// }); 
// Se ejecuta todos los dias a las 12 AM



