declare module 'react-paystack' {
  import React from 'react';

  export interface PaystackButtonProps {
    text?: string;
    className?: string;
    children?: React.ReactNode;
    onSuccess?: (reference: any) => void;
    onClose?: () => void;
    reference?: string;
    email?: string;
    amount?: number;
    publicKey?: string;
    currency?: string;
    [key: string]: any;
  }

  export const PaystackButton: React.FC<PaystackButtonProps>;
  export const usePaystackPayment: (config: any) => (onSuccess?: Function, onClose?: Function) => void;
}
