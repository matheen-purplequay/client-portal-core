@extends('layouts.master')

@section('content')
<div class="container">
    <div class="row pt-4">
        <div class="col-sm-8">
            <div class="hstack gap-2 justify-content-between align-items-end">
                <div class="h4 mb-0">Add Agreed Data</div>
                <div>
                    <button class="btn btn-link btn-sm text-decoration-none">Download Template</button>
                </div>
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
            <form action="{{ route('excel.upload') }}" method="post" enctype="multipart/form-data">
                @csrf

                <div class="vstack gap-2">
                    <div>
                        <label class="opacity-50 fw-bold mb-2">Who is this data for?</label>
                        <div class="form-floating">
                            <select class="form-select mb-3" id="floatingSelect" name="project_id" required>
                                <option value="" selected>Choose a client</option>
                                @foreach ($companies as $company)
                                <option value="{{ $company->works_manager_client_id }}">{{ $company->name }}</option>
                                @endforeach
                            </select>
                            <label for="floatingSelect">Company</label>
                        </div>
                    </div>

                    <label class="opacity-50 fw-bold mb-0">Total Jobs for the Month Details</label>
                    <div class="hstack gap-2 align-items-ceter">
                        <div class="form-floating flex-fill">
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
                                <input type="text" class="form-control" value="" placeholder="" name="number_of_jobs" required>
                                <label class="form-label">Number of Jobs</label>
                            </div>
                        </div>

                    </div>

                    <div>
                        <div class="mb-3">
                            <label class="opacity-50 fw-bold mb-2">Upload Job Details (Excel File)</label>
                            <input class="form-control" type="file" id="formFile" name="excel_file" required>
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

@section('style')
@endsection

@section('script')
@endsection