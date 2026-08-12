@extends('layouts.master')

@section('content')
<div class="container">
    <div class="row pt-4">
        <div class="col-sm-12">
            <div class="h4 mb-0">Upload Connect / Weekly Reports</div>
            <div>
                <a href="{{ route('reports.index') }}" class="btn btn-link px-0">View all reports</a>
            </div>
            @if(isset($response))
            {{ var_dump($response) }}
            @endif
            <div class="small">
                @isset($success)
                    <span class="text-success">File has been saved.</span>
                @endisset
            </div>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-sm-8">
            <form action="{{ route('reports.store') }}" method="post" enctype="multipart/form-data" onsubmit="return confirm('Please confirm that you are uploading the final copy?');">
                @csrf

                <div class="vstack gap-2">
                    <div>
                        <label class="opacity-50 fw-bold mb-2">Who is this report for?</label>
                        <div class="form-floating">
                            <select class="form-select mb-3" id="floatingSelect" name="client_id" required>
                                <option value="" selected>Choose a client</option>
                                @foreach ($companies as $company)
                                <option value="{{ $company->Pid }}">{{ $company->ClientName }}</option>
                                @endforeach
                            </select>
                            <label for="floatingSelect">Company</label>
                        </div>
                    </div>

                    <div>
                        <label class="opacity-50 fw-bold mb-2">Report Details</label>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" value="" placeholder="Please give a title for report" name="name" required>
                            <label class="form-label">Report Name / Title</label>
                        </div>
                    </div>

                    <label class="opacity-50 fw-bold">Additional Details</label>
                    <div class="vstack gap-2">
                        <div class="hstack gap-2 align-items-ceter">
                            <div class="form-floating flex-grow">
                                <select class="form-select mb-3" name="report_type" required>
                                    <option value="connect">Connect Reports</option>
                                    <option value="weekly">Weekly Reports</option>
                                </select>
                                <label>Report Type</label>
                            </div>
    
                            <div>&nbsp;&bull;&nbsp;</div>
    
                            <div class="form-floating">
                                <select class="form-select mb-3" name="month" required>
                                    <option value="January">January</option>
                                    <option value="February">February</option>
                                    <option value="March">March</option>
                                    <option value="April">April</option>
                                    <option value="May">May</option>
                                    <option value="June">June</option>
                                    <option value="July">July</option>
                                    <option value="August">August</option>
                                    <option value="September">September</option>
                                    <option value="October">October</option>
                                    <option value="November">November</option>
                                    <option value="December">December</option>
                                </select>
                                <label>For Month</label>
                            </div>
    
                            <div>
                                <div class="form-floating mb-3">
                                    <input type="number" class="form-control" value="{{ date("Y") }}" name="year" required>
                                    <label class="form-label">For Year</label>
                                </div>
                            </div>
    
                            <div>&nbsp;&bull;&nbsp;</div>
    
                            <div>
                                <div class="form-floating mb-3">
                                    <input type="number" class="form-control" value="1" name="pages" required>
                                    <label class="form-label">Report Pages</label>
                                </div>
                            </div>
                        </div>
                        <div class="hstack gap-2">
                            <div class="form-floating mb-3 flex-fill">
                                <input type="text" class="form-control" value="" name="pages" required>
                                <label class="form-label">Client Director Name</label>
                            </div>
                            <div class="form-floating mb-3 flex-fill">
                                <input type="text" class="form-control w-100" value="" name="pages" required>
                                <label class="form-label">Team Lead Name</label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="mb-3">
                            <label class="opacity-50 fw-bold mb-2">Upload Report</label>
                            <input class="form-control" type="file" id="formFile" name="report" required>
                        </div>
                    </div>

                    <div>
                        <button type="submit" class="btn btn-primary shadow-sm px-4">
                            Save Report
                        </button>
                    </div>

                </div>
            </form>

        </div>
    </div>
</div>
@endsection

@section('styles')
@endsection

@section('scripts')
@endsection