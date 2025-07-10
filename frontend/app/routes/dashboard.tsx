import { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { Layout } from '~/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { 
  Package,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalParts: number;
  lowStockParts: number;
  activeWorkOrders: number;
  completedWorkOrders: number;
  totalStockValue: number;
}

interface Part {
  _id: string;
  sku: string;
  name: string;
  qtyAvailable: number;
  minStockLevel: number;
  unitPrice: number;
}

interface WorkOrder {
  _id: string;
  workOrderNo: string;
  customer: {
    name: string;
  };
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalParts: 0,
    lowStockParts: 0,
    activeWorkOrders: 0,
    completedWorkOrders: 0,
    totalStockValue: 0,
  });
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);
  const [recentWorkOrders, setRecentWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load parts data
      const partsResponse = await partsApi.getAll();
      if (partsResponse.success && partsResponse.data) {
        const parts = partsResponse.data;
        const totalStockValue = parts.reduce((sum, part) => sum + (part.unitPrice * part.qtyAvailable), 0);
        
        setStats(prev => ({
          ...prev,
          totalParts: parts.length,
          totalStockValue,
        }));
      }

      // Load low stock parts
      const lowStockResponse = await partsApi.getLowStock();
      if (lowStockResponse.success && lowStockResponse.data) {
        setLowStockParts(lowStockResponse.data);
        setStats(prev => ({
          ...prev,
          lowStockParts: (lowStockResponse.data ?? []).length,
        }));
      }

      // Load work orders
      const workOrdersResponse = await workOrdersApi.getAll({ limit: 10 });
      if (workOrdersResponse.success && workOrdersResponse.data) {
        const workOrders = workOrdersResponse.data;
        setRecentWorkOrders(workOrders);
        
        const activeCount = workOrders.filter(wo => wo.status === 'pending' || wo.status === 'in-progress').length;
        const completedCount = workOrders.filter(wo => wo.status === 'completed').length;
        
        setStats(prev => ({
          ...prev,
          activeWorkOrders: activeCount,
          completedWorkOrders: completedCount,
        }));
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockLevelColor = (part: Part) => {
    const percentage = (part.qtyAvailable / part.minStockLevel) * 100;
    if (percentage <= 50) return 'error';
    if (percentage <= 100) return 'warning';
    return 'success';
  };

  const getStockLevelPercentage = (part: Part) => {
    return Math.min((part.qtyAvailable / (part.minStockLevel * 2)) * 100, 100);
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

  if (error) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalParts}</Typography>
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
                <Warning sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.lowStockParts}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Low Stock
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
                  <Typography variant="h4">{stats.activeWorkOrders}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Orders
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
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">${stats.totalStockValue.toFixed(2)}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Stock Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Low Stock Alert */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Alert
              </Typography>
              {lowStockParts.length === 0 ? (
                <Typography color="textSecondary">
                  All parts are well stocked
                </Typography>
              ) : (
                <List>
                  {lowStockParts.slice(0, 5).map((part) => (
                    <ListItem key={part._id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body1">{part.name}</Typography>
                            <Chip
                              label={`${part.qtyAvailable} left`}
                              size="small"
                              color={getStockLevelColor(part)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              SKU: {part.sku} | Min: {part.minStockLevel}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={getStockLevelPercentage(part)}
                              color={getStockLevelColor(part)}
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              {lowStockParts.length > 5 && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/parts')}
                  sx={{ mt: 2 }}
                >
                  View All Low Stock Parts
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Work Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Work Orders
              </Typography>
              {recentWorkOrders.length === 0 ? (
                <Typography color="textSecondary">
                  No work orders yet
                </Typography>
              ) : (
                <List>
                  {recentWorkOrders.slice(0, 5).map((order) => (
                    <ListItem key={order._id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body1">{order.workOrderNo}</Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              color={
                                order.status === 'completed' ? 'success' :
                                order.status === 'in-progress' ? 'warning' :
                                order.status === 'cancelled' ? 'error' : 'default'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            {order.customer.name} - {order.vehicleInfo.make} {order.vehicleInfo.model}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/work-orders')}
                sx={{ mt: 2 }}
              >
                View All Work Orders
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}
