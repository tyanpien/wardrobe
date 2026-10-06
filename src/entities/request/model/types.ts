export type RequestKind = "receive" | "exchange" | "to_organization";

export type RequestStatus = "pending" | "accepted" | "rejected" | "in_transfer" | "completed" | "cancelled";

export type Request = {
  id: string;
  itemId: string;
  fromUserId: string;
  toUserId?: string;
  organizationId?: string;
  kind: RequestKind;
  status: RequestStatus;
  message?: string;
};
