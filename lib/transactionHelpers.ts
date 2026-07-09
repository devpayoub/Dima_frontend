import { Transaction, IssuedCard, Customer, UserRole } from '../types';

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function createTransaction(params: {
  type: Transaction['type'];
  amount: number;
  title: string;
  remarks?: string;
  actorId?: string;
  actorName?: string;
  actorRole?: UserRole;
}): Transaction {
  const now = new Date();
  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: params.type,
    amount: params.amount,
    date: now.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
    timestamp: now.getTime(),
    title: params.title,
    remarks: params.remarks ?? null,
    actorId: params.actorId ?? null,
    actorName: params.actorName ?? null,
    actorRole: params.actorRole ?? undefined,
  };
}

export function updateCustomerCard(
  customers: Customer[],
  customerId: string,
  cardId: string,
  updater: (card: IssuedCard) => IssuedCard
): Customer[] {
  return customers.map(c => {
    if (c.id === customerId) {
      return { ...c, cards: c.cards.map(card => card.id === cardId ? updater(card) : card) };
    }
    return c;
  });
}

export function createIssuedCardData(params: {
  campaign: any;
  customer?: any;
  newCustomerData?: { name: string; email: string; mobile: string };
  currentUser: any;
  customerId?: string;
}): { customer: Customer; card: IssuedCard; initialTransaction: Transaction } {
  const actorName = params.currentUser?.businessName ?? params.currentUser?.email ?? 'Owner';
  const actorRole = params.currentUser?.role ?? 'owner';
  const actorId = params.currentUser?.id ?? '';

  const now = new Date();
  const customerId = params.customerId ?? `cust-${Date.now()}`;

  const customer: Customer = params.customer ?? {
    id: customerId,
    name: params.newCustomerData?.name ?? '',
    email: params.newCustomerData?.email ?? '',
    mobile: params.newCustomerData?.mobile ?? '',
    status: 'Active',
    cards: [],
  };

  const initialTransaction = createTransaction({
    type: 'issued',
    amount: 1,
    title: `Issued ${params.campaign.name}`,
    actorId,
    actorName,
    actorRole,
  });

  const card: IssuedCard = {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uniqueId: crypto.randomUUID(),

    campaignId: params.campaign.id,
    campaignName: params.campaign.name,
    stamps: 0,
    lastVisit: todayISO(),
    status: 'Active',
    completedDate: null,
    templateSnapshot: params.campaign,
    history: [initialTransaction],
  };

  return { customer, card, initialTransaction };
}
