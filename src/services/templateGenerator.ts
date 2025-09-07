import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const generateSampleDataTemplate = () => {
  const workbook = XLSX.utils.book_new();

  // Business Data Sheet
  const businessData = [
    {
      'Company Name': 'Example Corp',
      'Industry': 'Technology/Software',
      'Employees': 50,
      'Revenue': 1500000,
      'Costs': 1200000,
      'Assets': 2000000,
      'Liabilities': 800000,
      'Cash Flow': 150000
    }
  ];

  const businessWS = XLSX.utils.json_to_sheet(businessData);
  XLSX.utils.book_append_sheet(workbook, businessWS, 'Business Data');

  // Financial Records Sheet
  const financialData = [
    { Date: '2024-01-01', Revenue: 125000, Expenses: 100000, Profit: 25000, 'Cash Flow': 15000 },
    { Date: '2024-02-01', Revenue: 130000, Expenses: 102000, Profit: 28000, 'Cash Flow': 18000 },
    { Date: '2024-03-01', Revenue: 135000, Expenses: 105000, Profit: 30000, 'Cash Flow': 20000 },
    { Date: '2024-04-01', Revenue: 140000, Expenses: 108000, Profit: 32000, 'Cash Flow': 22000 },
    { Date: '2024-05-01', Revenue: 145000, Expenses: 110000, Profit: 35000, 'Cash Flow': 25000 },
    { Date: '2024-06-01', Revenue: 150000, Expenses: 112000, Profit: 38000, 'Cash Flow': 28000 }
  ];

  const financialWS = XLSX.utils.json_to_sheet(financialData);
  XLSX.utils.book_append_sheet(workbook, financialWS, 'Financial Records');

  // KPIs Sheet
  const kpiData = [
    { Metric: 'Customer Satisfaction', Value: 85, Target: 90, Unit: '%', Category: 'customer' },
    { Metric: 'Employee Productivity', Value: 92, Target: 95, Unit: '%', Category: 'operational' },
    { Metric: 'Monthly Recurring Revenue', Value: 125000, Target: 150000, Unit: '$', Category: 'financial' },
    { Metric: 'Market Share', Value: 12, Target: 15, Unit: '%', Category: 'growth' },
    { Metric: 'Customer Acquisition Cost', Value: 150, Target: 120, Unit: '$', Category: 'customer' },
    { Metric: 'Operational Efficiency', Value: 88, Target: 92, Unit: '%', Category: 'operational' }
  ];

  const kpiWS = XLSX.utils.json_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(workbook, kpiWS, 'KPIs');

  // Instructions Sheet
  const instructions = [
    { Section: 'Business Data', Description: 'Basic company information and high-level financial data' },
    { Section: 'Financial Records', Description: 'Monthly/quarterly financial performance data with Date, Revenue, Expenses, Profit, and Cash Flow' },
    { Section: 'KPIs', Description: 'Key Performance Indicators with current values, targets, units, and categories' },
    { Section: 'Data Format', Description: 'Use the exact column names shown in the sample data' },
    { Section: 'Date Format', Description: 'Use YYYY-MM-DD format for dates (e.g., 2024-01-15)' },
    { Section: 'Numbers', Description: 'Enter numbers without currency symbols or commas (e.g., 150000 not $150,000)' },
    { Section: 'Categories', Description: 'For KPIs use: financial, operational, customer, or growth' }
  ];

  const instructionsWS = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instructionsWS, 'Instructions');

  // Save file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, 'BizOptima_Data_Template.xlsx');
};

export const generateSampleCSVTemplate = () => {
  const csvContent = [
    'Date,Revenue,Expenses,Profit,Cash Flow',
    '2024-01-01,125000,100000,25000,15000',
    '2024-02-01,130000,102000,28000,18000',
    '2024-03-01,135000,105000,30000,20000',
    '2024-04-01,140000,108000,32000,22000',
    '2024-05-01,145000,110000,35000,25000',
    '2024-06-01,150000,112000,38000,28000'
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'BizOptima_Financial_Template.csv');
};
