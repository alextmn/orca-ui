import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { FraudInvestigationIntakeComponent } from './fraud-investigation-intake/fraud-investigation-intake.component';
import { FraudInvestigationConsentComponent } from './fraud-investigation-consent/fraud-investigation-consent.component';
import { SubmitForInvestigationComponent } from './submit-for-investigation/submit-for-investigation.component';
import { inject } from '@angular/core';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';

// Auth guard function
const authGuard = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  if (userService.isLoggedIn()) {
    return true;
  }
  
  return router.parseUrl('/login');
};

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [() => authGuard()]
  },
  { path: 'fraud-investigation-consent', component: FraudInvestigationConsentComponent },
  { path: 'fraud-investigation-intake', component: FraudInvestigationIntakeComponent },
  { path: 'submit-for-investigation', component: SubmitForInvestigationComponent },
  { path: '**', redirectTo: '/' }
];
