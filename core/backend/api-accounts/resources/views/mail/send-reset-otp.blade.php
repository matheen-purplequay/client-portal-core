<html>
<head>
    <title>{{ $subject }}</title>
</head>
<body>
<p>
    Dear {{ $name }},
</p>
<p>
    We received a request to reset your password. Please use the following one-time password (OTP) to complete the password reset process.
</p>
<p>
    <samp>
        One-Time Password (OTP): {{ $data['otp']  }}
    </samp>
</p>
<p>
    <small>
        If you did not initiate this request, please disregard this email. Your account security is important to us.
        Thank you, 
    </small>
</p>

<p>
    <small>
        <i>
            This is an auto-generated email. Please do not reply back to this thread. <br>
            Team Carisma
        </i>
    </small>
</p>
</body>
</html>