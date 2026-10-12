import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InsuranceDataService } from './insurance-data.service';

describe('InsuranceDataService', () => {
  let service: InsuranceDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        InsuranceDataService
      ]
    });
    service = TestBed.inject(InsuranceDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compute initial dashboard summary correctly', () => {
    const summary = service.dashboardSummary();
    expect(summary.totalCustomers).toBeGreaterThan(0);
    expect(summary.activePolicies).toBeGreaterThan(0);
  });

  it('should add a customer and update customer count', () => {
    const initialCount = service.customers().length;
    service.addCustomer({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0000',
      address: '123 Main St'
    });
    expect(service.customers().length).toBe(initialCount + 1);
  });

  it('should add a policy', () => {
    const initialCount = service.policies().length;
    service.addPolicy({
      customerId: 'cust-1',
      productId: 'prod-1',
      startDate: '2026-05-01',
      endDate: '2027-05-01',
      premiumAmount: 600,
      currency: 'USD'
    });
    expect(service.policies().length).toBe(initialCount + 1);
  });
});
