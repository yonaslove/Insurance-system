import { Component, inject } from '@angular/core';
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
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  password = '';
  loading = false;
  errorMessage = '';
  infoMessage = '';

  onForgotPassword() {
    this.infoMessage = 'To reset your credentials, please contact your system administrator or submit a recovery request with Customer Support.';
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username/email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        const destination = returnUrl || res.redirectUrl;
        this.router.navigateByUrl(destination);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Authentication failed. Please verify your exact database credentials.';
      }
    });
  }
}
