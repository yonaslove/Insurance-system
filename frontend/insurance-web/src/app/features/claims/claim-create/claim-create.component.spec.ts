import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ClaimCreateComponent } from './claim-create.component';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';

describe('ClaimCreateComponent', () => {
  let component: ClaimCreateComponent;
  let fixture: ComponentFixture<ClaimCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimCreateComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        InsuranceDataService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create claim registration form component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize claim form', () => {
    expect(component.claimForm.get('claimedAmount')?.value).toBe(1500);
  });
});
