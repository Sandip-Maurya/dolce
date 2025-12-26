import { apiClient } from '../client'

export interface Payment {
  paymentId: string
  provider: 'RAZORPAY' | 'STRIPE' | 'OTHER'
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
}

export interface PaymentOrderRequest {
  amount: number
  currency: string
  orderId: string
}

export interface PaymentOrderResponse {
  paymentOrderId: string
  provider: 'RAZORPAY' | 'STRIPE' | 'OTHER'
  amount: number
  currency: string
}

export const paymentsApi = {
  createPaymentOrder: (data: PaymentOrderRequest) =>
    apiClient.post<PaymentOrderResponse>('/payments/create-order/', data),
}

