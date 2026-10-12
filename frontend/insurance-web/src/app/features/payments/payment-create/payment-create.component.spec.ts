import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentCreateComponent } from './payment-create.component';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';

describe('PaymentCreateComponent', () => {
  let component: PaymentCreateComponent;
  let fixture: ComponentFixture<PaymentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCreateComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        InsuranceDataService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create payment entry component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default currency USD', () => {
    expect(component.paymentForm.get('currency')?.value).toBe('USD');
  });
});
