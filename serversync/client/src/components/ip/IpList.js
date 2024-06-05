import React, { useState, useEffect, useRef } from 'react';
import {
  getIpList,
  updateIpStatus,
  deleteIpLogs,
  searchIpRecords,
} from '../../services/ip/IpService';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Checkbox,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import Menu from '@mui/material/Menu';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import '../../css/ip/IpList.css';

const IpList = () => {
  const [ipList, setIpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [open, setOpen] = useState(false);
  const [newIps, setNewIps] = useState('');
  const [selectedIps, setSelectedIps] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchIpList = async () => {
      setLoading(true);
      try {
        const data = await getIpList(currentPage, pageSize, showInactive);
        setIpList(data.payload.logs || []);
        setTotalPages(data.payload.meta.totalPage || 1);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching IP list:', error);
        setLoading(false);
      }
    };

    fetchIpList();
  }, [currentPage, pageSize, showInactive]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setSearchResults([]);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = e => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      await updateIpStatus(newIps.split(','));
      setSnackbarMessage('IPs updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpen(false);
      const data = await getIpList(currentPage, pageSize, showInactive);
      setIpList(data.payload.logs || []);
    } catch (error) {
      console.error('Error updating IP status:', error);
      setSnackbarMessage('Error updating IP status.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSelect = ip => {
    setSelectedIps(prevSelectedIps => {
      if (prevSelectedIps.includes(ip)) {
        return prevSelectedIps.filter(selectedIp => selectedIp !== ip);
      } else {
        return [...prevSelectedIps, ip];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIps([]);
    } else {
      setSelectedIps(ipList.map(l => l.ip));
    }
    setSelectAll(prevSelectAll => !prevSelectAll);
  };

  const handleDelete = async () => {
    try {
      const cleanedIps = selectedIps.map(ip => ip.replace(/\s/g, ''));
      await deleteIpLogs(cleanedIps);
      setSnackbarMessage('IPs deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSelectedIps([]);
      const data = await getIpList(currentPage, pageSize, showInactive);
      setIpList(data.payload.logs || []);
    } catch (error) {
      console.error('Error deleting IP logs:', error);
      setSnackbarMessage('Error deleting IP logs.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleRecheck = async () => {
    try {
      await updateIpStatus(selectedIps);
      setSnackbarMessage('IPs rechecked successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSelectedIps([]);
      const data = await getIpList(currentPage, pageSize, showInactive);
      setIpList(data.payload.logs || []);
    } catch (error) {
      console.error('Error rechecking IPs:', error);
      setSnackbarMessage('Error rechecking IPs.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await searchIpRecords(searchTerm);
      setIpList(response.payload.ipRecords || []);
      setIsSearching(false);
    } catch (error) {
      console.error('Error searching IP records:', error);
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = async e => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() !== '') {
      try {
        const response = await searchIpRecords(term);
        setSearchResults(response.payload.ipRecords || []);
      } catch (error) {
        console.error('Error searching IP records:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSuggestionClick = async suggestion => {
    setSearchTerm(suggestion);
    setSearchResults([]);
    setIsSearching(true);
    try {
      const response = await searchIpRecords(suggestion);
      setIpList(response.payload.ipRecords || []);
      setIsSearching(false);
    } catch (error) {
      console.error('Error fetching IP records:', error);
      setIsSearching(false);
    }
  };

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShowInactive = async () => {
    setShowInactive(prevShowInactive => !prevShowInactive);
  };

  return (
    <div className="ip-list-container">
      <div className="header">
        <div className="actions-bar">
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            <AddIcon /> Add New
          </Button>
          <Fab
            color="primary"
            size="small"
            onClick={handleMenuOpen}
            aria-controls="actions-menu"
            aria-haspopup="true"
            style={{ marginLeft: '10px' }}
          >
            <MoreVertIcon />
          </Fab>
          <Menu
            id="actions-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={handleDelete}
              disabled={selectedIps.length === 0}
            >
              <DeleteIcon /> Delete
            </MenuItem>
            <MenuItem
              onClick={handleRecheck}
              disabled={selectedIps.length === 0}
            >
              <RefreshIcon /> Recheck
            </MenuItem>
            <MenuItem variant="contained" onClick={handleShowInactive}>
              <VisibilityOffIcon style={{ marginRight: '5px' }} />
              {showInactive ? 'Show All' : 'Show Inactive'}
            </MenuItem>
          </Menu>

          <Fab
            color="primary"
            size="small"
            onClick={() => setShowCheckboxes(prevState => !prevState)}
            style={{ marginLeft: '10px' }}
          >
            <CheckIcon />
          </Fab>
          {showCheckboxes && (
            <Checkbox
              checked={selectAll}
              onChange={handleSelectAll}
              indeterminate={
                selectedIps.length > 0 && selectedIps.length < ipList.length
              }
            />
          )}
        </div>
      </div>

      <div className="search-bar">
        <div className="search-bar-content">
          <div className="search-input">
            <TextField
              variant="outlined"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
              style={{ marginBottom: '10px', marginTop: '10px' }}
            />
          </div>
          <div className="search-button">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              style={{ marginLeft: '10px', marginTop: '8px' }}
            >
              Search
            </Button>
          </div>
        </div>
        {searchResults.length > 0 && (
          <div className="suggestions-container" ref={suggestionsRef}>
            <ul className="suggestions-list">
              {searchResults.map(ip => (
                <li key={ip.id}>
                  <button onClick={() => handleSuggestionClick(ip.ip)}>
                    {ip.ip}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <TableContainer component={Paper}>
        <Table className="ip-table">
          <TableHead>
            <TableRow>
              {showCheckboxes && <TableCell>Select</TableCell>}
              <TableCell>IP</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Checked</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(isSearching ? searchResults : ipList).map(l => (
              <TableRow key={l.id}>
                {showCheckboxes && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIps.includes(l.ip)}
                      onChange={() => handleSelect(l.ip)}
                    />
                  </TableCell>
                )}
                <TableCell>{l.ip}</TableCell>
                <TableCell>
                  <span
                    className={`status-dot ${l.status.toLowerCase()}`}
                  ></span>
                  {l.status}
                </TableCell>
                <TableCell>{l.lastChecked}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {searchResults.length === 0 && !isSearching && (
        <div className="pagination-controls">
          <FormControl variant="outlined" className="page-size-selector">
            <InputLabel id="page-size-label">Page Size</InputLabel>
            <Select
              labelId="page-size-label"
              value={pageSize}
              onChange={handlePageSizeChange}
              label="Page Size"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New IPs</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter IP:Ports, separated by commas.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="IP:Ports"
            type="text"
            fullWidth
            variant="standard"
            value={newIps}
            onChange={e => setNewIps(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default IpList;
