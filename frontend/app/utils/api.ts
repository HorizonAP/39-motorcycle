import { api } from './auth';

export interface Part {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  qtyAvailable: number;
  minStockLevel: number;
  category?: string;
  brand?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  _id: string;
  partId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  refNo: string;
  notes?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export interface WorkOrder {
  _id: string;
  workOrderNo: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    plateNumber?: string;
    mileage?: number;
  };
  laborCost: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  parts?: WorkOrderPart[];
}

export interface WorkOrderPart {
  _id: string;
  workOrderId: string;
  partId: {
    _id: string;
    sku: string;
    name: string;
  };
  quantity: number;
  unitPriceSnapshot: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const partsApi = {
  async getAll(): Promise<ApiResponse<Part[]>> {
    return api.request<ApiResponse<Part[]>>('/parts');
  },

  async getById(id: string): Promise<ApiResponse<Part>> {
    return api.request<ApiResponse<Part>>(`/parts/${id}`);
  },

  async create(part: Omit<Part, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Part>> {
    return api.request<ApiResponse<Part>>('/parts', {
      method: 'POST',
      body: JSON.stringify(part),
    });
  },

  async update(id: string, part: Partial<Part>): Promise<ApiResponse<Part>> {
    return api.request<ApiResponse<Part>>(`/parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(part),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return api.request<ApiResponse<void>>(`/parts/${id}`, {
      method: 'DELETE',
    });
  },

  async getStockHistory(id: string): Promise<ApiResponse<StockMovement[]>> {
    return api.request<ApiResponse<StockMovement[]>>(`/parts/${id}/stock-history`);
  },

  async getLowStock(): Promise<ApiResponse<Part[]>> {
    return api.request<ApiResponse<Part[]>>('/parts/low-stock/alert');
  },
};

export const stockApi = {
  async createMovement(movement: {
    partId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    refNo: string;
    notes?: string;
  }): Promise<ApiResponse<StockMovement>> {
    return api.request<ApiResponse<StockMovement>>('/stock/movement', {
      method: 'POST',
      body: JSON.stringify(movement),
    });
  },

  async getMovements(filters?: {
    partId?: string;
    type?: 'IN' | 'OUT';
    limit?: number;
  }): Promise<ApiResponse<StockMovement[]>> {
    const params = new URLSearchParams();
    if (filters?.partId) params.append('partId', filters.partId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return api.request<ApiResponse<StockMovement[]>>(`/stock/movements?${params}`);
  },

  async getLowStock(): Promise<ApiResponse<Part[]>> {
    return api.request<ApiResponse<Part[]>>('/stock/low-stock');
  },
};

export const workOrdersApi = {
  async getAll(filters?: {
    status?: string;
    limit?: number;
  }): Promise<ApiResponse<WorkOrder[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return api.request<ApiResponse<WorkOrder[]>>(`/work-orders?${params}`);
  },

  async getById(id: string): Promise<ApiResponse<WorkOrder>> {
    return api.request<ApiResponse<WorkOrder>>(`/work-orders/${id}`);
  },

  async create(workOrder: {
    customer: {
      name: string;
      phone?: string;
      email?: string;
    };
    vehicleInfo: {
      make: string;
      model: string;
      year: number;
      plateNumber?: string;
      mileage?: number;
    };
    laborCost: number;
    notes?: string;
    parts: Array<{
      partId: string;
      quantity: number;
    }>;
  }): Promise<ApiResponse<WorkOrder>> {
    return api.request<ApiResponse<WorkOrder>>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(workOrder),
    });
  },

  async update(id: string, updates: {
    status?: string;
    notes?: string;
    laborCost?: number;
  }): Promise<ApiResponse<WorkOrder>> {
    return api.request<ApiResponse<WorkOrder>>(`/work-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return api.request<ApiResponse<void>>(`/work-orders/${id}`, {
      method: 'DELETE',
    });
  },
};
