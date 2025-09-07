import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  Save, 
  Plus, 
  Trash2, 
  Building2, 
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  FileDown,
  FileText
} from 'lucide-react';
import { dataManager, type BusinessData, type FinancialRecord, type KPIData } from '@/services/dataManager';
import { generateSampleDataTemplate, generateSampleCSVTemplate } from '@/services/templateGenerator';

interface DataInputProps {
  onDataUpdate?: () => void;
}

export const DataInput: React.FC<DataInputProps> = ({ onDataUpdate }) => {
  const [businessData, setBusinessData] = useState<Partial<BusinessData>>(
    dataManager.getBusinessData() || {}
  );
  
  const [newFinancialRecord, setNewFinancialRecord] = useState<Partial<FinancialRecord>>({
    date: new Date().toISOString().split('T')[0],
    revenue: 0,
    expenses: 0,
    profit: 0,
    cashFlow: 0
  });

  const [newKPI, setNewKPI] = useState<Partial<KPIData>>({
    metric: '',
    value: 0,
    target: 0,
    unit: '',
    category: 'operational'
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const industries = [
    'Technology/Software',
    'Healthcare/Medical',
    'Financial Services',
    'Manufacturing',
    'Retail/E-commerce',
    'Real Estate',
    'Education',
    'Construction',
    'Transportation',
    'Food & Beverage',
    'Professional Services',
    'Media & Entertainment',
    'Energy & Utilities',
    'Agriculture',
    'Other'
  ];

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleBusinessDataSave = () => {
    try {
      if (!businessData.companyName) {
        showMessage('error', 'Company name is required');
        return;
      }

      dataManager.setBusinessData(businessData);
      showMessage('success', 'Business data saved successfully');
      onDataUpdate?.();
    } catch (error) {
      showMessage('error', 'Failed to save business data');
    }
  };

  const handleFinancialRecordAdd = () => {
    try {
      if (!newFinancialRecord.date) {
        showMessage('error', 'Date is required');
        return;
      }

      dataManager.addFinancialRecord(newFinancialRecord as FinancialRecord);
      setNewFinancialRecord({
        date: new Date().toISOString().split('T')[0],
        revenue: 0,
        expenses: 0,
        profit: 0,
        cashFlow: 0
      });
      showMessage('success', 'Financial record added successfully');
      onDataUpdate?.();
    } catch (error) {
      showMessage('error', 'Failed to add financial record');
    }
  };

  const handleKPIAdd = () => {
    try {
      if (!newKPI.metric) {
        showMessage('error', 'Metric name is required');
        return;
      }

      dataManager.addKPI(newKPI as KPIData);
      setNewKPI({
        metric: '',
        value: 0,
        target: 0,
        unit: '',
        category: 'operational'
      });
      showMessage('success', 'KPI added successfully');
      onDataUpdate?.();
    } catch (error) {
      showMessage('error', 'Failed to add KPI');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let result;
      if (file.name.endsWith('.csv')) {
        result = await dataManager.importFromCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        result = await dataManager.importFromExcel(file);
      } else {
        showMessage('error', 'Please upload a CSV or Excel file');
        return;
      }

      if (result.success) {
        showMessage('success', result.message);
        setBusinessData(dataManager.getBusinessData() || {});
        onDataUpdate?.();
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to import file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportExcel = () => {
    try {
      dataManager.exportToExcel();
      showMessage('success', 'Data exported to Excel successfully');
    } catch (error) {
      showMessage('error', 'Failed to export to Excel');
    }
  };

  const handleExportCSV = () => {
    try {
      dataManager.exportToCSV();
      showMessage('success', 'Financial data exported to CSV successfully');
    } catch (error) {
      showMessage('error', 'Failed to export to CSV');
    }
  };

  const financialRecords = dataManager.getFinancialRecords();
  const kpiData = dataManager.getKPIData();

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Data Management</h1>
          <p className="text-muted-foreground mt-1">
            Input your real business data for accurate AI-powered insights
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Importing...' : 'Import Data'}
          </Button>
          <Button onClick={generateSampleDataTemplate} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Download Excel Template
          </Button>
          <Button onClick={generateSampleCSVTemplate} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">Company Info</TabsTrigger>
          <TabsTrigger value="financial">Financial Data</TabsTrigger>
          <TabsTrigger value="kpis">KPIs & Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={businessData.companyName || ''}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={businessData.industry || ''}
                    onValueChange={(value) => setBusinessData(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input
                    id="employees"
                    type="number"
                    value={businessData.employees || ''}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, employees: Number(e.target.value) }))}
                    placeholder="Enter number of employees"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue">Annual Revenue ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={businessData.revenue || ''}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                    placeholder="Enter annual revenue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costs">Annual Costs ($)</Label>
                  <Input
                    id="costs"
                    type="number"
                    value={businessData.costs || ''}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, costs: Number(e.target.value) }))}
                    placeholder="Enter annual costs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assets">Total Assets ($)</Label>
                  <Input
                    id="assets"
                    type="number"
                    value={businessData.assets || ''}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, assets: Number(e.target.value) }))}
                    placeholder="Enter total assets"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liabilities">Total Liabilities ($)</Label>
                  <Input
                    id="liabilities"
                    type="number"
                    value={businessData.liabilities || ''}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, liabilities: Number(e.target.value) }))}
                    placeholder="Enter total liabilities"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cashFlow">Monthly Cash Flow ($)</Label>
                  <Input
                    id="cashFlow"
                    type="number"
                    value={businessData.cashFlow || ''}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, cashFlow: Number(e.target.value) }))}
                    placeholder="Enter monthly cash flow"
                  />
                </div>
              </div>

              <Button onClick={handleBusinessDataSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Company Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Add Financial Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newFinancialRecord.date || ''}
                    onChange={(e) => setNewFinancialRecord(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={newFinancialRecord.revenue || ''}
                    onChange={(e) => setNewFinancialRecord(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                    placeholder="Revenue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenses">Expenses ($)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    value={newFinancialRecord.expenses || ''}
                    onChange={(e) => setNewFinancialRecord(prev => ({ ...prev, expenses: Number(e.target.value) }))}
                    placeholder="Expenses"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profit">Profit ($)</Label>
                  <Input
                    id="profit"
                    type="number"
                    value={newFinancialRecord.profit || ''}
                    onChange={(e) => setNewFinancialRecord(prev => ({ ...prev, profit: Number(e.target.value) }))}
                    placeholder="Profit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cashFlow">Cash Flow ($)</Label>
                  <Input
                    id="cashFlow"
                    type="number"
                    value={newFinancialRecord.cashFlow || ''}
                    onChange={(e) => setNewFinancialRecord(prev => ({ ...prev, cashFlow: Number(e.target.value) }))}
                    placeholder="Cash Flow"
                  />
                </div>
              </div>

              <Button onClick={handleFinancialRecordAdd} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Financial Record
              </Button>
            </CardContent>
          </Card>

          {financialRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Records ({financialRecords.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {financialRecords.slice(-10).reverse().map((record, index) => (
                    <div key={record.date} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{record.date}</span>
                      <div className="flex space-x-4 text-sm">
                        <span>Revenue: ${record.revenue.toLocaleString()}</span>
                        <span>Profit: ${record.profit.toLocaleString()}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          dataManager.deleteFinancialRecord(record.date);
                          onDataUpdate?.();
                          showMessage('success', 'Record deleted');
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add KPI / Metric</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metric">Metric Name</Label>
                  <Input
                    id="metric"
                    value={newKPI.metric || ''}
                    onChange={(e) => setNewKPI(prev => ({ ...prev, metric: e.target.value }))}
                    placeholder="e.g., Customer Satisfaction"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Current Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={newKPI.value || ''}
                    onChange={(e) => setNewKPI(prev => ({ ...prev, value: Number(e.target.value) }))}
                    placeholder="Current value"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newKPI.target || ''}
                    onChange={(e) => setNewKPI(prev => ({ ...prev, target: Number(e.target.value) }))}
                    placeholder="Target value"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newKPI.unit || ''}
                    onChange={(e) => setNewKPI(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="%, $, units, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newKPI.category || 'operational'}
                    onValueChange={(value) => setNewKPI(prev => ({ ...prev, category: value as KPIData['category'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleKPIAdd} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add KPI
              </Button>
            </CardContent>
          </Card>

          {kpiData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current KPIs ({kpiData.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kpiData.map((kpi, index) => (
                    <div key={kpi.metric} className="p-4 border rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{kpi.metric}</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            dataManager.deleteKPI(kpi.metric);
                            onDataUpdate?.();
                            showMessage('success', 'KPI deleted');
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current: {kpi.value}{kpi.unit} | Target: {kpi.target}{kpi.unit}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        Category: {kpi.category}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
