import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccessRequestService } from '../../core/services/access-request.service';

interface PortalUserView {
  contactId?: string;
  fullName?: string;
  accountName?: string | null;
}

@Component({
  selector: 'app-distributor-workspace',
  standalone: true,
  templateUrl: './distributor-workspace.component.html',
  styleUrl: './distributor-workspace.component.scss',
})
export class DistributorWorkspaceComponent implements OnInit {
  fullName = 'Distributor';
  accountName = 'Distributor Account';
  checkingWorkspaceAccess = true;
  workspaceAccessGranted = false;
  accessMessage = 'Your account must be approved before you can access the workspace.';

  constructor(private router: Router, private portalApi: AccessRequestService) {}

  ngOnInit(): void {
    const savedUser = sessionStorage.getItem('portal-user');
    if (!savedUser) {
      void this.router.navigate(['/sign-in'], { replaceUrl: true });
      return;
    }

    try {
      const user = JSON.parse(savedUser) as PortalUserView;
      this.fullName = user.fullName || this.fullName;
      this.accountName = user.accountName || this.accountName;
      if (!user.contactId) {
        sessionStorage.removeItem('portal-user');
        void this.router.navigate(['/sign-in'], { replaceUrl: true });
        return;
      }

      this.portalApi.checkWorkspaceAccess(user.contactId).subscribe({
        next: response => {
          this.checkingWorkspaceAccess = false;
          this.workspaceAccessGranted = response.success && response.data === true;
          if (!this.workspaceAccessGranted)
            this.accessMessage = 'Your account must be approved before you can access the workspace.';
        },
        error: () => {
          this.checkingWorkspaceAccess = false;
          this.workspaceAccessGranted = false;
          this.accessMessage = 'We could not verify your account approval. Please try again later.';
        },
      });
    } catch {
      sessionStorage.removeItem('portal-user');
      void this.router.navigate(['/sign-in'], { replaceUrl: true });
    }
  }

  signOut(): void {
    sessionStorage.removeItem('portal-user');
    void this.router.navigate(['/sign-in'], { replaceUrl: true });
  }

  openProfile(): void {
    void this.router.navigate(['/profile']);
  }
}
