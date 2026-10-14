import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { InsuranceDataService } from './insurance-data.service';

describe('InsuranceDataService', () => {
  let service: InsuranceDataService;
  let httpMock: HttpTestingController;

  const flushInitialLoads = (customers: any[] = [], policies: any[] = []) => {
    httpMock.expectOne('/api/v1/customers').flush({ content: customers });
    httpMock.expectOne('/api/v1/products').flush({ content: [] });
    httpMock.expectOne('/api/v1/policies').flush({ content: policies });
    httpMock.expectOne('/api/v1/claims').flush({ content: [] });
    httpMock.expectOne('/api/v1/payments').flush({ content: [] });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        InsuranceDataService
      ]
    });
    service = TestBed.inject(InsuranceDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    flushInitialLoads();
    expect(service).toBeTruthy();
  });

  it('should compute dashboard summary from loaded server data', () => {
    flushInitialLoads([{ id: 'c1' }], [{ id: 'p1', status: 'ACTIVE' }, { id: 'p2', status: 'LAPSED' }]);

    const summary = service.dashboardSummary();
    expect(summary.totalCustomers).toBe(1);
    expect(summary.activePolicies).toBe(1);
    expect(summary.openClaims).toBe(0);
  });

  it('should only add a customer to the store after the server confirms', () => {
    flushInitialLoads();
    const initialCount = service.customers().length;

    let emitted = false;
    service.addCustomer({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0000',
      address: '123 Main St'
    }).subscribe(() => { emitted = true; });

    // No optimistic write: the list is unchanged until the server responds.
    expect(service.customers().length).toBe(initialCount);

    httpMock.expectOne('/api/v1/customers').flush({
      id: 'srv-1',
      customerNumber: 'CUST-2026-004',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0000',
      address: '123 Main St',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    expect(emitted).toBeTrue();
    expect(service.customers().length).toBe(initialCount + 1);
  });

  it('should only add a policy after the server confirms', () => {
    flushInitialLoads();
    const initialCount = service.policies().length;

    service.addPolicy({
      customerId: 'cust-1',
      productId: 'prod-1',
      startDate: '2026-05-01',
      endDate: '2027-05-01',
      premiumAmount: 600,
      currency: 'USD'
    }).subscribe();

    expect(service.policies().length).toBe(initialCount);

    httpMock.expectOne('/api/v1/policies').flush({
      id: 'srv-p1',
      policyNumber: 'POL-2026-8803',
      customerId: 'cust-1',
      productId: 'prod-1',
      startDate: '2026-05-01',
      endDate: '2027-05-01',
      premiumAmount: 600,
      currency: 'USD',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    expect(service.policies().length).toBe(initialCount + 1);
  });
});
