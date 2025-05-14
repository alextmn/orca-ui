import { Injectable } from '@angular/core';

export interface User {
  id: number;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: User | null = null;
  
  // Mock user database
  private users = [
    { id: 1, email: 'user@example.com', password: 'password123', name: 'Test User' },
    { id: 2, email: 'admin@example.com', password: 'admin123', name: 'Admin User' }
  ];

  constructor() { }

  login(email: string, password: string): boolean {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Create a user object without the password
      this.currentUser = {
        id: user.id,
        email: user.email,
        name: user.name
      };
      return true;
    }
    
    return false;
  }

  logout(): void {
    this.currentUser = null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
