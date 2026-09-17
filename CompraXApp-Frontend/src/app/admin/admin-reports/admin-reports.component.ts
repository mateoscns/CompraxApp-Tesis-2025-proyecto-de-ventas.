import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { 
  AdminService, 
  ProductSalesDTO, 
  SalesReportDTO,
  UserPurchaseStatisticsDTO,
  ReportsSummary
} from '../admin.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Tab navigation
  activeTab: 'products' | 'sales' | 'users' | 'summary' = 'summary';
  
  // Report data
  productSalesStats: ProductSalesDTO[] = [];
  salesReport: SalesReportDTO | null = null;
  userStatistics: UserPurchaseStatisticsDTO[] = [];
  reportsSummary: any = null;
  
  loading = false;
  
  // Chart references
  @ViewChild('productRevenueChart') productRevenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('productQuantityChart') productQuantityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('userSpendingChart') userSpendingChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('userOrdersChart') userOrdersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesOverviewChart') salesOverviewChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('summaryPieChart') summaryPieChartRef!: ElementRef<HTMLCanvasElement>;
  
  // Chart instances
  private productRevenueChart: Chart | null = null;
  private productQuantityChart: Chart | null = null;
  private userSpendingChart: Chart | null = null;
  private userOrdersChart: Chart | null = null;
  private salesOverviewChart: Chart | null = null;
  private summaryPieChart: Chart | null = null;
  
  // Solo formulario de sales report
  salesReportForm!: FormGroup;

  // Sales report options
  salesPeriodOptions = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'Custom Range', value: 'custom' }
  ];

  // Messages
  successMessage = '';
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.initializeSalesReportForm();
  }

  ngOnInit(): void {
    this.loadReportsSummary();
    this.loadProductSalesStats();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized when data is loaded
  }

  ngOnDestroy(): void {
    // Destroy all charts to prevent memory leaks
    this.destroyAllCharts();
  }

  private destroyAllCharts(): void {
    if (this.productRevenueChart) {
      this.productRevenueChart.destroy();
      this.productRevenueChart = null;
    }
    if (this.productQuantityChart) {
      this.productQuantityChart.destroy();
      this.productQuantityChart = null;
    }
    if (this.userSpendingChart) {
      this.userSpendingChart.destroy();
      this.userSpendingChart = null;
    }
    if (this.userOrdersChart) {
      this.userOrdersChart.destroy();
      this.userOrdersChart = null;
    }
    if (this.salesOverviewChart) {
      this.salesOverviewChart.destroy();
      this.salesOverviewChart = null;
    }
    if (this.summaryPieChart) {
      this.summaryPieChart.destroy();
      this.summaryPieChart = null;
    }
  }

  // ❌ REMOVER: initializeForm() y loadCategories()

  private initializeSalesReportForm(): void {
    this.salesReportForm = this.fb.group({
      period: [30],
      startDate: [''],
      endDate: ['']
    });

    this.salesReportForm.valueChanges.subscribe(() => {
      if (this.activeTab === 'sales') {
        this.loadSalesReport();
      }
    });
  }

  loadProductSalesStats(): void {
    this.loading = true;
    this.clearMessages();

    this.adminService.getProductSalesStatistics().subscribe({
      next: (stats) => {
        this.productSalesStats = stats;
        this.loading = false;
        this.showSuccess(`Loaded ${stats.length} product statistics`);
        
        // Initialize charts after data is loaded
        setTimeout(() => this.initializeProductCharts(), 100);
      },
      error: (error) => {
        console.error('Error loading product sales stats:', error);
        this.loading = false;
        this.showError('Failed to load product statistics. Please check if you are logged in as admin.');
      }
    });
  }

  loadReportsSummary(): void {
    this.loading = true;
    this.adminService.getReportsSummary().subscribe({
      next: (summary) => {
        this.reportsSummary = summary;
        this.loading = false;
        this.showSuccess('Summary loaded successfully');
        
        // Initialize summary charts
        setTimeout(() => this.initializeSummaryCharts(), 100);
      },
      error: (error) => {
        console.error('Error loading reports summary:', error);
        this.loading = false;
        this.showError('Failed to load reports summary. Please check your admin permissions.');
      }
    });
  }

  loadSalesReport(): void {
    this.loading = true;
    const formValue = this.salesReportForm.value;
    
    let days: number | undefined;
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (formValue.period === 'custom') {
      if (formValue.startDate) startDate = new Date(formValue.startDate);
      if (formValue.endDate) endDate = new Date(formValue.endDate);
    } else {
      days = formValue.period;
    }

    this.adminService.getSalesReportForPeriod(days, startDate, endDate).subscribe({
      next: (report) => {
        this.salesReport = report;
        this.loading = false;
        this.showSuccess('Sales report loaded successfully');
        
        // Initialize sales chart
        setTimeout(() => this.initializeSalesChart(), 100);
      },
      error: (error) => {
        console.error('Error loading sales report:', error);
        this.loading = false;
        this.showError('Failed to load sales report');
      }
    });
  }

  loadUserStatistics(): void {
    this.loading = true;
    this.adminService.getUserPurchaseStatistics().subscribe({
      next: (stats) => {
        this.userStatistics = stats;
        this.loading = false;
        this.showSuccess(`Loaded ${stats.length} user statistics`);
        
        // Initialize user charts
        setTimeout(() => this.initializeUserCharts(), 100);
      },
      error: (error) => {
        console.error('Error loading user statistics:', error);
        this.loading = false;
        this.showError('Failed to load user statistics');
      }
    });
  }

  switchTab(tab: 'products' | 'sales' | 'users' | 'summary'): void {
    this.activeTab = tab;
    this.clearMessages();

    switch (tab) {
      case 'products':
        if (this.productSalesStats.length === 0) {
          this.loadProductSalesStats();
        } else {
          // Re-initialize charts if data already exists
          setTimeout(() => this.initializeProductCharts(), 150);
        }
        break;
      case 'sales':
        this.loadSalesReport();
        break;
      case 'users':
        if (this.userStatistics.length === 0) {
          this.loadUserStatistics();
        } else {
          // Re-initialize charts if data already exists
          setTimeout(() => this.initializeUserCharts(), 150);
        }
        break;
      case 'summary':
        if (!this.reportsSummary) {
          this.loadReportsSummary();
        } else {
          // Re-initialize charts if data already exists
          setTimeout(() => this.initializeSummaryCharts(), 150);
        }
        break;
    }
  }

  isSalesCustomRange(): boolean {
    return this.salesReportForm.get('period')?.value === 'custom';
  }

  hasData(): boolean {
    switch (this.activeTab) {
      case 'products':
        return this.productSalesStats && this.productSalesStats.length > 0;
      case 'sales':
        return this.salesReport !== null;
      case 'users':
        return this.userStatistics && this.userStatistics.length > 0;
      case 'summary':
        return this.reportsSummary !== null;
      default:
        return false;
    }
  }

  // ❌ REMOVER: Métodos relacionados con filtros, exportación, etc.
  // buildFilter(), exportStats(), resetFilters(), isCustomRange(), etc.

  // Messages methods
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // ===== CHART INITIALIZATION METHODS =====

  private initializeProductCharts(): void {
    if (!this.productSalesStats || this.productSalesStats.length === 0) return;

    const topProducts = this.productSalesStats.slice(0, 10);
    const labels = topProducts.map(p => this.truncateLabel(p.productName, 15));
    const revenueData = topProducts.map(p => p.totalRevenue);
    const quantityData = topProducts.map(p => p.totalQuantitySold);

    // Revenue Bar Chart
    if (this.productRevenueChartRef?.nativeElement) {
      if (this.productRevenueChart) this.productRevenueChart.destroy();
      
      this.productRevenueChart = new Chart(this.productRevenueChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Revenue ($)',
            data: revenueData,
            backgroundColor: this.generateGradientColors(topProducts.length, 'blue'),
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Top 10 Products by Revenue',
              font: { size: 16, weight: 'bold' },
              color: '#1f2937'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => '$' + value.toLocaleString()
              }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      });
    }

    // Quantity Doughnut Chart
    if (this.productQuantityChartRef?.nativeElement) {
      if (this.productQuantityChart) this.productQuantityChart.destroy();
      
      this.productQuantityChart = new Chart(this.productQuantityChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: quantityData,
            backgroundColor: this.generateGradientColors(topProducts.length, 'rainbow'),
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { font: { size: 11 } }
            },
            title: {
              display: true,
              text: 'Products by Quantity Sold',
              font: { size: 16, weight: 'bold' },
              color: '#1f2937'
            }
          }
        }
      });
    }
  }

  private initializeUserCharts(): void {
    if (!this.userStatistics || this.userStatistics.length === 0) return;

    const topUsers = this.userStatistics.slice(0, 10);
    const labels = topUsers.map(u => this.truncateLabel(u.userName, 12));
    const spendingData = topUsers.map(u => u.totalSpent);
    const ordersData = topUsers.map(u => u.totalOrders);

    // User Spending Chart
    if (this.userSpendingChartRef?.nativeElement) {
      if (this.userSpendingChart) this.userSpendingChart.destroy();
      
      this.userSpendingChart = new Chart(this.userSpendingChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Spent ($)',
            data: spendingData,
            backgroundColor: this.generateGradientColors(topUsers.length, 'green'),
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Top 10 Customers by Spending',
              font: { size: 16, weight: 'bold' },
              color: '#1f2937'
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (value) => '$' + value.toLocaleString()
              }
            }
          }
        }
      });
    }

    // User Orders Chart - Changed to horizontal bar for better visualization
    if (this.userOrdersChartRef?.nativeElement) {
      if (this.userOrdersChart) this.userOrdersChart.destroy();
      
      this.userOrdersChart = new Chart(this.userOrdersChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Orders',
            data: ordersData,
            backgroundColor: this.generateGradientColors(topUsers.length, 'purple'),
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Customer Orders Distribution',
              font: { size: 16, weight: 'bold' },
              color: '#1f2937'
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (value) => Number(value).toLocaleString()
              }
            }
          }
        }
      });
    }
  }

  private initializeSalesChart(): void {
    if (!this.salesReport) return;

    if (this.salesOverviewChartRef?.nativeElement) {
      if (this.salesOverviewChart) this.salesOverviewChart.destroy();
      
      // Create a doughnut chart showing revenue distribution goal (visual gauge)
      const totalRevenue = this.salesReport.totalRevenue;
      const targetRevenue = Math.max(totalRevenue * 1.5, 10000); // Target is 150% of current or min $10k
      const remaining = Math.max(targetRevenue - totalRevenue, 0);
      
      this.salesOverviewChart = new Chart(this.salesOverviewChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Revenue Achieved', 'Target Remaining'],
          datasets: [{
            data: [totalRevenue, remaining],
            backgroundColor: [
              'rgba(16, 185, 129, 0.9)',
              'rgba(229, 231, 235, 0.5)'
            ],
            borderColor: [
              'rgba(16, 185, 129, 1)',
              'rgba(209, 213, 219, 1)'
            ],
            borderWidth: 2,
            circumference: 270,
            rotation: 225
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: `Revenue Progress - ${this.salesReport.period}`,
              font: { size: 16, weight: 'bold' },
              color: '#1f2937'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                }
              }
            }
          }
        }
      });
    }
  }

  private initializeSummaryCharts(): void {
    if (!this.reportsSummary) return;

    // Summary Pie Chart for Top Products
    if (this.summaryPieChartRef?.nativeElement && this.reportsSummary.productSales?.length > 0) {
      if (this.summaryPieChart) this.summaryPieChart.destroy();
      
      const topProducts = this.reportsSummary.productSales.slice(0, 5);
      const labels = topProducts.map((p: any) => this.truncateLabel(p.productName, 12));
      const data = topProducts.map((p: any) => p.totalRevenue);

      this.summaryPieChart = new Chart(this.summaryPieChartRef.nativeElement, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(249, 115, 22, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)'
            ],
            borderColor: '#ffffff',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 12 } }
            },
            title: {
              display: true,
              text: 'Top 5 Products Revenue Distribution',
              font: { size: 16, weight: 'bold' },
              color: '#1f2937'
            }
          }
        }
      });
    }
  }

  // Helper methods for charts
  private truncateLabel(label: string, maxLength: number): string {
    if (!label) return '';
    return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
  }

  private generateGradientColors(count: number, theme: string): string[] {
    const colors: string[] = [];
    
    switch (theme) {
      case 'blue':
        for (let i = 0; i < count; i++) {
          const opacity = 0.9 - (i * 0.05);
          colors.push(`rgba(59, 130, 246, ${Math.max(opacity, 0.4)})`);
        }
        break;
      case 'green':
        for (let i = 0; i < count; i++) {
          const opacity = 0.9 - (i * 0.05);
          colors.push(`rgba(16, 185, 129, ${Math.max(opacity, 0.4)})`);
        }
        break;
      case 'purple':
        for (let i = 0; i < count; i++) {
          const opacity = 0.9 - (i * 0.05);
          colors.push(`rgba(139, 92, 246, ${Math.max(opacity, 0.4)})`);
        }
        break;
      case 'rainbow':
      default:
        const rainbowColors = [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ];
        for (let i = 0; i < count; i++) {
          colors.push(rainbowColors[i % rainbowColors.length]);
        }
        break;
    }
    
    return colors;
  }
}
