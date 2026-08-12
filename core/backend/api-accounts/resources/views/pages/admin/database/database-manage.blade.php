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
            <div class="col-sm-12">
                <div class="vstack gap-2">
                    <div class="hstack gap-2 align-items-center">
                        <a href="/setup/wipe" class="btn btn-danger">
                            Wipe
                        </a>
                        <div>Removes all data from database</div>
                    </div>
                    <div class="hstack gap-2 align-items-center">
                        <a href="/setup/wipe" class="btn btn-success">
                            Migrate and Seed
                        </a>
                        <div>Creates tables and adds demo data</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection