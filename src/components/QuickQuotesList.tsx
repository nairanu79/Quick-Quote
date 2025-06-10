import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface QuickQuote {
  estimateName: string;
  customerName: string;
  customerContact: string;
  products: any[];
  gnacv: number;
  estimateId: string;
  lastModified: string;
  createdAt: string;
}

interface QuickQuotesListProps {
  onCreateNew: () => void;
  onQuoteSelect: (quote: QuickQuote) => void;
}

const QuickQuotesList: React.FC<QuickQuotesListProps> = ({ onCreateNew, onQuoteSelect }) => {
  const [savedQuotes, setSavedQuotes] = React.useState<QuickQuote[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<QuickQuote | null>(null);

  // Add storage event listener to update list when localStorage changes
  React.useEffect(() => {
    loadSavedQuotes();

    // Listen for storage events (when other tabs/windows update localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quickQuotes') {
        loadSavedQuotes();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add interval to periodically check for updates
  React.useEffect(() => {
    const intervalId = setInterval(loadSavedQuotes, 1000); // Check every second
    return () => clearInterval(intervalId);
  }, []);

  const loadSavedQuotes = () => {
    try {
      const quotes = JSON.parse(localStorage.getItem('quickQuotes') || '[]');
      quotes.sort((a: any, b: any) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
      setSavedQuotes(quotes);
    } catch (error) {
      console.error('Error loading quotes:', error);
      alert('There was an error loading your quotes. Please refresh the page.');
    }
  };

  const handleDeleteClick = (event: React.MouseEvent, quote: QuickQuote) => {
    event.stopPropagation();
    setQuoteToDelete(quote);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (quoteToDelete) {
      try {
        const updatedQuotes = savedQuotes.filter(
          quote => quote.estimateId !== quoteToDelete.estimateId
        );
        localStorage.setItem('quickQuotes', JSON.stringify(updatedQuotes));
        setSavedQuotes(updatedQuotes);
        alert('Quote deleted successfully!');
      } catch (error) {
        console.error('Error deleting quote:', error);
        alert('There was an error deleting the quote. Please try again.');
      }
    }
    setDeleteDialogOpen(false);
    setQuoteToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setQuoteToDelete(null);
  };

  const calculateTotalProductsPrice = (products: any[]) => {
    return products.reduce((sum, product) => sum + product.totalNetPrice, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            pb: 3,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography 
            variant="h2" 
            component="h1"
            sx={{ 
              fontWeight: 'bold',
              color: '#2B5FD9',
            }}
          >
            Quick Quotes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
            sx={{ 
              backgroundColor: '#2B5FD9',
              '&:hover': {
                backgroundColor: '#000099'
              }
            }}
          >
            Create New Quote
          </Button>
        </Box>

        {savedQuotes.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            backgroundColor: '#F8F9FA',
            borderRadius: 1,
            mt: 2
          }}>
            <Typography variant="h6" color="text.secondary">
              No quotes found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Create your first quote to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateNew}
              sx={{ 
                backgroundColor: '#2B5FD9',
                '&:hover': {
                  backgroundColor: '#000099'
                }
              }}
            >
              Create New Quote
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                  <TableCell>Estimate Name</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Customer Contact</TableCell>
                  <TableCell align="right">Total Net Price</TableCell>
                  <TableCell align="right">GNACV</TableCell>
                  <TableCell align="center">Last Modified</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedQuotes.map((quote, index) => (
                  <TableRow 
                    key={quote.estimateId}
                    hover
                    onClick={() => onQuoteSelect(quote)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography 
                        sx={{ 
                          color: '#2B5FD9',
                          textDecoration: 'underline',
                          '&:hover': { color: '#000099' }
                        }}
                      >
                        {quote.estimateName}
                      </Typography>
                    </TableCell>
                    <TableCell>{quote.customerName}</TableCell>
                    <TableCell>{quote.customerContact}</TableCell>
                    <TableCell align="right">
                      ${calculateTotalProductsPrice(quote.products).toFixed(2)}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: quote.gnacv >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}
                    >
                      ${quote.gnacv.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      {formatDate(quote.lastModified)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleDeleteClick(e, quote)}
                        color="error"
                        size="small"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(255, 107, 107, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the quote "{quoteToDelete?.estimateName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{ 
              backgroundColor: '#FF6B6B',
              '&:hover': {
                backgroundColor: '#ff4444'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickQuotesList; 