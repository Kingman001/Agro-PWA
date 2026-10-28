import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Warehouse,
  AlertCircle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  WarehouseItem,
  WarehouseTransaction,
  ComputedWarehouseBalance,
  TransactionType,
  UserRole,
} from '../../types';
import { validateNewTransaction } from '../../services/inventoryLedger';

interface NewTxProps {
  items: WarehouseItem[];
  balances: ComputedWarehouseBalance[];
  onClose: () => void;
  onRecordTransaction: (tx: WarehouseTransaction) => void;
  activeRole: UserRole;
  currentUserId: string;
  currentUserName: string;
}

const TX_TYPES: { type: TransactionType; label: string; effect: string }[] = [
  { type: 'RECEIPT', label: 'Receipt (Inflow from supplier or farm harvest)', effect: '(+) Stock Increase' },
  { type: 'ISSUE', label: 'Issue (Outflow distribution to farmer or field team)', effect: '(-) Stock Decrease' },
  { type: 'TRANSFER', label: 'Transfer (Inter-warehouse depot shipment)', effect: '(+/-) Relocation' },
  { type: 'DISPATCH', label: 'Dispatch (Produce sale to off-taker or export terminal)', effect: '(-) Stock Decrease' },
  { type: 'RETURN', label: 'Return (Unused input returned to warehouse storage)', effect: '(+) Stock Increase' },
  { type: 'ADJUSTMENT', label: 'Authorized Adjustment (Post-cycle physical count audit)', effect: '(+/-) Audit Reconciliation' },
];

export const NewTransactionModal: React.FC<NewTxProps> = ({
  items,
  balances,
  onClose,
  onRecordTransaction,
  activeRole,
  currentUserId,
  currentUserName,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [transactionType, setTransactionType] = useState<TransactionType>('RECEIPT');
  const [quantity, setQuantity] = useState<number>(50);
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [referenceDoc, setReferenceDoc] = useState<string>('');
  const [sourceDestination, setSourceDestination] = useState<string>('');
  const [authorizedBy, setAuthorizedBy] = useState<string>(currentUserName);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const currentBalanceObj = balances.find((b) => b.itemId === selectedItemId);
  const currentBalance = currentBalanceObj ? currentBalanceObj.currentStock : 0;

  // Calculate projected new balance based on immutable ledger rules
  let projectedBalance = currentBalance;
  if (transactionType === 'RECEIPT' || transactionType === 'RETURN') {
    projectedBalance += quantity;
  } else if (transactionType === 'ISSUE' || transactionType === 'DISPATCH') {
    projectedBalance -= quantity;
  } else if (transactionType === 'ADJUSTMENT') {
    projectedBalance += quantity; // Adjustment quantity can be signed
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedItem) {
      setErrorMsg('Please select a valid warehouse item.');
      return;
    }

    // Strict ledger business rule validation
    const validation = validateNewTransaction(
      selectedItem,
      currentBalance,
      transactionType,
      quantity,
      referenceDoc,
      authorizedBy
    );

    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Transaction validation failed.');
      return;
    }

    const txNumber = `TX-${transactionType.slice(0, 3)}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx: WarehouseTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: txNumber,
      warehouseId: 'wh-main-01',
      warehouseName: 'Central Agro Hub Depot',
      itemId: selectedItem.id,
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.name,
      category: selectedItem.category,
      transactionType,
      quantity,
      unitOfMeasure: selectedItem.unitOfMeasure,
      batchNumber: batchNumber.trim() || undefined,
      referenceDoc: referenceDoc.trim(),
      sourceDestination: sourceDestination.trim() || 'Internal Warehouse Store',
      authorizedBy: authorizedBy.trim(),
      officerId: currentUserId,
      officerName: currentUserName,
      timestamp: new Date().toISOString(),
      notes: notes.trim() || undefined,
      runningBalanceAfter: projectedBalance,
    };

    onRecordTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 uppercase tracking-wider font-semibold font-mono border border-emerald-800">
                Traceable Stock Journal
              </span>
              <h2 className="text-base sm:text-lg font-bold">Record Inventory Movement</h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Append-only ledger entry. Balances are derived strictly from signed transactions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Item Selector & Current Balance Display */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-semibold mb-1">
                  Commodity or Input Item *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
                >
                  <optgroup label="Agricultural Inputs">
                    {items
                      .filter((i) => i.category === 'INPUT')
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.itemCode} — {item.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Harvested Produce">
                    {items
                      .filter((i) => i.category === 'PRODUCE')
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.itemCode} — {item.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Current Ledger Balance
                </label>
                <div className="px-3 py-2 bg-white rounded-lg border border-stone-200 font-mono font-bold text-stone-900 text-sm">
                  {currentBalance}{' '}
                  <span className="text-[10px] font-normal text-stone-500">
                    {selectedItem?.unitOfMeasure.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Projected Impact Preview */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200">
              <span className="text-stone-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                Projected Balance after entry:
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  projectedBalance < 0
                    ? 'text-red-700 underline'
                    : projectedBalance <= (selectedItem?.reorderLevel || 0)
                    ? 'text-amber-700'
                    : 'text-emerald-800'
                }`}
              >
                {projectedBalance} {selectedItem?.unitOfMeasure.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Movement Type & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Transaction Movement Type *
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
              >
                {TX_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Transaction Quantity ({selectedItem?.unitOfMeasure}) *
              </label>
              <input
                type="number"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none bg-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Reference Document & Batch Lot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Reference Document (Waybill / GRN / SIV) *
              </label>
              <input
                type="text"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                placeholder="e.g. WAYBILL-WB-8819 or GRN-99120"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Batch / Lot Number
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. LOT-YARA-2026-B2"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Source/Destination & Authorized By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Source / Destination Entity *
              </label>
              <input
                type="text"
                value={sourceDestination}
                onChange={(e) => setSourceDestination(e.target.value)}
                placeholder="e.g. Golden Pod Co-op or Port Terminal Takoradi"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Authorizing Supervisor / Officer *
              </label>
              <input
                type="text"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                placeholder="Sign-off supervisor name"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Quality Inspection / Audit Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified bag integrity, moisture 6.8%, zero caking."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Audit Invariant:</strong> Once recorded, this transaction cannot be modified or deleted directly. Corrections must be handled via authorized reversal transactions.
            </span>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 font-semibold hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record to Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
