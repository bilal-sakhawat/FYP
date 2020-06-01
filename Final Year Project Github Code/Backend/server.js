const ideas = require('./ideas.js');
const email = require('./email.js');
const users = require('./users.js');
const contacts = require('./contact.js');
const admins = require('./admins.js');
const faqs = require('./faqs.js');
const transactions = require('./transactions.js');
var express = require('express');
const path = require('path');
const app = express();
const sgMail = require('@sendgrid/mail')
const sgMailApiKey = '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'
sgMail.setApiKey(sgMailApiKey)

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));

const cors = require('cors');
app.use(cors())

app.use(express.static(path.join(__dirname, 'build')));

var logger = require('morgan');
app.use(logger('dev'));
app.use(express.json({
  limit: '10mb'
}));
app.use(express.urlencoded({
  extended: false
}));


// home path
app.get('/', function (req, res) {
  res.send({
    message: "Block Chain Payment Backend"
  });
});


// USERS


// add new data to users table
app.post('/addUser', function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const role = req.body.role;
  const contact = req.body.contact;
  const password = users.passwordEncrypt(req.body.password);

  users
    .findUser(email)
    .then(user => {
      // console.log(users.length)
      // res.status(200).send(users);
      if (user.length > 0) {
        res.status(200).send({
          status: false,
          message: "Email Already Exist"
        });
      } else {
        users
          .addUser(name, email, role, contact, password)
          .then(user => {
            res.status(200).send({
              status: true,
              message: "User Registered Successfully"
            });
          })
          .catch(err => {
            res.status(400).send('Failed to add new user.');
          });
      }

    })
    .catch(err => {
      res.status(400).send('Failed to add new user.');
    });


});



// login
app.post('/login', function (req, res) {

  const email = req.body.email;
  const password = req.body.password;

  users
    .findUser(email)
    .then(user => {
      // console.log(users.length)
      // res.status(200).send(users);
      if (user.length > 0) {
        var compare = users.compareEncryptPassword(password, user[0].userpassword);
        console.log(compare)
        if (compare) {
          var result1 = user[0];
          result1.status = true;
          res.status(200).send(result1);
        } else {
          res.status(200).send({
            status: false,
            message: "incorrect password"
          });
        }

      } else {
        res.status(200).send({
          status: false,
          message: "incorrect email"
        });
      }
    })
    .catch(err => {
      res.status(400).send('Failed to fetch users.');
    });
});


// get all users
app.get('/users', function (req, res) {
  users
    .getAllUser()
    .then(user => {
      res.status(200).send(user);
    })
    .catch(err => {
      console.log(err)
      res.status(400).send('Failed to fetch users.');
    });
});


// get users profile by email
app.get('/userprofile/:useremail', function (req, res) {
  const useremail = req.params.useremail;
  users
    .findUser(useremail)
    .then(user => {
      res.status(200).send(user);
    })
    .catch(err => {
      res.status(400).send('Failed to fetch users.');
    });
});


// search users by name or email
app.get('/userSearchByNameEmail/:userData', function (req, res) {
  const userDataSearch = req.params.userData;
  users
    .findAllUserBasedOnNameAndEmail(userDataSearch)
    .then(user => {
      res.status(200).send(user);
    })
    .catch(err => {
      res.status(400).send('Failed to fetch users.');
      console.log(err.message)
    });
});




// get proof of user block
app.get('/btcUser/:useremail', function (req, res) {
  const {
    useremail
  } = req.params;
  users
    .getUserProof(useremail)
    .then(proof => {
      res.status(200).send(proof);
    })
    .catch(err => {
      console.error(err);
      res.status(400).send('Failed to get proof for user,');
    });
});


// user reset password
app.post('/resetPassword', function (req, res) {
  var email = req.body.email;

  console.log(email)
  users
    .findUser(email)
    .then(user => {
      
      console.log(user.length)
      // res.status(200).send(users);
      if (user.length > 0) {

        // generating a new random password
        let password = Math.random() * (1000000 - 100000) + 100000;
        password = Math.ceil(password);
        console.log(password);

        const encryptPassword = users.passwordEncrypt(password);

        users
          .updatePassword(email,encryptPassword)
          .then(user => {

            console.log(user)
            // Sending new email to user
            sgMail.send({
              to: email,
              from: 'Blockchain.Payment.76@gmail.com',
              subject: 'Password Recovery - BlockChain Payments',
              text: `Hello. your new Password is: ${password} `
          })
            res.status(200).send({
              status: true,
              message: "Kindly Check Your Email For Updated Password"
            });
          })
          .catch(err => {
            console.log(err)
            res.status(400).send('Failed to update user password');
          });
      }

       else {
        res.status(200).send({
          status: false,
          message: "This Email Dose Not Exist"
        });
      }

    })
    .catch(err => {
      res.status(400).send({ status: false, message:'failed to fetch user'});
    });


});



// add new data to users table
app.post('/updateUser', function (req, res) {
        var userForm = req.body;

        if(userForm.userpassword){
          userForm.userpassword=users.passwordEncrypt(userForm.userpassword);
        }
        console.log(userForm)
        users
          .updateUser(userForm)
          .then(user => {

            console.log(user)

            res.status(200).send({
              status: true,
              message: "Profile Updated Successfully"
            });
          })
          .catch(err => {
            console.log(err)
            res.status(400).send('Failed to update Profile');
          });

});


// User Contacts 

// add new user contact
app.post('/addUserContact', function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const contactname = req.body.contactname;
  const contactemail = req.body.contactemail;

  contacts
    .findContact(email, contactemail)
    .then(contact => {
      // console.log(users.length)
      // res.status(200).send(users);
      if (contact.length > 0) {
        res.status(200).send({
          status: false,
          message: "Contact Already Exist"
        });
      } else {
        contacts
          .addUserContact(name, email, contactname, contactemail)
          .then(user => {
            res.status(200).send({
              status: true,
              message: "User contact Added Successfully"
            });
          })
          .catch(err => {
            res.status(400).send('Failed to add new contact.');
          });
      }

    })
    .catch(err => {
      res.status(400).send('Failed to add new contact.');
    });


});


// get user contacts by email
app.get('/userContacts/:email', function (req, res) {
  const useremail = req.params.email;
  contacts
    .findUserContact(useremail)
    .then(contact => {
      res.status(200).send(contact);
    })
    .catch(err => {
      res.status(400).send('Failed to fetch users.');
    });
});




// Transactions 

// add new transaction to users table

app.post('/addTransaction', function (req, res) {
  const sendername = req.body.sendername;
  const senderemail = req.body.senderemail;
  const receivername = req.body.receivername;
  const receiveremail = req.body.receiveremail;
  var amount = req.body.amount;
  var proofID = ((Math.floor(Math.random() * Math.floor(1000000000))) + Date.now()).toString(16);

  console.log(proofID);

  console.log("senderemail: " + senderemail)
  users
    .findUser(senderemail)
    .then(user => {
      // console.log(users.length)
      // res.status(200).send(users);
      var senderData = user;

      console.log(senderData[0].amount);

      if (senderData.length > 0) {

        if (senderData[0].amount > amount) {
          // add transaction in transactions collection
          transactions
            .addTransaction(sendername, senderemail, receivername, receiveremail, amount, proofID)
            .then(trans => {
              // update sender wallet

              transactions
                .updateSenderWalletByEmail(senderemail, amount)
                .then(senderwallet => {

                  // update receiver wallet
                  transactions
                    .updateReceiverWalletByEmail(receiveremail, amount)
                    .then(receiverwallet => {

                      res.status(200).send({
                        status: true,
                        message: "Transaction processed Successfully"
                      });

                    })
                    .catch(err => {
                      res.status(400).send('Failed to update receiver user wallet.');
                    });

                  // update receiver wallet End

                })
                .catch(err => {
                  res.status(400).send('Failed to update sender user wallet.');
                });
              // update sender wallet End

            })
            .catch(err => {
              res.status(400).send('Failed to add new Transaction.');
            });
        } else {
          res.status(200).send({
            status: false,
            message: "You have insufficient amount in your wallet"
          });
        }

      } else {
        res.status(200).send({
          status: false,
          message: "senderEmail invalid"
        });
      }

    })
    .catch(err => {
      res.status(400).send('Failed to get sender.');
    });
});



// get all Transactions
app.get('/transactions', function (req, res) {

  transactions
    .getAllTransactions()
    .then(transaction => {
      res.status(200).send(transaction);
    })
    .catch(err => {
      res.status(400).send('Failed to fetch users.');
    });
});


// get send Transactions by email
app.get('/sendtransactions/:senderemail', function (req, res) {
  const senderemail = req.params.senderemail;
  transactions
    .findSendTransactionByEmail(senderemail)
    .then(transaction => {
      res.status(200).send(transaction);
    })
    .catch(err => {
      res.status(400).send('Failed to fetch users.');
    });
});



// get receive Transactions by email
app.get('/receivetransactions/:receiveremail', function (req, res) {
  const receiveremail = req.params.receiveremail;
  transactions
    .findReceiveTransactionByEmail(receiveremail)
    .then(transaction => {
      res.status(200).send(transaction);
    })
    .catch(err => {
      res.status(400).send('Failed to fetch users.');
    });
});

// proof of transaction by _id
app.get('/btcTransaction/:proofID', function (req, res) {
  const {
    proofID
  } = req.params;
  transactions
    .getTransactionProof(proofID)
    .then(proof => {
      res.status(200).send(proof);
    })
    .catch(err => {
      console.error(err);
      res.status(400).send('Failed to get proof for transaction,');
    });
});



// get all Valid Proofs of Transaction 
app.get('/transactionsProof', function (req, res) {

  let amount;
  var btcTrans = [];
  var a = 0;
  var proofID

  transactions
    .getAllTransactions()
    .then(async transaction => { 
      for (let i = 0; i < transaction.length; i++) {


        if (transaction[i].proofID != undefined) {

          proofID = transaction[i].proofID;

          amount = transaction[i].amount;
          // console.log(transaction[i].amount)
          console.log(amount)
          // console.log(proofID)
          await transactions
            .getTransactionProof(proofID)
            .then(proof => {
              console.log(proof.proofs[0].status)
              if (proof.proofs[0].status == 'Valid') {
                console.log(amount)
                btcTrans[a] = {
                  id: a,
                  btc: proof.proofs[0].btcTransaction,
                  amount: amount

                }
                console.log(proof.proofs[0].btcTransaction)
                a++;
              }

            })
            .catch(err => {
              console.log(err.message);
              // res.status(400).send('Failed to fetch transaction proof.');
            });

        }



      }

      console.log(btcTrans)
      res.status(200).send(btcTrans);


    })
    .catch(err => {
      res.status(400).send('Failed to fetch transactions.');
    });
});







// sender wallet update
app.post('/updatewallet', function (req, res) {

  const senderemail = req.body.senderemail;
  var amount = req.body.amount;


  transactions
    .updateSenderWalletByEmail(senderemail, amount)
    .then(result => {
      res.status(200).send({
        status: true,
        message: "wallet updated"
      });
    })
    .catch(err => {
      res.send("error" + err.message);
    });


});



// Admin

// add new data to users table
app.post('/addAdmin', function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = users.passwordEncrypt(req.body.password);


  admins
    .addAdmin(name, email, password)
    .then(user => {
      res.status(200).send({
        status: true,
        message: "Admin Registered Successfully"
      });
    })
    .catch(err => {
      res.status(400).send('Failed to add admin.');
    });

});


// Admin login
app.post('/adminlogin', function (req, res) {

  const email = req.body.email;
  const password = req.body.password;

  admins
    .findAdmin(email)
    .then(admin => {
      if (admin.length > 0) {
        var compare = admins.compareEncryptPassword(password, admin[0].password);
        console.log(compare)
        if (compare) {
          var result1 = admin[0];
          result1.status = true;
          res.status(200).send(result1);
        } else {
          res.status(200).send({
            status: false,
            message: "incorrect password"
          });
        }

      } else {
        res.status(200).send({
          status: false,
          message: "incorrect email"
        });
      }
    })
    .catch(err => {
      res.status(400).send('Failed to fetch users.');
      console.log(err.message);
    });
});



// FAQ's

// add new data to faq collection
app.post('/addFaq', function (req, res) {
  const title = req.body.title;
  const description = req.body.description;
  var proofID = ((Math.floor(Math.random() * Math.floor(1000000000))) + Date.now()).toString(16);

  faqs
    .addFaq(title, description, proofID)
    .then(user => {
      res.status(200).send({
        status: true,
        message: "Faq Added Successfully"
      });
    })
    .catch(err => {
      res.status(400).send('Failed to add admin.');
    });

});


// get all faqs
app.get('/faqs', function (req, res) {
  faqs
    .getAllFaqs()
    .then(faq => {
      res.status(200).send(faq);
    })
    .catch(err => {
      console.log(err)
      res.status(400).send('Failed to fetch faqs.');
    });
});

// update FAQ
app.post('/updateFaq', function (req, res) {

  const _id = req.body.proofID;
  const faqDocument = req.body;

  faqs
    .updateFaqById(_id, faqDocument)
    .then(result => {
      res.status(200).send({
        status: true,
        message: "Faq updated"
      });
    })
    .catch(err => {
      console.log(err)
      res.send("error" + err.message);
    });


});


// IDEAS


// idea add
app.get('/proveIt/:idea', function (req, res) {
  const {
    idea
  } = req.params;
  ideas
    .proveNewIdea(idea)
    .then(idea => {
      res.status(200).send('New idea added.');
    })
    .catch(err => {
      res.status(400).send('Failed to add new idea.');
    });
});


// all ideas get
app.get('/ideas', function (req, res) {
  ideas
    .getAllIdeas()
    .then(ideas => {
      res.status(200).send(ideas);
    })
    .catch(err => {
      res.status(400).send('Failed to fetch ideas.');
    });
});


// proof of idea
app.get('/ideaProof/:idea', function (req, res) {
  const {
    idea
  } = req.params;
  ideas
    .getIdeaProof(idea)
    .then(proof => {
      res.status(200).send(proof);
    })
    .catch(err => {
      console.error(err);
      res.status(400).send('Failed to get proof for idea,');
    });
});

// node server port setup
app.listen(process.env.PORT || 3300, function (req, res) {
  console.log(`Server is listening on port ${process.env.PORT || 3300}...`);
});