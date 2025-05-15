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
          timestamp: new Date('2025-05-11T10:45:00'),
          status: 'under-review',
          comment: 'Case has been assigned and is under initial review.',
          updatedBy: 'Sarah Johnson'
        },
        {
          id: 'update-003',
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
          id: 'update-004',
          caseId: 'FR-2025-002',
          timestamp: new Date('2025-05-12T09:15:00'),
          status: 'submitted',
          comment: 'Case submitted for investigation.',
          updatedBy: 'System'
        },
        {
          id: 'update-005',
          caseId: 'FR-2025-002',
          timestamp: new Date('2025-05-13T11:30:00'),
          status: 'under-review',
          comment: 'Beginning initial assessment of the reported fraud incident. Will be analyzing transaction patterns and identifying potential recovery options.',
          updatedBy: 'Michael Chen'
        }
      ]
    },
    'FR-2025-003': {
      caseId: 'FR-2025-003',
      status: 'closed',
      createdDate: new Date('2025-05-01T08:20:00'),
      lastUpdated: new Date('2025-05-08T16:45:00'),
      assignedTo: 'Emily Rodriguez',
      statusUpdates: [
        {
          id: 'update-006',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-01T08:20:00'),
          status: 'submitted',
          comment: 'Case submitted for investigation.',
          updatedBy: 'System'
        },
        {
          id: 'update-007',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-02T13:10:00'),
          status: 'under-review',
          comment: 'Beginning review of the case details.',
          updatedBy: 'Emily Rodriguez'
        },
        {
          id: 'update-008',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-03T09:30:00'),
          status: 'investigating',
          comment: 'Identified suspicious wallet activity. Tracing transaction flow.',
          updatedBy: 'Emily Rodriguez'
        },
        {
          id: 'update-009',
          caseId: 'FR-2025-003',
          timestamp: new Date('2025-05-05T14:20:00'),
          status: 'escalated',
          comment: '**Escalation Notice**\n\nThis case has been escalated to our advanced investigation team due to:\n\n1. Large transaction amount\n2. Potential connection to known scam ring\n3. Multiple victims identified\n\nWe will be coordinating with law enforcement on this matter.',
          updatedBy: 'Emily Rodriguez'
        },
        {
          id: 'update-010',
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
      return of(null).pipe(delay(800));
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
    const newCase: CaseDetails = {
      caseId,
      status: 'submitted',
      createdDate: now,
      lastUpdated: now,
      statusUpdates: [
        {
          id: `update-${Math.floor(Math.random() * 10000)}`,
          caseId,
          timestamp: now,
          status: 'submitted',
          comment: `Case submitted by ${reporterName}. Awaiting review by our fraud investigation team.`,
          updatedBy: 'System'
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
