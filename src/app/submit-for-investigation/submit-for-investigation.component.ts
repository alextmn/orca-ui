import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FraudReportService, FraudReport } from '../services/fraud-report.service';

@Component({
  selector: 'app-submit-for-investigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './submit-for-investigation.component.html',
  styleUrl: './submit-for-investigation.component.scss'
})
export class SubmitForInvestigationComponent implements OnInit {
  reportData: FraudReport | null = null;
  isSubmitting = false;
  error: string | null = null;
  success: boolean = false;
  reportId: string | null = null;

  constructor(
    private fraudReportService: FraudReportService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get the report data from the route state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.reportData = navigation.extras.state['reportData'] as FraudReport;
    }
    
    // If no data was passed, use mock data
    if (!this.reportData) {
      this.loadMockData();
    }
  }
  
  loadMockData(): void {
    // Get the first mock report from the service
    this.fraudReportService.getAllReports().subscribe(reports => {
      if (reports && reports.length > 0) {
        this.reportData = reports[0];
        console.log('Using mock data for review:', this.reportData);
      }
    });
  }

  submitForInvestigation(): void {
    if (!this.reportData) {
      this.error = 'No report data found. Please go back and fill out the form again.';
      return;
    }

    // Generate a case ID if one doesn't exist
    if (!this.reportData.id) {
      this.reportData.id = `FR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
    
    // Set report date and status if they don't exist
    if (!this.reportData.reportDate) {
      this.reportData.reportDate = new Date();
    }
    
    if (!this.reportData.status) {
      this.reportData.status = 'submitted';
    }
    
    this.isSubmitting = true;
    this.error = null;
    
    // Navigate to the case-investigation component with the report data
    setTimeout(() => {
      this.router.navigate(['/case-investigation'], {
        state: { reportData: this.reportData }
      });
    }, 100);
  }
}
