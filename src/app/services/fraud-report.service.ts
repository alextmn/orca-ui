import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface FraudReport {
  id?: string;
  fullName: string;
  email: string;
  victimWallet: string;
  scammerWallet?: string;
  exchangePlatform?: string;
  tokenName?: string;
  amountLost: number;
  incidentDescription: string;
  evidenceUrls?: string;
  reportDate?: Date;
  status?: 'submitted' | 'under-review' | 'investigating' | 'closed';
}

@Injectable({
  providedIn: 'root'
})
export class FraudReportService {
  private mockReports: FraudReport[] = [
    {
      id: 'FR-2025-001',
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      victimWallet: '0x1234567890abcdef1234567890abcdef12345678, 0x9876543210fedcba9876543210fedcba98765432',
      scammerWallet: '0xabcdef1234567890abcdef1234567890abcdef12, 0xfedcba9876543210fedcba9876543210fedcba98',
      exchangePlatform: 'Binance',
      tokenName: 'BTC, ETH',
      amountLost: 2.5,
      incidentDescription: 'I received an email claiming to be from Binance support asking me to verify my wallet. After clicking the link and connecting my wallet, my funds were transferred out without my authorization.',
      evidenceUrls: 'https://example.com/screenshot1.png\nhttps://example.com/email.pdf',
      reportDate: new Date('2025-05-10T14:30:00'),
      status: 'under-review'
    },
    {
      id: 'FR-2025-002',
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      victimWallet: '0x9876543210fedcba9876543210fedcba98765432',
      scammerWallet: '0xfedcba9876543210fedcba9876543210fedcba98',
      exchangePlatform: 'Uniswap',
      tokenName: 'USDT, SHIB',
      amountLost: 5000,
      incidentDescription: 'I was approached on Discord by someone claiming to be a project developer. They convinced me to approve a smart contract that ended up draining my wallet.',
      reportDate: new Date('2025-05-12T09:15:00'),
      status: 'investigating'
    }
  ];

  constructor() { }

  /**
   * Submit a new fraud report
   * @param report The fraud report data
   * @returns An observable with the created report including ID
   */
  submitReport(report: FraudReport): Observable<FraudReport> {
    // Simulate API call with random success/failure
    const shouldSucceed = Math.random() > 0.2; // 80% success rate
    
    if (shouldSucceed) {
      const newReport: FraudReport = {
        ...report,
        id: `FR-2025-${this.mockReports.length + 1}`.padStart(10, '0'),
        reportDate: new Date(),
        status: 'submitted'
      };
      
      this.mockReports.push(newReport);
      
      // Simulate network delay
      return of(newReport).pipe(delay(1500));
    } else {
      // Simulate API error
      return throwError(() => new Error('Network error: Failed to submit report. Please try again later.')).pipe(delay(1500));
    }
  }

  /**
   * Get a list of all reports (would typically be admin-only)
   * @returns An observable with all fraud reports
   */
  getAllReports(): Observable<FraudReport[]> {
    // Simulate network delay
    return of(this.mockReports).pipe(delay(1000));
  }

  /**
   * Get a specific report by ID
   * @param id The report ID
   * @returns An observable with the found report or error
   */
  getReportById(id: string): Observable<FraudReport> {
    const report = this.mockReports.find(r => r.id === id);
    
    if (report) {
      return of(report).pipe(delay(800));
    } else {
      return throwError(() => new Error('Report not found')).pipe(delay(800));
    }
  }

  /**
   * Get reports by user email (would typically require authentication)
   * @param email The user's email
   * @returns An observable with the user's reports
   */
  getReportsByUser(email: string): Observable<FraudReport[]> {
    const reports = this.mockReports.filter(r => r.email.toLowerCase() === email.toLowerCase());
    return of(reports).pipe(delay(1000));
  }
}
