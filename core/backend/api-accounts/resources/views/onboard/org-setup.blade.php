@extends('layouts.onboard')

@section('content')
<div class="container">

    <div class="row mt-5 pb-5">
        <div class="col-sm-12">
            <form action="/onboard/form/validate" method="post">
                @csrf
                <div class="card border-0 shadow-lg">
                    <div class="card-body pt-0">
                        @include('onboard.card-steps', [ 'currentStep' => 1 ])
                        <div class="row mt-3">
                            <div class="col-sm-4">
                                <div class="mb-3">
                                    <label>Organization Short Name</label>
                                    <input type="text" class="form-control" placeholder="Clashville Pvt. Ltd.">
                                </div>
                            </div>
                            <div class="col-sm-8">
                                <div class="mb-3">
                                    <label>Organization Long Name</label>
                                    <input type="text" class="form-control" placeholder="Clashville Private Limited">
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-sm-4">
                                <div class="mb-3">
                                    <label for="squarelogo" class="form-label">Organization Square Logo</label>
                                    <input class="form-control" type="file" id="squarelogo">
                                </div>
                            </div>
                            <div class="col-sm-4">
                                <div class="mb-3">
                                    <label for="longlogo" class="form-label">Organization Long Logo</label>
                                    <input class="form-control" type="file" id="longlogo">
                                </div>
                            </div>
                            <div class="col-sm-4">
                                <div class="mb-3">
                                    <label class="form-label">Organization Theme Color</label>
                                    <input type="color" class="form-control form-control-color" value="#0088ff" title="Choose your theme color">
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-sm-6">
                                <div class="mb-3">
                                    <label>Primary Location</label>
                                    <input type="text" class="form-control rounded-bottom-0 no-shadow" placeholder="Address Line 1">
                                    <input type="text" class="form-control rounded-0 no-shadow border-top-0" placeholder="Address Line 2">
                                    <input type="text" class="form-control rounded-0 no-shadow border-top-0" placeholder="Area / Province">
                                    <input type="text" class="form-control rounded-0 no-shadow border-top-0" placeholder="City">
                                    <input type="text" class="form-control rounded-0 no-shadow border-top-0" placeholder="Country">
                                    <input type="text" class="form-control rounded-top-0 no-shadow border-top-0" placeholder="Zipcode">
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="hstack justify-content-end">
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
            </form>
        </div>
    </div>
</div>
@endsection