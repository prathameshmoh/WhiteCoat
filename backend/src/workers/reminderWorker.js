const cron = require("node-cron");
const pool = require("../config/db");
const sendReminderEmail = require("../utils/sendReminderEmail");

/* ======================================================
   REMINDER WORKER (Runs Every Minute)
====================================================== */

cron.schedule("* * * * *", async () => {
  console.log("🔔 Checking pending reminders...");

  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        p.email,
        p.full_name AS patient_name,
        d.full_name AS doctor_name,
        a.appointment_date,
        a.appointment_time
      FROM reminders r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN doctors d ON r.doctor_id = d.doctor_id
      JOIN appointments a ON r.appointment_id = a.appointment_id
      WHERE r.status = 'pending'
      AND r.remind_at <= NOW()
    `);

    if (result.rows.length === 0) return;

    for (let reminder of result.rows) {
      console.log("📤 Processing reminder:", reminder.reminder_id);

      try {
        /* ================= EMAIL REMINDER ================= */
        if (reminder.channel === "email") {

          if (!reminder.email) {
            console.log(
              `⚠️ No email found for patient ${reminder.patient_id}`
            );

            await pool.query(
              `UPDATE reminders
               SET status = 'failed',
                   sent_at = NOW()
               WHERE reminder_id = $1`,
              [reminder.reminder_id]
            );

            continue;
          }

          const formattedDate = new Date(
            reminder.appointment_date
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          const formattedTime = reminder.appointment_time;

          await sendReminderEmail({
            to: reminder.email,
            subject: `Appointment Reminder – ${formattedDate} at ${formattedTime}`,
            text: `
Dear ${reminder.patient_name},

This is a friendly reminder of your upcoming appointment.

Doctor: Dr. ${reminder.doctor_name}
Date: ${formattedDate}
Time: ${formattedTime}

Please arrive 10 minutes early.

If you need to reschedule, kindly contact the clinic.

Thank you,
Clinic Management System
            `,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color:#2c3e50;">Appointment Reminder</h2>

                <p>Dear <strong>${reminder.patient_name}</strong>,</p>

                <p>This is a friendly reminder of your upcoming appointment.</p>

                <table style="margin-top:10px;">
                  <tr>
                    <td><strong>Doctor:</strong></td>
                    <td>Dr. ${reminder.doctor_name}</td>
                  </tr>
                  <tr>
                    <td><strong>Date:</strong></td>
                    <td>${formattedDate}</td>
                  </tr>
                  <tr>
                    <td><strong>Time:</strong></td>
                    <td>${formattedTime}</td>
                  </tr>
                </table>

                <p style="margin-top:15px;">
                  Please arrive 10 minutes early for a smooth check-in.
                </p>

                <p>
                  If you need to reschedule, please contact the clinic.
                </p>

                <hr style="margin-top:20px;" />

                <p style="font-size:12px; color:gray;">
                  This is an automated reminder from Clinic Management System.
                </p>
              </div>
            `,
          });
        }

        /* ================= IN-APP REMINDER ================= */
        if (reminder.channel === "in_app") {
          console.log("📱 In-app reminder triggered.");
        }

        /* ================= UPDATE STATUS ================= */
        await pool.query(
          `UPDATE reminders
           SET status = 'sent',
               sent_at = NOW()
           WHERE reminder_id = $1`,
          [reminder.reminder_id]
        );

        console.log("✅ Reminder processed:", reminder.reminder_id);

      } catch (sendError) {
        console.error("❌ Failed to send reminder:", sendError);

        await pool.query(
          `UPDATE reminders
           SET status = 'failed'
           WHERE reminder_id = $1`,
          [reminder.reminder_id]
        );
      }
    }

  } catch (error) {
    console.error("❌ Worker error:", error);
  }
});