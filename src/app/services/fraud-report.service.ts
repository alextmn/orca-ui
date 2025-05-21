import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface FraudReport {
  id?: string;
  fullName: string;
  email: string;
  isAnonymous?: boolean;
  victimWallet: string;
  scammerWallet?: string;
  exchangePlatform?: string;
  tokenName?: string;
  amountLost: number;
  incidentDescription: string;
  evidenceUrls?: string;
  reportDate?: Date;
  status?: 'submitted' | 'under-review' | 'investigating' | 'escalated' | 'closed';
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
    },
    {
      id: 'FR-2025-003',
      fullName: 'Michael Johnson',
      email: 'michael.johnson@example.com',
      victimWallet: '0x5678901234abcdef5678901234abcdef56789012',
      scammerWallet: '0x1234abcdef5678901234abcdef5678901234abcd',
      exchangePlatform: 'Coinbase',
      tokenName: 'ETH, LINK',
      amountLost: 12.75,
      incidentDescription: 'I participated in what I thought was an official airdrop for a new token. After connecting my wallet to the site, my ETH and LINK tokens were transferred out immediately.',
      evidenceUrls: 'https://example.com/airdrop-scam.png\nhttps://example.com/transaction-log.pdf',
      reportDate: new Date('2025-05-08T11:20:00'),
      status: 'escalated'
    },
    {
      id: 'FR-2025-004',
      fullName: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      victimWallet: '0xabcdef1234567890abcdef1234567890abcdef12',
      scammerWallet: '0x2345678901abcdef2345678901abcdef23456789',
      exchangePlatform: 'Kraken',
      tokenName: 'BTC, SOL',
      amountLost: 1.2,
      incidentDescription: 'I received a phishing email that looked exactly like Kraken support. I entered my credentials on the fake site, and the attacker gained access to my account and withdrew my funds.',
      reportDate: new Date('2025-05-05T15:45:00'),
      status: 'closed'
    },
    {
      id: 'FR-2025-005',
      fullName: 'David Brown',
      email: 'david.brown@example.com',
      victimWallet: '0x3456789012abcdef3456789012abcdef34567890',
      scammerWallet: '0x6789012345abcdef6789012345abcdef67890123',
      exchangePlatform: 'Metamask',
      tokenName: 'ETH, USDC',
      amountLost: 8500,
      incidentDescription: 'I was contacted by someone claiming to be from Metamask support on Telegram. They asked me to provide my seed phrase to fix a synchronization issue. After I provided it, all my funds were transferred out.',
      evidenceUrls: 'https://example.com/telegram-chat.png',
      reportDate: new Date('2025-05-13T09:30:00'),
      status: 'submitted'
    },
    {
      id: 'FR-2025-006',
      fullName: 'Emily Davis',
      email: 'emily.davis@example.com',
      victimWallet: '0x7890123456abcdef7890123456abcdef78901234',
      scammerWallet: '0x4567890123abcdef4567890123abcdef45678901',
      exchangePlatform: 'PancakeSwap',
      tokenName: 'BNB, CAKE',
      amountLost: 3200,
      incidentDescription: 'I tried to swap tokens on what I thought was PancakeSwap, but it was a fake site. When I approved the contract, it took all my BNB and CAKE tokens instead of performing the swap I requested.',
      reportDate: new Date('2025-05-11T16:20:00'),
      status: 'under-review'
    },
    {
      id: '12234',
      fullName: 'Robert Wilson',
      email: 'robert.wilson@example.com',
      victimWallet: '0x9012345678abcdef9012345678abcdef90123456',
      scammerWallet: '0x8901234567abcdef8901234567abcdef89012345',
      exchangePlatform: 'OpenSea',
      tokenName: 'ETH, NFTs',
      amountLost: 15000,
      incidentDescription: 'I received a message about an exclusive NFT drop. The site asked me to sign a transaction to mint the NFT, but instead it transferred all my NFTs and ETH to another wallet.',
      evidenceUrls: 'https://example.com/nft-scam.png\nhttps://example.com/wallet-transactions.pdf',
      reportDate: new Date('2025-05-09T13:15:00'),
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
  getReportById(id: string): Observable<FraudReport | null> {
    const report = this.mockReports.find(r => r.id === id);
    
    if (report) {
      return of(report).pipe(delay(500)); // Simulate API delay
    } else {
      // Generate dynamic mock data for any case ID
      const dynamicReport: FraudReport = {
        id: id,
        fullName: 'Dynamic User',
        email: 'dynamic.user@example.com',
        victimWallet: '0x' + Math.random().toString(16).substring(2, 42),
        scammerWallet: '0x' + Math.random().toString(16).substring(2, 42),
        exchangePlatform: ['Binance', 'Coinbase', 'Kraken', 'Uniswap', 'OpenSea'][Math.floor(Math.random() * 5)],
        tokenName: ['ETH', 'BTC', 'USDT', 'SOL', 'NFT Collection'][Math.floor(Math.random() * 5)],
        amountLost: Math.floor(Math.random() * 10000) + 100,
        incidentDescription: 'This is a dynamically generated fraud report for demonstration purposes. The user reported a suspicious transaction that resulted in unauthorized access to their wallet.',
        evidenceUrls: 'https://example.com/evidence1.png\nhttps://example.com/evidence2.pdf',
        reportDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'under-review'
      };
      
      // Add to mock reports for future reference
      this.mockReports.push(dynamicReport);
      
      return of(dynamicReport).pipe(delay(800));
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
  
  /**
   * Updates the email address for a report
   * @param id The report ID
   * @param email The new email address
   * @returns An Observable of the updated FraudReport
   */
  updateReportEmail(id: string, email: string): Observable<FraudReport> {
    const reportIndex = this.mockReports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      return throwError(() => new Error(`Report with ID ${id} not found`));
    }
    
    // Update the email in the mock data
    this.mockReports[reportIndex].email = email;
    
    // Return the updated report
    return of(this.mockReports[reportIndex]).pipe(delay(800)); // Simulate API delay
  }
}
