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
    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    authService.loginAsAdmin();

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
