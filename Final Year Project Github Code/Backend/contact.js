const { MongoClient } = require('mongodb');
const ProvenDB = require('@southbanksoftware/provendb-node-driver').Database;


const provenDB_URI = 'mongodb://BlockchainPayment76:Bilal.BlockChain564@blockchainpayment564.provendb.io/blockchainpayment564?ssl=true';
let dbObject;
let collection;
let pdb;

// First we establish a connection to ProvenDB.
MongoClient.connect(provenDB_URI, {
  useNewUrlParser: true
  // useUnifiedTopology: true 
})
  .then(client => {
    // Replace this with the database name from the ProvenDB UI.
    dbObject = client.db('blockchainpayment564');
    pdb = new ProvenDB(dbObject); // Mongo Database with helper functions.
    userContactsCollection = pdb.collection('contacts'); // With ProvenDB Driver.
    // collection = dbObject.collection('provenIdeas'); // Without ProvenDB Driver.
    
  })
  .catch(err => {
    console.error('Error connecting to ProvenDB:');
    console.error(err);
    process.exit();
  });




module.exports = {


  // find contacts
  findContact: (email,contactemail) =>
  new Promise((resolve, reject) => {
    
    var useremail = email;
    console.log("Email: "+useremail);

    var cemail = contactemail;
    console.log("contactemail: "+cemail);

    if (userContactsCollection) {

      userContactsCollection.find({ $and: [{useremail:useremail} , {contactemail:cemail}]}).toArray((queryError, result) => {
        if (queryError) {
          reject(new Error('Error fetching users.'));
        } else {
          resolve(result);
        }
      });
    }
  }),


    // find user contacts
    findUserContact: (email) =>
    new Promise((resolve, reject) => {
      
      var useremail = email;
      console.log("Email: "+useremail);
  
  
      if (userContactsCollection) {
  
        userContactsCollection.find({useremail:useremail}).toArray((queryError, result) => {
          if (queryError) {
            reject(new Error('Error fetching users.'));
          } else {
            resolve(result);
          }
        });
      }
    }),





  // Returns a list of all users we've added to our database.
  getAllUser: (users) =>
  new Promise((resolve, reject) => {
    if (userContactsCollection) {
      // console.log("users"+users)
      userContactsCollection.find().toArray((queryError, result) => {
        console.log(result)
        if (queryError) {
          reject(new Error('Error fetching ideas.'));
        }
        else {
          resolve(result);
        }
      });
    }
  }),
  
  
    // Adds a new user to the database AND submits a proof of it to the blockchain.
      addUserContact: (name,email,cname,cemail) =>
      new Promise((resolve, reject) => {

        var username = name;
        console.log("username: "+username);

        var useremail = email;
        console.log("useremail: "+useremail);

        var contactname = cname;
        console.log("contactname: "+contactname);

        var contactemail = cemail;
        console.log("contactemail: "+contactemail);


        const userDocument = {
          username: username,
          useremail: useremail,
          contactname: contactname,
          contactemail: contactemail,
          uploadDate: Date.now()
        };
    
        if (userContactsCollection) {
          userContactsCollection.insertOne(userDocument, insertError => {
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