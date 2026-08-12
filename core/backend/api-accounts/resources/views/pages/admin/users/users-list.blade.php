@extends('layouts.admin')

@section('content')
    <div class="py-4">
        <div class="container">
            <div class="row">
                <div class="col-sm-12">
                    <div class="hstack gap-2 align-items-center justify-content-between">
                        <div class="h4 mb-0">All Users</div>
                        <a href="{{ route('users.create') }}" class="btn btn-primary shadow-sm">Create Users</a>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-sm-12">
                    <table class="table-auto rounded bg-white w-full">
                        <thead>
                            <tr class="border-b-2 border-indigo-500">
                                <th class="text-left py-1 px-2">ID</th>
                                <th class="text-left py-1 px-2">First Name</th>
                                <th class="text-left py-1 px-2">Last Name</th>
                                <th class="text-left py-1 px-2">Email</th>
                                <th class="text-left py-1 px-2">Phone</th>
                                <th class="text-left py-1 px-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($users as $user)
                            <tr class="border-b border-slate-50">
                                <td class="py-1 px-2">{{ $user->id }}</td>
                                <td class="py-1 px-2">{{ $user->first_name }}</td>
                                <td class="py-1 px-2">{{ $user->last_name }}</td>
                                <td class="py-1 px-2">{{ $user->email }}</td>
                                <td class="py-1 px-2">{{ $user->phone }}</td>
                                <td class="py-1 px-2">
                                    @isset($user->userDetails)
                                    {{ $user->userDetails->status }}
                                    @endisset
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
@endsection