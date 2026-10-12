import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { AdminCreateUserRequest, UserAccount, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private authService = inject(AuthService);
  private insuranceData = inject(InsuranceDataService);

  users: UserAccount[] = [];
  selectedRoleFilter: string = 'ALL';
  showCreateModal = false;
  submitting = false;
  successMessage = '';
  modalError = '';

  newUser: AdminCreateUserRequest = {
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'UNDERWRITER',
    phone: '',
    address: ''
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getUsers().subscribe(list => {
      this.users = list;
    });
  }

  get filteredUsers(): UserAccount[] {
    if (this.selectedRoleFilter === 'ALL') {
      return this.users;
    }
    return this.users.filter(u => u.role === this.selectedRoleFilter);
  }

  getCountForRole(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  getTargetWorkspace(role: UserRole): string {
    return this.authService.getRedirectUrlForRole(role);
  }

  onCreateUser() {
    this.modalError = '';

    if (!this.newUser.username || !this.newUser.password || !this.newUser.email || !this.newUser.fullName || !this.newUser.role) {
      this.modalError = 'Please fill out all required fields.';
      return;
    }

    if (this.newUser.password.length < 6) {
      this.modalError = 'Password must be at least 6 characters.';
      return;
    }

    this.submitting = true;

    this.authService.adminCreateUser(this.newUser).subscribe({
      next: (created) => {
        this.submitting = false;
        this.showCreateModal = false;
        this.successMessage = `Actor "${created.fullName}" successfully provisioned with role ${created.role} and database credentials!`;
        this.loadUsers();
        if (created.role === 'CUSTOMER') {
          this.insuranceData.loadAll();
        }

        // Reset
        this.newUser = {
          username: '',
          password: '',
          email: '',
          fullName: '',
          role: 'UNDERWRITER',
          phone: '',
          address: ''
        };
      },
      error: (err) => {
        this.submitting = false;
        this.modalError = err.message || 'Failed to provision user. Username or email may already exist.';
      }
    });
  }

  approveCustomerUser(user: UserAccount) {
    if (!user.customerId) return;
    this.insuranceData.approveCustomer(user.customerId).subscribe({
      next: () => {
        this.successMessage = `Policyholder "${user.fullName}" approved and activated!`;
        this.loadUsers();
      }
    });
  }
}
