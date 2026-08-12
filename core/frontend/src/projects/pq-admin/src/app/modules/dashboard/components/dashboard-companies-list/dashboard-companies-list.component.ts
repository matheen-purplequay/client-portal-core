import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from 'pq-ui';

@Component({
  selector: 'app-dashboard-companies-list',
  templateUrl: './dashboard-companies-list.component.html',
  styleUrls: ['./dashboard-companies-list.component.scss']
})
export class DashboardCompaniesListComponent implements OnInit {

  @Input() isReportsLoading: boolean = false;
  @Input() availableReports: any;
  @Input() availableCompanies: any;
  @Input() companiesWithReports: any;
  @Input() companiesWithoutReports: any;

  sortedColumn = '';
  isAsc = true;

  constructor(
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
  }

  copyTableToClipboard(html: any) {
    // Create a temporary textarea to hold CSV data
    const textarea = document.createElement('textarea');
    textarea.textContent = this.convertTableToCSV(html);
    document.body.appendChild(textarea);

    // Select and copy the text
    textarea.select();
    document.execCommand('copy');

    // Clean up
    document.body.removeChild(textarea);
    this.toastService.show('Copied to clipboard. Now you can paste it into your favorite Excel app.', 'Copied List', 'success', true);
  }

  private convertTableToCSV(tableHtml: string): string {
    // Extract table data and convert to CSV format
    const parser = new DOMParser();
    const doc = parser.parseFromString(tableHtml, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr'));

    const lines = rows.map(row => {
      const columns = Array.from(row.querySelectorAll('th, td')).map(cell => {
        let text = cell.textContent!.trim();
        // Escape double quotes by doubling them
        text = text.replace(/"/g, '""');
        // If the text contains commas or newlines, wrap it in double quotes
        if (text.includes(',') || text.includes('\n')) {
          text = `"${text}"`;
        }
        return text;
      });
      return columns.join(',');
    });

    return lines.join('\n');
  }



  getObjectValuesAsArray(object: Object) {
    return Object.values(object);
  }

  getObjectKeysAsArray(object: Object) {
    return Object.keys(object);
  }

  checkIfColumnExists(column: string) {
    let flag = false;
    const columns = Object.values(this.availableReports.columns);
    columns.forEach((col: any) => {
      if (col.id == column && col.showColumn) {
        flag = true;
        return;
      }
    });
    return flag;
  }


  sortBy(propertyName: string) {
    if (this.sortedColumn === propertyName) {
      this.isAsc = !this.isAsc;
    } else {
      this.sortedColumn = propertyName;
      this.isAsc = true;
    }

    this.companiesWithReports.data.sort((a: any, b: any) => {
      const valueA = a[propertyName];
      const valueB = b[propertyName];

      let comparison = 0;
      if (valueA < valueB) {
        comparison = -1;
      } else if (valueA > valueB) {
        comparison = 1;
      }

      return this.isAsc ? comparison : -comparison;
    });
  }

}
