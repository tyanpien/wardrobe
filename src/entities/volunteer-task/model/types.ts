export type VolunteerTaskStatus = "open" | "recruitment_closed" | "completed" | "cancelled";

export type VolunteerApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled_by_user"
  | "completed";

export type VolunteerTask = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  location: string;
  dateOrPeriod: string;
  volunteersNeeded: number;
  helpType?: string;
  status: VolunteerTaskStatus;
};

export type VolunteerApplication = {
  id: string;
  taskId: string;
  userId: string;
  status: VolunteerApplicationStatus;
};
