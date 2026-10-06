export type NotificationType =
  | "request"
  | "message"
  | "volunteer_application"
  | "volunteer_application_result"
  | "transfer"
  | "status";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};
