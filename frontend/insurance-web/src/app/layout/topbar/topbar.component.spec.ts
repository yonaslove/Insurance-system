import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TopbarComponent } from './topbar.component';
import { AuthService } from '../../core/services/auth.service';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        AuthService,
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

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create topbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should display active user info', () => {
    const userNameEl = fixture.nativeElement.querySelector('.user-name');
    expect(userNameEl).toBeTruthy();
  });
});
