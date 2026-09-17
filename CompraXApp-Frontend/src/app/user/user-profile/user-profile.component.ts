import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UserProfileResponse, UserUpdateRequest } from '../user.service';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userProfile: UserProfileResponse | null = null;
  isEditing = false;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  profileForm: FormGroup;
  addressForm: FormGroup;
  originalFormValues: any = {};
  originalAddressValues: any = {};

  provinces = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.profileForm = this.fb.group({
      name: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2)]],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]]
    });

    this.addressForm = this.fb.group({
      street: [{value: '', disabled: true}, [Validators.required]],
      number: [{value: '', disabled: true}, [Validators.required]],
      floor: [{value: '', disabled: true}],
      apartment: [{value: '', disabled: true}],
      city: [{value: '', disabled: true}, [Validators.required]],
      province: [{value: '', disabled: true}, [Validators.required]],
      postalCode: [{value: '', disabled: true}, [Validators.required]],
      additionalInfo: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getMyProfile().subscribe({
      next: (profile: UserProfileResponse) => {
        this.userProfile = profile;
        
        const formData = {
          name: profile.name,
          email: profile.email
        };
        
        this.profileForm.patchValue(formData);
        this.originalFormValues = { ...formData };

        const addressData = this.parseAddress(profile.shippingAddress || '');
        this.addressForm.patchValue(addressData);
        this.originalAddressValues = { ...addressData };
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Error loading profile. Please try again.';
        this.isLoading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.addressForm.invalid) {
      this.markFormGroupTouched();
      this.markAddressFormTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const combinedAddress = this.combineAddress();

    const updateData: UserUpdateRequest = {
      name: this.profileForm.value.name.trim(),
      email: this.profileForm.value.email.trim(),
      shippingAddress: combinedAddress
    };

    this.userService.updateMyProfile(updateData).subscribe({
      next: (updatedProfile: any) => {
        if (this.userProfile) {
          this.userProfile.name = updatedProfile.name || updateData.name;
          this.userProfile.email = updatedProfile.email || updateData.email;
          this.userProfile.shippingAddress = updatedProfile.shippingAddress || updateData.shippingAddress;
        }
        
        this.originalFormValues = { ...this.profileForm.value };
        this.originalAddressValues = { ...this.addressForm.value };
        
        this.successMessage = 'Profile updated successfully';
        this.isEditing = false;
        this.toggleEditState(false);
        this.isSaving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        this.errorMessage = 'Error updating profile. Please try again.';
        this.isSaving = false;
        console.error('Error updating profile:', err);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.clearMessages();
    this.toggleEditState(this.isEditing);
  }

  private toggleEditState(enable: boolean): void {
    if (enable) {
      this.profileForm.get('name')?.enable();
      this.profileForm.get('email')?.enable();
      Object.keys(this.addressForm.controls).forEach(key => {
        this.addressForm.get(key)?.enable();
      });
    } else {
      this.profileForm.get('name')?.disable();
      this.profileForm.get('email')?.disable();
      Object.keys(this.addressForm.controls).forEach(key => {
        this.addressForm.get(key)?.disable();
      });
      if (!this.isEditing) {
          this.profileForm.patchValue(this.originalFormValues);
          this.addressForm.patchValue(this.originalAddressValues);
          this.profileForm.markAsUntouched();
          this.addressForm.markAsUntouched();
      }
    }
  }


  cancelEdit(): void {
    this.isEditing = false;
    this.toggleEditState(false);
    this.profileForm.patchValue(this.originalFormValues);
    this.addressForm.patchValue(this.originalAddressValues);
    this.profileForm.markAsUntouched();
    this.addressForm.markAsUntouched();
    this.clearMessages();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `This field is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email';
      }
      if (field.errors['minlength']) {
        return `Must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  requestPasswordReset(): void {
    if (this.userProfile?.email) {
      this.authService.requestPasswordReset(this.userProfile.email).subscribe({
        next: () => {
          this.successMessage = 'A password reset link has been sent to your email.';
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (err: any) => {
          this.errorMessage = 'Error requesting password reset.';
          console.error('Error requesting password reset:', err);
        }
      });
    }
  }

  deleteAccount(): void {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      const doubleConfirmed = confirm(
        'WARNING: All your data will be permanently deleted. Continue?'
      );
      
      if (doubleConfirmed) {
        this.userService.deleteMyAccount().subscribe({
          next: () => {
            this.toastService.success('Your account has been successfully deleted.');
            this.authService.logout();
            this.router.navigate(['/']);
          },
          error: (err: any) => {
            this.errorMessage = 'Error deleting account.';
            console.error('Error deleting account:', err);
          }
        });
      }
    }
  }

  isAddressFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markAddressFormTouched(): void {
    Object.keys(this.addressForm.controls).forEach(key => {
      const control = this.addressForm.get(key);
      control?.markAsTouched();
    });
  }

  private parseAddress(address: string): any {
    const defaultAddress = {
      street: '',
      number: '',
      floor: '',
      apartment: '',
      city: '',
      province: '',
      postalCode: '',
      additionalInfo: ''
    };

    if (!address || address.trim() === '') {
      return defaultAddress;
    }

    if (address.includes('||ADDR||')) {
      const parseablePart = address.split('||ADDR||')[1];
      const parts = parseablePart.split('|').map(p => p.trim());
      return {
        street: parts[0] || '',
        number: parts[1] || '',
        floor: parts[2] || '',
        apartment: parts[3] || '',
        city: parts[4] || '',
        province: parts[5] || '',
        postalCode: parts[6] || '',
        additionalInfo: parts[7] || ''
      };
    }

    return {
      ...defaultAddress,
      additionalInfo: address
    };
  }

  private combineAddress(): string {
    const addr = this.addressForm.value;
    
    const parts: string[] = [];
    
    if (addr.street && addr.number) {
      parts.push(`${addr.street} ${addr.number}`);
    }
    
    if (addr.floor || addr.apartment) {
      const floorApt: string[] = [];
      if (addr.floor) floorApt.push(`Piso ${addr.floor}`);
      if (addr.apartment) floorApt.push(`Depto ${addr.apartment}`);
      parts.push(floorApt.join(', '));
    }
    
    if (addr.city) {
      parts.push(addr.city);
    }
    
    if (addr.province) {
      let provincePart = addr.province;
      if (addr.postalCode) {
        provincePart += ` (CP ${addr.postalCode})`;
      }
      parts.push(provincePart);
    }
    
    if (addr.additionalInfo) {
      parts.push(`- ${addr.additionalInfo}`);
    }
    
    const parseableFormat = [
      addr.street || '',
      addr.number || '',
      addr.floor || '',
      addr.apartment || '',
      addr.city || '',
      addr.province || '',
      addr.postalCode || '',
      addr.additionalInfo || ''
    ].join('|');
    
    return parts.join(', ') + ' ||ADDR||' + parseableFormat;
  }
}
