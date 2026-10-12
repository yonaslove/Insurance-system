import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentListComponent } from './payment-list.component';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';

describe('PaymentListComponent', () => {
  let component: PaymentListComponent;
  let fixture: ComponentFixture<PaymentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        InsuranceDataService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create payment list component', () => {
    expect(component).toBeTruthy();
  });

  it('should display list of payments', () => {
    expect(component.payments().length).toBeGreaterThan(0);
  });
});
