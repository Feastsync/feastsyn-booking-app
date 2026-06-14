// const BrevoClient = require("@getbrevo/brevo");

// const brevoClient = new BrevoClient.TransactionalEmailsApi()
// brevoClient.setApiKey(BrevoClient.TransactionalEmailsApiApiKeys.apiKey, process.env.brevoApiKey);

// const brevo = async (userEmail, userName, html) => {
//     const sendSmtpEmail = new BrevoClient.SendSmtpEmail()
//     const data = {
//         htmlContent: `<html><head></head><body><p>Hello ${userName} ,</p>Welcome to Feastsync!.</p></body></html>`,
//         sender: {
//             email: process.env.USER_EMAIL,
//             name: "Our team from FEASTSYNC",
//         },
//         subject: "Feastsync",
//     };
//     sendSmtpEmail.to = [{
//         email: userEmail
//     }] 
//     sendSmtpEmail.subject = data.subject
//     sendSmtpEmail.htmlContent = html
//     sendSmtpEmail.sender = data.sender
   
//     const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
// console.log("BREVO RESPONSE:", response);
// //     const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
// // console.log(response);
// // console.log("Sending to:", user.email);
// }

// module.exports = {brevo}

const BrevoClient = require("@getbrevo/brevo");

const brevoClient = new BrevoClient.TransactionalEmailsApi();

brevoClient.setApiKey(
  BrevoClient.TransactionalEmailsApiApiKeys.apiKey,
  process.env.brevoApiKey
);

const brevo = async (userEmail, userName, html) => {
  const sendSmtpEmail = new BrevoClient.SendSmtpEmail();

  sendSmtpEmail.to = [
    {
      email: userEmail,
    },
  ];

  sendSmtpEmail.sender = {
    email: process.env.USER_EMAIL,
    name: "FeastSync Team",
  };

  sendSmtpEmail.subject = "FeastSync Verification";

  sendSmtpEmail.htmlContent = html;

  const response = await brevoClient.sendTransacEmail(sendSmtpEmail);

  console.log("BREVO RESPONSE:", response);
  console.log("EMAIL BEING SENT TO:", userEmail);
};

module.exports = { brevo };