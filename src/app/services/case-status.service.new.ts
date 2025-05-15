import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface CaseStatusUpdate {
  id: string;
  caseId: string;
  timestamp: Date;
  status: 'submitted' | 'under-review' | 'investigating' | 'escalated' | 'closed';
  comment: string;
  updatedBy: string;
}

export interface CaseDetails {
  caseId: string;
  status: 'submitted' | 'under-review' | 'investigating' | 'escalated' | 'closed';
  createdDate: Date;
  lastUpdated: Date;
  assignedTo?: string;
  statusUpdates: CaseStatusUpdate[];
}

@Injectable({
  providedIn: 'root'
})
export class CaseStatusService {
  private mockCases: { [key: string]: CaseDetails } = {
    '12234': {
      caseId: '12234',
      status: 'investigating',
      createdDate: new Date('2025-05-09T13:15:00'),
      lastUpdated: new Date('2025-05-14T10:30:00'),
      assignedTo: 'Thomas Reynolds',
      statusUpdates: [
        {
          id: 'update-001',
          caseId: '12234',
          timestamp: new Date('2025-05-09T13:15:00'),
          status: 'submitted',
          comment: 'Case submitted for investigation.',
          updatedBy: 'System'
        },
        {
          id: 'update-002',
          caseId: '12234',
          timestamp: new Date('2025-05-09T13:45:00'),
          status: 'submitted',
          comment: `## Automatic Case Assessment

### Risk Analysis Report

| Factor | Score | Details |
|--------|-------|--------|
| Transaction Pattern | High | Multiple small transactions followed by one large withdrawal |
| Wallet Age | High | Destination wallet created within last 24 hours |
| Known Patterns | High | Similar to NFT fraud cases #FR-2025-089, #FR-2025-142 |

### On-Chain Analysis

- Funds traced to exchange hot wallet
- 3 hops between victim and final destination
- Connected to 5 other recent victim wallets

**Recommendation:** Prioritize for manual review due to high correlation with known scam patterns.`,
          updatedBy: 'Automatic Assessment System'
        },
        {
          id: 'update-003',
          caseId: '12234',
          timestamp: new Date('2025-05-09T15:30:00'),
          status: 'submitted',
          comment: `## Blockchain Forensics Report

### Transaction Analysis

\`\`\`
Victim Wallet → 0x7a23... → 0x9b45... → 0x3f67... → Exchange
\`\`\`

### Key Findings

- **Scammer Wallet**: 0x9b45... has been involved in 12 similar incidents
- **Mixing Service**: Evidence of funds passing through Tornado Cash
- **Exchange Deposit**: Final destination identified as Binance hot wallet

### Similar Cases

| Case ID | Status | Similarity |
|---------|--------|------------|
| FR-2025-089 | Closed | 87% |
| FR-2025-142 | Investigating | 92% |
| FR-2025-201 | Escalated | 78% |

**Action Taken**: Exchange notification sent to freeze funds. Case escalation recommended.`,
          updatedBy: 'Blockchain Forensics Bot'
        },
        {
          id: 'update-004',
          caseId: '12234',
          timestamp: new Date('2025-05-10T09:30:00'),
          status: 'under-review',
          comment: 'Case has been assigned to the NFT fraud team and is under initial review.',
          updatedBy: 'Alex Chen'
        },
        {
          id: 'update-005',
          caseId: '12234',
          timestamp: new Date('2025-05-12T14:45:00'),
          status: 'investigating',
          comment: '**Investigation Progress:**\n\n- Identified the scammer wallet and tracked transaction history\n- Found similar scam patterns affecting 12 other victims\n- Contacted OpenSea security team to report the fraudulent collection\n- Analyzing smart contract used in the attack\n\nNext steps: Coordinate with blockchain forensics team to trace fund movements.',
          updatedBy: 'Thomas Reynolds'
        },
        {
          id: 'update-006',
          caseId: '12234',
          timestamp: new Date('2025-05-14T10:30:00'),
          status: 'investigating',
          comment: '**Update on Investigation:**\n\n- OpenSea has flagged the malicious collection and accounts\n- Identified exchange deposits of stolen ETH to Binance and Kraken\n- Submitted requests to both exchanges to freeze suspicious accounts\n- Compiled evidence for potential law enforcement referral\n\nWill update when we hear back from the exchanges. Estimated timeframe: 3-5 business days.',
          updatedBy: 'Thomas Reynolds'
        }
      ]
    },
    'FR-2025-001': {
      caseId: 'FR-2025-001',
      status: 'investigating',
      createdDate: new Date('2025-05-10T14:30:00'),
      lastUpdated: new Date('2025-05-12T09:15:00'),
      assignedTo: 'Sarah Johnson',
      statusUpdates: [
        {
          id: 'update-001',
          caseId: 'FR-2025-001',
          timestamp: new Date('2025-05-10T14:30:00'),
          status: 'submitted',
          comment: 'Case submitted for investigation.',
          updatedBy: 'System'
        },
        {
          id: 'update-002',
          caseId: 'FR-2025-001',
          timestamp: new Date('2025-05-10T15:00:00'),
          status: 'submitted',
          comment: `## Automatic Case Assessment

### Risk Analysis Report

| Factor | Score | Details |
|--------|-------|--------|
| Transaction Pattern | Medium | Single large transaction |
| Wallet Age | Medium | Destination wallet created 2 weeks ago |
| Known Patterns | Low | Limited similarity to known scams |

### On-Chain Analysis

- Direct transfer to exchange wallet
- No mixing or obfuscation detected
- No connection to other victim wallets

**Recommendation:** Standard review process.`,
          updatedBy: 'Automatic Assessment System'
        },
        {
          id: 'update-003',
          caseId: 'FR-2025-001',
          timestamp: new Date('2025-05-11T10:45:00'),
          status: 'under-review',
          comment: 'Case has been assigned and is under initial review.',
          updatedBy: 'Sarah Johnson'
        },
        {
          id: 'update-004',
          caseId: 'FR-2025-001',
          timestamp: new Date('2025-05-12T09:15:00'),
          status: 'investigating',
          comment: '**Initial findings:**\n\n- Identified suspicious transactions on the blockchain\n- Traced funds to exchange wallet\n- Contacting exchange for additional information\n\nWill update once we hear back from the exchange.',
          updatedBy: 'Sarah Johnson'
        }
      ]
    },
    'FR-2025-002': {
      caseId: 'FR-2025-002',
      status: 'under-review',
      createdDate: new Date('2025-05-12T09:15:00'),
      lastUpdated: new Date('2025-05-13T11:30:00'),
      assignedTo: 'Michael Chen',
      statusUpdates: [
        {
          id: 'update-001',
          caseId: 'FR-2025-002',
          timestamp: new Date('2025-05-12T09:15:00'),
          status: 'submitted',
          comment: 'Case submitted for investigation.',
          updatedBy: 'System'
        },
        {
          id: 'update-002',
          caseId: 'FR-2025-002',
          timestamp: new Date('2025-05-12T09:45:00'),
          status: 'submitted',
          comment: `## Automatic Case Assessment

### Risk Analysis Report

| Factor | Score | Details |
|--------|-------|--------|
| Transaction Pattern | High | Multiple rapid transfers between wallets |
| Wallet Age | Medium | Destination wallet created 1 month ago |
| Known Patterns | Medium | Similar to Discord scam cases |

### On-Chain Analysis

- Complex transfer pattern through multiple wallets
- Funds split across multiple destinations
- Connected to 2 other recent victim wallets

**Recommendation:** Prioritize review due to complex transaction pattern.`,
          updatedBy: 'Automatic Assessment System'
        },
        {
          id: 'update-003',
          caseId: 'FR-2025-002',
          timestamp: new Date('2025-05-13T11:30:00'),
          status: 'under-review',
          comment: 'Case assigned to Discord scam investigation team. Initial review in progress.',
          updatedBy: 'Michael Chen'
        }
      ]
    },
    'FR-2025-003': {
      caseId: 'FR-2025-003',
      status: 'closed',
      createdDate: new Date('2025-05-01T10:45:00'),
      lastUpdated: new Date('2025-05-08T16:45:00'),
      assignedTo: 'Emily Rodriguez',
      statusUpdates: [
        {
          id: 'update-001',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-01T10:45:00'),
          status: 'submitted',
          comment: 'Case submitted for investigation.',
          updatedBy: 'System'
        },
        {
          id: 'update-002',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-01T11:15:00'),
          status: 'submitted',
          comment: `## Automatic Case Assessment

### Risk Analysis Report

| Factor | Score | Details |
|--------|-------|--------|
| Transaction Pattern | High | Complex multi-step transaction |
| Wallet Age | High | Multiple new wallets in transaction chain |
| Known Patterns | High | Matches airdrop scam pattern |

### On-Chain Analysis

- Funds passed through 7 different wallets
- Evidence of mixing service usage
- Connected to 15 other victim wallets

**Recommendation:** High priority case - immediate escalation recommended.`,
          updatedBy: 'Automatic Assessment System'
        },
        {
          id: 'update-003',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-02T13:10:00'),
          status: 'under-review',
          comment: 'Beginning review of the case details.',
          updatedBy: 'Emily Rodriguez'
        },
        {
          id: 'update-004',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-03T09:30:00'),
          status: 'investigating',
          comment: 'Identified suspicious wallet activity. Tracing transaction flow.',
          updatedBy: 'Emily Rodriguez'
        },
        {
          id: 'update-005',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-05T14:20:00'),
          status: 'escalated',
          comment: '**Escalation Notice**\n\nThis case has been escalated to our advanced investigation team due to:\n\n1. Large transaction amount\n2. Potential connection to known scam ring\n3. Multiple victims identified\n\nWe will be coordinating with law enforcement on this matter.',
          updatedBy: 'Emily Rodriguez'
        },
        {
          id: 'update-006',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-08T16:45:00'),
          status: 'closed',
          comment: '**Case Resolution Summary**\n\n- Successfully identified scammer wallet network\n- Coordinated with exchange to freeze remaining funds\n- Recovered approximately 35% of stolen assets\n- Provided evidence to law enforcement\n\nFunds will be returned to victim wallet within 5-7 business days. Case is now closed.',
          updatedBy: 'Advanced Investigation Team'
        }
      ]
    }
  };

  constructor() { }

  /**
   * Get case details by case ID
   * @param caseId The case ID to look up
   * @returns Observable with case details or null if not found
   */
  getCaseDetails(caseId: string): Observable<CaseDetails | null> {
    const caseDetails = this.mockCases[caseId];
    
    if (caseDetails) {
      return of(caseDetails).pipe(delay(800));
    } else {
      // Generate dynamic mock data for any case ID
      const now = new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(now.getDate() - 3);
      
      // Create timestamps for automatic assessments
      const autoAssessment1Time = new Date(threeDaysAgo.getTime() + 30 * 60000); // 30 minutes after submission
      const autoAssessment2Time = new Date(threeDaysAgo.getTime() + 2 * 60 * 60000); // 2 hours after submission
      
      const dynamicCase: CaseDetails = {
        caseId: caseId,
        status: 'under-review',
        createdDate: threeDaysAgo,
        lastUpdated: now,
        assignedTo: 'Alex Chen',
        statusUpdates: [
          {
            id: `update-${Math.floor(Math.random() * 10000)}`,
            caseId: caseId,
            timestamp: threeDaysAgo,
            status: 'submitted',
            comment: 'Case submitted for investigation.',
            updatedBy: 'System'
          },
          {
            id: `update-${Math.floor(Math.random() * 10000)}`,
            caseId: caseId,
            timestamp: autoAssessment1Time,
            status: 'submitted',
            comment: `## Automatic Case Assessment

### Risk Analysis Report

| Factor | Score | Details |
|--------|-------|--------|
| Transaction Pattern | Medium | Multiple small transactions followed by one large withdrawal |
| Wallet Age | High | Destination wallet created within last 24 hours |
| Known Patterns | Medium | Similar to NFT fraud cases #FR-2025-089, #FR-2025-142 |

### On-Chain Analysis

- Funds traced to exchange hot wallet
- 3 hops between victim and final destination
- Connected to 5 other recent victim wallets

**Recommendation:** Prioritize for manual review due to high correlation with known scam patterns.`,
            updatedBy: 'Automatic Assessment System'
          },
          {
            id: `update-${Math.floor(Math.random() * 10000)}`,
            caseId: caseId,
            timestamp: autoAssessment2Time,
            status: 'submitted',
            comment: `## Blockchain Forensics Report

### Transaction Analysis

\`\`\`
Victim Wallet → 0x7a23... → 0x9b45... → 0x3f67... → Exchange
\`\`\`

### Key Findings

- **Scammer Wallet**: 0x9b45... has been involved in 12 similar incidents
- **Mixing Service**: Evidence of funds passing through Tornado Cash
- **Exchange Deposit**: Final destination identified as Binance hot wallet

### Similar Cases

| Case ID | Status | Similarity |
|---------|--------|------------|
| FR-2025-089 | Closed | 87% |
| FR-2025-142 | Investigating | 92% |
| FR-2025-201 | Escalated | 78% |

**Action Taken**: Exchange notification sent to freeze funds. Case escalation recommended.`,
            updatedBy: 'Blockchain Forensics Bot'
          },
          {
            id: `update-${Math.floor(Math.random() * 10000)}`,
            caseId: caseId,
            timestamp: now,
            status: 'under-review',
            comment: 'Case has been assigned to the fraud investigation team and is currently under review. We will update you with our findings shortly.',
            updatedBy: 'Alex Chen'
          }
        ]
      };
      
      // Add to mock cases for future reference
      this.mockCases[caseId] = dynamicCase;
      
      return of(dynamicCase).pipe(delay(800));
    }
  }

  /**
   * Add a new status update to a case
   * @param caseId The case ID
   * @param status The new status
   * @param comment The comment for the update
   * @param updatedBy Who made the update
   * @returns Observable with the updated case details
   */
  addStatusUpdate(
    caseId: string, 
    status: 'submitted' | 'under-review' | 'investigating' | 'escalated' | 'closed',
    comment: string,
    updatedBy: string
  ): Observable<CaseDetails> {
    const caseDetails = this.mockCases[caseId];
    
    if (caseDetails) {
      const newUpdate: CaseStatusUpdate = {
        id: `update-${Math.floor(Math.random() * 10000)}`,
        caseId,
        timestamp: new Date(),
        status,
        comment,
        updatedBy
      };
      
      caseDetails.statusUpdates.push(newUpdate);
      caseDetails.status = status;
      caseDetails.lastUpdated = new Date();
      
      return of(caseDetails).pipe(delay(1000));
    } else {
      throw new Error('Case not found');
    }
  }

  /**
   * Create an initial case status entry for a new case
   * @param caseId The case ID
   * @param reporterName The name of the person who reported the case
   * @returns Observable with the created case details
   */
  createInitialCaseStatus(caseId: string, reporterName: string): Observable<CaseDetails> {
    const now = new Date();
    
    // Create a timestamp 5 minutes after submission for automatic assessment
    const assessmentTime = new Date(now.getTime() + 5 * 60000);
    
    const newCase: CaseDetails = {
      caseId,
      status: 'submitted',
      createdDate: now,
      lastUpdated: assessmentTime,
      statusUpdates: [
        {
          id: `update-${Math.floor(Math.random() * 10000)}`,
          caseId,
          timestamp: now,
          status: 'submitted',
          comment: `Case submitted by ${reporterName}. Awaiting review by our fraud investigation team.`,
          updatedBy: 'System'
        },
        {
          id: `update-${Math.floor(Math.random() * 10000)}`,
          caseId,
          timestamp: assessmentTime,
          status: 'submitted',
          comment: `## Automatic Case Assessment

### Risk Analysis Report

| Factor | Score | Details |
|--------|-------|--------|
| Transaction Pattern | Medium | Multiple small transactions followed by one large withdrawal |
| Wallet Age | High | Destination wallet created within last 24 hours |
| Known Patterns | Medium | Similar to NFT fraud cases #FR-2025-089, #FR-2025-142 |

### On-Chain Analysis

- Funds traced to exchange hot wallet
- 3 hops between victim and final destination
- Connected to 5 other recent victim wallets

**Recommendation:** Prioritize for manual review due to high correlation with known scam patterns.`,
          updatedBy: 'Automatic Assessment System'
        }
      ]
    };
    
    // Add to mock cases
    this.mockCases[caseId] = newCase;
    
    return of(newCase).pipe(delay(1000));
  }

  /**
   * Get all cases (for admin purposes)
   * @returns Observable with all cases
   */
  getAllCases(): Observable<CaseDetails[]> {
    return of(Object.values(this.mockCases)).pipe(delay(1000));
  }
}
