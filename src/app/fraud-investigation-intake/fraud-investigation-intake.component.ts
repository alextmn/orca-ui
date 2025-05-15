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
      this.selectedFiles = Array.from(input.files);
    }
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
          // Navigate to the case investigation page
          this.router.navigate(['/case-investigation'], { 
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
