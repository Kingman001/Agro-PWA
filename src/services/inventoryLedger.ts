import {
  WarehouseItem,
  WarehouseTransaction,
  ComputedWarehouseBalance,
  TransactionType,
} from '../types';

/**
 * Strict Ledger Business Rules:
 * Receipts: Adds to warehouse inventory (+)
 * Issues: Deducts from warehouse inventory (-) (e.g. distributed to farmers)
 * Dispatches: Deducts from warehouse inventory (-) (e.g. sale to processor or exporter)
 * Returns: Adds back to warehouse inventory (+) (e.g. unused input returned from field)
 * Transfers: Deducts from source warehouse (-) / Adds to destination (+)
 * Adjustments: Can be positive or negative (+/-), requires verified authorization note
 *
 * Invariant: Never allow an issue or dispatch that results in negative stock balance.
 */

export function calculateItemBalances(
  items: WarehouseItem[],
  transactions: WarehouseTransaction[],
  warehouseFilter?: string
): ComputedWarehouseBalance[] {
  // Filter transactions if specific warehouse selected
  const filteredTxs = warehouseFilter
    ? transactions.filter((t) => t.warehouseId === warehouseFilter)
    : transactions;

  // Sort chronologically ascending
  const sortedTxs = [...filteredTxs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return items.map((item) => {
    let totalReceipts = 0;
    let totalIssues = 0;
    let totalDispatches = 0;
    let totalReturns = 0;
    let totalAdjustments = 0;
    let lastDate = 'N/A';

    const itemTxs = sortedTxs.filter((tx) => tx.itemId === item.id);

    for (const tx of itemTxs) {
      lastDate = tx.timestamp;
      const qty = Number(tx.quantity) || 0;

      switch (tx.transactionType) {
        case 'RECEIPT':
          totalReceipts += qty;
          break;
        case 'ISSUE':
          totalIssues += qty;
          break;
        case 'DISPATCH':
          totalDispatches += qty;
          break;
        case 'RETURN':
          totalReturns += qty;
          break;
        case 'TRANSFER':
          // If we are looking across all warehouses, internal transfer is net 0,
          // but if scoped to warehouseId, outbound is issue, inbound is receipt
          if (warehouseFilter) {
            if (tx.sourceDestination.includes('->') && tx.sourceDestination.startsWith(tx.warehouseName)) {
              totalIssues += qty;
            } else {
              totalReceipts += qty;
            }
          }
          break;
        case 'ADJUSTMENT':
          totalAdjustments += qty;
          break;
      }
    }

    const currentStock =
      totalReceipts + totalReturns + totalAdjustments - totalIssues - totalDispatches;

    let status: 'In Stock' | 'Low Stock' | 'Critical' = 'In Stock';
    if (currentStock <= 0) {
      status = 'Critical';
    } else if (currentStock <= item.reorderLevel) {
      status = 'Low Stock';
    }

    return {
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.name,
      category: item.category,
      unitOfMeasure: item.unitOfMeasure,
      totalReceipts,
      totalIssues,
      totalDispatches,
      totalReturns,
      totalAdjustments,
      currentStock,
      reorderLevel: item.reorderLevel,
      status,
      lastTransactionDate: lastDate,
    };
  });
}

/**
 * Validates whether a transaction is permitted before recording it to the immutable ledger.
 */
export function validateNewTransaction(
  item: WarehouseItem,
  currentBalance: number,
  txType: TransactionType,
  quantity: number,
  referenceDoc: string,
  authorizedBy: string
): { isValid: boolean; error?: string } {
  if (quantity <= 0) {
    return { isValid: false, error: 'Transaction quantity must be greater than zero.' };
  }

  if (!referenceDoc.trim()) {
    return { isValid: false, error: 'A reference document (Waybill, GRN, SIV, or Voucher) is required for traceability.' };
  }

  if (!authorizedBy.trim()) {
    return { isValid: false, error: 'Sign-off and authorization by a certified supervisor or warehouse officer is mandatory.' };
  }

  // Stock depletion operations check
  if (txType === 'ISSUE' || txType === 'DISPATCH') {
    if (quantity > currentBalance) {
      return {
        isValid: false,
        error: `Insufficient stock! Requested ${quantity} ${item.unitOfMeasure}, but verified ledger balance is only ${currentBalance} ${item.unitOfMeasure}.`,
      };
    }
  }

  return { isValid: true };
}
