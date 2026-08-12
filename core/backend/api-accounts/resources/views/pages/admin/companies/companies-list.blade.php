@extends('layouts.admin')

@section('content')
<div class="py-4">
    <div class="container">

        <div class="row">
            <div class="col-sm-12">
                <div class="hstack gap-2 align-items-center justify-content-between">
                    <div class="h4 mb-0">Companies List</div>
                    <a href="{{ route('companies.create') }}" class="btn btn-primary shadow-sm">Create new company</a>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            @foreach ($companies as $company)
            <div class="col-sm-4 pb-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <div class="h4 mb-0">{{ $company->name }}</div>
                        <div class="small opacity-50 mb-4">{{ $company->short_name }}</div>
                        <div class="text-end">
                            <a href="/admin/choose-client/{{ $company->id }}" class="card-link text-decoration-none">Choose Client</a>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>
@endsection