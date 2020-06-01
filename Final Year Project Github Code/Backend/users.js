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
    
    dbObject = client.db('blockchainpayment564');
    pdb = new ProvenDB(dbObject); // Mongo Database with helper functions.
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

  // Password Encryption
  passwordEncrypt: (password)=>
   {
    return bcrypt.hashSync(password,bcrypt.genSaltSync(10))
   }, 

   // Compare Encrypted Password (it returns true or false)
   compareEncryptPassword: (password,hash)=>
   {
    return bcrypt.compareSync(password,hash)
   }, 

  // User login
  findUser: (email) =>
  new Promise((resolve, reject) => {
    
    var useremail = email;
    console.log("userEmail: "+useremail);

    if (usersCollection) {

      usersCollection.find({useremail:useremail}).toArray((queryError, result) => {
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
    if (usersCollection) {
      // console.log("users"+users)
      usersCollection.find().toArray((queryError, result) => {
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


    // get all users based on name and email
    findAllUserBasedOnNameAndEmail: (userDataSearch) =>
    new Promise((resolve, reject) => {
      
      var fullname = userDataSearch;
      console.log("fullname: "+fullname);

      var useremail = userDataSearch;
      console.log("userEmail: "+useremail);
  
      if (usersCollection) {
        // find user based on name and email with regex
        usersCollection.find({ $or: [ {useremail: { $regex: useremail, $options:"i"}} , {fullname: { $regex: fullname, $options:"i"} } ] }).toArray((queryError, result) => {
          if (queryError) {
            reject(new Error('Error fetching users.'));
          } else {
            resolve(result);
          }
        });
      }
      else {
        reject(new Error('Could not acquire collection'));
      }
    }),
  
  
    // Adds a new user to the database AND submits a proof of it to the blockchain.
      addUser: (name,email,role,contact,password) =>
      new Promise((resolve, reject) => {

        var fullname = name;
        console.log("fullname: "+fullname);

        var useremail = email;
        console.log("useremail: "+useremail);

        var userrole = role;
        console.log("userrole: "+userrole);

        var usercontact = contact;
        console.log("userrole: "+usercontact);

        var userpassword = password;
        console.log("userpassword: "+userpassword);

        const userDocument = {
          fullname: fullname,
          useremail: useremail,
          userrole: userrole,
          usercontact: usercontact,
          userpassword: userpassword,
          amount:5000,
          uploadDate: Date.now()
        };
    
        if (usersCollection) {
          usersCollection.insertOne(userDocument, insertError => {
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
    
      getUserProof: useremail =>
    new Promise((resolve, reject) => {
     
      if (usersCollection) {
        /**
         * With the ProvenDB Driver.
         */
        pdb
          .getVersion()
          .then(result => {
            pdb
              .getDocumentProof('users', { useremail }, result.version)
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
    
    // Forget Password 
  updatePassword: (email, password) =>
  new Promise((resolve, reject) => {

    var useremail = email;
    console.log("useremail: " + useremail);

    var userpassword = password;
    console.log("userpassword: "+userpassword);


    if (usersCollection) {

      var result = usersCollection.updateOne({
        useremail: useremail
      }, {
        $set: {
          userpassword: userpassword
        }
      })
      console.log(result)
      if (result) {
        resolve(true);

      } else {
        console.log(reject(new Error('Error updating user password')));
      }

    }
  }),


   // Update User Profile by  Email
   updateUser: (userForm) =>
   new Promise((resolve, reject) => {

     if (usersCollection) {
 
       var result = usersCollection.updateOne({
         useremail: userForm.useremail
       }, {
         $set: userForm
         
       })
       console.log(result)
       if (result) {
         resolve(true);
 
       } else {
         console.log(reject(new Error('Error updating user password')));
       }
 
     }
   }),

  }