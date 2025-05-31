import { Unsubscribe } from 'firebase/auth';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { JobInfoComponent } from 'src/app/components/modals/job-info/job-info.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ServiceService } from 'src/app/services/service.service';

interface Job {
  status: string;
  type?: string;        // ประเภทงาน: ล้าง, ตัดล้าง, ติดตั้ง, ซ่อม, อื่นๆ
  jobType?: string;     // alternative field name
  createdAt: Date;
  site_id?: string;     // ID ของไซต์ที่เกี่ยวข้อง
  // Add other job properties as needed
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  jobs: Job[] = [];
  usageCount: number = 0;

  statusCounts = [
    { name: 'Pending', value: 0 },
    { name: 'Booked', value: 0 },
    { name: 'Completed', value: 0 },
    { name: 'Canceled', value: 0 },
    { name: 'Rejected', value: 0 },
  ];

  types = [
    {
      title: 'ล้าง',
      value: 'ล้าง',
      disabled: false,
    },
    {
      title: 'ตัดล้าง',
      value: 'ตัดล้าง',
      disabled: false,
    },
    {
      title: 'ติดตั้ง',
      value: 'ติดตั้ง',
      disabled: false,
    },
    {
      title: 'ซ่อม',
      value: 'ซ่อม',
      disabled: false,
    },
    {
      title: 'อื่นๆ',
      value: 'อื่นๆ',
      disabled: false,
    },
  ];

  serviceTypes = this.types.map(type => type.value);

  PieChart!: EChartsOption;
  SeparateChart!: EChartsOption;
  distributeByTimeChart!: EChartsOption;
  date = new Date();
  selectedDateRange: string = 'today';
  selectedMonth: string = '';
  selectedYear: string = '';

  dateRangeOptions = [
    { value: 'today', label: 'วันนี้', icon: 'today-outline' },
    { value: 'yesterday', label: 'เมื่อวาน', icon: 'arrow-back-outline' },
    { value: '7days', label: '7 วันที่ผ่านมา', icon: 'calendar-outline' },
    { value: '30days', label: '30 วันที่ผ่านมา', icon: 'calendar-outline' },
    { value: 'month', label: 'เลือกเดือน', icon: 'calendar-number-outline' },
    { value: 'custom', label: 'กำหนดเอง', icon: 'options-outline' }
  ];

  months = [
    { value: '01', label: 'มกราคม' },
    { value: '02', label: 'กุมภาพันธ์' },
    { value: '03', label: 'มีนาคม' },
    { value: '04', label: 'เมษายน' },
    { value: '05', label: 'พฤษภาคม' },
    { value: '06', label: 'มิถุนายน' },
    { value: '07', label: 'กรกฎาคม' },
    { value: '08', label: 'สิงหาคม' },
    { value: '09', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' }
  ];

  years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: (year + 543).toString() }; // แสดงปี พ.ศ.
  });

  unsubscribe: Unsubscribe | undefined;

  constructor(
    private firestoreService: FirestoreService,
    private service: ServiceService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // Set default month and year
    const currentDate = new Date();
    this.selectedMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    this.selectedYear = currentDate.getFullYear().toString();

    this.firestoreService.jobDashboardChange.subscribe(async (data) => {
      this.jobs = data;
      this.processJobsData();
    });
    this.searchJobsToday()
    // this.searchJobsByDateRange();
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async searchJobs() {
    console.log(this.date);
    this.firestoreService.fetchDataDashboard(this.date);
  }

  async searchJobsToday() {
    const date = new Date().setHours(0, 0, 0, 0);
    const formatQueryDate = new Date(date);
    this.firestoreService.fetchDataDashboard(formatQueryDate);
  }

  private processJobsData() {
    this.filterStatus();
    this.initializeAllCharts();
  }

  private filterStatus() {
    const statusCounts = this.jobs.reduce((counts, job) => {
      counts[job.status] = (counts[job.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const { PENDING, BOOKED, COMPLETED, CANCELED, REJECTED } = statusCounts;

    this.usageCount = (PENDING || 0) + (BOOKED || 0) + (COMPLETED || 0) +
      (CANCELED || 0) + (REJECTED || 0);

    this.statusCounts = [
      { name: 'Pending', value: PENDING || 0 },
      { name: 'Booked', value: BOOKED || 0 },
      { name: 'Completed', value: COMPLETED || 0 },
      { name: 'Canceled', value: CANCELED || 0 },
      { name: 'Rejected', value: REJECTED || 0 }
    ];
  }

  private initializeAllCharts() {
    this.PieChartComponent();
    this.SeparateChartComponent();
    this.distributeByTimeChartComponent();
  }

  private getServiceCounts() {
    const serviceCounts = this.jobs.reduce((counts, job) => {
      // สมมติว่า job มี property ชื่อ 'type' หรือ 'jobType' 
      // ปรับตามโครงสร้างข้อมูลจริงของคุณ
      const jobType = job.type || job.jobType || 'อื่นๆ';
      counts[jobType] = (counts[jobType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return this.serviceTypes.map(service => ({
      name: service,
      value: serviceCounts[service] || 0
    }));
  }

   private getServiceinSiteCounts() {
  const siteServiceCounts = this.jobs
    .filter(job => !!job.site_id)
    .reduce((siteCounts, job) => {
      const siteId = job.site_id;
      const jobType = job.type || job.jobType || 'อื่นๆ';

      if (!siteCounts[siteId]) {
        siteCounts[siteId] = {};
      }

      siteCounts[siteId][jobType] = (siteCounts[siteId][jobType] || 0) + 1;

      return siteCounts;
    }, {} as Record<string, Record<string, number>>);

  return siteServiceCounts;
}

  private getHourlyDistribution() {
    const hourlyData = Array(24).fill(0).map(() =>
      this.serviceTypes.reduce((acc, service) => ({ ...acc, [service]: 0 }), {})
    );

    this.jobs.forEach(job => {
      const hour = new Date(job.createdAt).getHours();
      const jobType = job.type || job.jobType || 'อื่นๆ';
      if (hourlyData[hour] && this.serviceTypes.includes(jobType)) {
        hourlyData[hour][jobType]++;
      }
    });

    return hourlyData;
  }

  formatDate(date: Date): string {
    return dayjs(date).startOf('day').format('ddd MMM DD YYYY 00:00:00 [GMT+0700]');
  }

  PieChartComponent() {
    this.PieChart = {
      color: ['#5383FF', '#66C0F2', '#47CF5D', '#FFA215', '#FF2424'],
      title: {
        text: 'Krungthon Air',
        subtext: `งานทั้งหมด ${this.usageCount}`,
        left: 'center'
      },
      legend: {
        top: 'bottom',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: 'Job Status',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: this.statusCounts.filter(item => item.value > 0)
        }
      ]
    };
  }

  SeparateChartComponent() {
    const serviceCounts = this.getServiceCounts();
    const serviceCounts2 = this.getServiceinSiteCounts(); // ใช้สำหรับแสดงข้อมูลตามไซต์
    console.log('Service Counts:', serviceCounts);
    console.log('Service Counts by Site:', serviceCounts2);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    this.SeparateChart = {
      title: {
        text: 'ประเภทงาน',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: '#374151'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params: any) {
          const data = params[0];
          return `${data.name}: ${data.value} งาน`;
        }
      },
      grid: {
        left: '15%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: false
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: {
            color: '#F3F4F6',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#6B7280',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'category',
        data: serviceCounts.map(item => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#374151',
          fontSize: 13,
          fontWeight: 500
        }
      },
      series: [
        {
          name: 'จำนวนงาน',
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            borderRadius: [0, 8, 8, 0]
          },
          data: serviceCounts.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: colors[index % colors.length],
              borderRadius: [0, 8, 8, 0]
            }
          })),
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            color: '#6B7280',
            fontSize: 12
          }
        }
      ]
    };
  }

  distributeByTimeChartComponent() {
    const hourlyData = this.getHourlyDistribution();
    const colors = ['#9F65FF', '#66C0F2', '#47CF5D', '#5383FF', '#FFA215', '#FF2424'];
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i + 1}:00`);

    this.distributeByTimeChart = {
      color: colors,
      title: {
        text: 'Hourly Distribution by Service'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: this.serviceTypes,
        top: 'top'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      yAxis: {
        type: 'value'
      },
      xAxis: {
        type: 'category',
        data: hourLabels,
      },
      series: this.serviceTypes.map((serviceType, index) => ({
        name: serviceType,
        data: hourlyData.map(hour => hour[serviceType] || 0),
        type: 'bar',
        stack: 'total',
        color: colors[index]
      }))
    };
  }

  // เพิ่มเมธอดเหล่านี้ใน DashboardComponent
  selectedTimeRange: string = 'today';

  // Helper methods for stats cards
  getStatusCount(status: string): number {
    const statusItem = this.statusCounts.find(item =>
      item.name.toUpperCase() === status.toUpperCase()
    );
    return statusItem ? statusItem.value : 0;
  }

  getStatusPercentage(status: string): string {
    if (this.usageCount === 0) return '0';
    const count = this.getStatusCount(status);
    const percentage = (count / this.usageCount) * 100;
    return percentage.toFixed(1);
  }

  getGrowthRate(): number {
    // คำนวณอัตราการเติบโตเปรียบเทียบกับเมื่อวาน
    // สามารถดึงข้อมูลจาก API หรือคำนวณจากข้อมูลที่มี
    return 12.5; // ตัวอย่าง
  }

  onTimeRangeChange(): void {
    // Handle time range selection change
    console.log('Time range changed to:', this.selectedTimeRange);
    this.updateTimeDistributionChart();
  }

  private updateTimeDistributionChart(): void {
    // Update chart based on selected time range
    // สามารถเรียก API ใหม่หรือกรองข้อมูลที่มีอยู่
    this.distributeByTimeChartComponent();
  }
  // เพิ่มเมธอดนี้ใน DashboardComponent class

  onMonthYearChange(): void {
    console.log('Month/Year changed:', {
      selectedMonth: this.selectedMonth,
      selectedYear: this.selectedYear
    });

    // ตรวจสอบว่าเลือกเดือนและปีครบแล้ว
    if (this.selectedMonth && this.selectedYear) {
      this.searchJobsByMonthYear();
    }
  }

  private async searchJobsByMonthYear() {
    try {
      // สร้างวันที่เริ่มต้นของเดือนที่เลือก
      const startDate = new Date(
        parseInt(this.selectedYear),
        parseInt(this.selectedMonth) - 1,
        1
      );

      // สร้างวันที่สิ้นสุดของเดือนที่เลือก
      const endDate = new Date(
        parseInt(this.selectedYear),
        parseInt(this.selectedMonth),
        0,
        23, 59, 59, 999
      );

      console.log('Searching jobs from:', startDate, 'to:', endDate);

      // เรียก Firestore service เพื่อดึงข้อมูลในช่วงเวลาที่เลือก
      // หากมี method สำหรับดึงข้อมูลตามช่วงวันที่
      // TODO: Implement this in FirestoreService
      this.firestoreService.fetchDataDashboardByDateRange(startDate, endDate);

      // หรือหากใช้ method เดิม
      // this.firestoreService.fetchDataDashboard(startDate);

    } catch (error) {
      console.error('Error searching jobs by month/year:', error);
    }
  }

  // เพิ่มเมธอดสำหรับการเปลี่ยนแปลง date range
  onDateRangeChange(): void {
    console.log('Date range changed to:', this.selectedDateRange);

    switch (this.selectedDateRange) {
      case 'today':
        this.searchJobsToday();
        break;
      case 'yesterday':
        this.searchJobsYesterday();
        break;
      case '7days':
        this.searchJobsLast7Days();
        break;
      case '30days':
        this.searchJobsLast30Days();
        break;
      case 'month':
        // เมื่อเลือก month จะให้ user เลือกเดือนและปี
        // ไม่ต้องทำอะไรที่นี่ จะรอให้ onMonthYearChange() ทำงาน
        break;
      case 'custom':
        // เปิด date picker หรือ modal สำหรับเลือกวันที่
        this.openCustomDatePicker();
        break;
      default:
        this.searchJobsToday();
    }
  }

  private async searchJobsYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    this.firestoreService.fetchDataDashboard(yesterday);
  }

  private async searchJobsLast7Days() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    // this.firestoreService.fetchDataDashboard(sevenDaysAgo);

    // หากต้องการดึงข้อมูลตามช่วงวันที่
    const startDate = sevenDaysAgo;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // ตั้งเวลาให้สิ้นสุดวัน
    endDate.setDate(endDate.getDate() + 1); // เพิ่มวันเพื่อให้รวมถึงวันนี้
    this.firestoreService.fetchDataDashboardByDateRange(startDate, endDate);
  }

  private async searchJobsLast30Days() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    // this.firestoreService.fetchDataDashboard(thirtyDaysAgo);
    // หากต้องการดึงข้อมูลตามช่วงวันที่
    const startDate = thirtyDaysAgo;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // ตั้งเวลาให้สิ้นสุดวัน
    endDate.setDate(endDate.getDate() + 1); // เพิ่มวันเพื่อให้รวมถึงวันนี้
    this.firestoreService.fetchDataDashboardByDateRange(startDate, endDate);

  }

  private openCustomDatePicker(): void {
    // ใช้ Ionic datetime component หรือเปิด modal สำหรับเลือกวันที่
    console.log('Opening custom date picker...');
    // TODO: Implement custom date picker
  }
  // เพิ่มเมธอดนี้ใน DashboardComponent

  getDateRangeDisplay(): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (this.selectedDateRange) {
      case 'today':
        return `วันนี้ (${this.formatDisplayDate(today)})`;

      case 'yesterday':
        return `เมื่อวาน (${this.formatDisplayDate(yesterday)})`;

      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return `7 วันที่ผ่านมา (${this.formatDisplayDate(sevenDaysAgo)} - ${this.formatDisplayDate(today)})`;

      case '30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return `30 วันที่ผ่านมา (${this.formatDisplayDate(thirtyDaysAgo)} - ${this.formatDisplayDate(today)})`;

      case 'month':
        if (this.selectedMonth && this.selectedYear) {
          const monthName = this.months.find(m => m.value === this.selectedMonth)?.label || '';
          const yearBE = parseInt(this.selectedYear) + 543; // แปลงเป็นปี พ.ศ.
          return `${monthName} ${yearBE}`;
        }
        return 'เลือกเดือน';

      case 'custom':
        // หากมีการเลือกวันที่แบบ custom
        if (this.hasValidCustomDateRange()) {
          const startFormatted = this.formatDisplayDate(this.customStartDate!);
          const endFormatted = this.formatDisplayDate(this.customEndDate!);

          // ถ้าเป็นวันเดียวกัน
          if (this.customStartDate!.toDateString() === this.customEndDate!.toDateString()) {
            return startFormatted;
          }

          return `${startFormatted} - ${endFormatted}`;
        }
        return 'กำหนดเอง (ยังไม่ได้เลือกวันที่)';

      default:
        return 'วันนี้';
    }
  }

  private formatDisplayDate(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'วันที่ไม่ถูกต้อง';
    }

    // แปลงวันที่เป็นรูปแบบไทย
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear() + 543; // แปลงเป็นปี พ.ศ.

    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    return `${day} ${thaiMonths[month]} ${year}`;
  }

  // เพิ่มเมธอดสำหรับจัดรูปแบบวันที่แบบเต็ม
  private formatDisplayDateFull(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'วันที่ไม่ถูกต้อง';
    }

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear() + 543;

    const thaiMonthsFull = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const dayName = thaiDays[date.getDay()];

    return `วัน${dayName}ที่ ${day} ${thaiMonthsFull[month]} ${year}`;
  }

  // Properties สำหรับ custom date range
  customStartDate: Date | null = null;
  customEndDate: Date | null = null;

  // เมธอดสำหรับตั้งค่า custom date range
  setCustomDateRange(startDate: Date | string, endDate: Date | string): void {
    try {
      this.customStartDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
      this.customEndDate = typeof endDate === 'string' ? new Date(endDate) : endDate;

      // ตรวจสอบความถูกต้องของวันที่
      if (!this.isValidDate(this.customStartDate) || !this.isValidDate(this.customEndDate)) {
        console.error('Invalid custom date range');
        this.customStartDate = null;
        this.customEndDate = null;
        return;
      }

      // ตรวจสอบว่า startDate ไม่มากกว่า endDate
      if (this.customStartDate > this.customEndDate) {
        console.error('Start date cannot be greater than end date');
        // สลับค่า
        [this.customStartDate, this.customEndDate] = [this.customEndDate, this.customStartDate];
      }

      console.log('Custom date range set:', {
        start: this.customStartDate,
        end: this.customEndDate
      });

    } catch (error) {
      console.error('Error setting custom date range:', error);
      this.customStartDate = null;
      this.customEndDate = null;
    }
  }

  // เมธอดตรวจสอบความถูกต้องของวันที่
  private isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // เมธอดสำหรับรีเซ็ต custom date range
  resetCustomDateRange(): void {
    this.customStartDate = null;
    this.customEndDate = null;
    console.log('Custom date range reset');
  }

  // เมธอดตรวจสอบว่ามี custom date range ที่ถูกต้องหรือไม่
  hasValidCustomDateRange(): boolean {
    return this.customStartDate !== null &&
      this.customEndDate !== null &&
      this.isValidDate(this.customStartDate) &&
      this.isValidDate(this.customEndDate);
  }

  // เมธอดสำหรับแสดงช่วงเวลาแบบสั้น
  getDateRangeDisplayShort(): string {
    switch (this.selectedDateRange) {
      case 'today':
        return 'วันนี้';
      case 'yesterday':
        return 'เมื่อวาน';
      case '7days':
        return '7 วันที่ผ่านมา';
      case '30days':
        return '30 วันที่ผ่านมา';
      case 'month':
        if (this.selectedMonth && this.selectedYear) {
          const monthName = this.months.find(m => m.value === this.selectedMonth)?.label || '';
          return monthName;
        }
        return 'เลือกเดือน';
      case 'custom':
        return 'กำหนดเอง';
      default:
        return 'วันนี้';
    }
  }

  // เมธอดสำหรับตรวจสอบว่าเป็นช่วงเวลาปัจจุบันหรือไม่
  isCurrentPeriod(): boolean {
    return this.selectedDateRange === 'today';
  }

  // เมธอดสำหรับดึงจำนวนวันในช่วงที่เลือก
  getSelectedPeriodDays(): number {
    switch (this.selectedDateRange) {
      case 'today':
      case 'yesterday':
        return 1;
      case '7days':
        return 7;
      case '30days':
        return 30;
      case 'month':
        if (this.selectedMonth && this.selectedYear) {
          // คำนวณจำนวนวันในเดือนที่เลือก
          const daysInMonth = new Date(parseInt(this.selectedYear), parseInt(this.selectedMonth), 0).getDate();
          return daysInMonth;
        }
        return 0;
      case 'custom':
        if (this.hasValidCustomDateRange()) {
          const timeDiff = this.customEndDate!.getTime() - this.customStartDate!.getTime();
          return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        }
        return 0;
      default:
        return 1;
    }
  }
}