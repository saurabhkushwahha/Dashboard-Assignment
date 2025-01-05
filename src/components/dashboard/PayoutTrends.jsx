import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';

const PayoutTrends = ({ data, payoutRates }) => {
  const muiTheme = useMuiTheme();
  const chartColors = {
    articles: muiTheme.palette.mode === 'dark' ? '#FFD700' : '#FFC107',
    payout: muiTheme.palette.mode === 'dark' ? '#FFB300' : '#FF9800'
  };

  const trendData = useMemo(() => {
    const dailyStats = data.reduce((acc, article) => {
      const date = new Date(article.publishedAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, articles: 0, payout: 0 };
      }
      acc[date].articles += 1;
      acc[date].payout += article.type === 'blog' ? payoutRates.blog : payoutRates.news;
      return acc;
    }, {});

    return Object.values(dailyStats).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );
  }, [data, payoutRates]);

  const totalArticles = trendData.reduce((sum, day) => sum + day.articles, 0);
  const totalPayout = trendData.reduce((sum, day) => sum + day.payout, 0);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Payout Trends
        </Typography>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total Articles: {totalArticles}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Payout: ${totalPayout.toFixed(2)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="articles"
              stroke={chartColors.articles}
              name="Articles"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="payout"
              stroke={chartColors.payout}
              name="Payout ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default PayoutTrends;