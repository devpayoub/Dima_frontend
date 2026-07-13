import { useState, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { formatPhoneNumber } from '../lib/format';
import type { Customer, IssuedCard } from '../types';
import type { EditFormData } from '@/features/cards/components/EditCustomerDialog';

export function useCustomerDialogs() {
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStampOpen, setIsStampOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [activeCard, setActiveCard] = useState<IssuedCard | null>(null);

  const [mobileError, setMobileError] = useState('');

  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    email: '',
    mobile: '',
  });

  const onMobileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    const digits = formatted.replace(/[^\d]/g, '');
    setEditFormData(prev => ({ ...prev, mobile: formatted }));
    if (digits.length > 0 && digits.length < 10) {
      setMobileError('Enter 10 digits');
    } else {
      setMobileError('');
    }
  }, []);

  return {
    isIssueOpen,
    setIsIssueOpen,
    isEditOpen,
    setIsEditOpen,
    isStampOpen,
    setIsStampOpen,
    isRedeemOpen,
    setIsRedeemOpen,
    activeCustomer,
    setActiveCustomer,
    activeCard,
    setActiveCard,
    mobileError,
    setMobileError,
    editFormData,
    setEditFormData,
    onMobileChange,
  };
}
