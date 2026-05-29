exports.emailTemplate = (firstName, lastName, otp) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FeastSync OTP Verification</title>

    <style>

        *{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        body{
            width: 100%;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .main-section{
            width: 50%;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
        }

        .header{
            width: 100%;
            background-color: #0f172a;
            color: white;
            padding: 30px;
            text-align: center;
        }

        .content{
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .content h2{
            color: #111827;
        }

        .content p{
            color: #4b5563;
            line-height: 1.7;
        }

        .otp-box{
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .otp{
            background-color: #e2e8f0;
            padding: 15px 40px;
            border-radius: 8px;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #0f172a;
        }

        .footer{
            width: 100%;
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
        }

        .footer p{
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
        }

        @media screen and (max-width: 768px){

            .main-section{
                width: 100%;
            }

        }

    </style>

</head>

<body>

    <div class="main-section">

        <div class="header">
            <h1>FeastSync Booking App</h1>
        </div>

        <div class="content">

            <h2>Email OTP Verification</h2>

            <p>
                Hello, ${firstName} ${lastName}
            </p>

            <p>
                Below is your one-time passcode required to complete your authentication process.
                This verification code will remain valid for 30 minutes.
                Please do not share this code with anyone for security reasons.
            </p>

            <div class="otp-box">
                <div class="otp">${otp}</div>
            </div>

            <p>
                If you did not request this verification, please ignore this email or contact our support team immediately.
            </p>

            <p>
                FeastSync helps users seamlessly connect and book entertainers for events with ease, speed, and trust.
            </p>

        </div>

        <div class="footer">

            <p>
                Need help? Contact our support team or visit our Help Center for assistance.
            </p>

            <p>
                © 2026 FeastSync Team. All rights reserved.
            </p>

        </div>

    </div>

</body>
</html>
    `
}


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
