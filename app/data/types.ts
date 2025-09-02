export interface Book {
  id: string;
  title: string;
  author: string;
  rating: number;
  registeredDate: string;
  review?: string;
}

export interface Entry {
  id: string;
  book_id: string;
  page_start: number;
  page_end: number;
  text: string;
  created_at: number;
}

export interface Settings {
  viewMode: 'continuous' | 'page';
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: 'normal' | 'wide';
  margin: 'normal' | 'wide';
  font: 'sans' | 'mono';
  einkMode: boolean;
  haptic: boolean;
  sound: boolean;
  scrollAccel: 'slow' | 'normal';
}