export type Rating = {
  id: string;
  fromUserId: string;
  toUserId: string;
  value: number;
  comment?: string;
  createdAt: string;
};
