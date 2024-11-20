export interface TodoData {
  id: number;
  title: string;
  completed: boolean;
}

export interface TodoResponse {
  data: TodoData[];
  message: string;
}
