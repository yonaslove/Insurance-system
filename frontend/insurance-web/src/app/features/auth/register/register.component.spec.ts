import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display validation error when required fields are empty', () => {
    component.onSubmit();
    expect(component.errorMessage).toContain('mandatory');
  });

  it('should reject mismatched passwords', () => {
    component.form.firstName = 'John';
    component.form.lastName = 'Doe';
    component.form.email = 'john@example.com';
    component.form.phone = '123456';
    component.form.address = 'Test address';
    component.form.username = 'johndoe';
    component.form.password = 'Secret123!';
    component.confirmPassword = 'DifferentPassword!';

    component.onSubmit();
    expect(component.errorMessage).toContain('match');
  });
});
