import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomerPortalComponent } from './customer-portal.component';
import { AuthService } from '../../core/services/auth.service';
import { InsuranceDataService } from '../../core/services/insurance-data.service';

describe('CustomerPortalComponent', () => {
  let component: CustomerPortalComponent;
  let fixture: ComponentFixture<CustomerPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPortalComponent],
      providers: [
        AuthService,
        InsuranceDataService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch tabs', () => {
    component.activeTab = 'file-claim';
    expect(component.activeTab).toBe('file-claim');
  });

  it('should validate claim before submission', () => {
    component.newClaim = {
      policyId: '',
      incidentDate: '',
      description: '',
      claimedAmount: 0
    };
    component.submitClaim();
    expect(component.claimError).toBeTruthy();
  });
});
