const API_BASE_URL = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    // Add retry logic for failed requests
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(url, { 
          ...options, 
          headers
        });
      
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        const hasJsonContent = contentType && contentType.includes('application/json');
      
        if (!response.ok) {
          let errorMessage = 'Request failed';
          if (hasJsonContent) {
            try {
              const error = await response.json();
              errorMessage = error.error || errorMessage;
            } catch {
              // If JSON parsing fails, use default message
            }
          }
          
          // If it's a server error (5xx) and we haven't exhausted retries, try again
          if (response.status >= 500 && retryCount < maxRetries - 1) {
            retryCount++;
            console.log(`Request failed with ${response.status}, retrying (${retryCount}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          }
          
          throw new Error(errorMessage);
        }

        // Only parse JSON if response has JSON content
        if (hasJsonContent) {
          return await response.json();
        } else {
          // Return empty object for non-JSON responses
          return {} as T;
        }
      } catch (error) {
        // If it's a network error and we haven't exhausted retries, try again
        if (retryCount < maxRetries - 1 && (
          error instanceof TypeError || // Network error
          (error as any).name === 'AbortError' // Timeout
        )) {
          retryCount++;
          console.log(`Network error, retrying (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
        
        console.error('API request failed:', error);
        throw error;
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  // Auth
  async login(username: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<any>('/dashboard/stats');
  }

  // Products
  async getProducts(params?: { 
    search?: string; 
    category?: string; 
    barcode?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<any[]>(`/products${query}`);
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(product: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  async createCategory(category: any) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  // Suppliers
  async getSuppliers() {
    return this.request<any[]>('/suppliers');
  }

  async createSupplier(supplier: any) {
    return this.request<any>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
  }

  // Members
  async getMembers() {
    return this.request<any[]>('/members');
  }

  async getMember(phone: string) {
    return this.request<any>(`/members/${phone}`);
  }

  async createMember(member: any) {
    return this.request<any>('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  }

  // Sales
  async createSale(sale: any) {
    return this.request<any>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  async getSales() {
    return this.request<any[]>('/sales');
  }

  // Reports
  async getSalesReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request<any>(`/reports/sales?${params.toString()}`);
  }

  async getInventoryReport() {
    return this.request<any>('/reports/inventory');
  }

  // Payments
  async createPaymentIntent(amount: number, currency = 'thb') {
    return this.request<any>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }
}

export const apiService = new ApiService();