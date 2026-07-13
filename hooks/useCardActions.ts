import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Customer, IssuedCard, Transaction, User, Template } from '../types';
import { createTransaction, todayISO } from '../lib/transactionHelpers';
import { resolveCardTemplate } from '../lib/templateSerialization';

interface ApiCallbacks {
  updateCard?: (cardId: string, updates: Partial<IssuedCard>) => Promise<void>;
  logTransaction?: (cardId: string, tx: Transaction) => Promise<void>;
  deleteCard?: (cardId: string) => Promise<void>;
}

interface UseCardActionsParams {
  customers: Customer[];
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  currentUser: User | null;
  activeCustomer: Customer | null;
  activeCard: IssuedCard | null;
  setActiveCard: (card: IssuedCard | null) => void;
  setActiveCustomer: (customer: Customer | null) => void;
  campaigns?: Template[];
  apiCallbacks?: ApiCallbacks;
}

export function useCardActions({
  customers,
  setCustomers,
  currentUser,
  activeCustomer,
  activeCard,
  setActiveCard,
  setActiveCustomer,
  campaigns = [],
  apiCallbacks,
}: UseCardActionsParams) {
  const actorName = currentUser?.businessName ?? 'Owner';
  const actorRole = currentUser?.role ?? 'owner';
  const actorId = currentUser?.id;

  const updateCardStamps = useCallback(async (newStamps: number, isRedeem = false) => {
    if (!activeCustomer || !activeCard) return;

    const template = resolveCardTemplate(activeCard, campaigns);
    const maxStamps = template ? template.totalStamps : 10;

    if (newStamps > maxStamps) return;
    if (newStamps < 0) return;

    const transactionType = isRedeem ? 'redeem' : 'stamp_add';
    const amount = isRedeem ? -activeCard.stamps : 1;
    const title = isRedeem ? 'Reward Redeemed' : 'Stamp Added';

    const newTransaction = createTransaction({
      type: transactionType,
      amount,
      title,
      actorName,
      actorRole,
      actorId,
    });

    const updatedCard: IssuedCard = {
      ...activeCard,
      stamps: newStamps,
      lastVisit: todayISO(),
      ...(isRedeem ? { status: 'Redeemed', completedDate: todayISO() } : {}),
      history: [newTransaction, ...activeCard.history],
    };

    const updatedCustomers = customers.map(c =>
      c.id === activeCustomer.id
        ? { ...c, cards: c.cards.map(cc => (cc.id === activeCard.id ? updatedCard : cc)) }
        : c
    );
    setCustomers(updatedCustomers);

    if (apiCallbacks?.updateCard) {
      await apiCallbacks.updateCard(activeCard.id, {
        stamps: newStamps,
        status: updatedCard.status,
        completedDate: updatedCard.completedDate,
        lastVisit: updatedCard.lastVisit,
      });
    }
    if (apiCallbacks?.logTransaction) {
      await apiCallbacks.logTransaction(activeCard.id, newTransaction);
    }

    setActiveCard(updatedCard);
    setActiveCustomer(updatedCustomers.find(c => c.id === activeCustomer.id) ?? activeCustomer);
  }, [activeCustomer, activeCard, customers, campaigns, setCustomers, setActiveCard, setActiveCustomer, apiCallbacks, actorName, actorRole, actorId]);

  const addStamp = useCallback(async () => {
    await updateCardStamps(activeCard ? activeCard.stamps + 1 : 0);
  }, [updateCardStamps, activeCard]);

  const removeStamp = useCallback(async (customer: Customer, card: IssuedCard) => {
    if (card.stamps <= 0) return;

    const newTransaction = createTransaction({
      type: 'stamp_remove',
      amount: -1,
      title: 'Stamp Removed',
      remarks: 'Manual correction',
      actorName,
      actorRole,
      actorId,
    });

    const updatedCard: IssuedCard = {
      ...card,
      stamps: card.stamps - 1,
      history: [newTransaction, ...card.history],
    };

    const updatedCustomers = customers.map(c =>
      c.id === customer.id
        ? { ...c, cards: c.cards.map(cc => (cc.id === card.id ? updatedCard : cc)) }
        : c
    );
    setCustomers(updatedCustomers);

    if (apiCallbacks?.updateCard) {
      await apiCallbacks.updateCard(card.id, { stamps: card.stamps - 1 });
    }
    if (apiCallbacks?.logTransaction) {
      await apiCallbacks.logTransaction(card.id, newTransaction);
    }

    if (activeCard?.id === card.id) {
      setActiveCard(updatedCard);
      setActiveCustomer(updatedCustomers.find(c => c.id === customer.id) ?? customer);
    }
  }, [customers, setCustomers, apiCallbacks, activeCard, setActiveCard, setActiveCustomer, actorName, actorRole, actorId]);

  const redeemReward = useCallback(async () => {
    await updateCardStamps(0, true);
  }, [updateCardStamps]);

  const deleteCard = useCallback(async (customerId: string, cardId: string) => {
    if (apiCallbacks?.deleteCard) {
      await apiCallbacks.deleteCard(cardId);
    }
    const updatedCustomers = customers
      .map(c => (c.id === customerId ? { ...c, cards: c.cards.filter(card => card.id !== cardId) } : c))
      .filter(c => c.cards.length > 0 || c.id !== customerId);
    setCustomers(updatedCustomers);
  }, [customers, setCustomers, apiCallbacks]);

  return { addStamp, removeStamp, redeemReward, deleteCard };
}
