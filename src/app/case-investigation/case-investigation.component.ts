import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FraudReportService, FraudReport } from '../services/fraud-report.service';
import { CaseStatusService, CaseDetails, CaseStatusUpdate, MarkdownFile } from '../services/case-status.service';
import { MarkdownModule } from 'ngx-markdown';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-case-investigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownModule, FormsModule],
  templateUrl: './case-investigation.component.html',
  styleUrl: './case-investigation.component.scss'
})
export class CaseInvestigationComponent implements OnInit {
  reportData: FraudReport | null = null;
  caseDetails: CaseDetails | null = null;
  caseId: string | null = null;
  isIncidentSectionExpanded = false; // Collapsed by default
  isLoadingCase = false;
  caseError: string | null = null;
  
  // Modal properties
  showMarkdownModal = false;
  selectedUpdate: CaseStatusUpdate | null = null;
  selectedMarkdownFile: MarkdownFile | null = null;

  constructor(
    private fraudReportService: FraudReportService,
    private caseStatusService: CaseStatusService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for case ID in the query parameters
    this.route.queryParams.subscribe(params => {
      const caseId = params['case'];
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

  
  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }
  
  /**
   * Opens the markdown modal with the selected comment
   */
  openMarkdownModal(update: CaseStatusUpdate): void {
    this.selectedUpdate = update;
    this.showMarkdownModal = true;
    // Prevent scrolling of the background when modal is open
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Closes the markdown modal
   */
  closeMarkdownModal(event: MouseEvent): void {
    event.preventDefault();
    this.showMarkdownModal = false;
    this.selectedUpdate = null;
    this.selectedMarkdownFile = null;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }
  
  /**
   * Gets the title for a markdown file by ID
   * @param fileId The markdown file ID
   * @returns The title of the markdown file or a default title
   */
  getFileTitle(fileId: string): string {
    // Map of common file IDs to friendly names
    const fileTitles: {[key: string]: string} = {
      'update-002': 'Automatic Case Assessment',
      'update-003': 'Blockchain Forensics Report',
      'assessment-report': 'Case Assessment Report',
      'forensics-report': 'Forensics Analysis',
      'police-report': 'Police Report Template'
    };
    
    return fileTitles[fileId] || 'Document';
  }
  
  /**
   * Opens a markdown file in the modal
   * @param fileId The markdown file ID to open
   */
  openMarkdownFile(fileId: string): void {
    this.isLoadingCase = true;
    this.caseStatusService.getMdFile(fileId).subscribe({
      next: (mdFile) => {
        this.isLoadingCase = false;
        if (mdFile) {
          this.selectedMarkdownFile = mdFile;
          this.showMarkdownModal = true;
          document.body.style.overflow = 'hidden';
        }
      },
      error: (error) => {
        this.isLoadingCase = false;
        console.error('Error loading markdown file:', error);
      }
    });
  }


}
