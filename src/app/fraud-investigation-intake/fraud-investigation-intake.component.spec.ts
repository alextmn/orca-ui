import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FraudInvestigationIntakeComponent } from './fraud-investigation-intake.component';

describe('FraudInvestigationIntakeComponent', () => {
  let component: FraudInvestigationIntakeComponent;
  let fixture: ComponentFixture<FraudInvestigationIntakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FraudInvestigationIntakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FraudInvestigationIntakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
