const sgMail = require('@sendgrid/mail')

const sgMailApiKey = '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'

sgMail.setApiKey(sgMailApiKey) 
module.exports = {
    resetEmail: (email, password) => {
        sgMail.send({
            to: email,
            from: 'Blockchain.Payment.76@gmail.com',
            subject: 'Password Recovery BlockChain Payments',
            text: `Hello. your new Password is: ${password} `
        })
    }
}
