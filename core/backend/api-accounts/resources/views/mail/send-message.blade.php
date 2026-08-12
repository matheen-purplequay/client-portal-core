<!DOCTYPE html>
<html>
<head>
    <title>Query Confirmation</title>
</head>
<body>
<p>
    Dear all,
</p>
<p>
    I hope this message finds you well. I wanted to bring to your attention that a query has been raised and action is required. The details of the query are as follows:
</p>

<p><b>
    Query Details:
</b>
</p>
<p>
    Date Raised: {{ now() }}
</p>
<p>
    Raised By: {{ $clientName }}
</p>
<p>
    Email: {{ $clientEmail }}
</p>
<p>
    Company: {{ $company }}
</p>
<p>
    Query Description:
</p>
<p>
    {{ $query }}
</p>
<p>
    This query is important and requires immediate attention. To ensure that we address it promptly and effectively, we kindly request your involvement and expertise.
    Thank you for your cooperation and commitment to resolving this query promptly.
</p>
<div>
    -------------------------
</div>
<p>
    Best regards,
</p>
<p>
    Team Carisma
</p>
</body>
</html>

