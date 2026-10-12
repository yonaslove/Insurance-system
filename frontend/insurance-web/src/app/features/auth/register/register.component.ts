import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerRegisterRequest } from '../../../core/models/user.model';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private insuranceData = inject(InsuranceDataService);
  private router = inject(Router);

  form: CustomerRegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '1992-06-15',
    gender: 'MALE',
    idType: 'NATIONAL_ID',
    idNumber: '',
    occupation: '',
    annualIncome: 65000,
    emergencyContactName: '',
    emergencyContactPhone: '',
    username: '',
    password: ''
  };

  streetAddress = '';
  city = '';
  state = '';
  zipCode = '';
  confirmPassword = '';
  certificationAgreed = false;
  kycConsentAgreed = false;

  loading = false;
  errorMessage = '';

  // Submission state
  submittedSuccess = false;
  registrationRefNumber = '';
  registeredCustomerName = '';

  onSubmit() {
    this.errorMessage = '';

    if (!this.form.firstName || !this.form.lastName || !this.form.email || 
        !this.form.phone || !this.streetAddress || !this.city || !this.state ||
        !this.form.idNumber || !this.form.occupation ||
        !this.form.emergencyContactName || !this.form.emergencyContactPhone ||
        !this.form.username || !this.form.password) {
      this.errorMessage = 'Please complete all required fields in the insurance onboarding application.';
      return;
    }

    if (!this.certificationAgreed || !this.kycConsentAgreed) {
      this.errorMessage = 'You must confirm the legal accuracy declaration and consent to KYC identity checks.';
      return;
    }

    if (this.form.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    if (this.form.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // Assemble full verified address
    this.form.address = `${this.streetAddress}, ${this.city}, ${this.state} ${this.zipCode}`.trim();

    this.loading = true;

    this.authService.registerCustomer(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        this.insuranceData.loadAll();
        this.submittedSuccess = true;
        this.registeredCustomerName = `${this.form.firstName} ${this.form.lastName}`;
        this.registrationRefNumber = res.user?.customerId 
          ? `CUST-2026-${res.user.customerId.substring(0, 4).toUpperCase()}`
          : `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Registration failed. Email or username may already be registered.';
      }
    });
  }

  goToPortal() {
    this.router.navigateByUrl('/portal');
  }
}
