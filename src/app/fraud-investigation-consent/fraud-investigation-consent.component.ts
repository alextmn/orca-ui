import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fraud-investigation-consent',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './fraud-investigation-consent.component.html',
  styleUrls: ['./fraud-investigation-consent.component.scss']
})
export class FraudInvestigationConsentComponent {
  consentChecked = false;
  
  updateConsent(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.consentChecked = checkbox.checked;
  }
}
