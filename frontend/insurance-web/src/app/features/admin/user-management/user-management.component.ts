import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InsuranceDataService } from '../../../core/services/insurance-data.service';
import { AdminCreateUserRequest, AdminUpdateUserRequest, UserAccount, UserRole } from '../../../core/models/user.model';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private authService = inject(AuthService);
  private insuranceData = inject(InsuranceDataService);

  users: UserAccount[] = [];
  allUsers: UserAccount[] = [];
  selectedRoleFilter: string = 'ALL';
  currentPage = 1;
  pageSize = 10;
  showCreateModal = false;
  submitting = false;
  loading = false;
  successMessage = '';
  modalError = '';

  // Edit User Modal State
  showEditModal = false;
  editUserId = '';
  editUsername = '';
  editForm: AdminUpdateUserRequest = {
    fullName: '',
    email: '',
    role: 'UNDERWRITER',
    status: 'ACTIVE',
    newPassword: '',
    unlockAccount: false
  };
  editSubmitting = false;
  editModalError = '';

  // Delete User Modal State
  showDeleteModal = false;
  userToDelete: UserAccount | null = null;
  deleteSubmitting = false;
  deleteModalError = '';

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
    this.loadUsers('ALL');
  }

  loadUsers(role: string = this.selectedRoleFilter) {
    this.loading = true;
    this.authService.getUsers(role).subscribe(list => {
      this.users = list;
      this.loading = false;
    });

    // Also keep allUsers cached for counting
    if (role !== 'ALL' && this.allUsers.length === 0) {
      this.authService.getUsers('ALL').subscribe(all => {
        this.allUsers = all;
      });
    } else if (role === 'ALL') {
      this.allUsers = this.users;
    }
  }

  filterByRole(role: string) {
    this.selectedRoleFilter = role;
    this.currentPage = 1;
    this.loadUsers(role);
  }

  refreshData() {
    this.currentPage = 1;
    this.loadUsers(this.selectedRoleFilter);
  }

  get filteredUsers(): UserAccount[] {
    return this.users;
  }

  get paginatedUsers(): UserAccount[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  getCountForRole(role: string): number {
    const source = this.allUsers.length > 0 ? this.allUsers : this.users;
    return source.filter(u => u.role === role).length;
  }

  get totalCount(): number {
    return this.allUsers.length > 0 ? this.allUsers.length : this.users.length;
  }

  getTargetWorkspace(role: UserRole): string {
    return this.authService.getRedirectUrlForRole(role);
  }

  openCreateModal() {
    this.newUser = {
      username: '',
      password: '',
      email: '',
      fullName: '',
      role: 'UNDERWRITER',
      phone: '',
      address: ''
    };
    this.modalError = '';
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.modalError = '';
    this.newUser = {
      username: '',
      password: '',
      email: '',
      fullName: '',
      role: 'UNDERWRITER',
      phone: '',
      address: ''
    };
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
        this.successMessage = `User "${created.fullName}" successfully created with role ${created.role}.`;
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

  openEditModal(user: UserAccount) {
    this.editUserId = user.id;
    this.editUsername = user.username;
    this.editForm = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status === 'LOCKED' ? 'ACTIVE' : user.status,
      newPassword: '',
      unlockAccount: user.status === 'LOCKED'
    };
    this.editModalError = '';
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editModalError = '';
    this.editUserId = '';
  }

  onSaveUser() {
    this.editModalError = '';
    if (!this.editForm.fullName || !this.editForm.email || !this.editForm.role) {
      this.editModalError = 'Full name, email, and role are required.';
      return;
    }

    if (this.editForm.newPassword && this.editForm.newPassword.length < 6) {
      this.editModalError = 'New password must be at least 6 characters.';
      return;
    }

    this.editSubmitting = true;
    this.authService.updateUser(this.editUserId, this.editForm).subscribe({
      next: (updated) => {
        this.editSubmitting = false;
        this.showEditModal = false;
        this.successMessage = `User "${updated.fullName}" updated successfully!`;
        this.loadUsers();
      },
      error: (err) => {
        this.editSubmitting = false;
        this.editModalError = err.message || 'Failed to update user profile.';
      }
    });
  }

  openDeleteModal(user: UserAccount) {
    if (user.username === 'admin') {
      this.modalError = 'The master administrator account cannot be deleted.';
      return;
    }
    this.userToDelete = user;
    this.deleteModalError = '';
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
    this.deleteModalError = '';
  }

  onConfirmDelete() {
    if (!this.userToDelete) return;

    this.deleteSubmitting = true;
    const deletedName = this.userToDelete.fullName;

    this.authService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.deleteSubmitting = false;
        this.showDeleteModal = false;
        this.userToDelete = null;
        this.successMessage = `User "${deletedName}" was permanently deleted.`;
        this.loadUsers();
      },
      error: (err) => {
        this.deleteSubmitting = false;
        this.deleteModalError = err.message || 'Failed to delete user account.';
      }
    });
  }

  quickUnlock(user: UserAccount) {
    this.authService.unlockUser(user.id).subscribe({
      next: (unlocked) => {
        this.successMessage = `Account "${unlocked.fullName}" has been unlocked!`;
        this.loadUsers();
      },
      error: (err) => {
        this.modalError = err.message || 'Failed to unlock user account.';
      }
    });
  }
}
