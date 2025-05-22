import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';           // ✅ Add this
import { FormComponent } from '../form/form.component';   // Adjust path if needed

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterModule, CommonModule, FormComponent]    // ✅ Include CommonModule
})
export class HomeComponent {
  showForm = false;
  selectedFormType: 'idea' | 'fund' = 'idea';

  openForm(type: 'idea' | 'fund') {
    this.selectedFormType = type;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }
}
