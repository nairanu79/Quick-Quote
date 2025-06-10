import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Fade,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';

interface ChatBotProps {
  onProductSelect: (product: {
    assetName: string;
    quantity: number;
    discount: number;
  }) => void;
  productNames: string[];
  defaultListPrices: { [key: string]: number };
}

interface Message {
  text: string;
  type: 'bot' | 'user' | 'input';
  options?: string[];
}

const ChatBot: React.FC<ChatBotProps> = ({ onProductSelect, productNames, defaultListPrices }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<'product' | 'quantity' | 'discount' | 'complete'>('product');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(0);
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  // Handle initial greeting and messages initialization
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingText = "Hi! I'm here to help you add products to your quick quote.";
      addMessage({
        text: greetingText,
        type: 'bot',
        options: productNames
      });
    }
  }, [isOpen, messages.length, productNames]);

  const handleProductSelect = (product: string) => {
    setSelectedProduct(product);
    setCurrentStep('quantity');
    const responseText = `I would love to help you with ${product}! How many would you like? (Enter a number)`;
    addMessage({
      text: responseText,
      type: 'bot'
    });
  };

  const handleQuantityInput = (quantity: number) => {
    setSelectedQuantity(quantity);
    setCurrentStep('discount');
    const responseText = `Great choice! What discount would you like me to apply? (Enter a percentage between 0-100)`;
    addMessage({
      text: responseText,
      type: 'bot'
    });
  };

  const handleDiscountInput = (discount: number) => {
    if (discount >= 0 && discount <= 100) {
      setSelectedDiscount(discount);
      setCurrentStep('complete');
      
      // Submit the product selection
      onProductSelect({
        assetName: selectedProduct,
        quantity: selectedQuantity,
        discount: discount
      });

      // Show completion message with a friendly tone
      const completionText = `Wonderful! I've added ${selectedQuantity} ${selectedProduct} with a ${discount}% discount. The list price is $${defaultListPrices[selectedProduct]}. Would you like me to help you add another product?`;
      addMessage({
        text: completionText,
        type: 'bot'
      });

      // Reset for next product
      setTimeout(() => {
        setCurrentStep('product');
        setSelectedProduct('');
        setSelectedQuantity(0);
        setSelectedDiscount(0);
        const nextPromptText = 'What other product can I help you add to your quote?';
        addMessage({
          text: nextPromptText,
          type: 'bot',
          options: productNames
        });
      }, 2000);
    } else {
      const errorText = 'I need a valid discount percentage between 0 and 100. Could you please try again?';
      addMessage({
        text: errorText,
        type: 'bot'
      });
    }
  };

  const handleInputSubmit = (value: string) => {
    switch (currentStep) {
      case 'quantity':
        const quantity = parseInt(value);
        if (!isNaN(quantity) && quantity > 0) {
          handleQuantityInput(quantity);
        } else {
          addMessage({
            text: 'I need a valid number greater than 0. Could you please try again?',
            type: 'bot'
          });
        }
        break;
      case 'discount':
        const discount = parseFloat(value);
        if (!isNaN(discount)) {
          handleDiscountInput(discount);
        } else {
          addMessage({
            text: 'I need a valid discount percentage. Could you please try again?',
            type: 'bot'
          });
        }
        break;
    }
  };

  return (
    <>
      <Fade in={!isOpen}>
        <Button
          variant="contained"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            borderRadius: '50%',
            minWidth: 'auto',
            width: 56,
            height: 56,
            backgroundColor: '#1976D2',
            '&:hover': {
              backgroundColor: '#1565C0'
            }
          }}
        >
          <ChatIcon />
        </Button>
      </Fade>

      <Fade in={isOpen}>
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 360,
            height: 480,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#1976D2', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Quick Quote Assistant</Typography>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{
            flex: 1, 
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            backgroundColor: '#F8F9FA'
          }}>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                  padding: 0
                }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    backgroundColor: message.type === 'user' ? '#1976D2' : 'white',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                    maxWidth: '80%',
                    borderRadius: 2,
                    boxShadow: 1
                  }}
                >
                  <ListItemText 
                    primary={message.text} 
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.9rem',
                        lineHeight: 1.4
                      }
                    }}
                  />
                </Paper>
                
                {message.options && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {message.options.map((option) => (
                      <Button
                        key={option}
                        variant="outlined"
                        size="small"
                        onClick={() => handleProductSelect(option)}
                        sx={{
                          borderColor: '#1976D2',
                          color: '#1976D2',
                          '&:hover': {
                            borderColor: '#1565C0',
                            backgroundColor: 'rgba(25, 118, 210, 0.1)'
                          }
                        }}
                      >
                        {option}
                      </Button>
                    ))}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>

          {(currentStep === 'quantity' || currentStep === 'discount') && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'white' }}>
              <TextField
                fullWidth
                size="small"
                placeholder={currentStep === 'quantity' ? "Enter quantity" : "Enter discount percentage"}
                type="number"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleInputSubmit((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976D2'
                    }
                  }
                }}
              />
            </Box>
          )}
        </Paper>
      </Fade>
    </>
  );
};

export default ChatBot; 