import React from "react";
import { Home, Info, X, Share2, Copy } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Expense, Split } from "./types";
import { toast } from "react-toastify";
import {
  formatCurrency,
  formatDateTime,
  generateWhatsAppMessage,
} from "./utils";
import Banners from "./Banners";

interface SummaryProps {
  currentExpense: Expense;
  setStep: React.Dispatch<React.SetStateAction<"new" | "details" | "summary">>;
  setCurrentExpense: React.Dispatch<React.SetStateAction<Expense | null>>;
  setTripName: React.Dispatch<React.SetStateAction<string>>;
  setFriends: React.Dispatch<React.SetStateAction<Expense["friends"]>>;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setPaidBy: React.Dispatch<React.SetStateAction<string>>;
  setSplitBetween: React.Dispatch<React.SetStateAction<string[]>>;
  calculateSplits: (expense: Expense) => Split[];
  showExplanation: boolean;
  setShowExplanation: React.Dispatch<React.SetStateAction<boolean>>;
}

const Summary: React.FC<SummaryProps> = ({
  currentExpense,
  setStep,
  setCurrentExpense,
  setTripName,
  setFriends,
  setAmount,
  setDescription,
  setPaidBy,
  setSplitBetween,
  calculateSplits,
  showExplanation,
  setShowExplanation,
}) => {
  if (!currentExpense) return null;

  const splits = calculateSplits(currentExpense);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="capitalize text-3xl font-bold text-gray-800">
          {currentExpense.tripName}
        </h1>
        <button
          onClick={() => {
            setStep("new");
            setCurrentExpense(null);
            setTripName("");
            setFriends([{ id: "1", name: "", phone: "" }]);
            setAmount("");
            setDescription("");
            setPaidBy("1");
            setSplitBetween([]);
          }}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          title="Go to Home"
        >
          <Home size={20} /> Home
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-2 bg-white rounded-2xl shadow-md border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">💰 Settlements</h2>
            <button
              onClick={() => setShowExplanation(true)}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <Info size={18} /> Explanation
            </button>
          </div>

          {splits.map((split, index) => {
            const from = currentExpense.friends.find(
              (f) => f.id === split.from
            );
            const to = currentExpense.friends.find((f) => f.id === split.to);
            if (!from || !to) return null;

            return (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:bg-gray-100 transition"
              >
                <div className="text-gray-700">
                  <span className="font-semibold text-gray-900">
                    {from.name}
                  </span>{" "}
                  owes{" "}
                  <span className="font-semibold text-gray-900">{to.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-700">
                    {formatCurrency(split.amount, currentExpense.currency)}
                  </span>
                  <a
                    href={`https://wa.me/${
                      from.phone
                    }?text=${generateWhatsAppMessage(
                      currentExpense,
                      splits,
                      from.id
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                    title={`Send reminder to ${from.name}`}
                  >
                    <FaWhatsapp size={22} className="text-green-500" />
                  </a>
                </div>
              </div>
            );
          })}

          <hr className="my-2" />
          <div className="text-right text-lg text-orange-600 font-bold">
            Total:{" "}
            {formatCurrency(
              currentExpense.totalAmount,
              currentExpense.currency
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setStep("new");
            setCurrentExpense(null);
            setTripName("");
            setFriends([{ id: "1", name: "", phone: "" }]);
            setAmount("");
            setDescription("");
            setPaidBy("1");
            setSplitBetween([]);
          }}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Split
        </button>
      </div>
      <Banners />

      {showExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative max-h-[70vh] overflow-y-auto">
            <button
              onClick={() => setShowExplanation(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4">
              How the Split was Calculated
            </h3>
            <div className="space-y-4 text-gray-600">
              <p>
                Here's how we calculated the splits for{" "}
                {currentExpense.tripName}:
              </p>

              <div className="space-y-2">
                <p className="font-medium text-gray-700">1. Total Amount</p>
                <p>
                  The total expense is{" "}
                  {formatCurrency(
                    currentExpense.totalAmount,
                    currentExpense.currency
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-gray-700">
                  2. Individual Transactions
                </p>
                {currentExpense.transactions.map((t, i) => {
                  const payer = currentExpense.friends.find(
                    (f) => f.id === t.paidBy
                  );
                  const splitCount =
                    t.splitBetween.length || currentExpense.friends.length;
                  const perPerson = t.amount / splitCount;

                  // Get the names of the people involved in the split
                  const splitNames =
                    t.splitBetween.length > 0
                      ? t.splitBetween
                          .map(
                            (id) =>
                              currentExpense.friends.find((f) => f.id === id)
                                ?.name
                          )
                          .filter(Boolean)
                          .join(", ")
                      : "all participants";

                  return (
                    <div key={i} className="pl-4">
                      <p>
                        • {payer?.name} paid{" "}
                        {formatCurrency(t.amount, currentExpense.currency)} for{" "}
                        {t.description}
                      </p>
                      <p className="text-sm">
                        Split between {splitCount} people{" "}
                        {t.splitBetween.length > 0 ? `(${splitNames})` : ""}(
                        {formatCurrency(perPerson, currentExpense.currency)}{" "}
                        each)
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <p className="font-medium text-gray-700">
                  3. Final Settlements
                </p>
                <p>
                  After consolidating all transactions, here are the final
                  amounts:
                </p>
                {splits.map((split, i) => {
                  const from = currentExpense.friends.find(
                    (f) => f.id === split.from
                  );
                  const to = currentExpense.friends.find(
                    (f) => f.id === split.to
                  );
                  return (
                    <p key={i} className="pl-4">
                      • {from?.name} owes {to?.name}{" "}
                      {formatCurrency(split.amount, currentExpense.currency)}
                    </p>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <a
                href={`https://wa.me/?text=${generateWhatsAppMessage(
                  currentExpense,
                  splits
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 hover:text-green-700"
              >
                <Share2 size={16} /> Share Explanation
              </a>
              <button
                onClick={() => {
                  const explanationText = splits
                    .map((split, i) => {
                      const from = currentExpense.friends.find(
                        (f) => f.id === split.from
                      )?.name;
                      const to = currentExpense.friends.find(
                        (f) => f.id === split.to
                      )?.name;
                      return `${from} owes ${to} ${formatCurrency(
                        split.amount,
                        currentExpense.currency
                      )}`;
                    })
                    .join("\n");

                  const additionalDetails = `
Trip Name: ${currentExpense.tripName}
Total Amount: ${formatCurrency(
                    currentExpense.totalAmount,
                    currentExpense.currency
                  )}
Date: ${formatDateTime(currentExpense.date)}

Transactions:
${currentExpense.transactions
  .map((t, i) => {
    const payer = currentExpense.friends.find((f) => f.id === t.paidBy)?.name;
    const splitCount = t.splitBetween.length || currentExpense.friends.length;
    const perPerson = t.amount / splitCount;

    // Get the names of the people involved in the split
    const splitNames =
      t.splitBetween.length > 0
        ? t.splitBetween
            .map((id) => currentExpense.friends.find((f) => f.id === id)?.name)
            .filter(Boolean)
            .join(", ")
        : "all participants";

    return `• ${payer} paid ${formatCurrency(
      t.amount,
      currentExpense.currency
    )} for ${t.description} (Split between ${splitCount} people ${
      t.splitBetween.length > 0 ? `(${splitNames})` : ""
    }: ${formatCurrency(perPerson, currentExpense.currency)} each)`;
  })
  .join("\n")}

Final Settlements:
${explanationText}
    `;

                  navigator.clipboard.writeText(additionalDetails.trim());
                  toast.success("All details copied to clipboard!");
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

export default Summary;
