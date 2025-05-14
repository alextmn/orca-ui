import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
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
  { path: '**', redirectTo: '/' }
];
