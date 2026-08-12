@extends('layouts.master')

@section('php')
@php
    $months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $years = [2023];
@endphp
@endsection

@section('content')
<div class="container">
    <div class="row pt-4">
        <div class="col-sm-8">
            <div class="h4 mb-0">Connect / Weekly Reports List</div>
            @if(isset($message))
            <div class="alert @if($status) alert-primary @else alert-warning @endif">
                {{ $message }}
            </div>
            @endif
        </div>
        <div class="col-sm-4 text-end">
            <a href="{{ route('reports.create') }}" class="btn btn-outline-primary">Upload Report</a>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-sm-12">

            <div class="filter-toolbar bg-light rounded">
                <form action="{{ route('reports.filter') }}" method="post" class="hstack gap-2 align-items-end p-2">
                    @csrf
                    <div>
                        <label class="opacity-50 fw-bold mb-2">Filter reports by client</label>
                        <div class="form-floating">
                            <select class="form-select" id="floatingSelect" name="client_id" required>
                                <option value="" selected>Choose a client</option>
                                @foreach ($companies as $company)
                                <option value="{{ $company->Pid }}">{{ $company->ClientName }}</option>
                                @endforeach
                            </select>
                            <label for="floatingSelect">Company</label>
                        </div>
                    </div>
                    <div>
                        <div class="form-floating">
                            <select class="form-select" id="floatingSelect" name="report_type" required>
                                <option value="connect">Connect Reports</option>
                                <option value="weekly">Weekly Reports</option>
                            </select>
                            <label for="floatingSelect">Report Type</label>
                        </div>
                    </div>
                    <div>
                        <div class="form-floating">
                            <select class="form-select" id="floatingSelect" name="month" required>
                                @foreach ($months as $month)
                                <option value="{{ $month }}">{{ $month }}</option>
                                @endforeach
                            </select>
                            <label for="floatingSelect">Month</label>
                        </div>
                    </div>
                    <div>
                        <div class="form-floating">
                            <select class="form-select" id="floatingSelect" name="year" required>
                                @foreach ($years as $year)
                                <option value="{{ $year }}" @if($loop->first) selected @endif>{{ $year }}</option>
                                @endforeach
                            </select>
                            <label for="floatingSelect">Year</label>
                        </div>
                    </div>
                    <div>
                        <button type="submit" class="btn btn-primary pe-5 text-start">
                            <div class="fw-smaller">Search</div>
                            <div>Reports</div>
                        </button>
                    </div>
                </form>
            </div>

            <div class="data-table mt-4">
                <div class="card">
                    <div class="card-body">
                        @if(isset($reports))
                        <table class="w-100">
                            <thead>
                                <th>S.No</th>
                                <th>Report Name</th>
                                <th>Month</th>
                                <th>Year</th>
                                <th>Client Director</th>
                                <th>Team Lead</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </thead>
                            <tbody>
                                @forelse ($reports as $report)
                                    <tr>
                                        <td>{{ $loop->index + 1 }}</td>
                                        <td>{{ $report->name }}</td>
                                        <td>{{ $report->month }}</td>
                                        <td>{{ $report->year }}</td>
                                        <td>{{ $report->client_director }}</td>
                                        <td>{{ $report->team_lead }}</td>
                                        <td>{{ $report->status_name }}</td>
                                        <td>
                                            @if($report->status == 0)
                                                @if($userRole->name == 'team_lead' || $userRole->name == 'project_director' || $userRole->name == 'group_director' || $userRole->name == 'client_director' || $userRole->name == 'admin')
                                                <form action="{{ route('reports.approve') }}" method="post">
                                                    <input type="hidden" name="role" value="{{ $userRole->name }}">
                                                    <input type="hidden" name="report_id" value="{{ $report->id }}">
                                                    <input type="hidden" name="client_id" value="{{ $filters['client_id'] }}">
                                                    <input type="hidden" name="month" value="{{ $filters['month'] }}">
                                                    <input type="hidden" name="year" value="{{ $filters['year'] }}">
                                                    <input type="hidden" name="report_type" value="{{ $filters['report_type'] }}">
                                                    <button class="btn btn-link" data-user-role="{{ $userRole->name }}">Approve</button>
                                                </form>
                                                @endif
                                            @endif
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td>No data received</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>

                        @else 
                            @if(isset($isFirstTime) && $isFirstTime)
                                <div class="p-4 text-center opacity-75">
                                    Choose filters to view reports...
                                </div>
                            @else
                                <div class="p-4 text-center opacity-75">
                                    No data available...
                                </div>
                            @endif
                        @endif
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
@endsection

@section('styles')
<style>
table, th, td {
  border: 1px solid rgba(0,0,0,0.5);
  border-collapse: collapse;
}
</style>
@endsection

@section('scripts')
@endsection