import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FraudReportService, FraudReport } from '../services/fraud-report.service';
import { CaseStatusService, CaseDetails, CaseStatusUpdate } from '../services/case-status.service';
import { MarkdownModule } from 'ngx-markdown';
import { forkJoin, of } from 'rxjs';
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
  isSubmitting = false;
  error: string | null = null;
  success: boolean = false;
  reportId: string | null = null;
  caseId: string | null = null;
  isIncidentSectionExpanded = false; // Collapsed by default
  isCommentsExpanded = true; // Expanded by default
  isLoadingCase = false;
  caseError: string | null = null;
  
  // Modal properties
  showMarkdownModal = false;
  selectedComment: CaseStatusUpdate | null = null;
  
  // Case comments
  newComment: string = '';
  commentStatus: string = 'submitted';
  isAddingComment = false;
  commentError: string | null = null;
  caseComments: CaseStatusUpdate[] = [];
  selectedFiles: File[] = [];
  fileUploadError: string | null = null;

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
            // Initialize the case comments array with the status updates
            // Filter out individual assessment reports since they're shown in the combined view
            this.caseComments = caseDetails.statusUpdates.filter(update => 
              !(update.updatedBy === 'Automatic Assessment System' && this.isMarkdownReport(update.comment)) &&
              !(update.updatedBy === 'Blockchain Forensics Bot' && this.isMarkdownReport(update.comment))
            );
            
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
  
  toggleCommentsSection(): void {
    this.isCommentsExpanded = !this.isCommentsExpanded;
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      // Check file size (max 10MB per file)
      const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
      const files = Array.from(input.files);
      
      // Validate files
      const oversizedFiles = files.filter(file => file.size > maxFileSize);
      if (oversizedFiles.length > 0) {
        this.fileUploadError = `Some files exceed the 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`;
        return;
      }
      
      this.selectedFiles = files;
      this.fileUploadError = null;
    }
  }
  
  addComment(): void {
    if (!this.newComment.trim() || !this.caseId) {
      this.commentError = 'Please enter a comment';
      return;
    }
    
    this.isAddingComment = true;
    this.commentError = null;
    
    // Prepare comment text, including file information if files are attached
    let commentText = this.newComment;
    
    if (this.selectedFiles.length > 0) {
      // In a real app, we would upload the files to a server here
      // For this mock, we'll just add the file names to the comment
      const filesList = this.selectedFiles.map(file => `- ${file.name} (${(file.size / 1024).toFixed(1)} KB)`).join('\n');
      commentText += '\n\n**Attached Files:**\n' + filesList;
    }
    
    const now = new Date();
    const newCommentObj: CaseStatusUpdate = {
      id: `comment-${Math.floor(Math.random() * 10000)}`,
      caseId: this.caseId,
      timestamp: now,
      status: this.commentStatus as 'submitted' | 'under-review' | 'investigating' | 'escalated' | 'closed',
      comment: commentText,
      updatedBy: this.reportData?.fullName || 'User'
    };
    
    // Add to local array for immediate display
    this.caseComments.unshift(newCommentObj);
    
    // Clear the form
    this.newComment = '';
    this.selectedFiles = [];
    this.isAddingComment = false;
    this.fileUploadError = null;
    
    // Reset the file input (would need a reference to the input element in a real app)
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    // If we have case details, also update the status updates there
    if (this.caseDetails) {
      this.caseDetails.statusUpdates.unshift(newCommentObj);
    }
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
  
  /**
   * Determines if a comment contains markdown report content
   */
  isMarkdownReport(comment: string): boolean {
    // Check if the comment starts with markdown heading for reports
    return comment.trim().startsWith('##');
  }
  
  /**
   * Determines if this is the special assessment row that should show both reports
   */
  isAssessmentRow(comment: CaseStatusUpdate): boolean {
    return comment.updatedBy === 'System' && 
           comment.comment.includes('Assessment completed');
  }
  
  /**
   * Gets the automatic assessment report from the case comments
   */
  getAssessmentReport(): CaseStatusUpdate | null {
    if (!this.caseDetails?.statusUpdates) return null;
    
    return this.caseDetails.statusUpdates.find(update => 
      update.updatedBy === 'Automatic Assessment System' && 
      this.isMarkdownReport(update.comment)
    ) || null;
  }
  
  /**
   * Gets the blockchain forensics report from the case comments
   */
  getForensicsReport(): CaseStatusUpdate | null {
    if (!this.caseDetails?.statusUpdates) return null;
    
    return this.caseDetails.statusUpdates.find(update => 
      update.updatedBy === 'Blockchain Forensics Bot' && 
      this.isMarkdownReport(update.comment)
    ) || null;
  }
  
  /**
   * Safely opens the assessment report modal
   */
  openAssessmentReport(): void {
    const report = this.getAssessmentReport();
    if (report) {
      this.openMarkdownModal(report);
    }
  }
  
  /**
   * Safely opens the forensics report modal
   */
  openForensicsReport(): void {
    const report = this.getForensicsReport();
    if (report) {
      this.openMarkdownModal(report);
    }
  }
  
  /**
   * Generates a police report example
   */
  generatePoliceReport(): CaseStatusUpdate {
    return {
      id: `police-report-${Math.floor(Math.random() * 10000)}`,
      caseId: this.caseId || '',
      timestamp: new Date(),
      status: 'investigating',
      comment: `## Police Report Example

### Case Information

| Field | Value |
|-------|-------|
| Case Number | PD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)} |
| Date Filed | ${new Date().toLocaleDateString()} |
| Jurisdiction | Cryptocurrency Fraud Division |
| Officer | Detective Sarah Johnson #4872 |

### Victim Statement

Victim reports unauthorized transactions from their cryptocurrency wallet on ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Approximately $12,500 USD equivalent in Ethereum was transferred to an unknown wallet address. Victim states they did not authorize these transactions and believes their private keys may have been compromised through a phishing attack.

### Evidence Collected

- Screenshots of unauthorized transactions
- Email correspondence with suspected phishing entity
- Blockchain transaction records
- IP logs from victim's wallet provider

### Initial Assessment

Preliminary investigation suggests this case is part of a larger phishing operation targeting cryptocurrency holders. Similar cases have been reported in our jurisdiction over the past 30 days. The wallet address used by the perpetrator has been flagged in our system and shared with cryptocurrency exchanges.

### Next Steps

1. Subpoena records from email service provider
2. Request IP logs from cryptocurrency exchange
3. Cross-reference with other similar cases
4. Coordinate with Cyber Crimes Unit for forensic analysis

**Case Status:** Active Investigation`,
      updatedBy: 'Police Department'
    };
  }
  
  /**
   * Opens the police report example
   */
  openPoliceReport(): void {
    const policeReport = this.generatePoliceReport();
    this.openMarkdownModal(policeReport);
  }
  
  /**
   * Opens a report based on its type from the API data
   */
  openReportByType(reportType: string): void {
    switch (reportType) {
      case 'automatic-assessment':
        this.openAssessmentReport();
        break;
      case 'blockchain-forensics':
        this.openForensicsReport();
        break;
      case 'police-report':
        this.openPoliceReport();
        break;
      default:
        console.warn(`Unknown report type: ${reportType}`);
    }
  }
  
  /**
   * Opens the markdown modal with the selected comment
   */
  openMarkdownModal(comment: CaseStatusUpdate): void {
    this.selectedComment = comment;
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
    this.selectedComment = null;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
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
