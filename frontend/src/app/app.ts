import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface WorkOrder {
  id: number;
  customer_id: number;
  customer_name: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  apiUrl = 'http://localhost:3000/api';

  customers: Customer[] = [];
  workOrders: WorkOrder[] = [];

  searchText = '';
  selectedStatus = '';

  form = {
    id: null as number | null,
    customer_id: '',
    title: '',
    description: '',
    status: 'New'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadWorkOrders();
  }

  loadCustomers(): void {
    this.http.get<Customer[]>(`${this.apiUrl}/customers`).subscribe({
      next: data => this.customers = data,
      error: err => console.error('Error loading customers', err)
    });
  }

  loadWorkOrders(): void {
    let url = `${this.apiUrl}/work-orders?`;

    if (this.searchText.trim()) {
      url += `search=${encodeURIComponent(this.searchText.trim())}&`;
    }

    if (this.selectedStatus) {
      url += `status=${encodeURIComponent(this.selectedStatus)}&`;
    }

    this.http.get<WorkOrder[]>(url).subscribe({
      next: data => this.workOrders = data,
      error: err => console.error('Error loading work orders', err)
    });
  }

  saveWorkOrder(): void {
    if (!this.form.customer_id || !this.form.title.trim()) {
      alert('Customer and title are required.');
      return;
    }

    const data = {
      customer_id: Number(this.form.customer_id),
      title: this.form.title,
      description: this.form.description,
      status: this.form.status
    };

    if (this.form.id) {
      this.http.put(`${this.apiUrl}/work-orders/${this.form.id}`, data).subscribe({
        next: () => {
          this.loadWorkOrders();
          this.resetForm();
        },
        error: err => console.error('Error updating work order', err)
      });
    } else {
      this.http.post(`${this.apiUrl}/work-orders`, data).subscribe({
        next: () => {
          this.loadWorkOrders();
          this.resetForm();
        },
        error: err => console.error('Error creating work order', err)
      });
    }
  }

  editWorkOrder(order: WorkOrder): void {
    this.form = {
      id: order.id,
      customer_id: String(order.customer_id),
      title: order.title,
      description: order.description,
      status: order.status
    };
  }

  deleteWorkOrder(id: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this work order?');

    if (!confirmDelete) {
      return;
    }

    this.http.delete(`${this.apiUrl}/work-orders/${id}`).subscribe({
      next: () => this.loadWorkOrders(),
      error: err => console.error('Error deleting work order', err)
    });
  }

  resetForm(): void {
    this.form = {
      id: null,
      customer_id: '',
      title: '',
      description: '',
      status: 'New'
    };
  }
}
