import { useState } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = () => {
  const { filters, setFilters } = useNews();
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      searchQuery: searchInput,
    }));
  };

  const handleDateChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      type: event.target.value,
    }));
  };

  return (
    <Box component="form" onSubmit={handleSearch}>
      <Grid
        container
        spacing={{ xs: 1, sm: 2 }}
        alignItems="center"
        sx={{
          transition: 'all 0.3s ease',
          '& .MuiTextField-root': {
            transition: 'all 0.3s ease',
          }
        }}
      >
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search news..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  '& > fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    type="submit"
                    edge="end"
                    sx={{
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            type="date"
            label="From Date"
            value={filters.dateFrom}
            onChange={(e) => handleDateChange('dateFrom', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            type="date"
            label="To Date"
            value={filters.dateTo}
            onChange={(e) => handleDateChange('dateTo', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={handleTypeChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="news">News</MenuItem>
              <MenuItem value="blog">Blog</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchBar;