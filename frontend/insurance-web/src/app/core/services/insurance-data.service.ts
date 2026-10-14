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
  private dashboardSignal = signal<DashboardSummary | null>(null);

  customers = computed(() => this.customersSignal());
  products = computed(() => this.productsSignal());
  policies = computed(() => this.policiesSignal());
  claims = computed(() => this.claimsSignal());
  payments = computed(() => this.paymentsSignal());

  dashboardSummary = computed<DashboardSummary>(() => {
    const server = this.dashboardSignal();
    if (server) {
      return { ...server, recentActivities: server.recentActivities ?? [] };
    }

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

  loadDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>('/api/v1/dashboard/summary').pipe(
      tap((summary) => this.dashboardSignal.set(summary))
    );
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

  addCustomer(req: CustomerCreateRequest): Observable<Customer> {
    return this.http.post<Customer>('/api/v1/customers', req).pipe(
      tap((saved) => {
        this.customersSignal.update(list => [saved, ...list]);
      })
    );
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

  addProduct(req: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>('/api/v1/products', req).pipe(
      tap((saved) => {
        this.productsSignal.update(list => [saved, ...list]);
      })
    );
  }

  addPolicy(req: PolicyCreateRequest): Observable<Policy> {
    return this.http.post<Policy>('/api/v1/policies', req).pipe(
      tap((saved) => {
        this.policiesSignal.update(list => [saved, ...list]);
      })
    );
  }

  addClaim(req: ClaimCreateRequest): Observable<Claim> {
    return this.http.post<Claim>('/api/v1/claims', req).pipe(
      tap((saved) => {
        this.claimsSignal.update(list => [saved, ...list]);
      })
    );
  }

  decideClaim(claimId: string, req: ClaimDecisionRequest): Observable<Claim> {
    const body = {
      decision: req.status,
      approvedAmount: req.status === 'APPROVED' ? (req.approvedAmount || 0) : 0,
      reviewerNotes: req.reviewerNotes || 'Reviewed by claims adjudicator'
    };

    return this.http.post<Claim>(`/api/v1/claims/${claimId}/decision`, body).pipe(
      tap((saved) => {
        this.claimsSignal.update(list => list.map(c => c.id === claimId ? saved : c));
      })
    );
  }

  addPayment(req: PaymentCreateRequest): Observable<Payment> {
    return this.http.post<Payment>('/api/v1/payments', req).pipe(
      tap((saved) => {
        this.paymentsSignal.update(list => [saved, ...list]);
      })
    );
  }
}
