import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FraudReportService, FraudReport } from '../services/fraud-report.service';
import { CaseStatusService, CaseDetails, CaseStatusUpdate } from '../services/case-status.service';
import { MarkdownModule } from 'ngx-markdown';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-case-investigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownModule],
  templateUrl: './case-investigation.component.html',
  styleUrl: './case-investigation.component.scss'
})
export class CaseInvestigationComponent implements OnInit {
  reportData: FraudReport | null = null;
  caseDetails: CaseDetails | null = null;
  isSubmitting = false;
  error: string | null = null;
  success: boolean = false;
  reportId: string | null = null;
  caseId: string | null = null;
  isIncidentSectionExpanded = false; // Collapsed by default
  isCaseStatusExpanded = true; // Expanded by default
  isLoadingCase = false;
  caseError: string | null = null;

  constructor(
    private fraudReportService: FraudReportService,
    private caseStatusService: CaseStatusService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for case ID in the route parameters
    this.route.paramMap.subscribe(params => {
      const caseId = params.get('id');
      if (caseId) {
        this.caseId = caseId;
        this.loadCaseById(caseId);
      } else {
        // Get the report data from the route state for new submissions
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
          this.reportData = navigation.extras.state['reportData'] as FraudReport;
          // For new submissions, we'll generate a temporary case ID
          this.caseId = `FR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        }
        
        // If no data was passed, use mock data
        if (!this.reportData) {
          this.loadMockData();
        }
      }
    });
  }
  
  loadCaseById(caseId: string): void {
    this.isLoadingCase = true;
    this.caseError = null;
    
    // Get case details
    this.caseStatusService.getCaseDetails(caseId)
      .pipe(
        switchMap(caseDetails => {
          if (caseDetails) {
            this.caseDetails = caseDetails;
            // For existing cases, also load the report data
            return this.fraudReportService.getReportById(caseId).pipe(
              catchError(() => {
                // If we can't find the report, just return null
                return of(null);
              })
            );
          } else {
            this.caseError = `Case ${caseId} not found`;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (reportData) => {
          this.isLoadingCase = false;
          if (reportData) {
            this.reportData = reportData;
          }
        },
        error: (error) => {
          this.isLoadingCase = false;
          this.caseError = `Error loading case: ${error.message || 'Unknown error'}`;
          console.error('Error loading case:', error);
        }
      });
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

  toggleIncidentSection(): void {
    this.isIncidentSectionExpanded = !this.isIncidentSectionExpanded;
  }
  
  toggleCaseStatusSection(): void {
    this.isCaseStatusExpanded = !this.isCaseStatusExpanded;
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'submitted': return 'status-submitted';
      case 'under-review': return 'status-review';
      case 'investigating': return 'status-investigating';
      case 'escalated': return 'status-escalated';
      case 'closed': return 'status-closed';
      default: return '';
    }
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  submitForInvestigation(): void {
    if (!this.reportData) {
      this.error = 'No report data available to submit';
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    
    // If we already have a case ID (from the temporary generation), use it
    if (this.caseId) {
      this.reportData.id = this.caseId;
    }
    
    this.fraudReportService.submitReport(this.reportData).subscribe({
      next: (response) => {
        console.log('Report submitted successfully:', response);
        this.isSubmitting = false;
        this.success = true;
        this.reportId = response.id || null;
        this.caseId = response.id || null; // Ensure caseId is set to the returned ID
        
        // Create an initial case status entry
        if (this.caseId && this.reportData) {
          this.caseStatusService.createInitialCaseStatus(this.caseId, this.reportData.fullName)
            .subscribe({
              next: (caseDetails: CaseDetails) => {
                console.log('Initial case status created:', caseDetails);
                this.caseDetails = caseDetails;
              },
              error: (error: Error) => {
                console.error('Error creating initial case status:', error);
                // We don't show this error to the user since the main submission was successful
              }
            });
        }
      },
      error: (error) => {
        console.error('Error submitting report:', error);
        this.isSubmitting = false;
        this.error = error.message || 'An error occurred while submitting the report. Please try again.';
      }
    });
  }
}
