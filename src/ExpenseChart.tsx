import React, { useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { FiPieChart } from "react-icons/fi";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Expense, Transaction } from "./types";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

interface ExpenseChartProps {
  pastExpenses: Expense[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ pastExpenses }) => {
  // State for expand/collapse
  const [isExpanded, setIsExpanded] = useState(false);

  // State to manage drill-down
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<
    { description: string; amount: number }[]
  >([]);

  // Define categories and their keywords
  const categories: { [key: string]: string[] } = {
    Food: ["food", "burger", "pizza", "drink", "coffee", "restaurant"],
    Fuel: ["fuel", "petrol", "gas", "diesel", "cng"],
    Shopping: ["shopping", "clothes", "electronics", "mall", "store"],
    Entertainment: ["movie", "cinema", "ticket", "show"],
    Travel: ["flight", "train", "bus", "taxi", "uber", "lyft", "travel"],
    Utilities: ["electricity", "water", "gas", "internet", "phone", "utility"],
    Healthcare: [
      "doctor",
      "hospital",
      "medicine",
      "pharmacy",
      "health",
      "clinic",
    ],
    Education: [
      "school",
      "college",
      "university",
      "tuition",
      "books",
      "education",
    ],
    Subscriptions: [
      "netflix",
      "spotify",
      "amazon prime",
      "subscription",
      "membership",
    ],
    Gifts: ["gift", "present", "birthday", "anniversary", "wedding"],
    Home: ["furniture", "appliance", "home", "decor", "repair", "maintenance"],
    Insurance: ["insurance", "policy", "premium", "coverage"],
    Dining: ["restaurant", "dining", "cafe", "bar", "pub"],
    Savings: ["savings", "investment", "stocks", "mutual funds", "crypto"],
    Miscellaneous: ["misc", "other", "general"],
  };

  // Aggregate expenses by category
  const categoryTotals: { [key: string]: number } = {};
  const allTransactions: Transaction[] = [];
  pastExpenses.forEach((expense) => {
    expense.transactions.forEach((transaction) => {
      allTransactions.push(transaction);

      const description = transaction.description.toLowerCase();
      let matchedCategory = "Miscellaneous";

      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some((keyword) => description.includes(keyword))) {
          matchedCategory = category;
          break;
        }
      }

      if (!categoryTotals[matchedCategory]) {
        categoryTotals[matchedCategory] = 0;
      }
      categoryTotals[matchedCategory] += transaction.amount;
    });
  });

  // Prepare data for the main pie chart
  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#FF6384", // Food
          "#36A2EB", // Fuel
          "#FFCE56", // Shopping
          "#4BC0C0", // Entertainment
          "#9966FF", // Miscellaneous
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
        borderWidth: 5,
        borderColor: "#fff",
        borderRadius: 10,
        hoverOffset: 15,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw || 0;
            const total = Object.values(categoryTotals).reduce(
              (sum, val) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "70%",
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const category = data.labels[index];
        handleDrillDown(category);
      }
    },
  };

  // Handle drill-down
  const handleDrillDown = (category: string) => {
    setSelectedCategory(category);

    const filtered = allTransactions.filter((transaction) => {
      const description = transaction.description.toLowerCase();
      return categories[category].some((keyword) =>
        description.includes(keyword)
      );
    });

    const groupedTransactions: { [key: string]: number } = {};
    filtered.forEach((transaction) => {
      const description = transaction.description.toLowerCase();

      const matchedKeyword = categories[category].find((keyword) =>
        description.includes(keyword)
      );

      if (matchedKeyword) {
        if (!groupedTransactions[matchedKeyword]) {
          groupedTransactions[matchedKeyword] = 0;
        }
        groupedTransactions[matchedKeyword] += transaction.amount;
      }
    });

    const groupedTransactionsArray = Object.entries(groupedTransactions).map(
      ([description, amount]) => ({
        description,
        amount,
      })
    );

    setFilteredTransactions(groupedTransactionsArray);
  };

  // Handle back to main chart
  const handleBack = () => {
    setSelectedCategory(null);
    setFilteredTransactions([]);
  };

  // Prepare data for the bar chart
  const drillDownData = {
    labels: filteredTransactions.map((transaction) => transaction.description),
    datasets: [
      {
        label: "Amount",
        data: filteredTransactions.map((transaction) => transaction.amount),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-lg mx-auto mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FiPieChart size={20} className="text-black" />
          Expense Breakdown
        </h3>
        <button
          className="text-gray-600 hover:text-gray-800 transition"
          aria-label="Toggle Expense Breakdown"
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4">
          {selectedCategory ? (
            <div>
              <button
                onClick={handleBack}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Back to Chart
              </button>
              <Bar data={drillDownData} options={options} />
            </div>
          ) : (
            <>
              <Doughnut data={data} options={options} />
              <div className="mt-6">
                {Object.keys(categoryTotals).map((category, index) => {
                  const value = categoryTotals[category];
                  const percentage = (
                    (value /
                      Object.values(categoryTotals).reduce(
                        (a, b) => a + b,
                        0
                      )) *
                    100
                  ).toFixed(2);

                  const colors = [
                    "#FF6384", // Food
                    "#36A2EB", // Fuel
                    "#FFCE56", // Shopping
                    "#4BC0C0", // Entertainment
                    "#9966FF", // Miscellaneous
                  ];

                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between mb-2 cursor-pointer"
                      onClick={() => handleDrillDown(category)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-gray-700 font-medium">
                          {category}
                        </span>
                      </div>
                      <span className="text-gray-600">
                        ${value.toFixed(2)} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;
