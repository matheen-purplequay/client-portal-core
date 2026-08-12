<!DOCTYPE html>
<html>
<head>
    <title>{{ $subject }}</title>
</head>
<body>

<p>
Hi {{ $uploaded_by }},
</p>

<p>
    @if($status == 'approved')
        Congratulations, the report "{{ $report_title }}" uploaded for the client {{ $client_name }} has been <b>approved</b>.
    @elseif ($status == 'rejected')
        The report with the title "{{ $report_title }}" for {{ $client_name }} has been <b>rejected</b>. Please review the reason for rejection detailed in the report information and re-upload the updated report.
    @endif
</p>



<p>
    <small>
        <i>
            Kindly access the <a href="https://admin-clientportal.purplequay.com.au/login">Admin Portal</a> to review and upload the revised report.
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
