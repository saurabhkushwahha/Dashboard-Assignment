import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Box, Grid, Typography } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const NewsAnalytics = ({ data }) => {
  const analytics = useMemo(() => {
    const authorStats = {};
    const sourceStats = {};

    data.forEach(article => {
      // Author statistics
      const author = article.author || 'Unknown';
      authorStats[author] = (authorStats[author] || 0) + 1;

      // Source statistics
      const source = article.source?.name || 'Unknown';
      sourceStats[source] = (sourceStats[source] || 0) + 1;
    });

    // Convert to array format for charts
    const authorData = Object.entries(authorStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const sourceData = Object.entries(sourceStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { authorData, sourceData };
  }, [data]);

  return (
    <Grid container spacing={3}>
      {/* Author Distribution */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          Top Authors
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={analytics.authorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Grid>

      {/* Source Distribution */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          Source Distribution
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={analytics.sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Grid>
    </Grid>
  );
};

export default NewsAnalytics;