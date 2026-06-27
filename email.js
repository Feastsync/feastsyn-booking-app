
exports.emailTemplate = (firstName, otp) => {
return `

<!DOCTYPE html>

<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FeastSync Email Verification</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">

    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <tr>
        <td align="center" style="background-color:#6A0DAD;padding:30px;">
          <h1 style="margin:0;color:#ffffff;">
            FeastSync Event Booking
          </h1>
          <p style="margin-top:10px;color:#f3e8ff;">
            Secure Email Verification
          </p>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td style="padding:40px;">

          <h2 style="margin-top:0;color:#333333;">
            Hello ${firstName},
          </h2>

          <p style="font-size:16px;line-height:1.8;color:#555555;">
            Thank you for registering on FeastSync Event Booking.
            To complete your registration, please verify your email address using the One-Time Password (OTP) below.
          </p>

          <!-- OTP BOX -->
          <table align="center"
                 cellpadding="0"
                 cellspacing="0"
                 border="0"
                 width="320"
                 style="
                   margin:30px auto;
                   background-color:#F3E8FF;
                   border:3px solid #6A0DAD;
                   border-radius:12px;
                 ">

            <tr>
              <td align="center" style="padding:15px;">
                <p style="
                  margin:0;
                  font-size:14px;
                  font-weight:bold;
                  color:#6A0DAD;
                  letter-spacing:2px;
                ">
                  YOUR VERIFICATION CODE
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom:20px;">
                <span style="
                  display:inline-block;
                  font-size:48px;
                  font-weight:bold;
                  color:#6A0DAD;
                  letter-spacing:12px;
                ">
                  ${otp}
                </span>
              </td>
            </tr>

          </table>

          <p style="font-size:16px;line-height:1.8;color:#555555;">
            This code will expire in <strong>30 minutes</strong>.
            Please do not share this code with anyone for security reasons.
          </p>

          <p style="font-size:16px;line-height:1.8;color:#555555;">
            If you did not create a FeastSync account, please ignore this email.
          </p>

          <p style="margin-top:30px;color:#333333;">
            Regards,<br>
            <strong>FeastSync Team</strong>
          </p>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td align="center" style="background-color:#f8f8f8;padding:20px;">
          <p style="margin:0;color:#777777;font-size:14px;">
            FeastSync Event Booking Platform
          </p>
          <p style="margin-top:8px;color:#999999;font-size:12px;">
            Making Event Planning Easier & More Reliable.
          </p>
        </td>
      </tr>

    </table>

  </td>
</tr>

  </table>

</body>
</html>
  `;
};




exports.resetPasswordTemplate = (data) => {
return `

<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Reset Your FEASTSYNC Password</title>

<style>
    @media screen and (max-width: 600px) {

        .container {
            width: 100% !important;
            border-radius: 0px !important;
        }

        .content {
            padding: 30px 20px !important;
        }

        .otp-code {
            font-size: 32px !important;
            letter-spacing: 6px !important;
        }

    }
</style>

</head>

<body style="margin:0; padding:0; background-color:#f4f6f9; font-family: Helvetica, Arial, sans-serif;">

<center>

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f6f9;">

<tr>

<td align="center" style="padding:40px 15px;">

<table class="container"
       width="100%"
       border="0"
       cellspacing="0"
       cellpadding="0"
       style="
            max-width:550px;
            background-color:#ffffff;
            border-radius:18px;
            overflow:hidden;
            box-shadow:0 6px 18px rgba(0,0,0,0.08);
       ">

<!-- HEADER -->
<tr>
    <td align="center"
        style="
            background: linear-gradient(135deg, #0f172a, #1e293b);
            padding:35px 20px;
        ">

        <h1 style="
            margin:0;
            color:#ffffff;
            font-size:32px;
            font-weight:800;
            letter-spacing:1px;
        ">
            FEASTSYNC
        </h1>

        <p style="
            margin:10px 0 0;
            color:#cbd5e1;
            font-size:14px;
        ">
            Seamless Event Booking Experience
        </p>

    </td>
</tr>

<!-- CONTENT -->
<tr>

    <td class="content"
        style="
            padding:45px 40px;
            color:#1e293b;
            text-align:center;
        ">

        <h2 style="
            margin:0 0 15px;
            font-size:26px;
            font-weight:700;
            color:#0f172a;
        ">
            Reset Your Password
        </h2>

        <p style="
            margin:0 0 25px;
            font-size:16px;
            line-height:1.7;
            color:#64748b;
        ">
            Hi <strong>${data.name}</strong>,
            we received a request to reset your FEASTSYNC account password.
            Use the secure verification code below to continue.
        </p>

        <!-- OTP BOX -->
        <table
            width="100%"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="
                margin:30px 0;
                background-color:#eef2ff;
                border:3px solid #6366f1;
                border-radius:16px;
            "
        >
            <tr>
                <td
                    align="center"
                    style="
                        padding-top:20px;
                        padding-bottom:10px;
                    "
                >

                    <p style="
                        margin:0;
                        font-size:14px;
                        font-weight:700;
                        color:#6366f1;
                        letter-spacing:2px;
                        text-transform:uppercase;
                    ">
                        Verification Code
                    </p>

                </td>
            </tr>

            <tr>
                <td
                    align="center"
                    style="
                        padding-bottom:25px;
                    "
                >

                    <table
                        border="0"
                        cellspacing="0"
                        cellpadding="0"
                        style="
                            background:#ffffff;
                            border:2px solid #c7d2fe;
                            border-radius:12px;
                        "
                    >
                        <tr>
                            <td
                                align="center"
                                class="otp-code"
                                style="
                                    padding:20px 35px;
                                    font-size:52px;
                                    font-weight:900;
                                    color:#0f172a;
                                    letter-spacing:12px;
                                    font-family:Courier New, monospace;
                                "
                            >
                                ${data.otp}
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>

        <p style="
            margin-top:20px;
            font-size:14px;
            line-height:1.7;
            color:#94a3b8;
        ">
            This code will expire in
            <strong style="color:#0f172a;">
                15 minutes
            </strong>.
        </p>

        <p style="
            margin-top:10px;
            font-size:14px;
            line-height:1.7;
            color:#94a3b8;
        ">
            If you did not request a password reset,
            please ignore this email or contact our support team immediately.
        </p>

    </td>

</tr>

<!-- FOOTER -->
<tr>

    <td align="center"
        style="
            background-color:#f8fafc;
            padding:25px;
            border-top:1px solid #e2e8f0;
        ">

        <p style="
            margin:0;
            font-size:13px;
            color:#94a3b8;
        ">
            © 2026 FEASTSYNC. All rights reserved.
        </p>

        <p style="
            margin:10px 0 0;
            font-size:13px;
        ">
            <a href="#"
               style="
                    color:#6366f1;
                    text-decoration:none;
                    margin-right:10px;
               ">
                Help Center
            </a>

            |

            <a href="#"
               style="
                    color:#6366f1;
                    text-decoration:none;
                    margin-left:10px;
               ">
                Security Tips
            </a>
        </p>

    </td>

</tr>

</table>

</td>

</tr>

</table>

</center>

</body>
</html>
    `;
};


// email.js
exports.paymentReleasedTemplate = (name, amount) => `
<h2>Hello ${name},</h2>

<p>Great news!</p>

<p>Your payment of <strong>₦${amount.toLocaleString()}</strong> has been released to your FeastSync wallet.</p>

<p>You can log in to your dashboard to view your wallet balance or request a withdrawal.</p>

<p>Thank you for using FeastSync.</p>
`;