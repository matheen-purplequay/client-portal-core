<?php

namespace App\Http\Controllers;

use App\Models\ClientPortalNotifications;
use App\Models\UserDetails;
use App\Models\WhitelistIPs;
use Exception;
use Illuminate\Http\Request;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Illuminate\Support\Facades\Storage;
use Kreait\Firebase\Factory;

class NotificationController extends Controller
{
    protected $messaging;

    public function __construct()
    {
        $firebaseCredentialsPath = storage_path('app/firebase-adminsdk.json');

        if (!file_exists($firebaseCredentialsPath)) {
            throw new \Exception("Firebase credentials file not found. Path checked: {$firebaseCredentialsPath}");
        }

        $credentials = json_decode(file_get_contents($firebaseCredentialsPath), true);

        $this->messaging = (new Factory)->withServiceAccount($credentials)->createMessaging();
    }

    public function sendNotificationToDevice(Request $request)
    {
        $user_id = $request->input('user_id');
        $title = $request->input('title');
        $body = $request->input('body');

        $app_id = $request->input('app_id');
        $sub_app_id = $request->input('sub_app_id');
        $type = $request->input('type');
        $action_title = $request->input('action_title');
        $action_url = $request->input('action_url');

        $whitelist_ip = WhitelistIPs::where('user_id', $user_id)->first();

        if (isset($whitelist_ip) && $whitelist_ip->allow_notification) {
            try {
                $deviceToken = $whitelist_ip->device_token;

                if (isset($deviceToken)) {

                    $message = CloudMessage::withTarget('token', $deviceToken)
                        ->withNotification(Notification::create($title, $body));

                    $this->messaging->send($message);
                }

                try {
                    $this->messaging->send($message);
                    ClientPortalNotifications::insert([
                        'app_id' => 1,
                        'sub_app_id' => 1,
                        'user_id' => $user_id,
                        'type' => $type,
                        'action_title' => $action_title,
                        'action_url' => $action_url,
                        'title' => $title,
                        'body' => $body
                    ]);

                    return ['status' => true, 'message' => 'Notification sent to user'];
                } catch (\Kreait\Firebase\Exception\Messaging\NotFound $e) {
                    return response()->json(['status' => false, 'message' => 'Token not found', 'error' => $e->getMessage()]);
                } catch (\Kreait\Firebase\Exception\MessagingException $e) {
                    return response()->json(['status' => false, 'message' => $e->getMessage()]);
                }
            } catch (Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while sending notification.', 'error' => $e->getMessage()];
            }
        } else
            return ['status' => false, 'message' => 'User device not found'];
    }

    // This function can be called directly from other Controllers      
    public function sendDirectNotificationToDevice($user_id, $title, $body, $app_id, $sub_app_id, $type, $action_title = '', $action_url = '')
    {

        $whitelist_ip = WhitelistIPs::where('user_id', $user_id)->first();

        if (isset($whitelist_ip) && $whitelist_ip->allow_notification) {
            try {
                $deviceToken = $whitelist_ip->device_token;

                if (isset($deviceToken)) {

                    $message = CloudMessage::withTarget('token', $deviceToken)
                        ->withNotification(Notification::create($title, $body));

                   $this->messaging->send($message);
                }

                try {
                    $this->messaging->send($message);
                    ClientPortalNotifications::insert([
                        'app_id' => 1,
                        'sub_app_id' => 1,
                        'user_id' => $user_id,
                        'type' => $type,
                        'action_title' => $action_title,
                        'action_url' => $action_url,
                        'title' => $title,
                        'body' => $body
                    ]);

                    return ['status' => true, 'message' => 'Notification sent to user'];
                } catch (\Kreait\Firebase\Exception\Messaging\NotFound $e) {
                    return response()->json(['status' => false, 'message' => 'Token not found', 'error' => $e->getMessage()]);
                } catch (\Kreait\Firebase\Exception\MessagingException $e) {
                    return response()->json(['status' => false, 'message' => $e->getMessage()]);
                }
            } catch (Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while sending notification.', 'error' => $e->getMessage()];
            }
        } else
            return ['status' => false, 'message' => 'User device not found'];
    }
}
