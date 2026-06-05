
exports.emailTemplate = (firstName, lastName, otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify Your Email</title>
<style>
    body {
        margin: 0;
        padding: 0;
        background-color: #f4f7fc;
        font-family: Arial, Helvetica, sans-serif;
    }

    .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .header {
        background: #6C63FF;
        color: #ffffff;
        text-align: center;
        padding: 30px 20px;
    }

    .header h1 {
        margin: 0;
        font-size: 28px;
    }

    .content {
        padding: 40px 30px;
        text-align: center;
        color: #333333;
    }

    .content h2 {
        margin-bottom: 15px;
    }

    .content p {
        line-height: 1.7;
        color: #666666;
    }

    .otp-box {
        margin: 30px auto;
        background: #f5f5ff;
        border: 2px dashed #6C63FF;
        border-radius: 10px;
        padding: 20px;
        width: fit-content;
    }

    .otp-code {
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 8px;
        color: #6C63FF;
    }

    .footer {
        background: #fafafa;
        padding: 25px;
        text-align: center;
        color: #999999;
        font-size: 13px;
    }

    @media screen and (max-width: 600px) {
        .container {
            width: 95%;
        }

        .content {
            padding: 30px 20px;
        }

        .otp-code {
            font-size: 28px;
            letter-spacing: 5px;
        }
    }
</style>
</head>
<body>

<div class="container">

    <div class="header">
        <h1>FeastSync</h1>
        <p>Event Booking App</p>
    </div>

    <div class="content">
        <h2>Email Verification</h2>

        <p>
            Hello ${firstName} ${lastName},
        </p>

        <p>
            Thank you for joining FeastSync. Use the verification code below
            to complete your account setup and start discovering talented
            entertainers for your events.
        </p>

        <div class="otp-box">
            <span class="otp-code">${otp}</span>
        </div>

        <p>
            This code will expire in <strong>30 minutes</strong>.
            Please do not share this code with anyone.
        </p>

        <p>
            With FeastSync, you can browse entertainers, compare profiles,
            and hire the perfect performer for your event with ease.
        </p>
    </div>

    <div class="footer">
        <p>
            If you did not create an account, you can safely ignore this email.
        </p>

        <p>
            © 2026 FeastSync Event Booking App. All rights reserved.
        </p>
    </div>

</div>

</body>
</html>
  `
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
                font-size: 30px !important;
                letter-spacing: 6px !important;
            }

            .button {
                width: 100% !important;
            }

        }

    </style>

</head>

<body style="margin:0; padding:0; background-color:#f4f6f9; font-family: Helvetica, Arial, sans-serif;">

<center>

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f6f9;">

<tr>

<td align="center" style="padding:40px 15px;">

<!-- MAIN CARD -->
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
                Hi <strong>${data.name}</strong>, we received a request to reset your FEASTSYNC account password.
                Use the secure verification code below to continue.
            </p>

            <!-- OTP BOX -->
            <div style="
                background-color:#f8fafc;
                border:2px dashed #6366f1;
                border-radius:14px;
                padding:30px 20px;
                margin:30px 0;
            ">

                <span class="otp-code"
                      style="
                        font-size:40px;
                        font-weight:bold;
                        letter-spacing:10px;
                        color:#0f172a;
                        font-family:'Courier New', monospace;
                        display:block;
                      ">

                    ${data.otp}

                </span>

            </div>

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
