import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form',
  standalone: true,
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,   // ✅ Required for [formGroup]
    RouterModule,
    HttpClientModule
  ]
})
export class FormComponent implements OnInit {
  form: FormGroup;
  file: File | null = null;
  formType: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      name: [''],
      phone: [''],
      email: [''],
      address: [''],
      education: [''],
      experience: [''],
      background: [''],
      additionalComments: ['']
    });
  }

  ngOnInit() {
    this.formType = this.route.snapshot.paramMap.get('type') || '';
  }

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }

  onSubmit() {
    const formData = new FormData();
  
    // Fix casing to match C# model exactly
    formData.append('Name', this.form.value.name);
    formData.append('Phone', this.form.value.phone);
    formData.append('Email', this.form.value.email);
    formData.append('Address', this.form.value.address);
    formData.append('Education', this.form.value.education);
    formData.append('Experience', this.form.value.experience);
    formData.append('Background', this.form.value.background);
    formData.append('AdditionalComments', this.form.value.additionalComments);
    
    formData.append('IsIdeaSubmitter', this.formType === 'idea' ? 'true' : 'false');
    formData.append('IsFunder', this.formType === 'fund' ? 'true' : 'false');    
  
    if (this.file) {
      formData.append('file', this.file);
    }
  
    this.http.post('http://localhost:5151/api/user/submit', formData).subscribe({
      next: () => alert('Form submitted successfully!'),
      error: () => alert('Failed to submit form'),
    });
  }
  
}
