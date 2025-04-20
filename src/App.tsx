import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusCircle, Share2, History, Trash2, Info, X, Copy, Edit, Home } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import InputMask from 'react-input-mask';
import { Expense, Friend, Transaction, Currency } from './types';
import { 
  calculateSplits, 
  formatCurrency, 
  generateWhatsAppMessage, 
  validateName,
  validatePhone,
  formatDateTime,
  getInitials,
  CURRENCIES
} from './utils';


const Header = ({ setStep }: { setStep: React.Dispatch<React.SetStateAction<'new' | 'details' | 'summary'>> }) => (
  <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <div className="max-w-4xl mx-auto flex items-center gap-3 p-4">
      <button
        onClick={() => setStep('new')}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-2xl font-bold">
          S
        </div>
        <h1 className="text-xl font-bold text-gray-800">Split Wisely</h1>
      </button>
    </div>
  </header>
);

function App() {
  const [step, setStep] = useState<'new' | 'details' | 'summary'>('new');
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [pastExpenses, setPastExpenses] = useState<Expense[]>([]);
  const [tripName, setTripName] = useState('');
  const [friends, setFriends] = useState<Friend[]>([{ id: '1', name: '', phone: '' }]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('1');
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('preferredCurrency');
    return saved || 'USD';
  });
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [assistanceText, setAssistanceText] = useState('');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      setPastExpenses(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('preferredCurrency', currency);
  }, [currency]);

  useEffect(() => {
    if (splitBetween.length === 0) {
      setAssistanceText('This expense will be split between all participants.');
    } else {
      const selectedFriends = currentExpense?.friends.filter(f => splitBetween.includes(f.id)).map(f => f.name).join(' and ');
      setAssistanceText(`This expense will be split between ${selectedFriends}.`);
    }
  }, [splitBetween, currentExpense]);

  useEffect(() => {
    if (amount && paidBy && splitBetween.length === 0) {
      setAssistanceText('This expense will be split between all participants.');
    } else if (amount && paidBy && splitBetween.length > 0) {
      const selectedFriends = currentExpense?.friends
        .filter(f => splitBetween.includes(f.id))
        .map(f => f.name)
        .join(' and ');
      setAssistanceText(`This expense will be split between ${selectedFriends}.`);
    } else {
      setAssistanceText(''); // Clear assistance text if conditions are not met
    }
  }, [amount, paidBy, splitBetween, currentExpense]);

  const saveExpense = (expense: Expense) => {
    const newPastExpenses = [expense, ...pastExpenses].slice(0, 3);
    setPastExpenses(newPastExpenses);
    localStorage.setItem('expenses', JSON.stringify(newPastExpenses));
  };

  const deleteExpense = (id: string) => {
    const newExpenses = pastExpenses.filter(e => e.id !== id);
    setPastExpenses(newExpenses);
    localStorage.setItem('expenses', JSON.stringify(newExpenses));
  };

  const deleteAllExpenses = () => {
    setPastExpenses([]);
    localStorage.removeItem('expenses');
  };

  const copyGroupFromExpense = (expense: Expense) => {
    //setTripName(expense.tripName); // Set the trip name from the copied expense
    setFriends(expense.friends.map(friend => ({
      ...friend,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    })));
    toast.success('Group copied to the form!'); // Show a success message
  };

  const handleNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setAssistanceText('');
    const validFriends = friends.filter(f => f.name);
    if (validFriends.length < 2) {
      toast.error('Please add at least 2 friends'); 
       return;
    }
    
    const expense: Expense = {
      id: Date.now().toString(),
      tripName,
      date: new Date().toISOString(),
      currency,
      friends: validFriends,
      transactions: [],
      totalAmount: 0
    };
    
    setCurrentExpense(expense);
    setPaidBy(validFriends[0].id);
    setSplitBetween([]);
    setStep('details');
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (!currentExpense) return;
  
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
  
    const updatedExpense: Expense = {
      ...currentExpense,
      transactions: [...currentExpense.transactions, newTransaction],
      totalAmount: currentExpense.totalAmount + transaction.amount,
    };
  
    setCurrentExpense(updatedExpense);
  
    // Update the pastExpenses list and save to localStorage
    const existingExpenseIndex = pastExpenses.findIndex(e => e.id === updatedExpense.id);
    if (existingExpenseIndex !== -1) {
      // Update the existing expense
      const updatedExpenses = [...pastExpenses];
      updatedExpenses[existingExpenseIndex] = updatedExpense;
      setPastExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    } else {
      // Add the new expense to the list
      const newPastExpenses = [updatedExpense, ...pastExpenses];
      setPastExpenses(newPastExpenses);
      localStorage.setItem('expenses', JSON.stringify(newPastExpenses));
    }
  };
  

  const finalizeSplit = () => {
    if (!currentExpense) return;

    // Check if the expense already exists in the pastExpenses list
    const existingExpenseIndex = pastExpenses.findIndex(e => e.id === currentExpense.id);

    if (existingExpenseIndex !== -1) {
      // Update the existing expense
      const updatedExpenses = [...pastExpenses];
      updatedExpenses[existingExpenseIndex] = currentExpense;
      setPastExpenses(updatedExpenses);
    } else {
      // Add a new expense if it doesn't exist
      const newPastExpenses = [currentExpense, ...pastExpenses].slice(0, 3);
      setPastExpenses(newPastExpenses);
    }

    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(pastExpenses));

    // Navigate to the summary page
    setStep('summary');
  };

  const renderNewExpenseForm = () => (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div
        className="flex items-center justify-center mb-6"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-3xl font-bold text-gray-800">Enter your trip/event details.</h4>
        </div>
      </div>
      <form onSubmit={handleNewExpense} className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              required
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Trip/Event name e.g. Dinner at Surya"
            />
          </div>
          <div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} {curr.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Friends List</label>
          {friends.map((friend, index) => (
            <div key={friend.id} className="flex flex-col sm:flex-row gap-2">
              <input
                id={`friend-name-${friend.id}`} // Add unique ID
                type="text"
                required
                value={friend.name}
                onChange={(e) => {
                  if (!validateName(e.target.value) && e.target.value !== '') return;
                  const newFriends = [...friends];
                  newFriends[index].name = e.target.value;
                  setFriends(newFriends);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Name"
              />
              <InputMask
                mask="+99 999 999 9999"
                maskChar={null}
                type="tel"
                value={friend.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d+]/g, '');
                  const newFriends = [...friends];
                  newFriends[index].phone = value;
                  setFriends(newFriends);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="+1 234 567 8900"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newFriend = { id: Date.now().toString(), name: '', phone: '' };
              setFriends([...friends, newFriend]);
              setTimeout(() => {
                document.getElementById(`friend-name-${newFriend.id}`)?.focus();
              }, 0); // Delay to ensure the DOM is updated before focusing
            }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <PlusCircle size={20} /> Add Friend
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          Continue
        </button>

        {pastExpenses.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <History size={20} /> Recent Expenses
              </h2>
              <button
                type="button"
                onClick={deleteAllExpenses}
                className="text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={16} /> Delete All
              </button>
            </div>
            <div className="space-y-2">
              {pastExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-transform transform hover:scale-105"
                  onClick={() => {
                    // Navigate to the Settlements page
                    setCurrentExpense(expense);
                    setStep('summary');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium capitalize text-blue-600">{expense.tripName}</div>
                      <div className="text-sm text-gray-600">
                        {formatDateTime(expense.date)} · {expense.friends.length} friends · {formatCurrency(expense.totalAmount, expense.currency)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Copy Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the main div's click event
                          copyGroupFromExpense(expense); // Copy group to the form
                        }}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        title="Copy group members"
                      >
                        <Copy size={16} />
                      </button>

                      {/* Edit Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the main div's click event
                          setCurrentExpense(expense);
                          setStep('details'); // Navigate to the details page for editing
                        }}
                        className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                        title="Edit expense"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the main div's click event
                          deleteExpense(expense.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );

  const renderExpenseDetails = () => {
    if (!currentExpense) return null;
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
    
      // If editing an existing transaction, update it
      if (editingTransactionId) {
        const updatedTransactions = currentExpense.transactions.map(transaction =>
          transaction.id === editingTransactionId
            ? {
                ...transaction,
                amount: parseFloat(amount),
                description,
                paidBy,
              }
            : transaction
        );
    
        const updatedExpense = {
          ...currentExpense,
          transactions: updatedTransactions,
          totalAmount: updatedTransactions.reduce((sum, t) => sum + t.amount, 0),
        };
    
        setCurrentExpense(updatedExpense);
        setEditingTransactionId(null);
        setAmount('');
        setDescription('');
        setPaidBy(currentExpense.friends[0].id);
    
        // Update localStorage
        const updatedExpenses = pastExpenses.map(expense =>
          expense.id === updatedExpense.id ? updatedExpense : expense
        );
        setPastExpenses(updatedExpenses);
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    
        // Show success toast
        toast.success('Expense updated successfully!');
    
        // Scroll to and highlight the updated expense
        setTimeout(() => {
          const expenseDiv = document.getElementById(`transaction-${editingTransactionId}`);
          if (expenseDiv) {
            expenseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            expenseDiv.classList.add('bg-yellow-100');
            setTimeout(() => expenseDiv.classList.remove('bg-yellow-100'), 2000); // Remove highlight after 2 seconds
          }
        }, 300); // Delay to ensure the DOM is updated
      } else {
        // Add a new transaction
        addTransaction({
          paidBy,
          amount: parseFloat(amount),
          description,
          splitBetween,
        });
      }
    
      setAmount('');
      setDescription('');
      setSplitBetween([]);
    };
  
    const handleEditTransaction = (transaction: Transaction) => {
      setEditingTransactionId(transaction.id);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setPaidBy(transaction.paidBy);
    
      const amountInput = document.getElementById('amount-input');
      
      if (amountInput) {
        amountInput.focus();
        const body = document.querySelector('body')
        if(body){
          body.scrollIntoView({ behavior: 'smooth' }); 
          amountInput.classList.add('bg-yellow-100');
          setTimeout(() => amountInput.classList.remove('bg-yellow-100'), 2000);

        }
        toast.success('Editing transaction. Make changes and click "Update Expense".');
      }
    };
  
    const handleDeleteTransaction = (transactionId: string) => {
      const updatedTransactions = currentExpense.transactions.filter(t => t.id !== transactionId);
    
      const updatedExpense = {
        ...currentExpense,
        transactions: updatedTransactions,
        totalAmount: updatedTransactions.reduce((sum, t) => sum + t.amount, 0),
      };
    
      setCurrentExpense(updatedExpense);
    
      // Update localStorage
      const updatedExpenses = pastExpenses.map(expense =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      );
      setPastExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    
      toast.success('Transaction deleted successfully.');
    };
  
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="capitalize text-3xl font-bold text-gray-800">{currentExpense.tripName}</h1>
          <button
            onClick={() => {
              setStep('new');
              setCurrentExpense(null);
              setTripName('');
              setFriends([{ id: '1', name: '', phone: '' }]);
              setAmount('');
              setDescription('');
              setPaidBy('1');
              setSplitBetween([]);
            }}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            title="Go to Home"
          >
            <Home size={20} /> Home
          </button>
        </div>
  
        <p className="text-right text-orange-600 font-semibold">
          Total: {formatCurrency(currentExpense.totalAmount, currentExpense.currency)}
        </p>
  
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                id="amount-input"
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {currentExpense.friends.map(friend => (
                  <option key={friend.id} value={friend.id}>{friend.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Split Between</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Option to split between all participants */}
              <button
                type="button"
                onClick={() => setSplitBetween([])}
                className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-colors ${
                  splitBetween.length === 0
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                  ALL
                </div>
                <span className="font-medium">Everyone</span>
              </button>
    
              {/* Options to split between specific friends */}
              {currentExpense.friends.map(friend => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => {
                    if (splitBetween.includes(friend.id)) {
                      setSplitBetween(splitBetween.filter(id => id !== friend.id));
                    } else {
                      setSplitBetween([...splitBetween, friend.id]);
                    }
                  }}
                  className={`p-2 rounded-md border flex items-center gap-1 text-sm transition-colors ${
                    splitBetween.includes(friend.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
                    {getInitials(friend.name)}
                  </div>
                  <span>{friend.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="What was this for?"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingTransactionId ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
  
        <div className="space-y-4">
          {currentExpense.transactions.length > 0 &&<h2 className="text-xl font-semibold">Expenses</h2>}
          {currentExpense.transactions.map(transaction => (
            <div
              key={transaction.id}
              id={`transaction-${transaction.id}`} // Add unique ID
              className="p-4 bg-gray-50 rounded-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium capitalize">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    Paid by <span className="text-blue-600 font-medium">{currentExpense.friends.find(f => f.id === transaction.paidBy)?.name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditTransaction(transaction)}
                    className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                    title="Edit expense"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    title="Delete expense"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="font-semibold">
                {formatCurrency(transaction.amount, currentExpense.currency)}
              </p>
            </div>
          ))}
        </div>
        
        {
          currentExpense.transactions.length > 0 && 
          <button
          onClick={finalizeSplit}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 mt-6"
        >
          Calculate Split
        </button>}
      </div>
    );
  };
  

  const renderSummary = () => {
    if (!currentExpense) return null;
    
    const splits = calculateSplits(currentExpense);

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentExpense.tripName}</h1>
        <p className="text-gray-600 mb-6">
          Total: {formatCurrency(currentExpense.totalAmount, currentExpense.currency)}
        </p>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Settlements</h2>
              <button
                onClick={() => setShowExplanation(true)}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Info size={16} /> Explanation
              </button>
            </div>
            {splits.map((split, index) => {
              const from = currentExpense.friends.find(f => f.id === split.from);
              const to = currentExpense.friends.find(f => f.id === split.to);
              if (!from || !to) return null;

              return (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{from.name}</span>
                    <span>owes</span>
                    <span className="font-medium">{to.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatCurrency(split.amount, currentExpense.currency)}
                    </span>
                    <a
                      href={`https://wa.me/${from.phone}?text=${generateWhatsAppMessage(currentExpense, splits, from.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      <FaWhatsapp size={20} className="text-green-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              setStep('new');
              setCurrentExpense(null);
              setTripName('');
              setFriends([{ id: '1', name: '', phone: '' }]);
              setAmount('');
              setDescription('');
              setPaidBy('1');
              setSplitBetween([]);
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Split
          </button>
        </div>

        {showExplanation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 relative max-h-[70vh] overflow-y-auto">
              <button
                onClick={() => setShowExplanation(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-semibold mb-4">How the Split was Calculated</h3>
              <div className="space-y-4 text-gray-600">
                <p>Here's how we calculated the splits for {currentExpense.tripName}:</p>
                
                <div className="space-y-2">
                  <p className="font-medium text-gray-700">1. Total Amount</p>
                  <p>The total expense is {formatCurrency(currentExpense.totalAmount, currentExpense.currency)}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-gray-700">2. Individual Transactions</p>
                  {currentExpense.transactions.map((t, i) => {
                    const payer = currentExpense.friends.find(f => f.id === t.paidBy);
                    const splitCount = t.splitBetween.length || currentExpense.friends.length;
                    const perPerson = t.amount / splitCount;
                    
                    return (
                      <div key={i} className="pl-4">
                        <p>• {payer?.name} paid {formatCurrency(t.amount, currentExpense.currency)} for {t.description}</p>
                        <p className="text-sm">
                          Split between {splitCount} people
                          ({formatCurrency(perPerson, currentExpense.currency)} each)
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-gray-700">3. Final Settlements</p>
                  <p>After consolidating all transactions, here are the final amounts:</p>
                  {splits.map((split, i) => {
                    const from = currentExpense.friends.find(f => f.id === split.from);
                    const to = currentExpense.friends.find(f => f.id === split.to);
                    return (
                      <p key={i} className="pl-4">
                        • {from?.name} owes {to?.name} {formatCurrency(split.amount, currentExpense.currency)}
                      </p>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <a
                  href={`https://wa.me/?text=${generateWhatsAppMessage(currentExpense, splits)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  <Share2 size={16} /> Share Explanation
                </a>
                <button
                  onClick={() => {
                    const explanationText = splits.map((split, i) => {
                      const from = currentExpense.friends.find(f => f.id === split.from)?.name;
                      const to = currentExpense.friends.find(f => f.id === split.to)?.name;
                      return `${from} owes ${to} ${formatCurrency(split.amount, currentExpense.currency)}`;
                    }).join('\n');

                    const additionalDetails = `
Trip Name: ${currentExpense.tripName}
Total Amount: ${formatCurrency(currentExpense.totalAmount, currentExpense.currency)}
Date: ${formatDateTime(currentExpense.date)}

Transactions:
${currentExpense.transactions.map((t, i) => {
  const payer = currentExpense.friends.find(f => f.id === t.paidBy)?.name;
  const splitCount = t.splitBetween.length || currentExpense.friends.length;
  const perPerson = t.amount / splitCount;
  return `• ${payer} paid ${formatCurrency(t.amount, currentExpense.currency)} for ${t.description} (Split between ${splitCount} people: ${formatCurrency(perPerson, currentExpense.currency)} each)`;
}).join('\n')}

Final Settlements:
${explanationText}
    `;

                    navigator.clipboard.writeText(additionalDetails.trim());
                    toast.success('All details copied to clipboard!');
                  }}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Copy size={16} /> Copy as Text
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <Header setStep={setStep} />
      <div className="pt-20 max-w-4xl mx-auto  p-6">
        {step === 'new' && renderNewExpenseForm()}
        {step === 'details' && renderExpenseDetails()}
        {step === 'summary' && renderSummary()}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;