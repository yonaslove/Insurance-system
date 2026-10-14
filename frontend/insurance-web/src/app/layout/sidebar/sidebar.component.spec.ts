import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../core/services/auth.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        AuthService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    localStorage.setItem('insuredge_auth_user', JSON.stringify({
      id: '10000000-0000-0000-0000-000000000001',
      username: 'admin',
      name: 'System Administrator',
      email: 'admin@insurance-corp.com',
      roles: ['ADMIN'],
      status: 'ACTIVE'
    }));
    authService = TestBed.inject(AuthService);

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create sidebar component', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation links', () => {
    const navItems = fixture.nativeElement.querySelectorAll('.nav-item');
    expect(navItems.length).toBeGreaterThan(0);
  });
});
