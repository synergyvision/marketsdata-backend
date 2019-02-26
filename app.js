const service = require('./service');
var schedule = require('node-schedule');

service.all().then(() =>{ console.log('All worked'); });

var j = schedule.scheduleJob('*/2 * * * *', function () {
    service.all().then(() =>{ console.log('All worked'); });
});

// var j = schedule.scheduleJob('00 00 12 * * 0-6', function () {
//     service.all().then(() =>{ console.log('All worked'); });
// }); Se ejecuta todos los dias a las 12 AM



