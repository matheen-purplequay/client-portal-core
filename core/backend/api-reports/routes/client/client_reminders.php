<?php
use App\Models\ClientReminders;
use Illuminate\Http\Request;
use App\Mail\SendReportApprovalRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

// Client Reminders - Client Routes
Route::prefix('client')->group(function() {
    Route::prefix('reminders')->group(function() {

        Route::post('get-by-user-id', function(Request $request) {
            $reminders = ClientReminders::where('user_id', $request->input('user_id'))->get();

            return ['status' => true, 'data' => $reminders];
        });

        Route::post('add-new', function(Request $request) {
            try {
                $user_id = $request->input('user_id');
                $when = $request->input('when');
                $reminder = $request->input('reminder');
    
                ClientReminders::insert([
                    'user_id' => $user_id,
                    'when' => $when,
                    'reminder' => $reminder,
                    'created_by' => $user_id
                ]);
    
                return ['status' => true, 'message' => 'Reminder saved', 'request' => $request->all()];
            } catch (Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while saving reminders', 'error' => $e->getMessage(), 'request' => $request->all()];
            }
        });

        Route::post('delete-reminder', function(Request $request) {
            try {
                $reminder_id = $request->input('reminder_id');
                $reminder = ClientReminders::find($reminder_id);
    
                if(isset($reminder)) {
                    $reminder->delete();
                    return ['status' => true, 'message' => 'Reminder has been deleted'];
                } else {
                    return ['status' => false, 'message' => 'Reminder does not exists'];
                }
            } catch(Exception $e) {
                return ['status' => false, 'message' => 'Something went wrong while deleting reminder'];
            }
        });
    });
});

// Client Reminders - Admin Routes
Route::prefix('admin')->group(function() {

});

