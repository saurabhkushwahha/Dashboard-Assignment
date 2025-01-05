import { useState } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import NewsAnalytics from './NewsAnalytics';
import PayoutDetails from './PayoutDetails';
import SearchBar from '../shared/SearchBar';

const Dashboard = () => {
  const { news, loading, error } = useNews();
  const [selectedArticle, setSelectedArticle] = useState(null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: { xs: 2, md: 4 },
        mb: 4,
        px: { xs: 1, sm: 2, md: 3 },
        '& .MuiPaper-root': {
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 16px rgba(255, 215, 0, 0.15)'
              : '0 8px 16px rgba(255, 193, 7, 0.2)',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark'
              ? 'rgba(255, 215, 0, 0.1)'
              : 'rgba(255, 193, 7, 0.1)'}`,
          }
        }
      }}
    >
      <Grid container spacing={3}>
        {/* Search Bar */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <SearchBar />
          </Paper>
        </Grid>

        {/* Analytics Section */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              News Analytics
            </Typography>
            <NewsAnalytics data={news} />
          </Paper>
        </Grid>

        {/* Payout Details */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payout Details
            </Typography>
            <PayoutDetails data={news} />
          </Paper>
        </Grid>

        {/* News List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent News
            </Typography>
            {news.slice(0, 5).map((article, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {article.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  By {article.author || 'Unknown'} | {new Date(article.publishedAt).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;