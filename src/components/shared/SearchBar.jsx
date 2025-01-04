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
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search news..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            type="date"
            label="From Date"
            value={filters.dateFrom}
            onChange={(e) => handleDateChange('dateFrom', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            type="date"
            label="To Date"
            value={filters.dateTo}
            onChange={(e) => handleDateChange('dateTo', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
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