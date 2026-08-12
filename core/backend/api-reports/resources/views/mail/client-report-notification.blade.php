<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Notification</title>
</head>
<body>
    <p>Dear Team {{ $client_name }},</p>

    <p>We are pleased to inform you that the Monthly Connect Report [{{ $month }}, {{ $year }}] has been uploaded and is now available for your view.</p>

    <div style="margin: 20px 0;">
        <p>You can access the report by clicking on following button:</p>
    
        <div>
            <a href="{{ $portal_link }}" target="_blank" style="display: inline-block;">
                <table cellpadding="10" style="border-radius: 4px; overflow: hidden; background: {{ $primary_color }}; font-weight: bold; color: white; text-decoration: none; box-shadow: 0 3px 6px -2px rgba(0,0,0,.25);">
                    <tr>
                        <td style="padding: 10px 15px; border-radius: 4px;">
                            Open Client Portal
                        </td>
                    </tr>
                </table>
            </a>
        </div>
    </div>

    <div>
        <p>
        Please use the credentials provided by your Client Lead to log in and view the report. If you have any questions or need further assistance, please reach out to your Client Lead.
        </p> 
        
        For technical support, please contact our Tech Support Team at 
        <a href="mailto:{{ $support_email }}" target="_blank" style="color: {{ $primary_color }};">
            Tech support
        </a>
    </div>

    <p style="margin-top: 15px;">
        Thank you for your continued partnership.
    </p>

    <div style="margin-top: 40px;">
        <p>
            Best regards,
        </p>
    
        <p>
            Team Carisma
        </p>
    </div>
</body>
</html>