import type { IssuedCard, Transaction } from '../../types';
import * as apiIssuedCards from '../api/issuedCards';
import * as apiTransactions from '../api/transactions';
import * as apiPublic from '../api/public';

export type ScannedCardStatus = 'owned' | 'foreign' | 'missing';

export interface PublicScanEntryContext {
  owner: {
    id: string;
    slug: string;
    businessName: string;
  };
  card: {
    uniqueId: string;
  };
}

export async function insertIssuedCard(
  card: any,
  _ownerId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    return await apiIssuedCards.issue(card);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function updateIssuedCard(
  cardId: string,
  updates: Partial<Pick<IssuedCard, 'stamps' | 'status' | 'completedDate' | 'lastVisit'>>
): Promise<{ ok: boolean; error?: string }> {
  try {
    return await apiIssuedCards.update(cardId, updates);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function deleteIssuedCard(cardId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    return await apiIssuedCards.remove(cardId);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function insertTransaction(
  cardId: string,
  tx: Transaction
): Promise<{ ok: boolean; error?: string }> {
  try {
    return await apiTransactions.log(cardId, tx);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function countIssuedCards(_ownerId: string): Promise<number> {
  try {
    return await apiIssuedCards.count();
  } catch {
    return 0;
  }
}

export async function inspectScannedCard(uniqueId: string): Promise<{ status: ScannedCardStatus; error?: string }> {
  try {
    const res = await apiIssuedCards.inspect(uniqueId);
    return { status: res.status as ScannedCardStatus };
  } catch (err: any) {
    return { status: 'missing', error: err.message };
  }
}

export async function fetchPublicScanEntryContext(
  slug: string,
  uniqueId: string
): Promise<PublicScanEntryContext | null> {
  try {
    const res = await apiPublic.getScanContext(slug, uniqueId);
    if (!res || !res.owner || !res.card) return null;
    return {
      owner: {
        id: res.owner.id,
        slug: res.owner.slug,
        businessName: res.owner.businessName || '',
      },
      card: {
        uniqueId: res.card.uniqueId,
      },
    };
  } catch {
    return null;
  }
}
