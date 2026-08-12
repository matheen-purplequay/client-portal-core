@extends('layouts.onboard')

@section('content')
<div class="container">

    <div class="row mt-5 pb-5">
        <div class="col-sm-12">
            <div class="card border-0 shadow-lg">
                <div class="card-body pt-0">
                    @include('onboard.card-steps', [ 'currentStep' => 2 ])
                    <div class="row mt-3">
                        <div class="col-sm-12">
                            <p class="lead">Let's add primary users now</p>
                        </div>
                        <div class="col-sm-12">
                            <div class="mb-3">
                                <label>Organization Admin Name</label>
                                <input type="text" class="form-control" placeholder="Full name">
                            </div>
                        </div>
                        <div class="col-sm-8">
                            <div class="mb-3">
                                <label>Organization Admin Email Address</label>
                                <input type="text" class="form-control" placeholder="Company email address">
                                <span class="small fst-italic opacity-50">Password will be sent to email address</span>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-sm-6">
                            <div class="mb-3">
                                <label>More Admin Details</label>
                                <input type="text" class="form-control rounded-bottom-0 no-shadow" placeholder="Personal email address">
                                <input type="text" class="form-control rounded-top-0 no-shadow border-top-0" placeholder="Contact number">
                            </div>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="hstack justify-content-between">
                            <a href="/onboard/org-setup" class="hstack gap-2 align-items-center justify-content-center fw-medium px-0 icon-link icon-link-hover text-decoration-none link-secondary">
                                <span class="small">
                                    <i class="fa-solid fa-arrow-left-long"></i>
                                </span>
                                Organization Setup
                            </a>
                            <button type="submit" class="btn btn-primary hstack gap-2 justify-content-center fw-medium shadow px-5">
                                Next
                                <span class="small">
                                    <i class="fa-solid fa-arrow-right-long"></i>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection