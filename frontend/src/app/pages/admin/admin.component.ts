import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AdminComponent {
  email: string = '';
  users: any[] = [];
  error = '';

  constructor(private http: HttpClient) {}

  fetchData() {
    const formData = new FormData();
    formData.append('email', this.email);

    this.http.post<any[]>(`${environment.apiUrl}/api/user/admin`, formData)
      .subscribe({
        next: (data) => {
          this.users = data;

          // Fetch pre-signed URLs for each user
          this.users.forEach(user => {
            if (user.filePath) {
              this.http
                .get<{ url: string }>(
                  `${environment.apiUrl}/api/user/file-url?key=${encodeURIComponent(user.filePath)}`
                )
                .subscribe({
                  next: (res) => user.fileUrl = res.url,
                  error: () => user.fileUrl = null
                });
            } else {
              user.fileUrl = null;
            }
          });

          this.error = '';
        },
        error: (err) => {
          this.error = err.error?.message || 'Unauthorized';
          this.users = [];
        }
      });
  }
}
