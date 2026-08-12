<?php

namespace App\Http\Controllers;

use App\Mail\SendOtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OtpController extends Controller
{
    public function generateAndSendOtp(Request $request)
    {
        // Generate a random 4-digit OTP
        $otp = rand(1000, 9999);

        // Get the customer's email address from the request or your database
        $email = $request->input('email'); // Assuming you have an 'email' field in your form

        // Send the OTP to the customer's email
        Mail::to($email)->send(new SendOtpMail($otp));

        // You can also save the OTP in your database for verification later
        // Save it along with the customer's email for later validation

        return ['OTP has been sent to your email id'];
    }
}
