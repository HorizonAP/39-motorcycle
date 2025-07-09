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
  Fab,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Inventory,
  Warning,
  History,
} from '@mui/icons-material';
import { Layout } from '~/components/Layout';
import { getAuthToken } from '~/utils/auth';
import { partsApi, Part } from '~/utils/api';

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<Part | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unitPrice: 0,
    qtyAvailable: 0,
    minStockLevel: 5,
    category: '',
    brand: '',
  });

  const categories = [
    'Brakes',
    'Drive Train',
    'Engine',
    'Filters',
    'Fluids',
    'Suspension',
    'Electrical',
    'Tires',
    'Accessories',
    'Other',
  ];

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    loadParts();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = parts.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParts(filtered);
    } else {
      setFilteredParts(parts);
    }
  }, [searchTerm, parts]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const response = await partsApi.getAll();
      if (response.success && response.data) {
        setParts(response.data);
        setFilteredParts(response.data);
      } else {
        setError('Failed to load parts');
      }
    } catch (err) {
      setError('Failed to load parts');
      console.error('Parts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = () => {
    setEditingPart(null);
    setFormData({
      sku: '',
      name: '',
      description: '',
      unitPrice: 0,
      qtyAvailable: 0,
      minStockLevel: 5,
      category: '',
      brand: '',
    });
    setDialogOpen(true);
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    setFormData({
      sku: part.sku,
      name: part.name,
      description: part.description || '',
      unitPrice: part.unitPrice,
      qtyAvailable: part.qtyAvailable,
      minStockLevel: part.minStockLevel,
      category: part.category || '',
      brand: part.brand || '',
    });
    setDialogOpen(true);
  };

  const handleDeletePart = (part: Part) => {
    setPartToDelete(part);
    setDeleteDialogOpen(true);
  };

  const handleSavePart = async () => {
    try {
      if (editingPart) {
        // Update existing part
        const response = await partsApi.update(editingPart._id, formData);
        if (response.success) {
          loadParts();
          setDialogOpen(false);
        } else {
          setError(response.message || 'Failed to update part');
        }
      } else {
        // Create new part
        const response = await partsApi.create(formData);
        if (response.success) {
          loadParts();
          setDialogOpen(false);
        } else {
          setError(response.message || 'Failed to create part');
        }
      }
    } catch (err) {
      setError('Failed to save part');
      console.error('Save part error:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!partToDelete) return;

    try {
      const response = await partsApi.delete(partToDelete._id);
      if (response.success) {
        loadParts();
        setDeleteDialogOpen(false);
        setPartToDelete(null);
      } else {
        setError(response.message || 'Failed to delete part');
      }
    } catch (err) {
      setError('Failed to delete part');
      console.error('Delete part error:', err);
    }
  };

  const getStockStatus = (part: Part) => {
    if (part.qtyAvailable === 0) {
      return { label: 'Out of Stock', color: 'error' as const };
    } else if (part.qtyAvailable <= part.minStockLevel) {
      return { label: 'Low Stock', color: 'warning' as const };
    } else {
      return { label: 'In Stock', color: 'success' as const };
    }
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
        <Typography variant="h4">Parts Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddPart}
        >
          Add Part
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search parts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{parts.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Parts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">
                    {parts.filter(p => p.qtyAvailable <= p.minStockLevel).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Low Stock
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">
                    ${parts.reduce((sum, p) => sum + (p.unitPrice * p.qtyAvailable), 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Stock Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Parts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredParts.map((part) => {
              const status = getStockStatus(part);
              return (
                <TableRow key={part._id}>
                  <TableCell>{part.sku}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body1">{part.name}</Typography>
                      {part.description && (
                        <Typography variant="body2" color="textSecondary">
                          {part.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{part.category || '-'}</TableCell>
                  <TableCell>{part.brand || '-'}</TableCell>
                  <TableCell>${part.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Typography variant="body1">{part.qtyAvailable}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Min: {part.minStockLevel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditPart(part)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePart(part)}>
                      <Delete />
                    </IconButton>
                    <IconButton onClick={() => navigate(`/parts/${part._id}/history`)}>
                      <History />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Part Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPart ? 'Edit Part' : 'Add New Part'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                select
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantity Available"
                type="number"
                value={formData.qtyAvailable}
                onChange={(e) => setFormData({ ...formData, qtyAvailable: parseInt(e.target.value) || 0 })}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Min Stock Level"
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePart} variant="contained">
            {editingPart ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{partToDelete?.name}"?
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
