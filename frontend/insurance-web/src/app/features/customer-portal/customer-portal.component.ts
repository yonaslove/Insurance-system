import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InsuranceDataService } from '../../core/services/insurance-data.service';
import { Policy, PolicyCreateRequest } from '../../core/models/policy.model';
import { Claim, ClaimCreateRequest } from '../../core/models/claim.model';
import { Payment } from '../../core/models/payment.model';
import { UserProfile } from '../../core/models/user.model';
import { Customer } from '../../core/models/customer.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-customer-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './customer-portal.component.html',
  styleUrl: './customer-portal.component.css'
})
export class CustomerPortalComponent implements OnInit {
  private authService = inject(AuthService);
  public insuranceData = inject(InsuranceDataService);

  user: UserProfile | null = null;
  activeTab: 'policies' | 'apply-policy' | 'file-claim' | 'claims' | 'payments' | 'kyc-profile' = 'policies';

  newClaim: ClaimCreateRequest = {
    policyId: '',
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
    claimedAmount: 0
  };

  claimCategory = 'AUTO_COLLISION';
  incidentLocation = '';
  policeReportNumber = '';

  // New policy application form
  selectedProductId = '';
  policyCoverageLimit = 50000;
  policyNotes = '';

  successMessage = '';
  claimError = '';
  policyError = '';

  ngOnInit() {
    this.user = this.authService.currentUser();
    this.insuranceData.loadAll();
  }

  get currentCustomer(): Customer | undefined {
    if (this.user?.customerId) {
      return this.insuranceData.customers().find(c => c.id === this.user?.customerId);
    }
    // Also try matching by email
    if (this.user?.email) {
      return this.insuranceData.customers().find(c => c.email.toLowerCase() === this.user?.email.toLowerCase());
    }
    return undefined;
  }

  get status(): string {
    const c = this.currentCustomer;
    if (c) return c.status;
    return this.user?.status || 'ACTIVE';
  }

  get isApproved(): boolean {
    return this.status === 'ACTIVE';
  }

  get isPendingApproval(): boolean {
    return this.status === 'PENDING_APPROVAL';
  }

  get isRejected(): boolean {
    return this.status === 'REJECTED';
  }

  get customerNumber(): string {
    const c = this.currentCustomer;
    if (c) return c.customerNumber;
    return 'CUST-REGISTERED';
  }

  get availableProducts(): Product[] {
    return this.insuranceData.products().filter(p => p.active);
  }

  get myPolicies(): Policy[] {
    const all = this.insuranceData.policies();
    const custId = this.currentCustomer?.id || this.user?.customerId;
    if (custId) {
      return all.filter(p => p.customerId === custId);
    }
    return all;
  }

  get myClaims(): Claim[] {
    const all = this.insuranceData.claims();
    const policyIds = new Set(this.myPolicies.map(p => p.id));
    if (policyIds.size > 0) {
      return all.filter(c => policyIds.has(c.policyId));
    }
    return all;
  }

  get myPayments(): Payment[] {
    const all = this.insuranceData.payments();
    const policyIds = new Set(this.myPolicies.map(p => p.id));
    if (policyIds.size > 0) {
      return all.filter(pay => policyIds.has(pay.policyId));
    }
    return all;
  }

  initiateClaimForPolicy(policyId: string) {
    this.newClaim.policyId = policyId;
    this.activeTab = 'file-claim';
  }

  applyForPolicy() {
    this.policyError = '';

    if (!this.isApproved) {
      this.policyError = 'Your customer account must be approved by Customer Care before applying for new policies.';
      return;
    }

    if (!this.selectedProductId) {
      this.policyError = 'Please select an insurance product.';
      return;
    }

    const custId = this.currentCustomer?.id || this.user?.customerId;
    if (!custId) {
      this.policyError = 'No verified customer record found.';
      return;
    }

    const prod = this.availableProducts.find(p => p.id === this.selectedProductId);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1);

    const req: PolicyCreateRequest = {
      customerId: custId,
      productId: this.selectedProductId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      premiumAmount: prod ? prod.basePremium * 12 : 1200,
      currency: 'USD'
    };

    this.insuranceData.addPolicy(req);
    this.successMessage = `Policy for ${prod?.name || 'Insurance'} issued successfully! You are now covered.`;
    this.activeTab = 'policies';
    this.selectedProductId = '';
  }

  submitClaim() {
    this.claimError = '';

    if (!this.isApproved) {
      this.claimError = 'Your customer account is currently pending KYC verification. Claims cannot be filed until account approval.';
      return;
    }

    if (!this.newClaim.policyId || !this.newClaim.incidentDate || !this.newClaim.description || this.newClaim.claimedAmount <= 0) {
      this.claimError = 'Please complete all required fields and enter a valid claimed damage amount.';
      return;
    }

    const fullDesc = `[Category: ${this.claimCategory}] [Location: ${this.incidentLocation || 'N/A'}] [Police/Doc Ref: ${this.policeReportNumber || 'N/A'}] ${this.newClaim.description}`;

    const payload: ClaimCreateRequest = {
      policyId: this.newClaim.policyId,
      incidentDate: this.newClaim.incidentDate,
      description: fullDesc,
      claimedAmount: this.newClaim.claimedAmount
    };

    this.insuranceData.addClaim(payload);
    this.successMessage = `Claim submitted successfully! Reference has entered the Claims Officer adjudication queue for loss verification.`;
    this.activeTab = 'claims';

    // Reset claim form
    this.newClaim = {
      policyId: '',
      incidentDate: new Date().toISOString().split('T')[0],
      description: '',
      claimedAmount: 0
    };
    this.incidentLocation = '';
    this.policeReportNumber = '';
  }
}
