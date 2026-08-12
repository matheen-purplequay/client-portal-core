import { Component, OnInit } from "@angular/core";
import { defineCustomElements } from "@ionic/core/loader";

defineCustomElements(window);

@Component({
  selector: "app-queries-home",
  templateUrl: "./queries-home.component.html",
  styleUrls: ["./queries-home.component.scss"],
})
export class QueriesHomeComponent implements OnInit {
  jobsWithQueries = {
    job_id: 1001,
    job_name: "ABC Fund",
    client: "Neo Super",
    sub_client: "Collins House",
    vertical: "SMSF",
    jy: "12-07-2024",
    fy: 2024,
    last_query: "Need invoice for this job",
    last_query_posted_date: "12-12-2024",
    total_queries: 12,
    open_queries: 5,
    resolved: 7,
  };

  constructor() {}

  ngOnInit(): void {}
}
