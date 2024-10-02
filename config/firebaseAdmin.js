const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

const serviceAccount = require('./react-ecommerce-9451a-firebase-adminsdk-zi47j-e34624b9a8.json')

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'react-ecommerce-9451a.appspot.com'
});

const bucket = getStorage().bucket();

module.exports = bucket;