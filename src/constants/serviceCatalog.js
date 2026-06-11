export const DRIVER_SERVICE_OPTIONS = [
  { id: 1, label: 'Xe ôm', scope: 'city' },
  { id: 2, label: 'Taxi 4 chỗ', scope: 'city' },
  { id: 3, label: 'Taxi 7 chỗ', scope: 'city' },
  { id: 4, label: 'Giao đồ ăn', scope: 'food' },
  { id: 5, label: 'Giao hàng', scope: 'delivery' },
  { id: 6, label: 'Xe đi tỉnh', scope: 'intercity' },
  { id: 7, label: 'Xe sân bay', scope: 'airport' },
  { id: 8, label: 'Lái hộ', scope: 'chauffeur' },
];

export const DRIVER_SERVICE_LABEL_MAP = Object.fromEntries(
  DRIVER_SERVICE_OPTIONS.map((item) => [item.id, item.label]),
);

export const SCHEDULED_PRICING_SERVICE_OPTIONS = [
  { id: 6, label: 'Đi tỉnh' },
  { id: 7, label: 'Sân bay' },
];

export const SCHEDULED_PRICING_SERVICE_LABEL_MAP = Object.fromEntries(
  SCHEDULED_PRICING_SERVICE_OPTIONS.map((item) => [item.id, item.label]),
);

export const SCHEDULED_RIDE_MODE_OPTIONS = [
  { id: 'shared', label: 'Ghép (Shared)' },
  { id: 'private', label: 'Bao xe (Private)' },
];

export const SCHEDULED_RIDE_MODE_LABEL_MAP = Object.fromEntries(
  SCHEDULED_RIDE_MODE_OPTIONS.map((item) => [item.id, item.label]),
);

export const COMMISSION_SERVICE_OPTIONS = [
  { id: 1, label: 'Chuyến xe' },
  { id: 2, label: 'Đồ ăn' },
  { id: 3, label: 'Giao hàng' },
  { id: 6, label: 'Đi tỉnh' },
  { id: 7, label: 'Sân bay' },
];

export const COMMISSION_SERVICE_LABEL_MAP = Object.fromEntries(
  COMMISSION_SERVICE_OPTIONS.map((item) => [item.id, item.label]),
);

export const VOUCHER_SERVICE_OPTIONS = [
  { id: 1, label: 'Chuyến xe' },
  { id: 2, label: 'Đồ ăn' },
  { id: 3, label: 'Đa dịch vụ' },
  { id: 4, label: 'Giao hàng' },
  { id: 5, label: 'Tất cả dịch vụ' },
];

export const VOUCHER_SERVICE_LABEL_MAP = Object.fromEntries(
  VOUCHER_SERVICE_OPTIONS.map((item) => [item.id, item.label]),
);
