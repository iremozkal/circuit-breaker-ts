import { TodoService } from "../services";

export class ServiceProvider {
  private static todoService: TodoService;

  public static getTodoService(): TodoService {
    if (!ServiceProvider.todoService) {
      ServiceProvider.todoService = new TodoService();
    }
    return ServiceProvider.todoService;
  }
}
