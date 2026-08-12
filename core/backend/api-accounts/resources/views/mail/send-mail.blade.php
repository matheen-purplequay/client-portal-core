<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

<div>Dear Client Executives,</div>
<p>
    You have received a new inquiry through the website contact form. Here are the details:
</p>
<p>
    Name: {{ $name }}
</p>
<p>
    Email: {{ $email }}
</p>
<p>
    Message: {{ $query }}
</p>
<p>
    Please review this inquiry and respond to the sender at your earliest convenience. 
</p>


<div>
    Thank you.
</div>
<div>
    Best regards,
</div>
<h5>
    IT Group at Carisma Solutions
</h5>
</body>
</html>