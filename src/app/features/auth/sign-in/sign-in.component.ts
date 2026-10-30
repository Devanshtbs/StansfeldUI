import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccessRequestService } from '../../../core/services/access-request.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent {
  username = '';
  password = '';
  errorMessage = '';
  signingIn = false;

  constructor(
    private router: Router,
    private portalApi: AccessRequestService,
  ) {}

  signIn(): void {
    if (this.signingIn) return;
    this.signingIn = true;
    this.errorMessage = '';

    this.portalApi.signIn(this.username, this.password).subscribe({
      next: (response) => {
        this.signingIn = false;
        if (!response.success || !response.data) {
          this.errorMessage = 'We could not sign you in. Check your username and password.';
          return;
        }

        sessionStorage.setItem('portal-user', JSON.stringify(response.data));
        void this.router.navigate(['/profile'], { replaceUrl: true });
      },
      error: (error: { status?: number; error?: { message?: string; Message?: string } }) => {
        this.signingIn = false;
        this.errorMessage = error.status === 401
          ? 'The username or password is incorrect.'
          : error.error?.message ?? error.error?.Message ?? 'We could not sign in. Please try again later.';
      },
    });
  }

  forgotPassword(): void {
    this.errorMessage = 'Password reset is not configured yet. Please contact the portal administrator.';
  }

  requestAccess(): void {
    this.router.navigate(['/request-access']);
  }
}
