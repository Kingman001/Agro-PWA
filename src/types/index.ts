export type UserRole =
  | 'Administrator'
  | 'Field Officer'
  | 'Field Supervisor'
  | 'Registration Officer'
  | 'Warehouse Officer'
  | 'Management Viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  station: string;
  avatarUrl?: string;
  active: boolean;
}

export type FarmerStatus = 'Active' | 'Pending Verification' | 'Suspended';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Farmer {
  id: string;
  registrationNumber: string;
  fullName: string;
  nationalId: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  community: string;
  district: string;
  cooperative: string;
  primaryCrop: string;
  farmSizeEstimateHa: number;
  status: FarmerStatus;
  photoUrl?: string;
  nationalIdPhotoUrl?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  };
  registeredBy: string;
  registeredByName?: string;
  registeredAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'local_draft' | 'pending_sync';
}

export interface LatLng {
  lat: number;
  lng: number;
}

export type PlotStatus = 'Active' | 'Fallow' | 'Harvested' | 'Inspection Due';

export interface FarmPlot {
  id: string;
  plotCode: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  locationName: string;
  district: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  cropTypes: string[];
  soilType: string;
  irrigationType: string;
  status: PlotStatus;
  boundaryPolygon: LatLng[];
  healthScore?: number; // 0 - 100
  mappedBy: string;
  mappedAt: string;
}

export type PestSeverity = 'None' | 'Low' | 'Moderate' | 'Severe';
export type WeedPressure = 'Clean' | 'Moderate' | 'Heavy';
export type SoilMoisture = 'Adequate' | 'Dry' | 'Waterlogged';
export type MonitoringStatus = 'Submitted' | 'Reviewed' | 'Action Required';

export interface FieldMonitoringLog {
  id: string;
  logNumber: string;
  farmPlotId: string;
  plotCode: string;
  farmerId: string;
  farmerName: string;
  officerId: string;
  officerName: string;
  visitDate: string;
  cropStage: string;
  pestSeverity: PestSeverity;
  pestNames?: string[];
  weedPressure: WeedPressure;
  soilMoisture: SoilMoisture;
  estimatedYieldBags: number;
  issuesDetected: string;
  recommendations: string;
  latitude: number;
  longitude: number;
  gpsAccuracyMeters?: number;
  photoUrl?: string;
  status: MonitoringStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  syncStatus?: 'synced' | 'local_draft' | 'pending_sync';
}

export type WarehouseCategory = 'INPUT' | 'PRODUCE';

export interface WarehouseItem {
  id: string;
  itemCode: string;
  name: string;
  category: WarehouseCategory;
  subCategory: string;
  unitOfMeasure: string;
  reorderLevel: number;
  standardCostPerUnit: number;
  active: boolean;
}

export type TransactionType =
  | 'RECEIPT'      // + Inflow from suppliers or harvest procurement
  | 'ISSUE'        // - Outflow to farmers or processing
  | 'TRANSFER'     // -/+ Moving between sheds/depots
  | 'DISPATCH'     // - Final sales dispatch / export loading
  | 'RETURN'       // + Return from uncollected farm inputs or canceled issue
  | 'ADJUSTMENT';  // +/- Authorized discrepancy adjustment after audited physical count

export interface WarehouseTransaction {
  id: string;
  transactionNumber: string;
  warehouseId: string;
  warehouseName: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: WarehouseCategory;
  transactionType: TransactionType;
  quantity: number; // positive number; sign derived by transactionType logic
  unitOfMeasure: string;
  batchNumber?: string;
  referenceDoc: string; // Waybill, delivery note, voucher, or supervisor signoff
  sourceDestination: string; // e.g. "Main Depot A -> Kumasi Satellite", "Supplier: Yara Ghana", "Farmer: Kofi Manu"
  authorizedBy: string; // Supervisor name/ID
  officerId: string;
  officerName: string;
  timestamp: string;
  notes?: string;
  runningBalanceAfter?: number;
}

export interface ComputedWarehouseBalance {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: WarehouseCategory;
  unitOfMeasure: string;
  totalReceipts: number;
  totalIssues: number;
  totalDispatches: number;
  totalReturns: number;
  totalAdjustments: number;
  currentStock: number;
  reorderLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Critical';
  lastTransactionDate: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
}

export interface OfflineDraft {
  id: string;
  type: 'farmer' | 'monitoring';
  data: Partial<Farmer> | Partial<FieldMonitoringLog>;
  createdAt: string;
  updatedAt: string;
  capturedPhotos?: string[]; // base64 strings
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}
