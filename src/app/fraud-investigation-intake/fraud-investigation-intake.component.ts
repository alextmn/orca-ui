import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FraudReportService, FraudReport } from '../services/fraud-report.service';

@Component({
  selector: 'app-fraud-investigation-intake',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './fraud-investigation-intake.component.html',
  styleUrls: ['./fraud-investigation-intake.component.scss']
})
export class FraudInvestigationIntakeComponent implements OnInit {
  fraudForm!: FormGroup;
  selectedFiles: File[] = [];
  isSubmitting = false;
  submitError: string | null = null;
  isDragOver = false;
  
  constructor(
    private fb: FormBuilder,
    private fraudReportService: FraudReportService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadMockData();
  }
  
  initForm(): void {
    this.fraudForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      victimWallet: ['', Validators.required],
      scammerWallet: [''],
      exchangePlatform: [''],
      tokenName: [''],
      amountLost: ['', [Validators.required, Validators.min(0)]],
      incidentDescription: ['', [Validators.required, Validators.maxLength(1000)]],
      fileUpload: [''],
      evidenceUrls: [''],
      shareDataConsent: [false, Validators.requiredTrue],
      termsConsent: [false, Validators.requiredTrue]
    });
  }
  
  loadMockData(): void {
    // Get the first mock report from the service
    this.fraudReportService.getAllReports().subscribe(reports => {
      if (reports && reports.length > 0) {
        const mockReport = reports[0];
        
        // Populate the form with mock data
        this.fraudForm.patchValue({
          fullName: mockReport.fullName,
          email: mockReport.email,
          victimWallet: mockReport.victimWallet,
          scammerWallet: mockReport.scammerWallet || '',
          exchangePlatform: mockReport.exchangePlatform || '',
          tokenName: mockReport.tokenName || '',
          amountLost: mockReport.amountLost,
          incidentDescription: mockReport.incidentDescription,
          evidenceUrls: mockReport.evidenceUrls || ''
        });
        
        // Update character count after loading mock data
        this.updateCharCount();
      }
    });
  }
  
  getCharacterCount(): number {
    const description = this.fraudForm.get('incidentDescription')?.value || '';
    return description.length;
  }
  
  updateCharCount(): void {
    // This method is called on input to trigger change detection for the character count
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      // Add new files to existing array
      const newFiles = Array.from(input.files);
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
    }
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files);
      const validFiles = files.filter(file => {
        const fileType = file.type.toLowerCase();
        return fileType.includes('image/jpeg') || 
               fileType.includes('image/png') || 
               fileType.includes('application/pdf');
      });
      
      if (validFiles.length > 0) {
        this.selectedFiles = [...this.selectedFiles, ...validFiles];
      }
    }
  }
  
  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }
  
  getFileIconClass(fileType: string): string {
    if (fileType.includes('image/jpeg') || fileType.includes('image/png')) {
      return 'image-icon';
    } else if (fileType.includes('application/pdf')) {
      return 'pdf-icon';
    } else {
      return 'file-icon';
    }
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  onSubmit(): void {
    
    if (this.fraudForm.valid) {
      try {
        this.isSubmitting = true;
        
        // Generate a case ID
        const caseId = `FR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        // Prepare the report data
        const reportData: FraudReport = {
          id: caseId, // Add the case ID to the report data
          fullName: this.fraudForm.value.fullName || '',
          email: this.fraudForm.value.email || '',
          victimWallet: this.fraudForm.value.victimWallet || '',
          scammerWallet: this.fraudForm.value.scammerWallet || '',
          exchangePlatform: this.fraudForm.value.exchangePlatform || '',
          tokenName: this.fraudForm.value.tokenName || '',
          amountLost: parseFloat(this.fraudForm.value.amountLost) || 0,
          incidentDescription: this.fraudForm.value.incidentDescription || '',
          evidenceUrls: this.fraudForm.value.evidenceUrls || '',
          reportDate: new Date(), // Add the current date
          status: 'submitted' // Set initial status
        };
        
        // Log files for debugging
        console.log('Files to upload:', this.selectedFiles);
        console.log('Generated case ID:', caseId);
        
        // Use timeout to ensure any pending operations complete
        setTimeout(() => {
          // Navigate to the case investigation page with the case ID as a query parameter
          this.router.navigate(['/case-investigation'], { 
            queryParams: { case: caseId },
            state: { reportData }
          });
        }, 100);
      } catch (error) {
        console.error('Navigation error:', error);
        this.isSubmitting = false;
        this.submitError = 'An error occurred while processing your form. Please try again.';
      }
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.fraudForm.controls).forEach(key => {
        const control = this.fraudForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
