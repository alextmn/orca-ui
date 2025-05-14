import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  get userName(): string {
    const user = this.userService.getCurrentUser();
    return user ? user.name : 'User';
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
