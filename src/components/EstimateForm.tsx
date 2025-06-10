import React, { useState, useCallback, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  Stack,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudIcon from '@mui/icons-material/Cloud';
import { styled } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import ChatBot from './ChatBot';
import { speak } from '../utils/voiceUtils';

interface Asset {
  id: number;
  assetName: string;
  quantity: number;
  listPrice: number;
  discount: number;
  netPrice: number;
  totalNetPrice: number;
  startDate: string;
  endDate: string;
}

interface Product {
  id: number;
  assetName: string;
  quantity: number;
  listPrice: number;
  discount: number;
  netPrice: number;
  totalNetPrice: number;
  startDate: string;
  endDate: string;
  autoCopied?: boolean;
}

interface QuoteData {
  estimateName: string;
  estimateId: string;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  assets: Asset[];
  products: Product[];
  gnacv: number;
}

interface QuickQuote {
  customerName: string;
  customerContact: string;
  estimateName: string;
  estimateId: string;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  assets: any[];
  products: any[];
  gnacv: number;
  createdAt: string;
  lastModified: string;
  consumptionPerformance: number;
  envelopesPurchased: number;
  envelopesSent: number;
}

const customers = [
  'Bank of America',
  'Wells Fargo',
  'T-Mobile',
  'Chase',
  'Papa John\'s'
] as const;

const baseballPlayers = [
  'Mike Trout',
  'Trea Turner',
  'Pete Alonso',
  'Austin Riley',
  'Matt Olson',
  'Ronald Acuña Jr.',
  'Mookie Betts',
  'Freddie Freeman',
  'Juan Soto',
  'Shohei Ohtani'
];

// Default contact mapping
const defaultContactMapping: Record<CustomerType, string> = {
  'Bank of America': 'Mike Trout',
  'Wells Fargo': 'Trea Turner',
  'T-Mobile': 'Pete Alonso',
  'Chase': 'Austin Riley',
  'Papa John\'s': 'Matt Olson'
};

// Default consumption performance mapping
const defaultConsumptionMapping: { [key in CustomerType]: number } = {
  'Bank of America': 85,
  'Wells Fargo': 90,
  'T-Mobile': 82,
  'Chase': 60,
  "Papa John's": 55
};

// Default envelopes sent mapping
const defaultEnvelopesSentMapping: { [key in CustomerType]: number } = {
  'Bank of America': 8500,
  'Wells Fargo': 9000,
  'T-Mobile': 8200,
  'Chase': 6000,
  "Papa John's": 5000
};

type CustomerType = typeof customers[number];

const paymentTerms = [
  'Net 30',
  'Net 45',
  'Net 60'
];

const productNames = [
  'eSignature Envelope Subs',
  'DocuSign Monitor',
  'ID Verification',
  'DocuSign Retrieve',
  'IAM for CX',
  'IAM for Sales'
];

const defaultListPrices: { [key: string]: number } = {
  'eSignature Envelope Subs': 5.00,
  'DocuSign Monitor': 3.00,
  'ID Verification': 3.50,
  'DocuSign Retrieve': 2.00,
  'IAM for CX': 1530.00,
  'IAM for Sales': 900.00
};

const generateQuantityOptions = () => {
  return Array.from({ length: 100 }, (_, i) => i + 1);
};

const generateDiscountOptions = () => {
  return Array.from({ length: 50 }, (_, i) => i + 1);
};

const defaultAssetRow = {
  assetName: '',
  quantity: 1,
  listPrice: 0,
  discount: 0,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  netPrice: 0,
  totalNetPrice: 0
};

const initialFormState = {
  estimateName: '',
  estimateId: 'QQ1',
  paymentTerms: 'Net 30',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  assets: [] as Asset[],
  products: [] as Product[]
};

interface EstimateFormProps {
  initialData?: QuickQuote | null;
  onClose: () => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const FormSection = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const StyledTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
  '& .MuiTableCell-body': {
    borderColor: theme.palette.divider,
  },
  '& .summary-row': {
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiPaper-root': {
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const FormField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const GNACVBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(4),
}));

interface DefaultAssetConfig {
  assetName: string;
  quantity: number;
  discount: number;
  startDate: string;
  endDate: string;
}

interface DefaultAssetsConfigType {
  'Bank of America': DefaultAssetConfig[];
  'Wells Fargo': DefaultAssetConfig[];
}

const EstimateForm: React.FC<EstimateFormProps> = ({ initialData, onClose }) => {
  const [customerName, setCustomerName] = useState<CustomerType | ''>('');
  const [customerContact, setCustomerContact] = useState('');
  const [consumptionPerformance, setConsumptionPerformance] = useState(0);
  const [envelopesPurchased, setEnvelopesPurchased] = useState(10000);
  const [envelopesSent, setEnvelopesSent] = useState(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [productsAssets, setProductsAssets] = useState<Product[]>([]);
  const [gnacv, setGnacv] = useState(0);

  const [newAsset, setNewAsset] = useState<Omit<Asset, 'id'>>({
    assetName: '',
    quantity: 1,
    listPrice: 0,
    discount: 0,
    netPrice: 0,
    totalNetPrice: 0,
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });

  const [newProductAsset, setNewProductAsset] = useState<Omit<Product, 'id'>>({
    assetName: '',
    quantity: 1,
    listPrice: 0,
    discount: 0,
    netPrice: 0,
    totalNetPrice: 0,
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  });

  const [estimateCounter, setEstimateCounter] = useState(1);
  const [estimateName, setEstimateName] = useState('');
  const [estimateId, setEstimateId] = useState('QQ1');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  const [lastModified, setLastModified] = useState<string>(new Date().toISOString());

  const defaultAssetsConfig: DefaultAssetsConfigType = {
    'Bank of America': [
      {
        assetName: 'eSignature Envelope Subs',
        quantity: 20,
        discount: 5,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      },
      {
        assetName: 'DocuSign Monitor',
        quantity: 10,
        discount: 7,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    ],
    'Wells Fargo': [
      {
        assetName: 'eSignature Envelope Subs',
        quantity: 20,
        discount: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      },
      {
        assetName: 'ID Verification',
        quantity: 20,
        discount: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    ]
  };

  useEffect(() => {
    setLastModified(new Date().toISOString());
  }, [
    customerName,
    customerContact,
    estimateName,
    estimateId,
    paymentTerms,
    startDate,
    endDate,
    assets,
    productsAssets
  ]);

  const calculateNetPrice = (listPrice: number, discount: number) => {
    return listPrice * (1 - discount / 100);
  };

  const calculateTotalNetPrice = (quantity: number, netPrice: number) => {
    return quantity * netPrice;
  };

  const copyAssetsToProducts = useCallback(() => {
    const increasedAssets = assets.map(asset => {
      const newQuantity = Math.ceil(asset.quantity * 1.3);
      const netPrice = calculateNetPrice(asset.listPrice, asset.discount);
      const totalNetPrice = calculateTotalNetPrice(newQuantity, netPrice);
      
      return {
        ...asset,
        id: Date.now() + Math.random(),
        quantity: newQuantity,
        netPrice: netPrice,
        totalNetPrice: totalNetPrice
      };
    });
    
    setProductsAssets(prevProducts => {
      const manualProducts = prevProducts.filter(product => !product.autoCopied);
      
      const newProducts = increasedAssets.map(asset => ({
        ...asset,
        autoCopied: true
      }));
      
      return [...manualProducts, ...newProducts];
    });
  }, [assets]);

  useEffect(() => {
    if (customerName && consumptionPerformance > 80 && assets.length > 0) {
      copyAssetsToProducts();
    }
  }, [consumptionPerformance, customerName, assets, copyAssetsToProducts]);

  const handleSaveAndClose = useCallback(() => {
    if (!customerName || !customerContact || !estimateName) {
      const errorMessage = 'Please fill in all required fields:\n- Customer Name\n- Customer Contact\n- Estimate Name';
      alert(errorMessage);
      speak("Please fill in all the required fields before saving.");
      return;
    }

    const quoteData = {
      customerName,
      customerContact,
      estimateName,
      estimateId,
      paymentTerms,
      startDate,
      endDate,
      assets,
      products: productsAssets,
      gnacv: calculateGNACV(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      lastModified,
      consumptionPerformance,
      envelopesPurchased,
      envelopesSent
    };

    try {
      const savedQuotes = JSON.parse(localStorage.getItem('quickQuotes') || '[]');
      
      if (initialData) {
        const index = savedQuotes.findIndex((q: any) => q.estimateId === initialData.estimateId);
        if (index !== -1) {
          quoteData.createdAt = savedQuotes[index].createdAt;
          savedQuotes[index] = quoteData;
        } else {
          savedQuotes.push(quoteData);
        }
      } else {
        savedQuotes.push(quoteData);
      }

      savedQuotes.sort((a: any, b: any) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );

      localStorage.setItem('quickQuotes', JSON.stringify(savedQuotes));

      const successMessage = `Great! I've saved the quote for ${customerName}. You can find it in the quotes list.`;
      speak(successMessage);
      
      // Wait for the voice to finish before closing
      setTimeout(() => {
        alert('Quick Quote saved successfully!');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving quote:', error);
      const errorMessage = 'There was an error saving your quote. Please try again.';
      speak(errorMessage);
      alert(errorMessage);
    }
  }, [
    customerName,
    customerContact,
    estimateName,
    estimateId,
    paymentTerms,
    startDate,
    endDate,
    assets,
    productsAssets,
    initialData,
    lastModified,
    consumptionPerformance,
    envelopesPurchased,
    envelopesSent,
    onClose
  ]);

  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to discard your changes?')) {
      onClose();
    }
  }, [onClose]);

  const handleAssetNameChange = (name: string) => {
    setNewAsset({
      ...newAsset,
      assetName: name,
      listPrice: defaultListPrices[name] || 0
    });
  };

  const handleAddAsset = () => {
    if (!newAsset.assetName) {
      alert('Please select an asset name');
      return;
    }

    const netPrice = calculateNetPrice(newAsset.listPrice, newAsset.discount);
    const totalNetPrice = calculateTotalNetPrice(newAsset.quantity, netPrice);

    const asset: Asset = {
      id: Date.now() + Math.random(),
      ...newAsset,
      netPrice,
      totalNetPrice,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };

    setAssets([...assets, asset]);
    
    setNewAsset({
      assetName: '',
      quantity: 1,
      listPrice: 0,
      discount: 0,
      netPrice: 0,
      totalNetPrice: 0,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });
  };

  const handleDeleteAsset = (id: number) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const handleUpdateAsset = (id: number, field: string, value: number | string) => {
    setAssets(assets.map(asset => {
      if (asset.id === id) {
        const updatedAsset = { ...asset, [field]: value };
        if (field === 'assetName') {
          updatedAsset.listPrice = defaultListPrices[value as string] || 0;
        }
        if (field === 'quantity' || field === 'discount' || field === 'listPrice') {
          updatedAsset.netPrice = calculateNetPrice(updatedAsset.listPrice, updatedAsset.discount);
          updatedAsset.totalNetPrice = updatedAsset.netPrice * updatedAsset.quantity;
        }
        return updatedAsset;
      }
      return asset;
    }));
  };

  const handleProductAssetNameChange = (name: string) => {
    setNewProductAsset({
      ...newProductAsset,
      assetName: name,
      listPrice: defaultListPrices[name] || 0
    });
  };

  const handleAddProductAsset = () => {
    if (!newProductAsset.assetName) {
      alert('Please select a product name');
      return;
    }

    const netPrice = calculateNetPrice(newProductAsset.listPrice, newProductAsset.discount);
    const totalNetPrice = calculateTotalNetPrice(newProductAsset.quantity, netPrice);

    const product: Product = {
      id: Date.now() + Math.random(),
      ...newProductAsset,
      netPrice,
      totalNetPrice,
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    };

    setProductsAssets([...productsAssets, product]);
    
    setNewProductAsset({
      assetName: '',
      quantity: 1,
      listPrice: 0,
      discount: 0,
      netPrice: 0,
      totalNetPrice: 0,
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    });
  };

  const handleDeleteProductAsset = (id: number) => {
    setProductsAssets(productsAssets.filter(asset => asset.id !== id));
  };

  const handleUpdateProductAsset = (id: number, field: string, value: number | string) => {
    setProductsAssets(productsAssets.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, [field]: value };
        if (field === 'assetName') {
          updatedProduct.listPrice = defaultListPrices[value as string] || 0;
        }
        if (field === 'quantity' || field === 'discount' || field === 'listPrice') {
          updatedProduct.netPrice = calculateNetPrice(updatedProduct.listPrice, updatedProduct.discount);
          updatedProduct.totalNetPrice = updatedProduct.netPrice * updatedProduct.quantity;
        }
        return updatedProduct;
      }
      return product;
    }));
  };

  const generateEstimateName = (selectedCustomerName: string) => {
    return `${selectedCustomerName} - Estimate ${estimateCounter}`;
  };

  const handleCustomerChange = (newCustomerName: CustomerType) => {
    setCustomerName(newCustomerName);
    setEstimateName(generateEstimateName(newCustomerName));
    setCustomerContact(defaultContactMapping[newCustomerName]);
    setConsumptionPerformance(defaultConsumptionMapping[newCustomerName]);
    setEnvelopesPurchased(10000);
    setEnvelopesSent(defaultEnvelopesSentMapping[newCustomerName]);

    // Add default assets for specific customers
    const customerAssets = defaultAssetsConfig[newCustomerName as keyof DefaultAssetsConfigType];
    if (customerAssets) {
      const defaultAssets = customerAssets.map((asset: DefaultAssetConfig) => ({
        id: Date.now() + Math.random(),
        assetName: asset.assetName,
        quantity: asset.quantity,
        listPrice: defaultListPrices[asset.assetName],
        discount: asset.discount,
        netPrice: calculateNetPrice(defaultListPrices[asset.assetName], asset.discount),
        totalNetPrice: calculateTotalNetPrice(
          asset.quantity,
          calculateNetPrice(defaultListPrices[asset.assetName], asset.discount)
        ),
        startDate: asset.startDate,
        endDate: asset.endDate
      }));
      setAssets(defaultAssets);
    } else {
      setAssets([]);
    }
  };

  const incrementCounter = () => {
    const newCounter = estimateCounter + 1;
    setEstimateCounter(newCounter);
    setEstimateId(`QQ${newCounter}`);
    if (customerName) {
      setEstimateName(generateEstimateName(customerName));
    }
  };

  const handleAddAssetRow = (section: 'current' | 'products') => {
    if (section === 'current') {
      setAssets([...assets, { ...defaultAssetRow, id: Date.now() }]);
    } else {
      setProductsAssets([...productsAssets, { ...defaultAssetRow, id: Date.now() }]);
    }
  };

  const calculateTotalAssetsPrice = () => {
    return assets.reduce((sum, asset) => sum + asset.totalNetPrice, 0);
  };

  const calculateTotalProductsPrice = () => {
    return productsAssets.reduce((sum, product) => sum + product.totalNetPrice, 0);
  };

  const calculateGNACV = () => {
    const totalProducts = calculateTotalProductsPrice();
    const totalAssets = calculateTotalAssetsPrice();
    return totalProducts - totalAssets;
  };

  useEffect(() => {
    const newGnacv = calculateGNACV();
    setGnacv(newGnacv);
  }, [assets, productsAssets]);

  useEffect(() => {
    if (initialData) {
      setCustomerName(initialData.customerName as CustomerType);
      setCustomerContact(initialData.customerContact);
      setEstimateName(initialData.estimateName);
      setAssets(initialData.assets || []);
      setProductsAssets(initialData.products || []);
      setConsumptionPerformance(initialData.consumptionPerformance || defaultConsumptionMapping[initialData.customerName as CustomerType] || 0);
      setEnvelopesPurchased(initialData.envelopesPurchased || 10000);
      setEnvelopesSent(initialData.envelopesSent || defaultEnvelopesSentMapping[initialData.customerName as CustomerType] || 0);
    }
  }, [initialData]);

  const sectionStyle = {
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)'
  };

  const sectionHeaderStyle = {
    backgroundColor: (theme: Theme) => theme.palette.primary.light,
    mx: -3,
    px: 3,
    py: 2,
    mb: 3,
    borderBottom: '1px solid #E5E7EB',
    '& h5': {
      color: (theme: Theme) => theme.palette.primary.dark,
      fontWeight: 600
    }
  };

  const handleChatBotProductSelect = (product: {
    assetName: string;
    quantity: number;
    discount: number;
  }) => {
    const netPrice = calculateNetPrice(defaultListPrices[product.assetName], product.discount);
    const totalNetPrice = calculateTotalNetPrice(product.quantity, netPrice);

    const newProduct: Product = {
      id: Date.now() + Math.random(),
      assetName: product.assetName,
      quantity: product.quantity,
      listPrice: defaultListPrices[product.assetName],
      discount: product.discount,
      netPrice,
      totalNetPrice,
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    };

    setProductsAssets(prevProducts => [...prevProducts, newProduct]);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 0,
        maxWidth: '1200px',
        margin: '32px auto',
        backgroundColor: '#F9FAFB',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 4,
            pb: 3,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudIcon 
              sx={{ 
                fontSize: 40,
                color: '#2B5FD9',
              }}
            />
            <Typography 
              variant="h2" 
              component="h1"
              sx={{ 
                fontWeight: 'bold',
                color: '#2B5FD9',
                textAlign: 'center'
              }}
            >
              Quick Quote
            </Typography>
          </Box>
        </Box>

        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <Typography variant="h5">
              Customer Details
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Customer Name"
                value={customerName}
                onChange={(e) => handleCustomerChange(e.target.value as CustomerType)}
              >
                {customers.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact"
                value={customerContact}
                disabled
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <Typography variant="h5">
              Current Assets & Subscription
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 4 }}>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                Asset Name
              </Typography>
              <TextField
                select
                fullWidth
                value={newAsset.assetName}
                onChange={(e) => handleAssetNameChange(e.target.value)}
                size="small"
              >
                {productNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={1}>
              <Typography variant="subtitle2" gutterBottom>
                Quantity
              </Typography>
              <TextField
                select
                fullWidth
                value={newAsset.quantity}
                onChange={(e) => setNewAsset({ ...newAsset, quantity: Number(e.target.value) })}
                size="small"
              >
                {generateQuantityOptions().map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                List Price
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={newAsset.listPrice}
                onChange={(e) => setNewAsset({ ...newAsset, listPrice: Number(e.target.value) })}
                size="small"
                InputProps={{
                  startAdornment: <span>$</span>
                }}
              />
            </Grid>
            <Grid item xs={6} sm={1}>
              <Box sx={{ height: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Discount
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={newAsset.discount}
                  onChange={(e) => setNewAsset({ ...newAsset, discount: Number(e.target.value) })}
                  size="small"
                >
                  {generateDiscountOptions().map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}%
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                Start Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={newAsset.startDate}
                onChange={(e) => setNewAsset({ ...newAsset, startDate: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                End Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={newAsset.endDate}
                onChange={(e) => setNewAsset({ ...newAsset, endDate: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                &nbsp;
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddAsset}
                disabled={!newAsset.assetName || newAsset.listPrice <= 0}
              >
                Add Asset
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Asset Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>List Price</TableCell>
                  <TableCell>Discount (%)</TableCell>
                  <TableCell>Net Price</TableCell>
                  <TableCell>Total Net Price</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.assetName}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={asset.quantity}
                        onChange={(e) => handleUpdateAsset(asset.id, 'quantity', Number(e.target.value))}
                      >
                        {generateQuantityOptions().map((q) => (
                          <MenuItem key={q} value={q}>
                            {q}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>${asset.listPrice}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={asset.discount}
                        onChange={(e) => handleUpdateAsset(asset.id, 'discount', Number(e.target.value))}
                      >
                        {generateDiscountOptions().map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}%
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>${asset.netPrice.toFixed(2)}</TableCell>
                    <TableCell>${asset.totalNetPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        value={asset.startDate}
                        onChange={(e) => handleUpdateAsset(asset.id, 'startDate', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        value={asset.endDate}
                        onChange={(e) => handleUpdateAsset(asset.id, 'endDate', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleDeleteAsset(asset.id)} 
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
                    Current ACV:
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    ${calculateTotalAssetsPrice().toFixed(2)}
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <Typography variant="h5">
              Usage & Consumption
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ mb: 4, mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>
                Consumption Performance
              </Typography>
              <TextField
                fullWidth
                value={`${consumptionPerformance}%`}
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>
                Envelopes Purchased
              </Typography>
              <TextField
                fullWidth
                value={envelopesPurchased.toLocaleString()}
                size="small"
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>
                Envelopes Sent
              </Typography>
              <TextField
                fullWidth
                value={envelopesSent.toLocaleString()}
                size="small"
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={sectionStyle}>
          <Box sx={sectionHeaderStyle}>
            <Typography variant="h5">
              Products & Configuration
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 4 }}>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                Product Name
              </Typography>
              <TextField
                select
                fullWidth
                value={newProductAsset.assetName}
                onChange={(e) => handleProductAssetNameChange(e.target.value)}
                size="small"
              >
                {productNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={1}>
              <Typography variant="subtitle2" gutterBottom>
                Quantity
              </Typography>
              <TextField
                select
                fullWidth
                value={newProductAsset.quantity}
                onChange={(e) => setNewProductAsset({ ...newProductAsset, quantity: Number(e.target.value) })}
                size="small"
              >
                {generateQuantityOptions().map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                List Price
              </Typography>
              <TextField
                type="number"
                fullWidth
                value={newProductAsset.listPrice}
                onChange={(e) => setNewProductAsset({ ...newProductAsset, listPrice: Number(e.target.value) })}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={1}>
              <Typography variant="subtitle2" gutterBottom>
                Discount
              </Typography>
              <TextField
                type="number"
                fullWidth
                value={newProductAsset.discount}
                onChange={(e) => setNewProductAsset({ ...newProductAsset, discount: Number(e.target.value) })}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                Start Date
              </Typography>
              <TextField
                type="date"
                fullWidth
                value="2025-01-01"
                size="small"
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                End Date
              </Typography>
              <TextField
                type="date"
                fullWidth
                value="2025-12-31"
                size="small"
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="subtitle2" gutterBottom>
                &nbsp;
              </Typography>
              <Button
                variant="contained"
                onClick={handleAddProductAsset}
                fullWidth
                sx={{ height: '40px' }}
              >
                Add Products
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>List Price</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Net Price</TableCell>
                  <TableCell>Total Net Price</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productsAssets.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.assetName}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={product.quantity}
                        onChange={(e) =>
                          handleUpdateProductAsset(product.id, 'quantity', Number(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={product.listPrice}
                        onChange={(e) =>
                          handleUpdateProductAsset(product.id, 'listPrice', Number(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={product.discount}
                        onChange={(e) =>
                          handleUpdateProductAsset(product.id, 'discount', Number(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>${product.netPrice.toFixed(2)}</TableCell>
                    <TableCell>${product.totalNetPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        value="2025-01-01"
                        InputProps={{
                          readOnly: true
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        value="2025-12-31"
                        InputProps={{
                          readOnly: true
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteProductAsset(product.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {productsAssets.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
                      Total Products Net Price:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      ${productsAssets.reduce((sum, product) => sum + product.totalNetPrice, 0).toFixed(2)}
                    </TableCell>
                    <TableCell colSpan={3} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ ...sectionStyle, backgroundColor: '#F9FAFB' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
                Gross New Annual Contract Value (GNACV)
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: gnacv >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 600
                }}
              >
                ${gnacv.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <ChatBot 
          onProductSelect={handleChatBotProductSelect}
          productNames={productNames}
          defaultListPrices={defaultListPrices}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ minWidth: '120px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ minWidth: '120px' }}
            onClick={handleSaveAndClose}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EstimateForm; 