<?php

use App\Http\Controllers\NotificationController;
use App\Models\Apps;
use App\Models\AppUpdates;
use App\Models\ClientPortalNotifications;
use App\Models\Company;
use App\Models\CompanyServices;
use App\Models\EngagementVerticals;
use App\Models\LoginActivity;
use App\Models\SubApps;
use App\Models\User;
use App\Models\RolesMaster;
use App\Models\UserDetails;
use App\Models\WhitelistIPs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;


Route::prefix('notifications')->group(function() {
    Route::post('save-token', function(Request $request) {
        // $user_id = $request->input('user_id');
        // $device_token = $request->input('device_token');

        // $whitelist_ip = WhitelistIPs::where('user_id', $user_id)->first();
        // if(isset($whitelist_ip)) {
        //     $whitelist_ip->device_token = $device_token;
        //     $whitelist_ip->save();

        //     return ['status' => true, 'message' => 'Token Saved', 'ip' => $whitelist_ip];
        // } else return ['status' => false, 'message' => 'Could not find any whitelisted ips'];
    });

    Route::post('get-notifications', function(Request $request) {
        $user_id = $request->input('user_id');
    
        $notifications = ClientPortalNotifications::where('user_id', $user_id)->get();
    
        return ['status' => true, 'data' => $notifications];
    });

    Route::get('/stream', function (Request $request) {
        ignore_user_abort(true);
    
        // Headers for SSE
        header('Access-Control-Allow-Origin: *'); // Change * to specific domains in production
        header('Access-Control-Allow-Headers: Content-Type');
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
    
        while (true) {
            // Check if the connection is still active
            if (connection_aborted()) {
                break;
            }
    
            // Retrieve the latest notification for the user
            $notifications = ClientPortalNotifications::where('user_id', $request->user_id)->where('notification_sent', 0)->get();      
    
            foreach ($notifications as $notification) {
                // Send a JSON-encoded event
                $notification->notification_sent = 1;
                $notification->save();

                echo "data: " . json_encode([
                    'id' => $notification->id,
                    'app_id' => $notification->app_id,
                    'sub_app_id' => $notification->sub_app_id,
                    'type' => $notification->type,
                    'action_title' => $notification->action_title,
                    'action_url' => $notification->action_url,
                    'title' => $notification->title,
                    'body' => $notification->body
                ]) . "\n\n";

            }
    
            ob_flush();
            flush();
    
            // Sleep for 5 seconds before checking for new notifications
            sleep(30);
        }
    });

    Route::post('delete-notification', function(Request $request) {
        $notification_id = $request->input('notification_id');

        $notification = ClientPortalNotifications::find($notification_id);
        if(null !== $notification_id) $notification->delete();

        return ['status' => true, 'message' => 'Notification deleted'];
    });

    Route::post('/send-notification', [NotificationController::class, 'sendNotificationToDevice']);
    Route::post('/set-notification-settings', [NotificationController::class, 'changeNotificaitonSettings']);
    Route::post('/get-notification-settings', [NotificationController::class, 'getNotificaitonSettings']);
});