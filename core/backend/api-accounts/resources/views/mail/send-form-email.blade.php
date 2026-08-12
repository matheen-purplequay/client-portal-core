<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request from Carisma Website Form</title>
</head>
<body>

<div>
    {{ $body }}
</div>
<div style="padding: 10px 15px; background: #F5F5F5; border-radius: 4px; box-shadow: rgb(204, 219, 232) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;">
    <p>
        Name: {{ $name }}
    </p>
    <p>
        Email: <a href="mailto:{{ $email }}">{{ $email }}</a>
    </p>
    @if (isset($data))
        @foreach ($data as $d => $v)
            @if(isset($d) && isset($v))
                <p>{{ ucfirst(trans($d)) }}: {{ $v }}</p>
            @endif
        @endforeach
    @endif
</div>
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