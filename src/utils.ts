import { Expense, Friend, Split, Transaction, Currency } from './types';

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
];

export const calculateSplits = (expense: Expense): Split[] => {
  const splits: Split[] = [];

  // Step 1: Calculate per-transaction splits
  expense.transactions.forEach(transaction => {
    const splitMembers = transaction.splitBetween.length > 0 
      ? transaction.splitBetween 
      : expense.friends.map(f => f.id);
    
    const perPersonShare = transaction.amount / splitMembers.length;

    splitMembers.forEach(memberId => {
      if (memberId !== transaction.paidBy) {
        splits.push({
          from: memberId,
          to: transaction.paidBy,
          amount: perPersonShare
        });
      }
    });
  });

  // Step 2: Consolidate same-direction splits
  const consolidatedMap: Record<string, Split> = {};
  splits.forEach(split => {
    const key = `${split.from}-${split.to}`;
    if (consolidatedMap[key]) {
      consolidatedMap[key].amount += split.amount;
    } else {
      consolidatedMap[key] = { ...split };
    }
  });

  const consolidatedSplits = Object.values(consolidatedMap);

  // Step 3: Net reverse-direction splits
  const nettedMap: Record<string, Split> = {};
  const visited = new Set<string>();

  consolidatedSplits.forEach(split => {
    const reverseKey = `${split.to}-${split.from}`;
    const directKey = `${split.from}-${split.to}`;

    if (visited.has(directKey) || visited.has(reverseKey)) return;

    const reverseSplit = consolidatedMap[reverseKey];
    if (reverseSplit) {
      // Both directions exist, net them
      if (split.amount > reverseSplit.amount) {
        nettedMap[directKey] = {
          from: split.from,
          to: split.to,
          amount: Number((split.amount - reverseSplit.amount).toFixed(2))
        };
      } else if (reverseSplit.amount > split.amount) {
        nettedMap[reverseKey] = {
          from: reverseSplit.from,
          to: reverseSplit.to,
          amount: Number((reverseSplit.amount - split.amount).toFixed(2))
        };
      }
      // If equal, nothing is owed
    } else {
      // Only one direction exists, keep it as-is
      nettedMap[directKey] = {
        from: split.from,
        to: split.to,
        amount: Number(split.amount.toFixed(2))
      };
    }

    visited.add(directKey);
    visited.add(reverseKey);
  });

  return Object.values(nettedMap);
};


export const calculateSplitsOld = (expense: Expense): Split[] => {
  const splits: Split[] = [];
  
  // Calculate per-transaction splits
  expense.transactions.forEach(transaction => {
    const splitMembers = transaction.splitBetween.length > 0 
      ? transaction.splitBetween 
      : expense.friends.map(f => f.id);
    
    const perPersonShare = transaction.amount / splitMembers.length;
    
    // For each split member who didn't pay
    splitMembers.forEach(memberId => {
      if (memberId !== transaction.paidBy) {
        splits.push({
          from: memberId,
          to: transaction.paidBy,
          amount: perPersonShare
        });
      }
    });
  });

  // Consolidate splits between same pairs
  const consolidatedSplits: Record<string, Split> = {};
  splits.forEach(split => {
    const key = `${split.from}-${split.to}`;
    if (consolidatedSplits[key]) {
      consolidatedSplits[key].amount += split.amount;
    } else {
      consolidatedSplits[key] = { ...split };
    }
  });

  return Object.values(consolidatedSplits).map(split => ({
    ...split,
    amount: Number(split.amount.toFixed(2))
  }));
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

export const generateWhatsAppMessage = (expense: Expense, splits: Split[], forFriendId?: string): string => {
  const friendMap = expense.friends.reduce((acc, friend) => {
    acc[friend.id] = friend;
    return acc;
  }, {} as Record<string, Friend>);

  let message = `*${expense.tripName} - Expense Summary*\n\n`;
  message += `Total Amount: ${formatCurrency(expense.totalAmount, expense.currency)}\n`;
  
  if (forFriendId) {
    // Generate message for specific friend
    const friendSplits = splits.filter(split => split.from === forFriendId);
    message += '\n*Your Settlements:*\n';
    friendSplits.forEach(split => {
      message += `You owe ${friendMap[split.to].name}: ${formatCurrency(split.amount, expense.currency)}\n`;
    });
  } else {
    // Generate full summary
    message += `Per Person Share: ${formatCurrency(expense.totalAmount / expense.friends.length, expense.currency)}\n\n`;
    message += '*All Settlements:*\n';
    splits.forEach(split => {
      message += `${friendMap[split.from].name} owes ${friendMap[split.to].name}: ${formatCurrency(split.amount, expense.currency)}\n`;
    });
  }

  return encodeURIComponent(message);
};

export const validateName = (name: string): boolean => {
  return /^[A-Za-z\s-']+$/.test(name);
};

export const validatePhone = (phone: string): boolean => {
  return /^\+?[\d-]{8,}$/.test(phone);
};

export const formatDateTime = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};