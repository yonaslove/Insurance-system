import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UserManagementComponent } from './user-management.component';
import { AuthService } from '../../../core/services/auth.service';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [
        AuthService,
        InsuranceDataService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial seed users', () => {
    expect(component.users.length).toBeGreaterThan(0);
  });

  it('should filter users by role', () => {
    component.selectedRoleFilter = 'ADMIN';
    const admins = component.filteredUsers;
    expect(admins.every(u => u.role === 'ADMIN')).toBeTrue();
  });

  it('should validate form before creating user', () => {
    component.newUser.username = '';
    component.onCreateUser();
    expect(component.modalError).toBeTruthy();
  });
});
