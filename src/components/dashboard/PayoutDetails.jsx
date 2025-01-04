import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  TablePagination,
  Tooltip,
  IconButton,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import { useNews } from '../../context/NewsContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { toast } from 'react-hot-toast';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import PayoutTrends from './PayoutTrends';

const PayoutDetails = ({ data }) => {
  const { payoutRates, updatePayoutRate } = useNews();
  const [editingRates, setEditingRates] = useState(false);
  const [tempRates, setTempRates] = useState(payoutRates);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isExporting, setIsExporting] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minArticles: '',
    maxArticles: '',
    minPayout: '',
    maxPayout: '',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('all');

  const filterPresets = {
    all: {
      label: 'All Time',
      filter: {},
    },
    week: {
      label: 'Last 7 Days',
      filter: {
        minPayout: 0,
      },
    },
    highValue: {
      label: 'High Value Authors',
      filter: {
        minArticles: 5,
        minPayout: 100,
      },
    },
    newAuthors: {
      label: 'New Authors',
      filter: {
        maxArticles: 3,
      },
    },
  };

  const applyPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    setAdvancedFilters(filterPresets[presetKey].filter);
    setShowAdvancedFilters(true);
  };

  const authorStats = data.reduce((acc, article) => {
    const author = article.author || 'Unknown';
    if (!acc[author]) {
      acc[author] = { articles: 0, payout: 0 };
    }
    acc[author].articles += 1;
    acc[author].payout += payoutRates.news; // Using default news rate
    return acc;
  }, {});

  const sortedAuthors = useMemo(() => {
    const authors = Object.entries(authorStats).map(([author, stats]) => ({
      author,
      articles: stats.articles,
      payout: stats.payout
    }));

    if (!sortConfig.key) return authors;

    return authors.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [authorStats, sortConfig]);

  const totals = useMemo(() => {
    return sortedAuthors.reduce((acc, row) => ({
      articles: acc.articles + row.articles,
      payout: acc.payout + row.payout
    }), { articles: 0, payout: 0 });
  }, [sortedAuthors]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSaveRates = () => {
    setConfirmDialog(true);
  };

  const confirmRateChange = () => {
    updatePayoutRate('news', Number(tempRates.news));
    updatePayoutRate('blog', Number(tempRates.blog));
    setEditingRates(false);
    setConfirmDialog(false);
    toast.success('Payout rates updated successfully');
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const tableData = Object.entries(authorStats).map(([author, stats]) => [
        author,
        stats.articles,
        `$${stats.payout.toFixed(2)}`,
      ]);

      doc.autoTable({
        head: [['Author', 'Articles', 'Payout']],
        body: tableData,
        foot: [['Total', totals.articles, `$${totals.payout.toFixed(2)}`]]
      });

      doc.save('payout-report.pdf');
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const csvContent =
        'Author,Articles,Payout\n' +
        Object.entries(authorStats)
          .map(([author, stats]) =>
            `${author},${stats.articles},$${stats.payout.toFixed(2)}`
          )
          .concat(`Total,${totals.articles},$${totals.payout.toFixed(2)}`)
          .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'payout-report.csv';
      link.click();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('CSV export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToGoogleSheets = async () => {
    setIsExporting(true);
    try {
      // Note: In a production app, this should be handled by your backend
      const doc = new GoogleSpreadsheet(import.meta.env.VITE_GOOGLE_SHEET_ID);

      await doc.useServiceAccountAuth({
        client_email: import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: import.meta.env.VITE_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });

      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];

      const rows = Object.entries(authorStats).map(([author, stats]) => ({
        Author: author,
        Articles: stats.articles,
        Payout: `$${stats.payout.toFixed(2)}`,
        Date: new Date().toLocaleDateString(),
      }));

      await sheet.addRows(rows);
      toast.success('Successfully exported to Google Sheets');
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      toast.error('Failed to export to Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ?
      <ArrowUpwardIcon fontSize="small" /> :
      <ArrowDownwardIcon fontSize="small" />;
  };

  const filteredAuthors = useMemo(() => {
    return sortedAuthors.filter(row => {
      // Text search
      const matchesSearch =
        row.author.toLowerCase().includes(tableSearch.toLowerCase()) ||
        row.articles.toString().includes(tableSearch) ||
        row.payout.toString().includes(tableSearch);

      // Advanced filters
      const matchesArticles =
        (!advancedFilters.minArticles || row.articles >= Number(advancedFilters.minArticles)) &&
        (!advancedFilters.maxArticles || row.articles <= Number(advancedFilters.maxArticles));

      const matchesPayout =
        (!advancedFilters.minPayout || row.payout >= Number(advancedFilters.minPayout)) &&
        (!advancedFilters.maxPayout || row.payout <= Number(advancedFilters.maxPayout));

      return matchesSearch && matchesArticles && matchesPayout;
    });
  }, [sortedAuthors, tableSearch, advancedFilters]);

  return (
    <Box>
      <PayoutTrends data={data} payoutRates={payoutRates} />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>Total Articles:</Typography>
              <Typography variant="h6">{totals.articles}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>Total Payout:</Typography>
              <Typography variant="h6" color="primary">
                ${totals.payout.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2 }}>
        {editingRates ? (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="News Rate"
              type="number"
              value={tempRates.news}
              onChange={(e) => setTempRates({ ...tempRates, news: e.target.value })}
              size="small"
            />
            <TextField
              label="Blog Rate"
              type="number"
              value={tempRates.blog}
              onChange={(e) => setTempRates({ ...tempRates, blog: e.target.value })}
              size="small"
            />
            <Button onClick={handleSaveRates} variant="contained">
              Save
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Button onClick={() => setEditingRates(true)} variant="outlined">
                Edit Rates
              </Button>
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                size="small"
                placeholder="Search table..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              </Button>
            </Grid>
          </Grid>
        )}
        {showAdvancedFilters && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filter Presets
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(filterPresets).map(([key, { label }]) => (
                  <Button
                    key={key}
                    variant={selectedPreset === key ? "contained" : "outlined"}
                    size="small"
                    onClick={() => applyPreset(key)}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Min Articles"
                  type="number"
                  value={advancedFilters.minArticles}
                  onChange={(e) => setAdvancedFilters(prev => ({
                    ...prev,
                    minArticles: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Max Articles"
                  type="number"
                  value={advancedFilters.maxArticles}
                  onChange={(e) => setAdvancedFilters(prev => ({
                    ...prev,
                    maxArticles: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Min Payout"
                  type="number"
                  value={advancedFilters.minPayout}
                  onChange={(e) => setAdvancedFilters(prev => ({
                    ...prev,
                    minPayout: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Max Payout"
                  type="number"
                  value={advancedFilters.maxPayout}
                  onChange={(e) => setAdvancedFilters(prev => ({
                    ...prev,
                    maxPayout: e.target.value
                  }))}
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => requestSort('author')}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <Tooltip title="Sort by Author">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Author
                    {getSortIcon('author')}
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell
                align="right"
                onClick={() => requestSort('articles')}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <Tooltip title="Sort by Articles">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Articles
                    {getSortIcon('articles')}
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell
                align="right"
                onClick={() => requestSort('payout')}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <Tooltip title="Sort by Payout">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Payout
                    {getSortIcon('payout')}
                  </Box>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAuthors
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.author}>
                  <TableCell>{row.author}</TableCell>
                  <TableCell align="right">{row.articles}</TableCell>
                  <TableCell align="right">${row.payout.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                {filteredAuthors.reduce((sum, row) => sum + row.articles, 0)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                ${filteredAuthors.reduce((sum, row) => sum + row.payout, 0).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAuthors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={exportToPDF}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
        <Button
          variant="contained"
          onClick={exportToCSV}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
        <Button
          variant="contained"
          onClick={exportToGoogleSheets}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export to Sheets'}
        </Button>
      </Box>

      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Rate Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update the payout rates to:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography>News Rate: ${tempRates.news}</Typography>
            <Typography>Blog Rate: ${tempRates.blog}</Typography>
          </Box>
          <Typography color="warning.main" sx={{ mt: 2 }}>
            This will affect all future payout calculations.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmRateChange} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayoutDetails;