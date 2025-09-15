import { FC, useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Phone as PhoneIcon,
  Sms as SmsIcon,
  CheckCircle as SuccessIcon,
  Schedule as ActivityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ErrorAlert } from '../../components/ErrorAlert';

interface UserStats {
  total_calls: number;
  total_sms: number;
  this_month_calls: number;
  this_month_sms: number;
  success_rate: number;
  last_activity: string;
  call_trend?: {
    value: number;
    isPositive: boolean;
  };
  sms_trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, trend }) => (
  <Card elevation={0}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" gutterBottom>
        {value}
      </Typography>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', color: trend.isPositive ? 'success.main' : 'error.main' }}>
          {trend.isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {trend.value}% {trend.isPositive ? 'increase' : 'decrease'}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

export const DashboardPage: FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        } else {
          throw new Error(data.message || 'Failed to fetch stats');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <ErrorAlert message={error} />;
  if (!stats) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Calls"
            value={stats.total_calls}
            icon={<PhoneIcon color="primary" />}
            trend={stats.call_trend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total SMS"
            value={stats.total_sms}
            icon={<SmsIcon color="primary" />}
            trend={stats.sms_trend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Success Rate"
            value={`${stats.success_rate}%`}
            icon={<SuccessIcon color="success" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Last Activity"
            value={format(new Date(stats.last_activity), 'PPp')}
            icon={<ActivityIcon color="info" />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                This Month
              </Typography>
              <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                <Box>
                  <Typography color="text.secondary">Calls</Typography>
                  <Typography variant="h4">{stats.this_month_calls}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary">SMS</Typography>
                  <Typography variant="h4">{stats.this_month_sms}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};