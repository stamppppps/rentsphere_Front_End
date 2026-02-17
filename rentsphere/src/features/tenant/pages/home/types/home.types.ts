export interface Resident {
  name: string;
  condo: string;
  unit: string;
}

export const FeatureType = {
  MAINTENANCE: 'maintenance',
  BILLING: 'billing',
  PARCEL: 'parcel',
  BOOKING: 'booking'
} as const;

export type FeatureType = (typeof FeatureType)[keyof typeof FeatureType];

export interface Activity {
  id: string;
  type: FeatureType;
  title: string;
  date: string;
  status: 'pending' | 'completed' | 'in-progress';
  description: string;
}
