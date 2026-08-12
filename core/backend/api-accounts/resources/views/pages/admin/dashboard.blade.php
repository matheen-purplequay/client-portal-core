@extends('layouts.admin')

@section('content')
<div class="py-4 container">

    <div class="row">
        <div class="col-sm-8 col-lg-9">

            <div class="row mb-5">
                <div class="col-sm-12">
                    <div class="card shadow-sm border-0">
                        <div class="card-body">
                            <div class="h4 mb-0">
                                {{ Session::get('selected_client')->name }}
                            </div>
                            <div class="small mb-3">
                                {{ Session::get('selected_client')->industry_type }}
                            </div>
                            <div class="small">
                                <div class="badge bg-success text-light rounded me-2">Active Status</div>
                                <div class="badge bg-light text-dark rounded me-2">4 Services</div>
                                <div class="badge bg-light text-dark rounded me-2">2 Apps</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
            <div class="row mb-5">
                <div class="col-sm-12">
                    <div class="h5 mb-3">Subscribed Services</div>
                </div>
                <div class="col-sm-4">
                    <div class="card mb-3 shadow-sm border-0" style="max-width: 540px;">
                        <div class="card-body">
                            <h5 class="card-title">SMSF</h5>
                            <p class="card-text">Self-Managed Super Fund</p>
                        </div>
                    </div>
                </div>
                <div class="col-sm-4">
                    <div class="card mb-3 shadow-sm border-0" style="max-width: 540px;">
                        <div class="card-body">
                            <h5 class="card-title">BS</h5>
                            <p class="card-text">Business Services</p>
                        </div>
                    </div>
                </div>        
                <div class="col-sm-4">
                    <div class="card mb-3 shadow-sm border-0" style="max-width: 540px;">
                        <div class="card-body">
                            <h5 class="card-title">FP</h5>
                            <p class="card-text">Financial Planning</p>
                        </div>
                    </div>
                </div>        
                <div class="col-sm-4">
                    <div class="card mb-3 shadow-sm border-0" style="max-width: 540px;">
                        <div class="card-body">
                            <h5 class="card-title">Accounts</h5>
                            <p class="card-text">Accounting Services</p>
                        </div>
                    </div>
                </div>        
            </div>

            <div class="row mb-5">
                <div class="col-sm-12">
                    <div class="h5 mb-3">Apps</div>
                </div>
                <div class="col-sm-6">
                    <div class="card mb-3 shadow-sm border-0" style="max-width: 540px;">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600" class="img-fluid rounded-start object-fit-cover h-100 w-24" alt="...">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">Dashboard</h5>
                                    <p class="card-text">Analytics &bull; Metrics &bull; Newsletters</p>
                                    <div class="hstack gap-2 justify-content-end">
                                        <a href="http://localhost:8002" class="btn bg-dark btn-sm text-light rounded-0" target="_blank">
                                            Reports
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="card mb-3 shadow-sm border-0" style="max-width: 540px;">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img src="http://localhost:4201/assets/images/login_banner.png" class="img-fluid rounded-start object-fit-cover h-100 w-24" alt="...">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">Best LMS</h5>
                                    <p class="card-text">Learn &bull; Grow &bull; Excel</p>
                                    <div class="hstack gap-2 justify-content-end">
                                        <a href="http://localhost:4200" class="btn btn-sm bg-dark text-light rounded-0" target="_blank">
                                            LMS USER
                                        </a>
                                        <a href="http://localhost:4200" class="btn btn-sm bg-dark text-light rounded-0" target="_blank">
                                            LMS ADMIN
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        
            </div>

        </div>
        <div class="col-sm-4 col-lg-3">

            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="text-muted small mb-2">Primary Location</div>
                    <div>
                        <div>245, Whites Lane, Eidenburg</div>
                        <div>Sydney, Australia</div>
                    </div>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-4">
                <div class="card-body">
                    <div class="text-muted small mb-2">Primary Contact</div>
                    <div>
                        <div>Mr. Johnson Timothy</div>
                        <div><a class="text-decoration-none fst-italic" href="tel:+619090909">+619090909</a></div>
                        <div><a class="text-decoration-none fst-italic" href="mailto:jhonsontimothy@candl.com">jhonsontimothy@candl.com</a></div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
@endsection