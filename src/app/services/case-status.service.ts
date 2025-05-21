import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ReportLink {
  id: string;
  title: string;
  icon: string;
  reportType: string;
}

export interface CaseStatusUpdate {
  id: string;
  caseId: string;
  timestamp: Date;
  status: 'Processing' | 'Report Finalized' | 'Shared with Stakeholders' | 'Report Filed';
  description: string;
  updatedBy: string;
  reportLinks?: ReportLink[];
  markdownFileIds?: string[];
}

export interface MarkdownFile {
  id: string;
  title: string;
  content: string;
  type: string;
  createdDate: Date;
}

export interface CaseDetails {
  caseId: string;
  status: 'submitted' | 'under-review' | 'investigating' | 'escalated' | 'closed';
  createdDate: Date;
  lastUpdated: Date;
  assignedTo?: string;
  statusUpdates: CaseStatusUpdate[];
  markdownFileIds?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CaseStatusService {
  private mockFiles: { [id: string]: MarkdownFile } = {
    'update-002': {
      id: 'update-002',
      title: 'Automatic Case Assessment',
      content: `## Automatic Case Assessment

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
      type: 'automatic-assessment',
      createdDate: new Date('2025-05-09T13:45:00')
    },
    'update-003': {
      id: 'update-003',
      title: 'Blockchain Forensics Report',
      content: `## Blockchain Forensics Report

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
      type: 'blockchain-forensics',
      createdDate: new Date('2025-05-09T15:30:00')
    },
    'update-006': {
      id: 'update-006',
      title: 'Investigation Progress Report',
      content: `**Investigation Progress:**

- Identified the scammer wallet and tracked transaction history
- Found similar scam patterns affecting 12 other victims
- Contacted OpenSea security team to report the fraudulent collection
- Analyzing smart contract used in the attack

Next steps: Coordinate with blockchain forensics team to trace fund movements.`,
      type: 'investigation-update',
      createdDate: new Date('2025-05-14T10:30:00')
    },
    'assessment-report': {
      id: 'assessment-report',
      title: 'Automatic Case Assessment',
      content: `## Automatic Case Assessment

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
      type: 'automatic-assessment',
      createdDate: new Date('2025-05-18T10:30:00')
    },
    'forensics-report': {
      id: 'forensics-report',
      title: 'Blockchain Forensics Report',
      content: `## Blockchain Forensics Report

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
      type: 'blockchain-forensics',
      createdDate: new Date('2025-05-18T11:45:00')
    },
    'police-report': {
      id: 'police-report',
      title: 'Police Report Template',
      content: `## Police Report Template

### Victim Information

- **Name**: [Victim Name]
- **Contact**: [Phone/Email]
- **Wallet Address**: [Victim Wallet Address]

### Incident Details

- **Date of Incident**: ${new Date().toLocaleDateString()}
- **Type of Fraud**: Cryptocurrency Scam
- **Amount Lost**: [Amount] [Currency]
- **Platform**: [Exchange/DApp Name]

### Description of Incident

[Provide a detailed account of how the fraud occurred, including any communication with the perpetrator, websites visited, or applications used.]

### Evidence

- Transaction IDs: [List of relevant transaction hashes]
- Screenshots: [Description of any visual evidence]
- Communication logs: [Description of any messages, emails, etc.]

### Suspect Information (if known)

- Wallet Addresses: [List of suspect wallets]
- Username/Alias: [Any online identifiers]
- Website/Platform: [Where the scam originated]

### Action Taken

- Reported to exchange on [Date]
- Contacted blockchain analytics firm on [Date]
- [Any other steps taken]

### Officer Information

- **Name**: Officer [Name]
- **Badge Number**: [Number]
- **Department**: Cyber Crime Division
- **Contact**: [Phone/Email]
- **Case Reference**: [Police Case Number]

---

*This document serves as a template for filing a police report related to cryptocurrency fraud. Please complete all fields with accurate information before submitting to law enforcement.*`,
      type: 'police-report',
      createdDate: new Date('2025-05-18T12:00:00')
    }
  };

  private mockCases: { [key: string]: CaseDetails } = {
    '12234': {
      caseId: '12234',
      status: 'investigating',
      createdDate: new Date('2025-05-09T13:15:00'),
      lastUpdated: new Date('2025-05-14T10:30:00'),
      assignedTo: 'Thomas Reynolds',
      markdownFileIds: ['update-002'],
      statusUpdates: [
        {
          id: 'update-001',
          caseId: '12234',
          timestamp: new Date('2025-05-09T13:15:00'),
          status: 'Processing',
          description: 'Your submission has been received and data is being analyzed. ',
          updatedBy: 'System',
        },
        {
          id: 'update-004',
          caseId: '12234',
          timestamp: new Date('2025-05-10T09:30:00'),
          status: 'Report Finalized',
          description: 'Investigative findings have been compiled',
          updatedBy: 'System',
          markdownFileIds: ['update-002',"update-003","assessment-report"],

        },
        {
          id: 'update-005',
          caseId: '12234',
          timestamp: new Date('2025-05-12T14:45:00'),
          status: 'Shared with Stakeholders',
          description: 'Sent to law enforcement, exchange, bank or other trusted parties',
          updatedBy: 'Thomas Reynolds',
          markdownFileIds: ["police-report", "forensics-report"],
        },
        {
          id: 'update-006',
          caseId: '12234',
          timestamp: new Date('2025-05-14T10:30:00'),
          status: 'Report Filed',
          description: ' Download a copy of your report',
          updatedBy: 'Thomas Reynolds',
          markdownFileIds: ["forensics-report"],
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
    return of(this.mockCases["12234"]).pipe(delay(1000));
  }

  /**
   * Create an initial case status entry for a new case
   * @param caseId The case ID
   * @param reporterName The name of the person who reported the case
   * @returns Observable with the created case details
   */
  createInitialCaseStatus(caseId: string, reporterName: string): Observable<CaseDetails> {
    return of(this.mockCases["12234"]).pipe(delay(1000));
  }

  

  /**
   * Get all cases (for admin purposes)
   * @returns Observable with all cases
   */
  getAllCases(): Observable<CaseDetails[]> {
    return of(Object.values(this.mockCases)).pipe(delay(1000));
  }

  /**
   * Get markdown file content by file ID
   * @param fileId The markdown file ID to retrieve
   * @returns Observable with the markdown file or null if not found
   */
  getMdFile(fileId: string): Observable<MarkdownFile | null> {
    const markdownFile = this.mockFiles[fileId];
    if (markdownFile) {
      return of(markdownFile).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }
}
