<!DOCTYPE html>
<html>
<head>
    <title>OTP Code</title>
</head>
<body>

<p>
Dear {{ $name }},
</p>

<p>
We are committed to ensuring the security of your account. To complete your login or transaction, please use the following One-Time Password (OTP):
</p>


<h4>
    <b>
        OTP: {{ $otp }}
    </b>
</h4>

<p>
    <small>
        <i>
* Please note that this OTP is valid for 5 minutes. Do not share this OTP with anyone, as it provides access to your account.
        </i>
    </small>
</p>

<br>

<div>
    <div>
        Best regards,
    </div>
    <div>
        <b>
            Team Carisma
        </b>
    </div>
</div>
</body>
</html>
