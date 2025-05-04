import React from "react";
import { Calendar, Users, Wallet, Copy, Edit, Trash2 } from "lucide-react";
import { Expense } from "./types";
import { formatDateTime, formatCurrency } from "./utils";

interface ExpenseCardProps {
  expense: Expense;
  setCurrentExpense: (expense: Expense) => void;
  setStep: (step: "new" | "details" | "summary") => void;
  copyGroupFromExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  setCurrentExpense,
  setStep,
  copyGroupFromExpense,
  deleteExpense,
}) => {
  return (
    <div
      key={expense.id}
      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition hover:scale-[1.01] p-4 cursor-pointer"
      onClick={() => {
        setCurrentExpense(expense);
        setStep("summary");
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-blue-600 font-semibold text-lg capitalize">
            {expense.tripName}
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          {/* Copy Group */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyGroupFromExpense(expense);
            }}
            className="p-1.5 rounded-full text-blue-600 hover:bg-blue-100"
            title="Copy group"
          >
            <Copy size={16} />
          </button>

          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentExpense(expense);
              setStep("details");
            }}
            className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100"
            title="Edit expense"
          >
            <Edit size={16} />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteExpense(expense.id);
            }}
            className="p-1.5 rounded-full text-red-600 hover:bg-red-100"
            title="Delete expense"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-700 font-medium">
        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full shadow-sm">
          <Calendar size={14} /> {formatDateTime(expense.date, true)}
        </span>
        <span className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full shadow-sm">
          <Users size={14} /> {expense.friends.length} friends
        </span>
        <span className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full shadow-sm">
          <Wallet size={14} />{" "}
          {formatCurrency(expense.totalAmount, expense.currency)}
        </span>
      </div>
    </div>
  );
};

export default ExpenseCard;
