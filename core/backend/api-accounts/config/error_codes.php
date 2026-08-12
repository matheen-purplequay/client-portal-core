<?php

return [
    'login' => [
        'code' => 100,
        'title' => 'Login Errors',
        'codes' => [
            101 => [ 'code' => 'ERRLGN101', 'title' => 'Credentials mismatch', 'message' => 'The email address and password you entered do not match our records. Please verify and try again.' ]
        ],
    ],
    'exception' => [
        'code' => 50,
        'title' => 'Exceptions',
        'codes' => [
            51 => [ 'code' => 'ERREXC51', 'title' => 'Critical error', 'message' => 'Something went wrong during operation. Please contact system administrator.' ],
            52 => [ 'code' => 'ERREXC52', 'title' => 'Something went wrong', 'message' => 'Something went wrong during operation. Please try again.' ],
        ],
    ]
];