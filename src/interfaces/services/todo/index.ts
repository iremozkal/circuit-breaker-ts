import { TodoData } from "./data";

export * from "./data";

export interface ITodoService {
  getAll(): Promise<TodoData[]>;
  getById(id: number): Promise<TodoData>;
  create(newTodo: TodoData): Promise<TodoData>;
  update(id: number, updatedTodo: TodoData): Promise<TodoData>;
  delete(id: number): Promise<void>;
}
