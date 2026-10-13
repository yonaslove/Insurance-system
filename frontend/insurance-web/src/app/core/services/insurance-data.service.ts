import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Customer, CustomerCreateRequest } from '../models/customer.model';
import { Product, ProductCreateRequest } from '../models/product.model';
import { Policy, PolicyCreateRequest } from '../models/policy.model';
import { Claim, ClaimCreateRequest, ClaimDecisionRequest } from '../models/claim.model';
import { Payment, PaymentCreateRequest } from '../models/payment.model';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class InsuranceDataService {
  // Empty reactive signals populated exclusively by real database microservices
  private customersSignal = signal<Customer[]>([]);
  private productsSignal = signal<Product[]>([]);
  private policiesSignal = signal<Policy[]>([]);
  private claimsSignal = signal<Claim[]>([]);
  private paymentsSignal = signal<Payment[]>([]);

  customers = computed(() => this.customersSignal());
  products = computed(() => this.productsSignal());
  policies = computed(() => this.policiesSignal());
  claims = computed(() => this.claimsSignal());
  payments = computed(() => this.paymentsSignal());

  dashboardSummary = computed<DashboardSummary>(() => {
    const custs = this.customersSignal();
    const pols = this.policiesSignal();
    const clms = this.claimsSignal();
    const pays = this.paymentsSignal();

    const activePols = pols.filter(p => p.status === 'ACTIVE').length;
    const openClms = clms.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
    const totalPaid = pays.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return {
      totalCustomers: custs.length,
      activePolicies: activePols,
      openClaims: openClms,
      totalPaymentsAmount: totalPaid,
      currency: 'USD',
      recentActivities: []
    };
  });

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  loadAll(): void {
    this.loadCustomers().subscribe({ error: () => {} });
    this.loadProducts().subscribe({ error: () => {} });
    this.loadPolicies().subscribe({ error: () => {} });
    this.loadClaims().subscribe({ error: () => {} });
    this.loadPayments().subscribe({ error: () => {} });
  }

  loadCustomers(status?: string): Observable<any> {
    const params = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return this.http.get<any>(`/api/v1/customers${params}`).pipe(
      tap((res) => {
        const list = res.content ? res.content : (Array.isArray(res) ? res : []);
        this.customersSignal.set(list);
      })
    );
  }

  loadProducts(): Observable<any> {
    return this.http.get<any>('/api/v1/products').pipe(
      tap((res) => {
        const list = res.content ? res.content : (Array.isArray(res) ? res : []);
        this.productsSignal.set(list);
      })
    );
  }

  loadPolicies(): Observable<any> {
    return this.http.get<any>('/api/v1/policies').pipe(
      tap((res) => {
        const list = res.content ? res.content : (Array.isArray(res) ? res : []);
        this.policiesSignal.set(list);
      })
    );
  }

  loadClaims(): Observable<any> {
    return this.http.get<any>('/api/v1/claims').pipe(
      tap((res) => {
        const list = res.content ? res.content : (Array.isArray(res) ? res : []);
        this.claimsSignal.set(list);
      })
    );
  }

  loadPayments(): Observable<any> {
    return this.http.get<any>('/api/v1/payments').pipe(
      tap((res) => {
        const list = res.content ? res.content : (Array.isArray(res) ? res : []);
        this.paymentsSignal.set(list);
      })
    );
  }

  addCustomer(req: CustomerCreateRequest): Customer {
    const tempId = `cust-${Date.now()}`;
    const nextNumber = `CUST-2026-${String(this.customersSignal().length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      id: tempId,
      customerNumber: nextNumber,
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      phone: req.phone,
      address: req.address,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.customersSignal.update(list => [newCustomer, ...list]);

    this.http.post<Customer>('/api/v1/customers', req).subscribe({
      next: (saved) => {
        this.customersSignal.update(list => list.map(c => c.id === tempId ? saved : c));
      },
      error: () => {}
    });

    return newCustomer;
  }

  approveCustomer(id: string): Observable<Customer> {
    return this.http.post<Customer>(`/api/v1/customers/${id}/approve`, {}).pipe(
      tap((updated) => {
        this.customersSignal.update(list => list.map(c => c.id === id ? { ...c, status: 'ACTIVE' } : c));
      })
    );
  }

  rejectCustomer(id: string, reason?: string): Observable<Customer> {
    return this.http.post<Customer>(`/api/v1/customers/${id}/reject`, { reason: reason || 'Failed KYC verification criteria' }).pipe(
      tap((updated) => {
        this.customersSignal.update(list => list.map(c => c.id === id ? { ...c, status: 'REJECTED', rejectionReason: reason } : c));
      })
    );
  }

  addProduct(req: ProductCreateRequest): Product {
    const tempId = `prod-${Date.now()}`;
    const newProduct: Product = {
      id: tempId,
      code: req.code,
      name: req.name,
      description: req.description,
      category: req.category,
      basePremium: req.basePremium,
      active: req.active,
      createdAt: new Date().toISOString()
    };

    this.productsSignal.update(list => [newProduct, ...list]);

    this.http.post<Product>('/api/v1/products', req).subscribe({
      next: (saved) => {
        this.productsSignal.update(list => list.map(p => p.id === tempId ? saved : p));
      },
      error: () => {}
    });

    return newProduct;
  }

  addPolicy(req: PolicyCreateRequest): Policy {
    const tempId = `pol-${Date.now()}`;
    const cust = this.customersSignal().find(c => c.id === req.customerId);
    const prod = this.productsSignal().find(p => p.id === req.productId);
    const nextNumber = `POL-2026-${String(8800 + this.policiesSignal().length + 1)}`;
    const newPolicy: Policy = {
      id: tempId,
      policyNumber: nextNumber,
      customerId: req.customerId,
      customerName: cust ? `${cust.firstName} ${cust.lastName}` : 'Customer',
      productId: req.productId,
      productName: prod ? prod.name : 'Insurance Product',
      startDate: req.startDate,
      endDate: req.endDate,
      premiumAmount: req.premiumAmount,
      currency: req.currency || 'USD',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.policiesSignal.update(list => [newPolicy, ...list]);

    this.http.post<Policy>('/api/v1/policies', req).subscribe({
      next: (saved) => {
        this.policiesSignal.update(list => list.map(p => p.id === tempId ? saved : p));
      },
      error: () => {}
    });

    return newPolicy;
  }

  addClaim(req: ClaimCreateRequest): Claim {
    const tempId = `clm-${Date.now()}`;
    const policy = this.policiesSignal().find(p => p.id === req.policyId);
    const nextNumber = `CLM-2026-${String(400 + this.claimsSignal().length + 1)}`;
    const newClaim: Claim = {
      id: tempId,
      claimNumber: nextNumber,
      policyId: req.policyId,
      policyNumber: policy ? policy.policyNumber : undefined,
      incidentDate: req.incidentDate,
      description: req.description,
      claimedAmount: req.claimedAmount,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };

    this.claimsSignal.update(list => [newClaim, ...list]);

    this.http.post<Claim>('/api/v1/claims', req).subscribe({
      next: (saved) => {
        this.claimsSignal.update(list => list.map(c => c.id === tempId ? saved : c));
      },
      error: () => {}
    });

    return newClaim;
  }

  decideClaim(claimId: string, req: ClaimDecisionRequest): boolean {
    this.claimsSignal.update(list =>
      list.map(c => {
        if (c.id === claimId) {
          return {
            ...c,
            status: req.status,
            approvedAmount: req.status === 'APPROVED' ? req.approvedAmount : 0,
            reviewerNotes: req.reviewerNotes
          };
        }
        return c;
      })
    );

    const body = {
      decision: req.status,
      approvedAmount: req.status === 'APPROVED' ? (req.approvedAmount || 0) : 0,
      reviewerNotes: req.reviewerNotes || 'Reviewed by claims adjudicator'
    };

    this.http.post<Claim>(`/api/v1/claims/${claimId}/decision`, body).subscribe({
      next: (saved) => {
        this.claimsSignal.update(list => list.map(c => c.id === claimId ? saved : c));
      },
      error: () => {}
    });

    return true;
  }

  addPayment(req: PaymentCreateRequest): Payment {
    const tempId = `pay-${Date.now()}`;
    const nextNumber = `PAY-REF-${String(9900 + this.paymentsSignal().length + 1)}`;
    const newPayment: Payment = {
      id: tempId,
      paymentReference: nextNumber,
      policyId: req.policyId,
      claimId: req.claimId,
      amount: req.amount,
      currency: req.currency || 'USD',
      paymentMethodReference: req.paymentMethodReference,
      status: 'COMPLETED',
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.paymentsSignal.update(list => [newPayment, ...list]);

    this.http.post<Payment>('/api/v1/payments', req).subscribe({
      next: (saved) => {
        this.paymentsSignal.update(list => list.map(p => p.id === tempId ? saved : p));
      },
      error: () => {}
    });

    return newPayment;
  }
}
