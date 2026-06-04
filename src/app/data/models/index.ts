import { Timestamp } from 'firebase/firestore';

export type JobStatus = 'PENDING' | 'BOOKED' | 'COMPLETED' | 'CANCELED' | 'REJECTED' | 'EXPIRED';
export type ServiceType = 'ล้าง' | 'ตัดล้าง' | 'ติดตั้ง' | 'ซ่อม' | 'อื่นๆ';

export interface BookInfo {
  date: Date;
  time: string[];
}

export interface Job {
  key?: string;
  job_id: string;
  project_id: string;
  group_id: string;
  site_id: string;
  address: string;
  type: ServiceType;
  type_other?: string;
  qty: number;
  phone: string;
  remark?: string;
  status: JobStatus;
  is_qrcode: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  book: BookInfo;
}

export interface GroupSummary {
  id: string;
  name: string;
  color: string;
}

export interface Site {
  key?: string;
  site_id: string;
  name: string;
  group_id: string;
  project_id: string;
  address?: string;
  group?: GroupSummary | null;
}

export interface SiteGroupIds {
  site_id: string[];
  site?: Site[];
}

export interface Group {
  key?: string;
  id: string;
  name: string;
  color: string;
  limit: number;
  project_id: string;
  reader?: string;
  image?: string;
  site_groups: SiteGroupIds;
}

export interface AppUser {
  key?: string;
  phone: string;
  project_id: string;
  nick_name: string;
  name?: string;
  last_name?: string;
  user_id?: string;
  group_id?: string;
}

export interface TimeSlot {
  title: string;
  value: string;
  count: number;
  disabled: boolean;
}

export interface SelectOption<T = string> {
  title: string;
  value: T;
  disabled: boolean;
}

export interface NewJobData {
  job_id: string;
  project_id: string;
  group_id: string;
  site_id: string;
  address: string;
  type: ServiceType;
  type_other: string;
  qty: number;
  phone: string;
  remark: string;
  status: JobStatus;
  is_qrcode: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  book: BookInfo;
}
