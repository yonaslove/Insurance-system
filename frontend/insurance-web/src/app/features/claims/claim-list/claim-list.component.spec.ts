import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ClaimListComponent } from './claim-list.component';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';

describe('ClaimListComponent', () => {
  let component: ClaimListComponent;
  let fixture: ComponentFixture<ClaimListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        InsuranceDataService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create claim list component', () => {
    expect(component).toBeTruthy();
  });

  it('should display claims', () => {
    expect(component.claims().length).toBeGreaterThan(0);
  });
});
