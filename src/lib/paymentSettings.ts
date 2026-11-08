export interface PaymentSettingsData {
  id: string;
  enabled: boolean;
  bkashNumber: string;
  bkashAccountType: string;
  nagadNumber: string;
  nagadAccountType: string;
  onlineDiscountAmount: number;
  instructions: string;
  updatedAt?: string;
  createdAt?: string;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettingsData = {
  id: 'default',
  enabled: true,
  bkashNumber: '01854411797',
  bkashAccountType: 'Personal (Send Money)',
  nagadNumber: '01854411797',
  nagadAccountType: 'Personal (Send Money)',
  onlineDiscountAmount: 50,
  instructions: 'Please Send Money to our bKash or Nagad Personal number or Payment to Merchant, then enter the Transaction ID below.',
};
