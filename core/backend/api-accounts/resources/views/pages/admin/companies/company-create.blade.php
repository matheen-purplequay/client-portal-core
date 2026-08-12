@extends('layouts.admin')

@section('content')
<section class="container pt-5 pb-4">
    <div class="row">
        <div class="col-sm-12">
            <a href="{{ route('companies.index') }}" class="btn px-0 btn-sm text-muted hstack gap-1 align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="grey" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                View All Companies
            </a>            

            <div class="h3 fw-normal">Create Users</div>
        </div>
    </div>
</section>
<div class="container pb-5">
    <form method="POST" action="{{ route('companies.store') }}">
        @csrf

        <div class="row">
            <div class="col-sm-6">
                <div class="row">
                    <div class="col-sm-12">
                        <label class="opacity-50 fw-bold mb-2 mt-4">Company Details</label>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-floating">
                            <select class="form-select mb-3" id="floatingSelect" aria-label="Floating label select example">
                                <option selected>Choose a company</option>
                                @foreach ($companies as $company)                                
                                <option value="{{ $company->id }}">{{ $company->name }}</option>
                                @endforeach
                            </select>
                            <label for="floatingSelect">Parent Company (if sub company)</label>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="inpfirstname" placeholder="First name" name="first_name">
                            <label for="inpfirstname">Company Name</label>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="inplastname" placeholder="Last name" name="last_name">
                            <label for="inplastname">Short Company Name</label>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="inpfirstname" placeholder="First name" name="first_name">
                            <label for="inpfirstname">Location</label>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="inplastname" placeholder="Last name" name="last_name">
                            <label for="inplastname">Short Company Name</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12">
                <button type="submit" class="btn btn-primary hstack gap-1 align-items-center shadow-sm">
                    Create Company
                </button>
            </div>
        </div>
    </form>
</div>
@endsection