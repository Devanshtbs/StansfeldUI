import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccessRequestService, AccountProfileInput, BusinessReferenceInput, ContactProfileInput, PortalContactProfile, PortalProfile } from '../../core/services/access-request.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profile: PortalProfile | null = null;
  contactId = '';
  loading = true;
  savingProfile = false;
  savingContact = false;
  savingAccount = false;
  uploadingDocument = false;
  deletingContactId: string | null = null;
  errorMessage = '';
  successMessage = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  profileDirty = false;
  contactsChanged = false;
  editingContactId: string | null = null;
  contactFormOpen = false;
  profileForm: ContactProfileInput = this.emptyInput();
  accountForm: AccountProfileInput = this.emptyAccountInput();
  contactForm: BusinessReferenceInput = this.emptyBusinessReference();
  selectedPdf: File | null = null;
  accountDirty = false;
  private savedProfileSnapshot = '';
  private savedAccountSnapshot = '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(private api: AccessRequestService, private router: Router) {}

  ngOnInit(): void {
    const rawUser = sessionStorage.getItem('portal-user');
    if (!rawUser) { void this.router.navigate(['/sign-in'], { replaceUrl: true }); return; }
    try {
      this.contactId = (JSON.parse(rawUser) as { contactId?: string }).contactId ?? '';
    } catch { this.contactId = ''; }
    if (!this.contactId) { sessionStorage.removeItem('portal-user'); void this.router.navigate(['/sign-in'], { replaceUrl: true }); return; }
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.api.getProfile(this.contactId).subscribe({
      next: response => {
        this.loading = false;
        if (!response.success || !response.data) { this.errorMessage = response.message || 'Could not load profile.'; return; }
        this.profile = response.data;
        const user = response.data.user;
        this.profileForm = { firstName: user.firstName, lastName: user.lastName, email: user.email ?? '', phone: user.phone ?? '', jobTitle: user.jobTitle ?? '' };
        this.savedProfileSnapshot = this.profileSnapshot();
        this.profileDirty = false;
        if (response.data.account) {
          const account = response.data.account;
          this.accountForm = {
            name: account.name ?? '', accountNumber: account.accountNumber ?? '', phone: account.phone ?? '',
            website: account.website ?? '', city: account.city ?? '', stateOrProvince: account.stateOrProvince ?? '',
            country: account.country ?? '', postalCode: account.postalCode ?? '',
          };
          this.savedAccountSnapshot = this.accountSnapshot();
          this.accountDirty = false;
        }
      },
      error: error => { this.loading = false; this.showToast(error.error?.message ?? error.error?.Message ?? 'Could not load your profile.', 'error'); },
    });
  }

  saveProfile(): void {
    this.clearNotice();
    this.savingProfile = true;
    this.api.updateProfile(this.contactId, this.profileForm).subscribe({
      next: () => { this.savingProfile = false; this.contactsChanged = false; this.showToast('Your profile was updated.', 'success'); this.loadProfile(); },
      error: error => { this.savingProfile = false; this.showToast(error.error?.message ?? error.error?.Message ?? 'Could not update your profile.', 'error'); },
    });
  }

  onProfileChanged(): void { this.profileDirty = this.profileSnapshot() !== this.savedProfileSnapshot; }

  onAccountChanged(): void { this.accountDirty = this.accountSnapshot() !== this.savedAccountSnapshot; }

  saveAccount(): void {
    if (!this.accountDirty) return;
    this.clearNotice(); this.savingAccount = true;
    this.api.updateAccount(this.contactId, this.accountForm).subscribe({
      next: () => { this.savingAccount = false; this.showToast('Account profile updated.', 'success'); this.loadProfile(); },
      error: error => { this.savingAccount = false; this.showToast(error.error?.message ?? error.error?.Message ?? 'Could not update the account profile.', 'error'); },
    });
  }

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedPdf = null;
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { this.showToast('Choose a PDF file.', 'error'); input.value = ''; return; }
    if (file.size > 20 * 1024 * 1024) { this.showToast('The PDF must be 20 MB or smaller.', 'error'); input.value = ''; return; }
    this.selectedPdf = file;
    this.clearNotice();
  }

  uploadPdf(): void {
    if (!this.selectedPdf || this.uploadingDocument) return;
    this.clearNotice(); this.uploadingDocument = true;
    this.api.uploadAccountDocument(this.contactId, this.selectedPdf).subscribe({
      next: response => {
        this.uploadingDocument = false;
        this.selectedPdf = null;
        this.showToast(response.message ?? 'Signed document uploaded and Account status updated to Waiting for Approval.', response.data?.notificationSent === false ? 'error' : 'success');
      },
      error: error => { this.uploadingDocument = false; this.showToast(error.error?.message ?? error.error?.Message ?? 'Could not upload the PDF.', 'error'); },
    });
  }

  openAddContact(): void { this.clearNotice(); this.editingContactId = null; this.contactForm = this.emptyBusinessReference(); this.contactFormOpen = true; }
  openEditContact(contact: PortalContactProfile): void {
    this.clearNotice(); this.editingContactId = contact.contactId; this.contactFormOpen = true;
    this.contactForm = { firstName: contact.firstName, lastName: contact.lastName, email: contact.email ?? '', phone: contact.phone ?? '', jobTitle: contact.jobTitle ?? '' };
  }
  cancelContactForm(): void { this.contactFormOpen = false; this.editingContactId = null; }

  saveContact(): void {
    if (!this.profile?.account) return;
    this.clearNotice(); this.savingContact = true;
    const wasEditing = !!this.editingContactId;
    const done = () => { this.savingContact = false; this.contactsChanged = true; this.contactFormOpen = false; this.showToast(wasEditing ? 'Business Reference updated.' : 'Business Reference added.', 'success'); this.editingContactId = null; this.loadProfile(); };
    const fail = (error: { error?: { message?: string; Message?: string } }) => { this.savingContact = false; this.showToast(error.error?.message ?? error.error?.Message ?? 'Could not save this Business Reference.', 'error'); };
    if (this.editingContactId) this.api.updateContact(this.contactId, this.editingContactId, this.contactForm).subscribe({ next: done, error: fail });
    else this.api.addContact(this.contactId, this.contactForm).subscribe({ next: done, error: fail });
  }

  deleteContact(contact: PortalContactProfile): void {
    if (!this.profile?.account || !window.confirm(`Delete ${contact.fullName} from this account?`)) return;
    this.clearNotice();
    this.deletingContactId = contact.contactId;
    this.api.deleteContact(this.contactId, contact.contactId).subscribe({
      next: () => { this.deletingContactId = null; this.contactsChanged = true; this.showToast(`${contact.fullName} was deleted.`, 'success'); this.loadProfile(); },
      error: error => { this.deletingContactId = null; this.showToast(error.error?.message ?? error.error?.Message ?? 'Could not delete this Business Reference.', 'error'); },
    });
  }

  signOut(): void { sessionStorage.removeItem('portal-user'); void this.router.navigate(['/sign-in'], { replaceUrl: true }); }
  dismissToast(): void { this.toastMessage = ''; if (this.toastTimer) clearTimeout(this.toastTimer); }
  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message; this.toastType = type;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage = '', 4500);
  }
  private clearNotice(): void { this.errorMessage = ''; this.successMessage = ''; this.dismissToast(); }
  private profileSnapshot(): string { return JSON.stringify(this.profileForm); }
  private accountSnapshot(): string { return JSON.stringify(this.accountForm); }
  private emptyInput(): ContactProfileInput { return { firstName: '', lastName: '', email: '', phone: '', jobTitle: '' }; }
  private emptyBusinessReference(): BusinessReferenceInput { return { firstName: '', lastName: '', email: '', phone: '', jobTitle: '' }; }
  private emptyAccountInput(): AccountProfileInput { return { name: '', accountNumber: '', phone: '', website: '', city: '', stateOrProvince: '', country: '', postalCode: '' }; }
}
