<?php

namespace App\Http\Controllers;
use App\Models\ClientManagers;
use App\Models\Company;
use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('userDetails')->get();
        return view('pages.admin.users.users-list')->with(compact('users'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $companies = Company::all();
        $roles = Role::where('name', '<>', 'super')->get();
        return view('pages.admin.users.user-create')->with(compact('companies', 'roles'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = new User();
        $userData = $request->only($user->getFillable());
        
        $role = Role::where('id', $request->input('role_id'))->first();
        $user->assignRole($role);
        
        $user->fill($userData)->save();

        if($role->name == 'client_manager') {
            $cm = new ClientManagers();
            $cm->user_id = $user->id;
            $cm->company_id = $request->input('company_id');
            $cm->save();
        }
        return redirect('/admin/users');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $company)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $company)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $company)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $company)
    {
        //
    }
}
