import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the datalabels plugin
import { Expense } from './types';

// Register Chart.js components and plugins
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface ExpenseTrendChartProps {
  expense: Expense;
}

const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ expense }) => {
  const participants = expense.friends.map(friend => friend.name);

  // Create a map from friend ID to their index in the participants array
  const friendIdToIndex: { [id: string]: number } = {};
  expense.friends.forEach((friend, index) => {
    friendIdToIndex[friend.id] = index;
  });

  // Calculate total spent by each participant
  const totalSpent = new Array(expense.friends.length).fill(0);

  // Define a color palette for the bars
  const colorPalette = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED',
  ];

  // Each dataset represents one transaction
  const datasets = expense.transactions.map((transaction, index) => {
    const data = new Array(expense.friends.length).fill(0);

    // Find the payer
    const payerIndex = friendIdToIndex[transaction.paidBy];
    if (payerIndex !== undefined) {
      data[payerIndex] = transaction.amount;
      totalSpent[payerIndex] += transaction.amount; // Add to the total spent
    }

    return {
      label: transaction.description,
      data,
      backgroundColor: colorPalette[index % colorPalette.length], // Use the color palette
      borderColor: '#ffffff', // Add a white border for a shadow effect
      borderWidth: 2, // Border width for shadow effect
      borderRadius: 8, // Rounded corners for bars
    };
  });

  const chartData = {
    labels: participants,
    datasets,
  };

  /* const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Disable the legend
      },
      title: {
        display: true,
        font: {
          size: 18, // Larger font size for the title
          weight: 'bold',
        },
        color: '#333', // Darker color for the title
      },
      tooltip: {
        backgroundColor: '#333', // Dark background for the tooltip
        titleColor: '#fff', // White title text
        bodyColor: '#fff', // White body text
        borderColor: '#fff', // White border
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ₹${value.toFixed(2)}`;
          },
        },
      },
      datalabels: {
        display: true,
        align: 'end', // Align the label to the end of the bar
        anchor: 'end', // Position the label at the top-right corner
        formatter: (value: number, context: any) => {
          const datasetIndex = context.datasetIndex;
          const dataIndex = context.dataIndex;

          // Only show the total for the last dataset (topmost stack)
          if (datasetIndex === datasets.length - 1) {
            return `₹${totalSpent[dataIndex].toFixed(2)}`;
          }
          return '';
        },
        color: '#000', // Label color
        font: {
          size: 12, // Larger font size for labels
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false, // Hide grid lines on the x-axis
        },
        ticks: {
          font: {
            size: 12, // Larger font size for x-axis labels
          },
          color: '#333', // Darker color for x-axis labels
        },
      },
      y: {
        stacked: true,
        grid: {
          color: '#e0e0e0', // Light gray grid lines
        },
        title: {
          display: true,
          text: 'Amount Spent',
          font: {
            size: 14, // Larger font size for y-axis title
            weight: 'bold',
          },
          color: '#333', // Darker color for y-axis title
        },
        ticks: {
          font: {
            size: 12, // Larger font size for y-axis labels
          },
          color: '#333', // Darker color for y-axis labels
        },
      },
    },
  }; */

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 2000, // Increase the duration to 2000ms (2 seconds) for slower animation
      easing: 'easeOutQuart', // Use a smooth easing function for the animation
    },
    plugins: {
      legend: {
        display: false, // Disable the legend
      },
      title: {
        display: true,
        font: {
          size: 18, // Larger font size for the title
          weight: 'bold',
        },
        color: '#333', // Darker color for the title
      },
      tooltip: {
        backgroundColor: '#333', // Dark background for the tooltip
        titleColor: '#fff', // White title text
        bodyColor: '#fff', // White body text
        borderColor: '#fff', // White border
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ₹${value.toFixed(2)}`;
          },
        },
      },
      datalabels: {
        display: true,
        align: 'end', // Align the label to the end of the bar
        anchor: 'end', // Position the label at the top-right corner
        formatter: (value: number, context: any) => {
          const datasetIndex = context.datasetIndex;
          const dataIndex = context.dataIndex;
  
          // Only show the total for the last dataset (topmost stack)
          if (datasetIndex === datasets.length - 1) {
            return `₹${totalSpent[dataIndex].toFixed(2)}`;
          }
          return '';
        },
        color: '#000', // Label color
        font: {
          size: 12, // Larger font size for labels
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false, // Hide grid lines on the x-axis
        },
        ticks: {
          font: {
            size: 12, // Larger font size for x-axis labels
          },
          color: '#333', // Darker color for x-axis labels
        },
      },
      y: {
        stacked: true,
        grid: {
          color: '#e0e0e0', // Light gray grid lines
        },
        title: {
          display: true,
          text: 'Amount Spent',
          font: {
            size: 14, // Larger font size for y-axis title
            weight: 'bold',
          },
          color: '#333', // Darker color for y-axis title
        },
        ticks: {
          font: {
            size: 12, // Larger font size for y-axis labels
          },
          color: '#333', // Darker color for y-axis labels
        },
      },
    },
  };
  return <Bar data={chartData} options={chartOptions} />;
};

export default ExpenseTrendChart;
