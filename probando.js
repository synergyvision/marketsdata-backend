const service = require('./service');
service.all().then(() =>{ 
    console.log('Probando servicio cada 10 minutos'); 
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    console.log(time);
});