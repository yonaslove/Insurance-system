import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode: 'login' | 'forgot' | 'reset' = 'login';

  // Login form fields
  username = '';
  password = '';

  // Forgot password & reset fields
  forgotIdentifier = '';
  resetCode = '';
  newPassword = '';
  confirmPassword = '';
  maskedEmail = '';

  loading = false;
  errorMessage = '';
  infoMessage = '';
  isAccountLocked = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.resetCode = params['code'];
        if (params['email']) {
          this.forgotIdentifier = params['email'];
        }
        this.mode = 'reset';
        this.infoMessage = 'Verification code detected. Enter your new password below to reset and unlock your account.';
      }
    });
  }

  switchMode(newMode: 'login' | 'forgot' | 'reset') {
    this.mode = newMode;
    this.errorMessage = '';
    this.infoMessage = '';
    if (newMode === 'forgot' && this.username && !this.forgotIdentifier) {
      this.forgotIdentifier = this.username;
    }
  }

  onForgotPassword() {
    this.switchMode('forgot');
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username/email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';
    this.isAccountLocked = false;

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        const destination = returnUrl || res.redirectUrl;
        this.router.navigateByUrl(destination);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.message || 'Authentication failed. Please verify your exact credentials.';
        this.errorMessage = msg;
        if (msg.toLowerCase().includes('lock') || msg.toLowerCase().includes('temporarily locked')) {
          this.isAccountLocked = true;
        }
      }
    });
  }

  onRequestResetCode() {
    if (!this.forgotIdentifier.trim()) {
      this.errorMessage = 'Please enter your registered email address or username.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.forgotPassword(this.forgotIdentifier.trim()).subscribe({
      next: (res) => {
        this.loading = false;
        this.maskedEmail = res.email || this.forgotIdentifier.trim();
        this.infoMessage = res.message || 'Verification code sent to your email.';
        this.mode = 'reset';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Unable to request password reset. Please check the email or username entered.';
      }
    });
  }

  onResetPassword() {
    if (!this.resetCode.trim()) {
      this.errorMessage = 'Please enter the 6-digit verification code received in your email.';
      return;
    }

    if (!this.newPassword) {
      this.errorMessage = 'Please enter a new password.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters in length.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match. Please verify and re-type.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.resetPassword(this.resetCode.trim(), this.newPassword).subscribe({
      next: (res) => {
        this.loading = false;
        this.infoMessage = res.message || 'Password successfully updated! Your account is unlocked. Please log in.';
        this.mode = 'login';
        this.isAccountLocked = false;
        if (this.forgotIdentifier) {
          this.username = this.forgotIdentifier;
        }
        this.password = '';
        this.resetCode = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Failed to reset password. Please verify the code or request a new one.';
      }
    });
  }
}
