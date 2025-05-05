import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Banners from "./Banners";
import "react-toastify/dist/ReactToastify.css";
import SpeechToTextInput from "./SpeechToTextInput";
import Summary from "./Summary";
import TransactionList from "./TransactionList";
import ExpenseChart from "./ExpenseChart";
import ExpenseCard from "./ExpenseCard";
import {
  History,
  Trash2,
  MapPin,
  X,
  Settings,
  Copy,
  Calendar,
  Users,
  Wallet,
  Edit,
  Home,
} from "lucide-react";
import "./App.css";
import { Expense, Friend, Transaction } from "./types";
import Header from "./Header";
import {
  calculateSplits,
  formatCurrency,
  formatDateTime,
  getInitials,
  highlightAndFocus,
} from "./utils";
import ExpenseTrendChart from "./ExpenseTrendChart";
import NewExpenseForm from "./NewExpenseForm";

function App() {
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[] | null
  >(null); // Add this state to store filtered transactions

  const [step, setStep] = useState<"new" | "details" | "summary">("new");
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [pastExpenses, setPastExpenses] = useState<Expense[]>([]);
  const [tripName, setTripName] = useState("");
  const [friends, setFriends] = useState<Friend[]>([
    { id: "1", name: "", phone: "" },
  ]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("1");
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem("preferredCurrency");
    return saved || "USD"; // default currency
  });
  const [currencySymbol, setCurrencySymbol] = useState("$"); // default symbol
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [showSearchBar, setShowSearchBar] = useState(false); // Add this state
  const [searchQuery, setSearchQuery] = useState(""); // Add this state for search input

  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [showTrendModal, setShowTrendModal] = useState(false); // Moved here

  useEffect(() => {
    const saved = localStorage.getItem("expenses");
    if (saved) {
      setPastExpenses(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("preferredCurrency", currency);
  }, [currency]);

  const scrollToAmountInput = () => {
    const amountInput = document.getElementById("amount-input");
    if (amountInput) {
      amountInput.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        amountInput.focus();
      }, 500);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.length < 1) {
      toast.error("Please enter a search term");
      return;
    }
    if (!currentExpense) return;

    const filtered = currentExpense.transactions.filter((transaction) =>
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length === 0) {
      toast.error("No transactions found");
      return;
    } else {
      setFilteredTransactions(filtered); // Update the filtered transactions state
      toast.success(`${filtered.length} transaction(s) found!`);
      gotoTrendButton();
    }
  };

  const gotoTrendButton = () => {
    const trendButton = document.getElementById("expenseTrend");
    if (trendButton) {
      trendButton.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const deleteExpense = (id: string) => {
    const newExpenses = pastExpenses.filter((e) => e.id !== id);
    setPastExpenses(newExpenses);
    localStorage.setItem("expenses", JSON.stringify(newExpenses));
  };

  const deleteAllExpenses = () => {
    setPastExpenses([]);
    localStorage.removeItem("expenses");
  };

  const copyGroupFromExpense = (expense: Expense) => {
    //setTripName(expense.tripName); // Set the trip name from the copied expense
    setFriends(
      expense.friends.map((friend) => ({
        ...friend,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      }))
    );
    toast.success("Group copied to the form!");

    setTimeout(() => {
      const firstFriendInput = document.getElementsByClassName("friendName")[0];
      if (firstFriendInput) {
        firstFriendInput.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstFriendInput.focus();
      }
    }, 100);
  };

  const handleNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const validFriends = friends.filter((f) => f.name);
    if (validFriends.length < 2) {
      toast.error("Please add at least 2 friends");
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      tripName,
      date: new Date().toISOString(),
      currency,
      friends: validFriends,
      transactions: [],
      totalAmount: 0,
    };

    setCurrentExpense(expense);
    setPaidBy(validFriends[0].id);
    setSplitBetween([]);
    setStep("details");
  };

  const addTransaction = (transaction: Omit<Transaction, "id" | "date">) => {
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
    const existingExpenseIndex = pastExpenses.findIndex(
      (e) => e.id === updatedExpense.id
    );
    if (existingExpenseIndex !== -1) {
      // Update the existing expense
      const updatedExpenses = [...pastExpenses];
      updatedExpenses[existingExpenseIndex] = updatedExpense;
      setPastExpenses(updatedExpenses);
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
    } else {
      // Add the new expense to the list
      const newPastExpenses = [updatedExpense, ...pastExpenses];
      setPastExpenses(newPastExpenses);
      localStorage.setItem("expenses", JSON.stringify(newPastExpenses));
    }
  };

  const finalizeSplit = () => {
    if (!currentExpense) return;

    // Check if the expense already exists in the pastExpenses list
    const existingExpenseIndex = pastExpenses.findIndex(
      (e) => e.id === currentExpense.id
    );

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
    localStorage.setItem("expenses", JSON.stringify(pastExpenses));

    // Navigate to the summary page
    setStep("summary");
  };

  const openContactPicker = async (index: number) => {
    if ("contacts" in navigator && "select" in navigator.contacts) {
      try {
        const contacts = await navigator.contacts.select(["name", "tel"], {
          multiple: false,
        });
        if (contacts.length > 0) {
          const selectedContact = contacts[0];
          const phoneNumber = selectedContact.tel[0]; // Get the first phone number
          const contactName = selectedContact.name[0]; // Get the first name

          const newFriends = [...friends];
          newFriends[index].phone = phoneNumber;
          newFriends[index].name = contactName; // Populate the name field
          setFriends(newFriends);

          toast.success(`Selected contact: ${contactName} successfully!`);
        }
      } catch (error) {
        console.error("Error selecting contact:", error);
        toast.error("Failed to open contacts.");
      }
    } else {
      toast.error("Not supported on this device.");
    }
  };

  const renderNewExpenseForm = () => (
    <>
      <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              <span className="text-blue-500 bg-blue-100 p-2 rounded-full">
                <MapPin size={24} />
              </span>
              <h4 className="text-3xl font-bold text-gray-800">
                Enter trip/event details
              </h4>
            </div>
          </div>
          <NewExpenseForm
            tripName={tripName}
            setTripName={setTripName}
            friends={friends}
            setFriends={setFriends}
            setCurrency={setCurrency}
            currencySymbol={currencySymbol}
            setCurrencySymbol={setCurrencySymbol}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            handleNewExpense={handleNewExpense}
            openContactPicker={openContactPicker}
          />
        </div>
        <div className="BannerSection">
          {pastExpenses.length > 0 && (
            <div className="mt-8 border-b pb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <History size={20} /> Recent Expenses
                </h2>
                <button
                  type="button"
                  onClick={deleteAllExpenses}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                >
                  <Trash2 size={16} /> Delete All
                </button>
              </div>

              <div className="space-y-3">
                {pastExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    setCurrentExpense={setCurrentExpense}
                    setStep={setStep}
                    copyGroupFromExpense={copyGroupFromExpense}
                    deleteExpense={deleteExpense}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add the ExpenseChart component here */}
          {pastExpenses.length > 1 && (
            <div className="border-b pt-6">
              <ExpenseChart pastExpenses={pastExpenses} />
            </div>
          )}

          <Banners />
        </div>
      </div>
    </>
  );

  const handleDeleteTransaction = (transactionId: string) => {
    const updatedTransactions = currentExpense.transactions.filter(
      (t) => t.id !== transactionId
    );

    const updatedExpense = {
      ...currentExpense,
      transactions: updatedTransactions,
      totalAmount: updatedTransactions.reduce((sum, t) => sum + t.amount, 0),
    };

    setCurrentExpense(updatedExpense);

    // Update localStorage
    const updatedExpenses = pastExpenses.map((expense) =>
      expense.id === updatedExpense.id ? updatedExpense : expense
    );
    setPastExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    toast.success("Transaction deleted successfully.");
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    setAmount(transaction.amount.toString());
    setDescription(transaction.description);
    setPaidBy(transaction.paidBy);
    setSplitBetween(transaction.splitBetween);

    const amountInput = document.getElementById("amount-input");

    if (amountInput) {
      amountInput.focus();
      const body = document.querySelector("body");
      if (body) {
        body.scrollIntoView({ behavior: "smooth" });
        amountInput.classList.add("bg-yellow-100");
        setTimeout(() => amountInput.classList.remove("bg-yellow-100"), 2000);
      }
      toast.success(
        'Editing transaction. Make changes and click "Update Expense".'
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Ensure amount and description are provided
    if (!amount || !description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validation: Ensure at least two participants are selected if not splitting with all
    if (splitBetween.length > 0 && splitBetween.length < 2) {
      toast.error("Please select at least 2 participants for the split.");
      return;
    }

    // If editing an existing transaction, update it
    if (editingTransactionId) {
      const updatedTransactions = currentExpense.transactions.map(
        (transaction) =>
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
      setAmount("");
      setDescription("");
      setPaidBy(currentExpense.friends[0].id);

      // Update localStorage
      const updatedExpenses = pastExpenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      );
      setPastExpenses(updatedExpenses);
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

      // Show success toast
      toast.success("Expense updated successfully!");

      highlightAndFocus(
        document.getElementById(`transaction-${editingTransactionId}`)
      );
    } else {
      // Add a new transaction
      try {
        addTransaction({
          paidBy,
          amount: parseFloat(amount),
          description,
          splitBetween,
        });

        // Show success toast
        toast.success("Expense added successfully!");
        setTimeout(() => {
          highlightAndFocus(
            document.getElementsByClassName("space-y-4")[1]?.lastElementChild
          );
        }, 500);
      } catch (error) {
        console.error("Error adding expense:", error);
        toast.error("Failed to add expense. Please try again.");
      }
    }

    setAmount("");
    setDescription("");
    setSplitBetween([]);
  };

  const renderExpenseDetails = () => {
    if (!currentExpense) return null;

    return (
      <div className="max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg">
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

        <p className="text-right text-orange-600 font-semibold">
          Total:{" "}
          {formatCurrency(currentExpense.totalAmount, currentExpense.currency)}
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 mb-10 bg-white p-6 rounded-xl shadow-md"
        >
          {/* Amount and Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="amount-input"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Amount
              </label>
              <input
                id="amount-input"
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {currentExpense.friends.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Split Between */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Split Between
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* All Option */}
              <button
                type="button"
                onClick={() => setSplitBetween([])}
                className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg transition ${
                  splitBetween.length === 0
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  ALL
                </div>
                Everyone
              </button>

              {/* Individual Friends */}
              {currentExpense.friends.map((friend) => {
                const isSelected = splitBetween.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() =>
                      isSelected
                        ? setSplitBetween(
                            splitBetween.filter((id) => id !== friend.id)
                          )
                        : setSplitBetween([...splitBetween, friend.id])
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition text-sm ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {getInitials(friend.name)}
                    </div>
                    {friend.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <SpeechToTextInput
              value={description}
              onChange={setDescription}
              placeholder="What was this for?"
              required={true}
              micPosition="right"
              micColor="text-red-600 hover:text-red-700"
            />
            {/* Assistance Text */}
            <div className="mt-2 text-sm text-gray-600 italic">
              Splitting between{" "}
              <span className="font-medium text-gray-800">
                {splitBetween.length === 0
                  ? currentExpense.friends.length
                  : splitBetween.length}
              </span>{" "}
              {splitBetween.length === 1 ? "person" : "people"}.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold transform hover:scale-105"
          >
            {editingTransactionId ? "Update Expense" : "Add Expense"}
          </button>
        </form>

        <div className="space-y-4">
          {currentExpense.transactions.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Expenses{" "}
                  <button
                    onClick={() => setShowSearchBar(!showSearchBar)} // Toggle search bar visibility
                    className="text-gray-600 hover:text-gray-700"
                    title="Search & filter expenses"
                  >
                    <Settings size={20} />
                  </button>
                </h2>
                <button
                  id="expenseTrend"
                  onClick={() => setShowTrendModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Expense Trend
                </button>
              </div>
              {/* Search Bar with Visibility Toggle */}
              <div className={`${showSearchBar ? "block" : "hidden"} mb-4`}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim() !== "") {
                        handleSearchSubmit();
                      }
                    }}
                    placeholder="Search expenses..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleSearchSubmit} // Call the search function
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Submit
                  </button>
                  {filteredTransactions && (
                    <button
                      onClick={() => {
                        setFilteredTransactions(null); // Clear the filtered transactions
                        setSearchQuery(""); // Clear the search query
                        gotoTrendButton();
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
          {(filteredTransactions || currentExpense.transactions) && (
            <TransactionList
              transactions={filteredTransactions || currentExpense.transactions}
              friends={currentExpense.friends}
              handleEditTransaction={handleEditTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
              currency={currentExpense.currency}
            />
          )}
        </div>

        {currentExpense.transactions.length > 0 && (
          <>
            <button
              id="calculateSplitButton"
              onClick={finalizeSplit}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 mt-6"
            >
              Calculate Split
            </button>
            <button
              onClick={scrollToAmountInput}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 mt-4"
            >
              Enter next expense
            </button>
          </>
        )}

        {/* Modal for Expense Trend */}
        {showTrendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full p-6 relative">
              <button
                onClick={() => setShowTrendModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-semibold mb-4">
                Expense Trend by Payer
              </h3>
              <ExpenseTrendChart expense={currentExpense} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="background min-h-screen">
      <Header setStep={setStep} />
      <div className="pt-20 max-w-4xl mx-auto  p-6">
        {step === "new" && renderNewExpenseForm()}
        {step === "details" && renderExpenseDetails()}
        {step === "summary" && currentExpense && (
          <Summary
            currentExpense={currentExpense}
            setStep={setStep}
            setCurrentExpense={setCurrentExpense}
            setTripName={setTripName}
            setFriends={setFriends}
            setAmount={setAmount}
            setDescription={setDescription}
            setPaidBy={setPaidBy}
            setSplitBetween={setSplitBetween}
            calculateSplits={calculateSplits}
            showExplanation={showExplanation}
            setShowExplanation={setShowExplanation}
          />
        )}
      </div>
      <ToastContainer theme="colored" />
    </div>
  );
}

export default App;
