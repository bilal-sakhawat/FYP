const {
  MongoClient
} = require('mongodb');
const ProvenDB = require('@southbanksoftware/provendb-node-driver').Database;

const provenDB_URI = 'mongodb://BlockchainPayment76:Bilal.BlockChain564@blockchainpayment564.provendb.io/blockchainpayment564?ssl=true';
let dbObject;
let collection;
let pdb;

// First we establish a connection to ProvenDB.
MongoClient.connect(provenDB_URI, {
    useNewUrlParser: true
  })
  .then(client => {
    dbObject = client.db('blockchainpayment564');
    pdb = new ProvenDB(dbObject); // Mongo Database with helper functions.
    adminsCollection = pdb.collection('admins'); // With ProvenDB Driver.
  })
  .catch(err => {
    console.error('Error connecting to ProvenDB:');
    console.error(err);
    process.exit();
  });


const bcrypt = require('bcrypt-nodejs');

module.exports = {

  // Password Encryption
  passwordEncrypt: (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
  },

  // Compare Encrypted Password (it returns true or false)
  compareEncryptPassword: (password, hash) => {
    return bcrypt.compareSync(password, hash)
  },

  // User login
  findAdmin: (email) =>
    new Promise((resolve, reject) => {

      var aemail = email;
      console.log("adminEmail: " + aemail);

      if (adminsCollection) {

        adminsCollection.find({
          email: aemail
        }).toArray((queryError, result) => {
          if (queryError) {
            reject(new Error('Error fetching users.'));
          } else {
            resolve(result);
          }
        });
      }
    }),


  // Adds a new user to the database AND submits a proof of it to the blockchain.
  addAdmin: (name, email, password) =>
    new Promise((resolve, reject) => {

      var aname = name;
      console.log("fullname: " + aname);

      var aemail = email;
      console.log("useremail: " + aemail);

      var apassword = password;
      console.log("userpassword: " + apassword);

      const userDocument = {
        name: aname,
        email: aemail,
        password: apassword,
        uploadDate: Date.now()
      };

      if (adminsCollection) {
        adminsCollection.insertOne(userDocument, insertError => {
          if (insertError) {
            reject(new Error('Error inserting document'));
          } else {
            /**
             * With the ProvenDB Driver.
             */
            pdb
              .submitProof()
              .then(result => {
                console.log(result);
                resolve('New Proof Created');
              })
              .catch(error => {
                console.error(error);
                reject(new Error('ERROR: Could not prove new version.'));
              });


          }
        });
      } else {
        reject(new Error('Could not acquire collection'));
      }
    }),


}