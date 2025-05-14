import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FraudInvestigationConsentComponent } from './fraud-investigation-consent.component';

describe('FraudInvestigationConsentComponent', () => {
  let component: FraudInvestigationConsentComponent;
  let fixture: ComponentFixture<FraudInvestigationConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FraudInvestigationConsentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FraudInvestigationConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
