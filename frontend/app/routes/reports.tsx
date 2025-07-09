import { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Assessment,
  Inventory,
  Work,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { Layout } from '~/components/Layout';
import { getAuthToken } from '~/utils/auth';
import {
  partsApi,
  workOrdersApi,
  stockApi,
  Part,
  WorkOrder,
} from '~/utils/api';

interface ReportsData {
  totalParts: number;
  totalStockValue: number;
  lowStockParts: Part[];
  recentWorkOrders: WorkOrder[];
  workOrdersByStatus: { [key: string]: number };
  topSellingParts: Part[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData>({
    totalParts: 0,
    totalStockValue: 0,
    lowStockParts: [],
    recentWorkOrders: [],
    workOrdersByStatus: {},
    topSellingParts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    loadReportsData();
  }, [navigate]);

  const loadReportsData = async () => {
    try {
      setLoading(true);

      // Load parts data
      const partsResponse = await partsApi.getAll();
      if (partsResponse.success && partsResponse.data) {
        const parts = partsResponse.data;
        const totalStockValue = parts.reduce(
          (sum, part) => sum + part.unitPrice * part.qtyAvailable,
          0
        );

        setData((prev) => ({
          ...prev,
          totalParts: parts.length,
          totalStockValue,
          topSellingParts: parts.slice(0, 5),
        }));
      }

      // Load low stock parts
      const lowStockResponse = await partsApi.getLowStock();
      if (lowStockResponse.success && lowStockResponse.data) {
        setData((prev) => ({
          ...prev,
          lowStockParts: lowStockResponse.data ?? [],
        }));
      }

      // Load work orders
      const workOrdersResponse = await workOrdersApi.getAll();
      if (workOrdersResponse.success && workOrdersResponse.data) {
        const workOrders = workOrdersResponse.data;
        const statusCounts = workOrders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        setData((prev) => ({
          ...prev,
          recentWorkOrders: workOrders.slice(0, 5),
          workOrdersByStatus: statusCounts,
        }));
      }
    } catch (err) {
      setError('Failed to load reports data');
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        Reports & Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory
                  sx={{ fontSize: 40, color: 'primary.main', mr: 2 }}
                />
                <Box>
                  <Typography variant="h4">{data.totalParts}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Parts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp
                  sx={{ fontSize: 40, color: 'success.main', mr: 2 }}
                />
                <Box>
                  <Typography variant="h4">
                    ${data.totalStockValue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Stock Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {data.lowStockParts.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Low Stock Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {data.recentWorkOrders.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Recent Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Work Orders by Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Work Orders by Status
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(data.workOrdersByStatus).map(
                    ([status, count]) => (
                      <TableRow key={status}>
                        <TableCell>
                          <Chip
                            label={status}
                            color={getStatusColor(status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{count}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Parts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Parts
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Part</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Min Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.lowStockParts.slice(0, 5).map((part) => (
                    <TableRow key={part._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body1">{part.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {part.sku}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={part.qtyAvailable}
                          color={part.qtyAvailable === 0 ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{part.minStockLevel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
