import React from "react";
import { Transaction, Expense } from "./types";
import { formatCurrency, formatDateTime } from "./utils";
import { Edit, Trash2, Users } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  friends: Expense["friends"];
  handleEditTransaction: (transaction: Transaction) => void;
  handleDeleteTransaction: (transactionId: string) => void;
  currency: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  friends,
  handleEditTransaction,
  handleDeleteTransaction,
  currency,
}) => {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          id={`transaction-${transaction.id}`} // Add unique ID
          className="p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-gray-200"
        >
          <div className="flex justify-between items-start">
            {/* Left Section: Transaction Details */}
            <div>
              <p className="font-medium capitalize text-lg text-gray-800">
                {transaction.description}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Paid by{" "}
                <span className="text-blue-600 font-semibold">
                  {friends.find((f) => f.id === transaction.paidBy)?.name}
                </span>{" "}
                on {formatDateTime(transaction.date)}
              </p>
              <p className="text-sm text-gray-600 italic mt-1">
                {transaction.splitBetween.length === 0
                  ? "Split with all"
                  : `Split with ${transaction.splitBetween
                      .map((id) => friends.find((f) => f.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")}`}
              </p>
            </div>

            {/* Right Section: Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEditTransaction(transaction)}
                className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition"
                title="Edit expense"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteTransaction(transaction.id)}
                className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-red-600 hover:text-red-700 transition"
                title="Delete expense"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Bottom Section: Amount */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={16} className="text-gray-500" />
              <span>
                {transaction.splitBetween.length || friends.length} participant
                {transaction.splitBetween.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="font-bold text-lg text-green-700">
              {formatCurrency(transaction.amount, currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
