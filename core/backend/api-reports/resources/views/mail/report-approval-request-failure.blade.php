<!DOCTYPE html>
<html>
<head>
    <title>{{ $subject }}</title>
</head>
<body>

<p>
    Hi,
</p>

<p>
    An approval request email has been failed while sending it to {{ $requester_name }} regarding the uploaded "{{ $report_title }}" for the client {{ $client_name }}.
</p>



<p>
    <small>
        <i>
            Kindly contact system administrator for more information.
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
            Team CRM
        </b>
    </div>
</div>
</body>
</html>
