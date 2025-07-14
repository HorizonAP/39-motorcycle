import { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
} from '@mui/material';
import { TrendingUp, TrendingDown, Search } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { getAuthToken } from '../utils/auth';
import { stockApi, StockMovement } from '../utils/api';

export default function StockHistoryPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'IN', label: 'Stock In' },
    { value: 'OUT', label: 'Stock Out' },
  ];

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    loadMovements();
  }, [navigate]);

  useEffect(() => {
    let filtered = movements;

    if (typeFilter !== 'all') {
      filtered = filtered.filter((movement) => movement.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (movement) =>
          movement.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMovements(filtered);
  }, [searchTerm, typeFilter, movements]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const response = await stockApi.getMovements({ limit: 100 });
      if (response.success && response.data) {
        setMovements(response.data);
        setFilteredMovements(response.data);
      } else {
        setError('Failed to load stock movements');
      }
    } catch (err) {
      setError('Failed to load stock movements');
      console.error('Stock movements error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    return type === 'IN' ? (
      <TrendingUp sx={{ color: 'success.main' }} />
    ) : (
      <TrendingDown sx={{ color: 'error.main' }} />
    );
  };

  const getMovementColor = (type: string) => {
    return type === 'IN' ? ('success' as const) : ('error' as const);
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
      <Typography variant="h4" gutterBottom>
        Stock History
      </Typography>

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
            label="Search movements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {typeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{filteredMovements.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                {typeFilter === 'all'
                  ? 'Total Movements'
                  : `${
                      typeOptions.find((t) => t.value === typeFilter)?.label
                    } Movements`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stock Movements Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Part</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Created By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMovements.map((movement) => (
              <TableRow key={movement._id}>
                <TableCell>
                  {new Date(movement.createdAt).toLocaleDateString()}{' '}
                  {new Date(movement.createdAt).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getMovementIcon(movement.type)}
                    <Chip
                      label={movement.type}
                      color={getMovementColor(movement.type)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {movement.partId &&
                  typeof movement.partId === 'object' &&
                  'name' in movement.partId ? (
                    <Box>
                      <Typography variant="body1">
                        {(movement.partId as any).name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        SKU: {(movement.partId as any).sku}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1">
                      Part ID: {movement.partId}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell>{movement.refNo}</TableCell>
                <TableCell>{movement.notes || '-'}</TableCell>
                <TableCell>{movement.createdBy.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
}
