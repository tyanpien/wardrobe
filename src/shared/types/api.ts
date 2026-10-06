export type LoadingState = "idle" | "loading" | "success" | "error";

export type AsyncStatus = {
  state: LoadingState;
  message?: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
