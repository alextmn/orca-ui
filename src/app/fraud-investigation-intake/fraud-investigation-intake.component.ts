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
  isAnonymous = false;
  private lastEmailValue: string = '';
  
  // Processing screen properties
  showProcessingScreen = false;
  processingSteps = [
    { text: 'Validating submission...', status: 'pending', delay: 1000 },
    { text: 'Analyzing on-chain activity...', status: 'pending', delay: 2500 },
    { text: 'Checking for similar cases...', status: 'pending', delay: 2000 },
    { text: 'Generating case profile...', status: 'pending', delay: 1500 },
    { text: 'Preparing investigation dashboard...', status: 'pending', delay: 2000 }
  ];
  caseId: string = '';
  reportData: any = null;
  
  // Multi-step form properties
  currentStep = 1;
  totalSteps = 5;
  stepTitles = [
    'Contact Information',
    'Incident Details',
    'Incident Description',
    'Supporting Evidence',
    'Terms and Consent'
  ];
  
  // Form validation status for each step
  stepValidation = {
    1: false, // Contact Information
    2: false, // Incident Details
    3: false, // Incident Description
    4: true,  // Supporting Evidence (optional)
    5: false  // Terms and Consent
  };
  
  constructor(
    private fb: FormBuilder,
    private fraudReportService: FraudReportService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadMockData();
    this.updateStepValidation();
    
    // Initialize progress bar CSS variables
    const root = document.documentElement;
    root.style.setProperty('--completed-steps', '0');
    root.style.setProperty('--total-steps', this.totalSteps.toString());
    
    // Subscribe to form value changes to update step validation
    this.fraudForm.valueChanges.subscribe(() => {
      this.updateStepValidation();
    });
  }
  
  initForm(): void {
    this.fraudForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      anonymousSubmission: [false],
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
  
  toggleAnonymous(): void {
    this.isAnonymous = this.fraudForm.get('anonymousSubmission')?.value === true;
    
    const emailControl = this.fraudForm.get('email');
    if (this.isAnonymous) {
      // Store the current email value temporarily
      this.lastEmailValue = emailControl?.value || '';
      // Set email to a placeholder value and disable validation
      emailControl?.setValue('anonymous@example.com');
      emailControl?.clearValidators();
    } else {
      // Restore the previous email value if available
      if (this.lastEmailValue) {
        emailControl?.setValue(this.lastEmailValue);
      } else {
        emailControl?.setValue('');
      }
      // Restore validators
      emailControl?.setValidators([Validators.required, Validators.email]);
    }
    // Update validation status
    emailControl?.updateValueAndValidity();
  }
  
  // Multi-step navigation methods
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo(0, 0);
      this.updateProgressBar();
    }
  }
  
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
      this.updateProgressBar();
    }
  }
  
  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      window.scrollTo(0, 0);
      this.updateProgressBar();
    }
  }
  
  isStepValid(step: number): boolean {
    return this.stepValidation[step as keyof typeof this.stepValidation];
  }
  
  updateStepValidation(): void {
    // Step 1: Contact Information
    this.stepValidation[1] = this.isAnonymous ? 
      this.fraudForm.get('fullName')?.valid === true :
      this.fraudForm.get('fullName')?.valid === true && 
      this.fraudForm.get('email')?.valid === true;
    
    // Step 2: Incident Details
    this.stepValidation[2] = 
      this.fraudForm.get('victimWallet')?.valid === true &&
      this.fraudForm.get('amountLost')?.valid === true;
    
    // Step 3: Incident Description
    this.stepValidation[3] = 
      this.fraudForm.get('incidentDescription')?.valid === true;
    
    // Step 4: Supporting Evidence (optional)
    this.stepValidation[4] = true;
    
    // Step 5: Terms and Consent
    this.stepValidation[5] = 
      this.fraudForm.get('shareDataConsent')?.value === true &&
      this.fraudForm.get('termsConsent')?.value === true;
      
    // Update progress bar CSS variables
    this.updateProgressBar();
  }
  
  updateProgressBar(): void {
    // Count completed steps
    let completedSteps = 0;
    for (let i = 1; i <= this.totalSteps; i++) {
      if (i < this.currentStep && this.stepValidation[i as keyof typeof this.stepValidation]) {
        completedSteps++;
      }
    }
    
    // Set CSS variables for the progress bar
    const root = document.documentElement;
    root.style.setProperty('--completed-steps', completedSteps.toString());
    root.style.setProperty('--total-steps', this.totalSteps.toString());
  }
  
  getStepCompletionStatus(step: number): 'complete' | 'current' | 'incomplete' | 'locked' {
    if (step < this.currentStep && this.isStepValid(step)) {
      return 'complete';
    } else if (step === this.currentStep) {
      return 'current';
    } else if (step < this.currentStep) {
      return 'incomplete';
    } else {
      // Check if all previous steps are valid
      let allPreviousValid = true;
      for (let i = 1; i < step; i++) {
        if (!this.isStepValid(i)) {
          allPreviousValid = false;
          break;
        }
      }
      return allPreviousValid ? 'incomplete' : 'locked';
    }
  }
  
  canProceedToNextStep(): boolean {
    return this.isStepValid(this.currentStep);
  }
  
  bothConsentsChecked(): boolean {
    const shareDataConsent = this.fraudForm.get('shareDataConsent')?.value;
    const termsConsent = this.fraudForm.get('termsConsent')?.value;
    return shareDataConsent === true && termsConsent === true;
  }
  
  onSubmit(): void {
    
    if (this.fraudForm.valid) {
      try {
        this.isSubmitting = true;
        
        // Generate a case ID
        this.caseId = `FR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        // Prepare the report data
        this.reportData = {
          id: this.caseId, // Add the case ID to the report data
          fullName: this.fraudForm.value.fullName || '',
          email: this.isAnonymous ? 'anonymous' : (this.fraudForm.value.email || ''),
          isAnonymous: this.isAnonymous,
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
        console.log('Generated case ID:', this.caseId);
        
        // Show processing screen and start the animation sequence
        this.showProcessingScreen = true;
        this.startProcessingAnimation();
        
      } catch (error) {
        console.error('Submission error:', error);
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
  
  // Processing screen animation methods
  startProcessingAnimation(): void {
    let totalDelay = 0;
    
    // Process each step with its own delay
    this.processingSteps.forEach((step, index) => {
      totalDelay += step.delay;
      
      // Set timeout for each step to change status
      setTimeout(() => {
        step.status = 'complete';
        
        // If this is the last step, navigate to the case investigation page after a short delay
        if (index === this.processingSteps.length - 1) {
          setTimeout(() => {
            this.navigateToCaseInvestigation();
          }, 1000);
        }
      }, totalDelay);
    });
  }
  
  navigateToCaseInvestigation(): void {
    // Navigate to the case investigation page with the case ID as a query parameter
    this.router.navigate(['/case-investigation'], { 
      queryParams: { case: this.caseId },
      state: { reportData: this.reportData }
    });
  }
  
  // Helper method to check if a processing step is the last one
  isLastProcessingStep(step: any): boolean {
    return this.processingSteps.indexOf(step) === this.processingSteps.length - 1;
  }
}
