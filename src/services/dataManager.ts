import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface BusinessData {
  id: string;
  companyName: string;
  industry: string;
  employees: number;
  revenue: number;
  costs: number;
  assets: number;
  liabilities: number;
  cashFlow: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialRecord {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  cashFlow: number;
}

export interface KPIData {
  metric: string;
  value: number;
  target: number;
  unit: string;
  category: 'financial' | 'operational' | 'customer' | 'growth';
}

export class DataManager {
  private businessData: BusinessData | null = null;
  private financialRecords: FinancialRecord[] = [];
  private kpiData: KPIData[] = [];

  // Local Storage Keys
  private readonly BUSINESS_DATA_KEY = 'bizoptima_business_data';
  private readonly FINANCIAL_RECORDS_KEY = 'bizoptima_financial_records';
  private readonly KPI_DATA_KEY = 'bizoptima_kpi_data';

  constructor() {
    this.loadFromStorage();
  }

  // Business Data Management
  setBusinessData(data: Partial<BusinessData>): void {
    const now = new Date();
    this.businessData = {
      id: data.id || this.generateId(),
      companyName: data.companyName || '',
      industry: data.industry || '',
      employees: data.employees || 0,
      revenue: data.revenue || 0,
      costs: data.costs || 0,
      assets: data.assets || 0,
      liabilities: data.liabilities || 0,
      cashFlow: data.cashFlow || 0,
      createdAt: data.createdAt || now,
      updatedAt: now
    };
    this.saveToStorage();
  }

  getBusinessData(): BusinessData | null {
    return this.businessData;
  }

  // Financial Records Management
  addFinancialRecord(record: Omit<FinancialRecord, 'date'> & { date?: string }): void {
    const newRecord: FinancialRecord = {
      date: record.date || new Date().toISOString().split('T')[0],
      revenue: record.revenue,
      expenses: record.expenses,
      profit: record.profit,
      cashFlow: record.cashFlow
    };
    
    // Remove existing record for the same date
    this.financialRecords = this.financialRecords.filter(r => r.date !== newRecord.date);
    this.financialRecords.push(newRecord);
    this.financialRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.saveToStorage();
  }

  getFinancialRecords(): FinancialRecord[] {
    return this.financialRecords;
  }

  updateFinancialRecord(date: string, updates: Partial<FinancialRecord>): void {
    const index = this.financialRecords.findIndex(r => r.date === date);
    if (index !== -1) {
      this.financialRecords[index] = { ...this.financialRecords[index], ...updates };
      this.saveToStorage();
    }
  }

  deleteFinancialRecord(date: string): void {
    this.financialRecords = this.financialRecords.filter(r => r.date !== date);
    this.saveToStorage();
  }

  // KPI Data Management
  setKPIData(kpis: KPIData[]): void {
    this.kpiData = kpis;
    this.saveToStorage();
  }

  getKPIData(): KPIData[] {
    return this.kpiData;
  }

  addKPI(kpi: KPIData): void {
    // Remove existing KPI with same metric
    this.kpiData = this.kpiData.filter(k => k.metric !== kpi.metric);
    this.kpiData.push(kpi);
    this.saveToStorage();
  }

  updateKPI(metric: string, updates: Partial<KPIData>): void {
    const index = this.kpiData.findIndex(k => k.metric === metric);
    if (index !== -1) {
      this.kpiData[index] = { ...this.kpiData[index], ...updates };
      this.saveToStorage();
    }
  }

  deleteKPI(metric: string): void {
    this.kpiData = this.kpiData.filter(k => k.metric !== metric);
    this.saveToStorage();
  }

  // File Import/Export
  async importFromExcel(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const data = await this.readFile(file);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Try to parse different sheets
      const businessSheet = workbook.Sheets['Business Data'] || workbook.Sheets['Company'];
      const financialSheet = workbook.Sheets['Financial Records'] || workbook.Sheets['Financials'];
      const kpiSheet = workbook.Sheets['KPIs'] || workbook.Sheets['Metrics'];

      let imported = 0;

      // Import business data
      if (businessSheet) {
        const businessData = XLSX.utils.sheet_to_json(businessSheet)[0] as any;
        if (businessData) {
          this.setBusinessData({
            companyName: businessData['Company Name'] || businessData.companyName,
            industry: businessData['Industry'] || businessData.industry,
            employees: Number(businessData['Employees'] || businessData.employees) || 0,
            revenue: Number(businessData['Revenue'] || businessData.revenue) || 0,
            costs: Number(businessData['Costs'] || businessData.costs) || 0,
            assets: Number(businessData['Assets'] || businessData.assets) || 0,
            liabilities: Number(businessData['Liabilities'] || businessData.liabilities) || 0,
            cashFlow: Number(businessData['Cash Flow'] || businessData.cashFlow) || 0,
          });
          imported++;
        }
      }

      // Import financial records
      if (financialSheet) {
        const records = XLSX.utils.sheet_to_json(financialSheet) as any[];
        records.forEach(record => {
          if (record.Date || record.date) {
            this.addFinancialRecord({
              date: record.Date || record.date,
              revenue: Number(record.Revenue || record.revenue) || 0,
              expenses: Number(record.Expenses || record.expenses) || 0,
              profit: Number(record.Profit || record.profit) || 0,
              cashFlow: Number(record['Cash Flow'] || record.cashFlow) || 0
            });
            imported++;
          }
        });
      }

      // Import KPI data
      if (kpiSheet) {
        const kpis = XLSX.utils.sheet_to_json(kpiSheet) as any[];
        const kpiData: KPIData[] = kpis.map(kpi => ({
          metric: kpi.Metric || kpi.metric || '',
          value: Number(kpi.Value || kpi.value) || 0,
          target: Number(kpi.Target || kpi.target) || 0,
          unit: kpi.Unit || kpi.unit || '',
          category: (kpi.Category || kpi.category || 'operational') as KPIData['category']
        })).filter(kpi => kpi.metric);
        
        if (kpiData.length > 0) {
          this.setKPIData(kpiData);
          imported += kpiData.length;
        }
      }

      return {
        success: true,
        message: `Successfully imported ${imported} records`
      };

    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async importFromCSV(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const text = await this.readFileAsText(file);
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return { success: false, message: 'CSV file must have at least a header and one data row' };
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const records: FinancialRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= headers.length) {
          const record: any = {};
          headers.forEach((header, index) => {
            record[header] = values[index];
          });

          // Try to parse as financial record
          if (record.date || record.Date) {
            records.push({
              date: record.date || record.Date,
              revenue: Number(record.revenue || record.Revenue) || 0,
              expenses: Number(record.expenses || record.Expenses) || 0,
              profit: Number(record.profit || record.Profit) || 0,
              cashFlow: Number(record.cashFlow || record['Cash Flow']) || 0
            });
          }
        }
      }

      records.forEach(record => this.addFinancialRecord(record));

      return {
        success: true,
        message: `Successfully imported ${records.length} financial records`
      };

    } catch (error) {
      console.error('CSV import error:', error);
      return {
        success: false,
        message: `CSV import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  exportToExcel(): void {
    const workbook = XLSX.utils.book_new();

    // Business Data Sheet
    if (this.businessData) {
      const businessWS = XLSX.utils.json_to_sheet([{
        'Company Name': this.businessData.companyName,
        'Industry': this.businessData.industry,
        'Employees': this.businessData.employees,
        'Revenue': this.businessData.revenue,
        'Costs': this.businessData.costs,
        'Assets': this.businessData.assets,
        'Liabilities': this.businessData.liabilities,
        'Cash Flow': this.businessData.cashFlow,
        'Created': this.businessData.createdAt,
        'Updated': this.businessData.updatedAt
      }]);
      XLSX.utils.book_append_sheet(workbook, businessWS, 'Business Data');
    }

    // Financial Records Sheet
    if (this.financialRecords.length > 0) {
      const financialWS = XLSX.utils.json_to_sheet(
        this.financialRecords.map(record => ({
          'Date': record.date,
          'Revenue': record.revenue,
          'Expenses': record.expenses,
          'Profit': record.profit,
          'Cash Flow': record.cashFlow
        }))
      );
      XLSX.utils.book_append_sheet(workbook, financialWS, 'Financial Records');
    }

    // KPI Data Sheet
    if (this.kpiData.length > 0) {
      const kpiWS = XLSX.utils.json_to_sheet(
        this.kpiData.map(kpi => ({
          'Metric': kpi.metric,
          'Value': kpi.value,
          'Target': kpi.target,
          'Unit': kpi.unit,
          'Category': kpi.category
        }))
      );
      XLSX.utils.book_append_sheet(workbook, kpiWS, 'KPIs');
    }

    // Save file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `${this.businessData?.companyName || 'Business'}_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
  }

  exportToCSV(): void {
    if (this.financialRecords.length === 0) {
      alert('No financial records to export');
      return;
    }

    const csvContent = [
      'Date,Revenue,Expenses,Profit,Cash Flow',
      ...this.financialRecords.map(record => 
        `${record.date},${record.revenue},${record.expenses},${record.profit},${record.cashFlow}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `${this.businessData?.companyName || 'Business'}_Financial_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName);
  }

  // Clear all data
  clearAllData(): void {
    this.businessData = null;
    this.financialRecords = [];
    this.kpiData = [];
    this.saveToStorage();
  }

  // Calculate derived metrics
  getFinancialMetrics() {
    if (!this.businessData) return null;

    const grossProfit = this.businessData.revenue - this.businessData.costs;
    const netProfit = grossProfit; // Simplified - in reality would subtract other expenses
    const equity = this.businessData.assets - this.businessData.liabilities;

    return {
      revenue: this.businessData.revenue,
      costs: this.businessData.costs,
      grossProfit,
      netProfit,
      assets: this.businessData.assets,
      liabilities: this.businessData.liabilities,
      equity,
      cashFlow: this.businessData.cashFlow,
      expenses: this.businessData.costs
    };
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private saveToStorage(): void {
    try {
      if (this.businessData) {
        localStorage.setItem(this.BUSINESS_DATA_KEY, JSON.stringify(this.businessData));
      }
      localStorage.setItem(this.FINANCIAL_RECORDS_KEY, JSON.stringify(this.financialRecords));
      localStorage.setItem(this.KPI_DATA_KEY, JSON.stringify(this.kpiData));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const businessData = localStorage.getItem(this.BUSINESS_DATA_KEY);
      if (businessData) {
        this.businessData = JSON.parse(businessData);
      }

      const financialRecords = localStorage.getItem(this.FINANCIAL_RECORDS_KEY);
      if (financialRecords) {
        this.financialRecords = JSON.parse(financialRecords);
      }

      const kpiData = localStorage.getItem(this.KPI_DATA_KEY);
      if (kpiData) {
        this.kpiData = JSON.parse(kpiData);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }
}

// Global instance
export const dataManager = new DataManager();
