<!DOCTYPE html>
<html>
<head>
    <title>{{ $subject }}</title>
</head>
<body>

<p>
Hi {{ $approver_name }},
</p>

<p>
An approval request has been received from {{ $requester_name }} regarding the uploaded "{{ $report_title }}" for the client {{ $client_name }}.
</p>



<p>
    <small>
        <i>
            Kindly access the <a href="https://admin-clientportal.purplequay.com.au/login">Admin Portal</a> to review and either approve or reject the report accordingly.
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
