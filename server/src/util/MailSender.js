import nodeMailer from 'nodemailer';

class MailSender {
  constructor() { }
  static async sendEmail(to, token, type, file) {

    let html;
    let subject;
    let details;

    if (type === 'ressetPass') {
      html = `<div style="direction: rtl"><a href="${process.env.CLIENT_HOST}/resset-password/${token}" class="btn btn-primary" >לחץ כאן לאיפוס סיסמה</a></div>`;
      subject = "קליקול ניהול משתמשים - איפוס סיסמה";
      details = {
        from: "support@clickcall.co.il",
        to: to,
        subject: subject,
        html: html,
      }
    } else if (type === 'backup_task' || type === 'backup_crm' || type === 'backup_data') {
      subject = "קליקול ניהול משתמשים -   " + type;
      details = {
        from: "support@clickcall.co.il",
        to: "yosi.b@clickcall.co.il",
        subject: subject,
        attachments: [
          {
            filename: type + ".zip",
            path: file,
          },
        ],
      }
    } else if (type === 'alertApiOverused') {
      subject = `פאנל ניהול משתמשים - אזהרת שימוש יתר API`;
      details = {
        from: "support@clickcall.co.il",
        to: "yosi.b@clickcall.co.il, asher@clickcall.co.il",
        subject: subject,
        html: `<div style="direction: rtl">
        <div><span>שם משתמש: </span><span>${token}</span></div>
        <div><span>דאטה משתמש: </span><span>${file}</span></div>
        <div><span>עבר את מגבלת השימוש בבקשות API</span></div>
        </div>`
      }
    }


    let transformMail = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: "support@clickcall.co.il",
        pass: process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 6000,
    });



    try {
      const result = await Promise.race([
        transformMail.sendMail(details),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Email sending timed out")), 6000)
        ),
      ]);
      return { emailSent: true };
    } catch (error) {
      console.log("Error sending email" + error);
      return { emailSent: false };
    }

  }
}

export default MailSender;

