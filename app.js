const service = require('./service');
var schedule = require('node-schedule');
const express =  require('express');
const app = express();
const bodyParser    = require('body-parser');
const PORT =  3000;

app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
});

app.use(function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Methods", "POST, DELETE");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     next();
   });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/user', require('./routes/admin'));

//app.use('/add-user', require('./routes/admin'));
// service.cities();
//service.all().then(() =>{ console.log('All worked'); });

var j = schedule.scheduleJob('*/2 * * * *', function () {
     //service.all().then(() =>{ console.log('All worked'); });
     console.log('Funcionando cada dos minutos');
     
});

// var j = schedule.scheduleJob('*/2 * * * *', function () {
//     service.all().then(() =>{ console.log('All worked'); });
// });

// var j = schedule.scheduleJob('00 00 12 * * 0-6', function () {
//     service.all().then(() =>{ console.log('All worked'); });
// }); Se ejecuta todos los dias a las 12 AM



