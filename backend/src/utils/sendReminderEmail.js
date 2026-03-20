const transporter = require("./email");

/* ======================================================
   SEND REMINDER EMAIL
====================================================== */

const sendReminderEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    throw new Error("Recipient email is missing");
  }

  try {
    await transporter.sendMail({
      from: `"Clinic Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,   // fallback for plain email clients
      html,   // styled version
    });

    console.log("📧 Email sent to:", to);

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error; // let worker handle status update
  }
};

module.exports = sendReminderEmail;