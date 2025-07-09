import { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Work,
  Person,
  DirectionsCar,
  Receipt,
  Remove,
} from '@mui/icons-material';
import { Layout } from '~/components/Layout';
import { getAuthToken } from '~/utils/auth';
import { workOrdersApi, partsApi, WorkOrder, Part } from '~/utils/api';

interface WorkOrderFormData {
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    mileage: number;
  };
  laborCost: number;
  notes: string;
  parts: Array<{
    partId: string;
    quantity: number;
    part?: Part;
  }>;
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState<WorkOrder | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<WorkOrderFormData>({
    customer: {
      name: '',
      phone: '',
      email: '',
    },
    vehicleInfo: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      plateNumber: '',
      mileage: 0,
    },
    laborCost: 0,
    notes: '',
    parts: [],
  });

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success' as const;
      case 'in-progress':
        return 'warning' as const;
      case 'cancelled':
        return 'error' as const;
      default:
        return 'default' as const;
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    loadData();
  }, [navigate]);

  useEffect(() => {
    let filtered = workOrders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vehicleInfo.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vehicleInfo.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vehicleInfo.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWorkOrders(filtered);
  }, [searchTerm, statusFilter, workOrders]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load work orders
      const workOrdersResponse = await workOrdersApi.getAll();
      if (workOrdersResponse.success && workOrdersResponse.data) {
        setWorkOrders(workOrdersResponse.data);
        setFilteredWorkOrders(workOrdersResponse.data);
      }

      // Load parts
      const partsResponse = await partsApi.getAll();
      if (partsResponse.success && partsResponse.data) {
        setParts(partsResponse.data);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer: {
        name: '',
        phone: '',
        email: '',
      },
      vehicleInfo: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        plateNumber: '',
        mileage: 0,
      },
      laborCost: 0,
      notes: '',
      parts: [],
    });
  };

  const handleAddWorkOrder = () => {
    setEditingWorkOrder(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setFormData({
      customer: {
        name: workOrder.customer.name,
        phone: workOrder.customer.phone ?? '',
        email: workOrder.customer.email ?? '',
      },
      vehicleInfo: {
        make: workOrder.vehicleInfo.make,
        model: workOrder.vehicleInfo.model,
        year: workOrder.vehicleInfo.year,
        plateNumber: workOrder.vehicleInfo.plateNumber ?? '',
        mileage: workOrder.vehicleInfo.mileage ?? 0,
      },
      laborCost: workOrder.laborCost,
      notes: workOrder.notes || '',
      parts: workOrder.parts?.map(wp => ({
        partId: wp.partId._id,
        quantity: wp.quantity,
        part: parts.find(p => p._id === wp.partId._id),
      })) || [],
    });
    setDialogOpen(true);
  };

  const handleDeleteWorkOrder = (workOrder: WorkOrder) => {
    setWorkOrderToDelete(workOrder);
    setDeleteDialogOpen(true);
  };

  const handleSaveWorkOrder = async () => {
    try {
      const workOrderData = {
        customer: formData.customer,
        vehicleInfo: formData.vehicleInfo,
        laborCost: formData.laborCost,
        notes: formData.notes,
        parts: formData.parts.map(p => ({
          partId: p.partId,
          quantity: p.quantity,
        })),
      };

      if (editingWorkOrder) {
        // Update existing work order (only status and notes for now)
        const response = await workOrdersApi.update(editingWorkOrder._id, {
          notes: formData.notes,
          laborCost: formData.laborCost,
        });
        if (response.success) {
          loadData();
          setDialogOpen(false);
        } else {
          setError(response.message || 'Failed to update work order');
        }
      } else {
        // Create new work order
        const response = await workOrdersApi.create(workOrderData);
        if (response.success) {
          loadData();
          setDialogOpen(false);
        } else {
          setError(response.message || 'Failed to create work order');
        }
      }
    } catch (err) {
      setError('Failed to save work order');
      console.error('Save work order error:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!workOrderToDelete) return;

    try {
      const response = await workOrdersApi.delete(workOrderToDelete._id);
      if (response.success) {
        loadData();
        setDeleteDialogOpen(false);
        setWorkOrderToDelete(null);
      } else {
        setError(response.message || 'Failed to delete work order');
      }
    } catch (err) {
      setError('Failed to delete work order');
      console.error('Delete work order error:', err);
    }
  };

  const handleAddPart = () => {
    setFormData({
      ...formData,
      parts: [...formData.parts, { partId: '', quantity: 1 }],
    });
  };

  const handleRemovePart = (index: number) => {
    const newParts = formData.parts.filter((_, i) => i !== index);
    setFormData({ ...formData, parts: newParts });
  };

  const handlePartChange = (index: number, field: string, value: any) => {
    const newParts = [...formData.parts];
    if (field === 'partId') {
      newParts[index] = { ...newParts[index], partId: value };
      const selectedPart = parts.find(p => p._id === value);
      if (selectedPart) {
        newParts[index].part = selectedPart;
      }
    } else {
      newParts[index] = { ...newParts[index], [field]: value };
    }
    setFormData({ ...formData, parts: newParts });
  };

  const calculateTotal = () => {
    const partsTotal = formData.parts.reduce((sum, p) => {
      const part = parts.find(part => part._id === p.partId);
      return sum + (part ? part.unitPrice * p.quantity : 0);
    }, 0);
    return partsTotal + formData.laborCost;
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Work Orders</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddWorkOrder}
        >
          Create Work Order
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search work orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{filteredWorkOrders.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                {statusFilter === 'all' ? 'Total Orders' : `${statuses.find(s => s.value === statusFilter)?.label} Orders`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Work Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Labor Cost</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.workOrderNo}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body1">{order.customer.name}</Typography>
                    {order.customer.phone && (
                      <Typography variant="body2" color="textSecondary">
                        {order.customer.phone}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body1">
                      {order.vehicleInfo.make} {order.vehicleInfo.model}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {order.vehicleInfo.year} {order.vehicleInfo.plateNumber && `• ${order.vehicleInfo.plateNumber}`}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>${order.laborCost.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditWorkOrder(order)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteWorkOrder(order)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Work Order Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingWorkOrder ? 'Edit Work Order' : 'Create Work Order'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.customer.name}
                onChange={(e) => setFormData({
                  ...formData,
                  customer: { ...formData.customer, name: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.customer.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  customer: { ...formData.customer, phone: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.customer.email}
                onChange={(e) => setFormData({
                  ...formData,
                  customer: { ...formData.customer, email: e.target.value }
                })}
              />
            </Grid>

            {/* Vehicle Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
                Vehicle Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Make"
                value={formData.vehicleInfo.make}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicleInfo: { ...formData.vehicleInfo, make: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model"
                value={formData.vehicleInfo.model}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicleInfo: { ...formData.vehicleInfo, model: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={formData.vehicleInfo.year}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicleInfo: { ...formData.vehicleInfo, year: parseInt(e.target.value) || 0 }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Plate Number"
                value={formData.vehicleInfo.plateNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicleInfo: { ...formData.vehicleInfo, plateNumber: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mileage"
                type="number"
                value={formData.vehicleInfo.mileage}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicleInfo: { ...formData.vehicleInfo, mileage: parseInt(e.target.value) || 0 }
                })}
              />
            </Grid>

            {/* Parts and Labor */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                Parts and Labor
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Parts Selection */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">Parts</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddPart}
                  disabled={editingWorkOrder !== null}
                >
                  Add Part
                </Button>
              </Box>
              {formData.parts.map((part, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Part</InputLabel>
                      <Select
                        value={part.partId}
                        label="Part"
                        onChange={(e) => handlePartChange(index, 'partId', e.target.value)}
                        disabled={editingWorkOrder !== null}
                      >
                        {parts.map((p) => (
                          <MenuItem key={p._id} value={p._id}>
                            {p.name} - ${p.unitPrice} (Stock: {p.qtyAvailable})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={part.quantity}
                      onChange={(e) => handlePartChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      disabled={editingWorkOrder !== null}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      ${((parts.find(p => p._id === part.partId)?.unitPrice || 0) * part.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      onClick={() => handleRemovePart(index)}
                      disabled={editingWorkOrder !== null}
                    >
                      <Remove />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Grid>

            {/* Labor Cost */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Labor Cost"
                type="number"
                value={formData.laborCost}
                onChange={(e) => setFormData({
                  ...formData,
                  laborCost: parseFloat(e.target.value) || 0
                })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Total */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    Total: ${calculateTotal().toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWorkOrder} variant="contained">
            {editingWorkOrder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete work order "{workOrderToDelete?.workOrderNo}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
