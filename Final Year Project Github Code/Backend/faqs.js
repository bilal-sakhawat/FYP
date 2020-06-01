const {
  MongoClient
} = require('mongodb');
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
    faqCollection = pdb.collection('faqs'); // With ProvenDB Driver.
    // collection = dbObject.collection('provenIdeas'); // Without ProvenDB Driver.

  })
  .catch(err => {
    console.error('Error connecting to ProvenDB:');
    console.error(err);
    process.exit();
  });


module.exports = {

  // Returns a list of all faqs we have added to blockchain
  getAllFaqs: (users) =>
    new Promise((resolve, reject) => {
      if (faqCollection) {
        // console.log("users"+users)
        faqCollection.find().toArray((queryError, result) => {
          if (queryError) {
            reject(new Error('Error fetching faqs.'));
          } else {
            resolve(result);
          }
        });
      }
    }),



  // Adds a new faq to the database AND submits a proof of it to the blockchain.
  addFaq: (faqTitle, faqDescription, faqProofID) =>
    new Promise((resolve, reject) => {


      const faqDocument = {
        title: faqTitle,
        description: faqDescription,
        uploadDate: Date.now(),
        proofID: faqProofID
      };

      if (faqCollection) {
        faqCollection.insertOne(faqDocument, insertError => {
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
                resolve('New Proof Created for faq Document');
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



  // Update Receiver Wallet By Email
  updateFaqById: (proofId, faqDocument) =>
    new Promise((resolve, reject) => {

      var id = proofId;
      console.log("id: " + id);

      var Doc = faqDocument;
      console.log(Doc);


      if (faqCollection) {

        var result = faqCollection.updateOne({
          proofID: id
        }, {
          $set: {
            title: Doc.title,
            description: Doc.description
          }
        })
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
              .getDocumentProof('transactions', {
                proofID
              }, result.version)
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