var admin = require('firebase-admin');

var serviceAccount = require('C:\\Users\\Manuel Espinoza\\Desktop\\marketsdata-vision-firebase-adminsdk-gk1mg-d51de792a1.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://marketsdata.firebaseio.com'
  });

  var db = admin.firestore();
  
  module.exports = {
        getConfig: () => {
            return db;
        }
  }

