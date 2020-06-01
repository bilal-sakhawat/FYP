const { MongoClient } = require('mongodb');
const ProvenDB = require('@southbanksoftware/provendb-node-driver').Database;
 
const provenDB_URI = 'mongodb://BlockchainPayment76:Bilal.BlockChain564@blockchainpayment564.provendb.io/blockchainpayment564?ssl=true';
let dbObject;
let transCollection;
let usersCollection;
let pdb;

// First we establish a connection to ProvenDB.
MongoClient.connect(provenDB_URI, {
  useNewUrlParser: true,
  seUnifiedTopology: true
  // useUnifiedTopology: true 
})
  .then(client => {
    // Replace this with the database name from the ProvenDB UI.
    dbObject = client.db('blockchainpayment564');
    pdb = new ProvenDB(dbObject); // Mongo Database with helper functions.
    transCollection = pdb.collection('transactions'); // With ProvenDB Driver.
    usersCollection = pdb.collection('users'); // With ProvenDB Driver.
    // collection = dbObject.collection('provenIdeas'); // Without ProvenDB Driver.
    
  })
  .catch(err => {
    console.error('Error connecting to ProvenDB:');
    console.error(err);
    process.exit();
  });


const bcrypt = require('bcrypt-nodejs');

module.exports = {

  // Returns a list of all Transactions we have added to blockchain
  getAllTransactions: (users) =>
  new Promise((resolve, reject) => {
    if (transCollection) {
      // console.log("users"+users)
      transCollection.find().toArray((queryError, result) => {
        if (queryError) {
          reject(new Error('Error fetching transactions.'));
        } else {
          resolve(result);
        }
      });
    }
  }),


  // Find Send Transactions by Email
  findSendTransactionByEmail: (email) =>
  new Promise((resolve, reject) => {
    
    var useremail = email;
    console.log("userEmail: "+useremail);

    if (transCollection) {

      transCollection.find({senderemail:useremail}).toArray((queryError, result) => {
        if (queryError) {
          reject(new Error('Error fetching users.'));
        } else {
          resolve(result);
        }
      });
    }
  }),


    // Find Receive Transactions by Email
    findSendTransactionByEmail: (senderemail) =>
    new Promise((resolve, reject) => {
  
      var useremail = senderemail;
      console.log("userEmail: "+useremail);

      if (transCollection) {
  
        transCollection.find({senderemail:useremail}).toArray((queryError, result) => {
          if (queryError) {
            reject(new Error('Error fetching users.'));
          } else {
            resolve(result);
          }
        });
      }
    }),

        // Find Receive Transactions by Email
    findReceiveTransactionByEmail: (receiveremail) =>
    new Promise((resolve, reject) => {
      
      var useremail = receiveremail;
      console.log("userEmail: "+useremail);
  
      if (transCollection) {
  
        transCollection.find({receiveremail:useremail}).toArray((queryError, result) => {
          if (queryError) {
            reject(new Error('Error fetching users.'));
          } else {
            resolve(result);
          }
        });
      }
    }),

    // Adds a new transaction to the database AND submits a proof of it to the blockchain.
      addTransaction: (sendername,senderemail,receivername,receiveremail,amount,proofID) =>
      new Promise((resolve, reject) => {

        const transactionDocument = {
          sendername: sendername,
          senderemail: senderemail,
          receivername: receivername,
          receiveremail: receiveremail,
          amount: amount,
          uploadDate: Date.now(),
          proofID: proofID
        };
    
        if (transCollection) {
          transCollection.insertOne(transactionDocument, insertError => {
            if (insertError) {
              reject(new Error('Error inserting transaction Document'));
            } else {
              /**
               * With the ProvenDB Driver.
               */
              pdb
                .submitProof()
                .then(result => {
                  console.log(result);
                  resolve('New Proof Created for transaction Document');
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

        updateSenderWalletByEmail: (email,amount) =>
        new Promise((resolve, reject) => {
          
          var senderemail = email;
          console.log("senderuserEmail: "+senderemail);

          var deductamount = amount;
          console.log("newamount: "+deductamount);
      
          if (usersCollection) {
      
            var result=usersCollection.updateOne({useremail:senderemail},{$inc:{amount:-deductamount}})
            console.log(reject);  
            if (result) {
              
                resolve(result);
                
              } else {
                // resolve(result);
                console.log(reject(new Error('Error updating sender user amount.')));
              }
            
          }
        }),



                // Update Receiver Wallet By Email
                updateReceiverWalletByEmail: (email,amount) =>
                new Promise((resolve, reject) => {
                  
                  var receiveremail = email;
                  console.log("userEmail: "+receiveremail);
        
                  var newamount = amount;
                  console.log("newamount: "+newamount);
              
                  if (usersCollection) {
              
                   var result= usersCollection.updateOne({useremail:receiveremail},{$inc:{amount:+newamount}})
                   console.log(result)   
                   if (result) {
                          resolve(result);
                        
                      } else {
                        console.log(reject(new Error('Error updating receiver user amount.')));
                      }
                   
                  }
                }),

    getTransactionProof: proofID =>
    new Promise((resolve, reject) => {
     
      if (transCollection) {
        /**
         * With the ProvenDB Driver.
         */
        pdb
          .getVersion()
          .then(result => {
            pdb
              .getDocumentProof('transactions', { proofID }, result.version)
              .then(result => {
                resolve(result);
              })
              .catch(err => {
                console.error(err);
                reject(err);
              });
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });


      } else {
        reject();
      }
    }),

  }