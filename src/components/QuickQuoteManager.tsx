import React, { useState, useCallback } from 'react';
import QuickQuotesList from './QuickQuotesList';
import EstimateForm from './EstimateForm';

const QuickQuoteManager: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedQuote(null);
    setView('form');
  };

  const handleQuoteSelect = (quote: any) => {
    setSelectedQuote(quote);
    setView('form');
  };

  const handleFormClose = () => {
    setView('list');
    setSelectedQuote(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (view === 'list') {
    return (
      <QuickQuotesList
        onCreateNew={handleCreateNew}
        onQuoteSelect={handleQuoteSelect}
        key={refreshTrigger}
      />
    );
  }

  return (
    <EstimateForm
      initialData={selectedQuote}
      onClose={handleFormClose}
    />
  );
};

export default QuickQuoteManager; 