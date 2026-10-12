import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PolicyCreateComponent } from './policy-create.component';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';

describe('PolicyCreateComponent', () => {
  let component: PolicyCreateComponent;
  let fixture: ComponentFixture<PolicyCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyCreateComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        InsuranceDataService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create policy create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.policyForm.get('currency')?.value).toBe('USD');
  });
});
