import { Component, OnInit, OnDestroy } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { EChartsOption } from 'echarts';
import { JobInfoComponent } from 'src/app/components/modals/job-info/job-info.component';
import { JobService } from 'src/app/services/job.service';
import { Job, ServiceType } from 'src/app/data/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  jobs: Job[] = [];
  usageCount = 0;

  statusCounts = [
    { name: 'Pending', value: 0 },
    { name: 'Booked', value: 0 },
    { name: 'Completed', value: 0 },
    { name: 'Canceled', value: 0 },
    { name: 'Rejected', value: 0 },
  ];

  readonly serviceTypes: ServiceType[] = ['ล้าง', 'ตัดล้าง', 'ติดตั้ง', 'ซ่อม', 'อื่นๆ'];

  PieChart!: EChartsOption;
  SeparateChart!: EChartsOption;
  distributeByTimeChart!: EChartsOption;

  selectedDateRange = 'today';
  selectedMonth = '';
  selectedYear = '';
  customStartDate: Date | null = null;
  customEndDate: Date | null = null;

  dateRangeOptions = [
    { value: 'today', label: 'วันนี้', icon: 'today-outline' },
    { value: 'yesterday', label: 'เมื่อวาน', icon: 'arrow-back-outline' },
    { value: '7days', label: '7 วันที่ผ่านมา', icon: 'calendar-outline' },
    { value: '30days', label: '30 วันที่ผ่านมา', icon: 'calendar-outline' },
    { value: 'month', label: 'เลือกเดือน', icon: 'calendar-number-outline' },
    { value: 'custom', label: 'กำหนดเอง', icon: 'options-outline' },
  ];

  months = [
    { value: '01', label: 'มกราคม' }, { value: '02', label: 'กุมภาพันธ์' },
    { value: '03', label: 'มีนาคม' }, { value: '04', label: 'เมษายน' },
    { value: '05', label: 'พฤษภาคม' }, { value: '06', label: 'มิถุนายน' },
    { value: '07', label: 'กรกฎาคม' }, { value: '08', label: 'สิงหาคม' },
    { value: '09', label: 'กันยายน' }, { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' }, { value: '12', label: 'ธันวาคม' },
  ];

  years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: (year + 543).toString() };
  });

  private unsubscribe: Unsubscribe | undefined;

  constructor(
    private jobService: JobService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    const currentDate = new Date();
    this.selectedMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    this.selectedYear = currentDate.getFullYear().toString();

    this.jobService.jobDashboardChange.subscribe((data) => {
      this.jobs = data;
      this.processJobsData();
    });
    this.searchJobsToday();
  }

  ngOnDestroy() {
    if (this.unsubscribe) { this.unsubscribe(); }
  }

  async searchJobs() {
    this.jobService.fetchDashboard(new Date(new Date().setHours(0, 0, 0, 0)));
  }

  async searchJobsToday() {
    this.jobService.fetchDashboard(new Date(new Date().setHours(0, 0, 0, 0)));
  }

  onDateRangeChange(): void {
    switch (this.selectedDateRange) {
      case 'today': this.searchJobsToday(); break;
      case 'yesterday': this.searchJobsYesterday(); break;
      case '7days': this.searchJobsByRange(7); break;
      case '30days': this.searchJobsByRange(30); break;
      case 'month': break;
      case 'custom': break;
    }
  }

  onMonthYearChange(): void {
    if (this.selectedMonth && this.selectedYear) {
      const startDate = new Date(parseInt(this.selectedYear), parseInt(this.selectedMonth) - 1, 1);
      const endDate = new Date(parseInt(this.selectedYear), parseInt(this.selectedMonth), 0, 23, 59, 59, 999);
      this.jobService.fetchDashboardByDateRange(startDate, endDate);
    }
  }

  getStatusCount(status: string): number {
    return this.statusCounts.find(item => item.name.toUpperCase() === status.toUpperCase())?.value ?? 0;
  }

  getStatusPercentage(status: string): string {
    if (this.usageCount === 0) { return '0'; }
    return ((this.getStatusCount(status) / this.usageCount) * 100).toFixed(1);
  }

  getDateRangeDisplay(): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    switch (this.selectedDateRange) {
      case 'today': return `วันนี้ (${this.formatDisplayDate(today)})`;
      case 'yesterday': return `เมื่อวาน (${this.formatDisplayDate(yesterday)})`;
      case '7days': {
        const d = new Date(today); d.setDate(d.getDate() - 7);
        return `7 วันที่ผ่านมา (${this.formatDisplayDate(d)} - ${this.formatDisplayDate(today)})`;
      }
      case '30days': {
        const d = new Date(today); d.setDate(d.getDate() - 30);
        return `30 วันที่ผ่านมา (${this.formatDisplayDate(d)} - ${this.formatDisplayDate(today)})`;
      }
      case 'month':
        if (this.selectedMonth && this.selectedYear) {
          const monthName = this.months.find(m => m.value === this.selectedMonth)?.label ?? '';
          return `${monthName} ${parseInt(this.selectedYear) + 543}`;
        }
        return 'เลือกเดือน';
      case 'custom':
        return this.hasValidCustomDateRange()
          ? `${this.formatDisplayDate(this.customStartDate!)} - ${this.formatDisplayDate(this.customEndDate!)}`
          : 'กำหนดเอง (ยังไม่ได้เลือกวันที่)';
      default: return 'วันนี้';
    }
  }

  hasValidCustomDateRange(): boolean {
    return this.customStartDate !== null && this.customEndDate !== null
      && this.isValidDate(this.customStartDate) && this.isValidDate(this.customEndDate);
  }

  private processJobsData() {
    this.filterStatus();
    this.PieChartComponent();
    this.SeparateChartComponent();
    this.distributeByTimeChartComponent();
  }

  private filterStatus() {
    const counts = this.jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.usageCount = Object.values(counts).reduce((a, b) => a + b, 0);
    this.statusCounts = [
      { name: 'Pending', value: counts['PENDING'] || 0 },
      { name: 'Booked', value: counts['BOOKED'] || 0 },
      { name: 'Completed', value: counts['COMPLETED'] || 0 },
      { name: 'Canceled', value: counts['CANCELED'] || 0 },
      { name: 'Rejected', value: counts['REJECTED'] || 0 },
    ];
  }

  private getServiceCounts() {
    const counts = this.jobs.reduce((acc, job) => {
      const type = job.type || 'อื่นๆ';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return this.serviceTypes.map(s => ({ name: s, value: counts[s] || 0 }));
  }

  private getHourlyDistribution() {
    const hourlyData = Array.from({ length: 24 }, () =>
      this.serviceTypes.reduce((acc, s) => ({ ...acc, [s]: 0 }), {} as Record<string, number>)
    );
    this.jobs.forEach(job => {
      const hour = new Date((job.created_at as any).seconds ? (job.created_at as any).seconds * 1000 : job.created_at).getHours();
      const type = job.type || 'อื่นๆ';
      if (hourlyData[hour] && this.serviceTypes.includes(type)) {
        hourlyData[hour][type]++;
      }
    });
    return hourlyData;
  }

  private searchJobsYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    this.jobService.fetchDashboard(yesterday);
  }

  private searchJobsByRange(days: number) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() + 1);
    this.jobService.fetchDashboardByDateRange(start, end);
  }

  private formatDisplayDate(date: Date): string {
    if (!this.isValidDate(date)) { return 'วันที่ไม่ถูกต้อง'; }
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  private isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  private PieChartComponent() {
    this.PieChart = {
      color: ['#5383FF', '#66C0F2', '#47CF5D', '#FFA215', '#FF2424'],
      title: { text: 'Krungthon Air', subtext: `งานทั้งหมด ${this.usageCount}`, left: 'center' },
      legend: { top: 'bottom', left: 'center' },
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      series: [{
        name: 'Job Status', type: 'pie', radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: false, fontSize: 40, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: this.statusCounts.filter(item => item.value > 0),
      }],
    };
  }

  private SeparateChartComponent() {
    const serviceCounts = this.getServiceCounts();
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    this.SeparateChart = {
      title: { text: 'ประเภทงาน', textStyle: { fontSize: 16, fontWeight: 'normal', color: '#374151' } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '15%', right: '4%', bottom: '3%', top: '15%', containLabel: false },
      xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } }, axisLabel: { color: '#6B7280', fontSize: 12 } },
      yAxis: { type: 'category', data: serviceCounts.map(i => i.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#374151', fontSize: 13 } },
      series: [{
        name: 'จำนวนงาน', type: 'bar', barWidth: '50%',
        data: serviceCounts.map((item, i) => ({ value: item.value, itemStyle: { color: colors[i % colors.length], borderRadius: [0, 8, 8, 0] } })),
        label: { show: true, position: 'right', formatter: '{c}', color: '#6B7280', fontSize: 12 },
      }],
    };
  }

  private distributeByTimeChartComponent() {
    const hourlyData = this.getHourlyDistribution();
    const colors = ['#9F65FF', '#66C0F2', '#47CF5D', '#5383FF', '#FFA215', '#FF2424'];
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i + 1}:00`);
    this.distributeByTimeChart = {
      color: colors,
      title: { text: 'Hourly Distribution by Service' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: this.serviceTypes, top: 'top' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      yAxis: { type: 'value' },
      xAxis: { type: 'category', data: hourLabels },
      series: this.serviceTypes.map((s, i) => ({
        name: s, data: hourlyData.map(h => h[s] || 0), type: 'bar', stack: 'total', color: colors[i],
      })),
    };
  }
}
