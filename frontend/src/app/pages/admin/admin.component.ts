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
          this.users = data.map(user => ({
            ...user,
            fileUrl: user.filePath ? `${environment.apiUrl}/Uploads/${user.filePath}` : null
          }));
          this.error = '';
        },
        error: (err) => {
          this.error = err.error?.message || 'Unauthorized';
          this.users = [];
        }
      });
  }
}
