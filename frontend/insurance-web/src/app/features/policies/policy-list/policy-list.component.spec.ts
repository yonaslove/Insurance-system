import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PolicyListComponent } from './policy-list.component';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';

describe('PolicyListComponent', () => {
  let component: PolicyListComponent;
  let fixture: ComponentFixture<PolicyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        InsuranceDataService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create policy list component', () => {
    expect(component).toBeTruthy();
  });

  it('should list policies from service', () => {
    expect(component.policies().length).toBeGreaterThan(0);
  });
});
