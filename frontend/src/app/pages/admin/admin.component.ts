import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  email = '';
  password = '';
  error = '';
  users: any[] = [];
  ideaSubmitters: any[] = [];
  funderSubmitters: any[] = [];
  loggedIn = false;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('adminToken');
    if (token) {
      this.loggedIn = true;
      this.fetchData();
    }
  }

  login() {
    const formData = new FormData();
    formData.append('email', this.email);
    formData.append('password', this.password);

    this.http
      .post<{ token: string }>(`${environment.apiUrl}/api/admin/login`, formData)
      .subscribe({
        next: (res) => {
          localStorage.setItem('adminToken', res.token);
          this.loggedIn = true;
          this.error = '';
          this.fetchData();
        },
        error: () => {
          this.error = 'Invalid credentials';
        },
      });
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.loggedIn = false;
    this.users = [];
    this.ideaSubmitters = [];
    this.funderSubmitters = [];
    this.email = '';
    this.password = '';
  }

  fetchData() {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any[]>(`${environment.apiUrl}/api/admin/submissions`, { headers })
      .subscribe({
        next: (data) => {
          this.users = data;

          this.ideaSubmitters = this.users
            .filter((u) => u.isIdeaSubmitter)
            .sort((a, b) => b.id - a.id);

          this.funderSubmitters = this.users
            .filter((u) => u.isFunder)
            .sort((a, b) => b.id - a.id);

          const attachUrl = (user: any) => {
            if (user.filePath) {
              this.http
                .get<{ url: string }>(
                  `${
                    environment.apiUrl
                  }/api/admin/file-url?key=${encodeURIComponent(
                    user.filePath
                  )}`,
                  { headers }
                )
                .subscribe({
                  next: (res) => (user.fileUrl = res.url),
                  error: () => (user.fileUrl = null),
                });
            } else {
              user.fileUrl = null;
            }
          };

          this.ideaSubmitters.forEach(attachUrl);
          this.funderSubmitters.forEach(attachUrl);
        },
        error: () => {
          this.error = 'Unauthorized or session expired.';
          this.logout();
        },
      });
  }

  deleteUser(userId: number) {
    if (!confirm('Are you sure you want to delete this submission?')) return;
  
    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.delete(`${environment.apiUrl}/api/admin/delete/${userId}`, { headers })
      .subscribe({
        next: () => {
          this.fetchData();
          this.showToast('Submission deleted successfully.');
        },
        error: () => {
          this.showToast('Failed to delete the submission.', true);
        }
      });
  }
  toastMessage = '';
  toastClass = '';
  
  showToast(message: string, isError = false) {
    this.toastMessage = message;
    this.toastClass = isError ? 'bg-danger text-white' : 'bg-success text-white';
  
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
  
  
}
