export type CompletedTransfer = {
  id: string;
  itemId: string;
  fromUserId: string;
  toUserId?: string;
  organizationId?: string;
  completedAt: string;
};

export type EcoStats = {
  userId: string;
  completedTransfersCount: number;
  textileSavedAmount: number;
  history: CompletedTransfer[];
};
