const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
admin.initializeApp();

// OAuth2 setup for Gmail API
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  "YOUR_CLIENT_ID",
  "YOUR_CLIENT_SECRET",
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: "YOUR_REFRESH_TOKEN",
});

const accessToken = oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "YOUR_EMAIL@gmail.com",
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    refreshToken: "YOUR_REFRESH_TOKEN",
    accessToken,
  },
});

// Function to send email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "YOUR_EMAIL@gmail.com",
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to}`);
};

// Trigger email on audit acceptance
exports.sendAcceptanceEmail = functions.firestore
  .document("audits/{auditId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    // Check if the audit was just accepted
    if (!previousValue.isAccepted && newValue.isAccepted) {
      const email = newValue.userEmail; // User's email
      const date = newValue.date; // Audit date
      await sendEmail(
        email,
        "Audit Accepted",
        `You have accepted the audit scheduled for ${date}.`
      );
      console.log(`Acceptance email sent to ${email}`);
    }
  });

// Schedule recurring emails
exports.sendRecurringEmails = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const today = new Date().toISOString().split("T")[0];
    const auditsSnapshot = await admin.firestore().collection("audits").get();

    auditsSnapshot.forEach(async (doc) => {
      const data = doc.data();

      // Check if audit is accepted and the date is in the future
      if (data.isAccepted && new Date(data.date) > new Date(today)) {
        const email = data.userEmail;
        const daysLeft = Math.ceil(
          (new Date(data.date) - new Date(today)) / (1000 * 60 * 60 * 24)
        );
        await sendEmail(
          email,
          "Reminder: Upcoming Audit",
          `Your audit is scheduled for ${data.date}. ${daysLeft} days left.`
        );
        console.log(`Reminder email sent to ${email}`);
      }
    });
  });
