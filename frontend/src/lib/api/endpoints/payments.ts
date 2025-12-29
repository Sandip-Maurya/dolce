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
  key: string
}

export interface PaymentVerificationRequest {
  paymentId: string
  orderId: string
  signature: string
}

export interface PaymentVerificationResponse {
  message: string
  paymentId: string
}

export const paymentsApi = {
  createPaymentOrder: (data: PaymentOrderRequest) =>
    apiClient.post<PaymentOrderResponse>('/payments/create-order/', data),
  verifyPayment: (data: PaymentVerificationRequest) =>
    apiClient.post<PaymentVerificationResponse>('/payments/verify/', data),
}

