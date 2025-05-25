import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-form',
  standalone: true,
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
})
export class FormComponent implements OnInit {
  @Input() formType: string = 'idea';
  @Output() close = new EventEmitter<void>();

  form: FormGroup;
  file: File | null = null;
  fileError: string = '';
  step = 0;

  readonly totalSteps = 10;
  readonly radius = 25;
  readonly circumference = 2 * Math.PI * this.radius;

  get progressOffset(): number {
    return (
      this.circumference -
      (this.step / (this.totalSteps - 1)) * this.circumference
    );
  }

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [
        '+91',
        [Validators.required, Validators.pattern(/^\+(?:[0-9] ?){6,14}[0-9]$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      education: ['', [Validators.required]],
      experience: ['', [Validators.required]],
      background: ['', [Validators.required, Validators.minLength(10)]],
      additionalComments: [''],
    });
  }

  ngOnInit() {
  }

  onFileChange(event: any) {
    const selectedFile = event.target.files[0];
    const maxSizeMB = 5;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (selectedFile && selectedFile.size > maxSizeMB * 1024 * 1024) {
      this.file = null;
      this.fileError = 'File size exceeds 5MB limit. Please upload a smaller file.';
      return;
    }

    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      this.file = null;
      this.fileError = 'Only PDF or DOCX files are allowed.';
      return;
    }

    this.file = selectedFile;
    this.fileError = '';
  }

  nextStep() {
    if (this.step === 8 && this.fileError) return;
    if (this.step < this.totalSteps - 1) this.step++;
  }

  prevStep() {
    if (this.step > 0) this.step--;
  }

  onSubmit() {
    if (this.form.invalid || this.fileError) {
      this.form.markAllAsTouched();
      return;
    }

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
    formData.append(
      'IsIdeaSubmitter',
      this.formType === 'idea' ? 'true' : 'false'
    );
    formData.append('IsFunder', this.formType === 'fund' ? 'true' : 'false');

    if (this.file) {
      formData.append('file', this.file);
    }

    this.http
      .post(`${environment.apiUrl}/api/user/submit`, formData)
      .subscribe({
        next: () => {
          alert('Form submitted successfully!');
          this.close.emit();
        },
        error: () => alert('Failed to submit form'),
      });
  }

  closeModal() {
    this.close.emit();
  }

  getField(name: string) {
    return this.form.get(name);
  }

  isNextDisabled(): boolean {
    if (this.step === 9) return false;
  
    if (this.step === 8) return !!this.fileError;
  
    return !this.getStepControl()?.valid;
  }
  

  getStepControl() {
    const fields = [
      'name', 'phone', 'email', 'address',
      'education', 'experience', 'background', 'additionalComments'
    ];
    return this.form.get(fields[this.step]);
  }  
}