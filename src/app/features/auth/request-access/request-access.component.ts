import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessRequestService, CountryOption } from '../../../core/services/access-request.service';

@Component({
  selector: 'app-request-access',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './request-access.component.html',
  styleUrl: './request-access.component.scss',
})
export class RequestAccessComponent implements OnInit {

  companyName = '';
  distributorAccountNo = '';
  firstName = '';
  lastName = '';
  username = '';
  password = '';
  jobTitle = '';
  email = '';
  phone = '';
  region = '';
  countryId = '';
  accountId = '';
  invitationCode = '';
  countries: CountryOption[] = [];
  countryLoadError = '';
  submitting = false;
  submitted = false;
  errorMessage = '';
  isInvitationLink = false;
  invitationChecking = false;
  invitationValid: boolean | null = null;
  invitationMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accessRequests: AccessRequestService,
  ) {}

  ngOnInit(): void {
    const accountId = this.route.snapshot.queryParamMap.get('accountid')?.trim() ?? '';
    const invitationCode = this.route.snapshot.queryParamMap.get('invitationcode')?.trim() ?? '';
    this.accountId = accountId;
    this.invitationCode = invitationCode;
    this.isInvitationLink = accountId.length > 0 || invitationCode.length > 0;

    this.accessRequests.getCountries().subscribe({
      next: response => { this.countries = response.data ?? []; },
      error: () => { this.countryLoadError = 'Could not load countries. Refresh the page to try again.'; },
    });

    if (!this.isInvitationLink) return;
    if (!accountId || !invitationCode) {
      this.invitationValid = false;
      this.invitationMessage = 'This invitation link is incomplete or invalid.';
      return;
    }

    this.invitationChecking = true;
    this.accessRequests.getInvitationInfo(accountId, invitationCode).subscribe({
      next: (response) => {
        this.invitationChecking = false;
        this.invitationValid = response.success === true && !!response.data;
        if (this.invitationValid) {
          this.companyName = response.data.companyName;
          this.distributorAccountNo = response.data.accountNumber;
          this.invitationMessage = 'Invitation verified. Complete your registration below.';
          return;
        }
        this.invitationMessage = 'This invitation is invalid or has expired. Contact the person who sent it.';
      },
      error: (error: { error?: { message?: string } }) => {
        this.invitationChecking = false;
        this.invitationValid = false;
        this.invitationMessage = error.error?.message
          ?? 'We could not validate this invitation. Please try again later.';
      },
    });
  }

  submitRequest(form: NgForm): void {
    this.errorMessage = '';
    if (form.invalid) {
      form.control.markAllAsTouched();
      const labels: Record<string, string> = {
        companyName: 'Company name', firstName: 'First name', lastName: 'Last name',
        username: 'Username (at least 3 characters)', password: 'Password (at least 8 characters)',
        jobTitle: 'Job title', email: 'A valid email address', phone: 'Phone', region: 'Country',
      };
      const invalidFields = Object.entries(form.controls)
        .filter(([, control]) => control.invalid)
        .map(([name]) => labels[name] ?? name);
      this.errorMessage = `Please check: ${invalidFields.join(', ')}.`;
      return;
    }

    this.submitting = true;
    this.accessRequests.submit({
      accountId: this.accountId,
      invitationCode: this.invitationCode,
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      password: this.password,
      jobTitle: this.jobTitle,
      email: this.email,
      phone: this.phone,
      region: this.region,
      countryId: this.countryId,
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
      },
      error: (error: { error?: { message?: string; Message?: string } }) => {
        this.submitting = false;
        this.errorMessage = error.error?.message ?? error.error?.Message
          ?? 'We could not submit your request. Please try again.';
      },
    });
  }

  signIn(): void {
    this.router.navigate(['/sign-in']);
  }

  updateSelectedCountry(): void {
    this.region = this.countries.find(country => country.countryId === this.countryId)?.name ?? '';
  }
}
