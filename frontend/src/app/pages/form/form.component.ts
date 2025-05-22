import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-form',
  standalone: true,
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule]
})
export class FormComponent implements OnInit {
  @Input() formType: string = 'idea';
  @Output() close = new EventEmitter<void>();

  form: FormGroup;
  file: File | null = null;
  step = 0;

  readonly totalSteps = 10;
  readonly radius = 25;
  readonly circumference = 2 * Math.PI * this.radius;

  get progressOffset(): number {
    return this.circumference - (this.step / (this.totalSteps - 1)) * this.circumference;
  }

  constructor(
    private fb: FormBuilder,
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
    // formType is now received via @Input from HomeComponent
  }

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }

  nextStep() {
    if (this.step < this.totalSteps - 1) this.step++;
  }

  prevStep() {
    if (this.step > 0) this.step--;
  }

  onSubmit() {
    const formData = new FormData();
    const formValue = this.form.value;

    formData.append('Name', formValue.name);
    formData.append('Phone', formValue.phone);
    formData.append('Email', formValue.email);
    formData.append('Address', formValue.address);
    formData.append('Education', formValue.education);
    formData.append('Experience', formValue.experience);
    formData.append('Background', formValue.background);
    formData.append('AdditionalComments', formValue.additionalComments);
    formData.append('IsIdeaSubmitter', this.formType === 'idea' ? 'true' : 'false');
    formData.append('IsFunder', this.formType === 'fund' ? 'true' : 'false');

    if (this.file) {
      formData.append('file', this.file);
    }

    this.http.post(`${environment.apiUrl}/api/user/submit`, formData).subscribe({
      next: () => {
        alert('Form submitted successfully!');
        this.close.emit(); // close the modal
      },
      error: () => alert('Failed to submit form')
    });
  }

  closeModal() {
    this.close.emit();
  }
}
