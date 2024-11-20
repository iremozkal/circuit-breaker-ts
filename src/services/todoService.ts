import { ITodoService, TodoData } from "../interfaces";
import { circuitBreakerProvider } from "../providers";
import { TODO_SERVICE_CONFIGS } from "../shared/envConfigs";
import { CircuitBreaker } from "../utils/circuitBreaker";
import { AxiosRequestConfig } from "axios";

export class TodoService implements ITodoService {
  private circuitBreaker: CircuitBreaker<unknown>;
  constructor() {
    this.circuitBreaker = circuitBreakerProvider.getCircuitBreaker(
      TODO_SERVICE_CONFIGS.baseUrl
    );
  }

  private createRequestConfig(
    method: string,
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any
  ): AxiosRequestConfig {
    return {
      method,
      url: endpoint,
      data,
    };
  }

  public async getAll(): Promise<TodoData[]> {
    try {
      const requestConfig = this.createRequestConfig("get", "/todos");
      return await this.circuitBreaker.exec(requestConfig);
    } catch (error) {
      console.error("Error fetching todos: ", (error as Error)?.message);
      throw error;
    }
  }

  public async getById(id: number): Promise<TodoData> {
    try {
      const requestConfig = this.createRequestConfig("get", `/todos/${id}`);
      return await this.circuitBreaker.exec(requestConfig);
    } catch (error) {
      console.error(
        `Error fetching todo with id ${id}: `,
        (error as Error)?.message
      );
      throw error;
    }
  }

  public async create(newTodo: TodoData): Promise<TodoData> {
    try {
      const requestConfig = this.createRequestConfig("post", "/todos", newTodo);
      return await this.circuitBreaker.exec(requestConfig);
    } catch (error) {
      console.error("Error creating todo: ", (error as Error)?.message);
      throw error;
    }
  }

  public async update(id: number, updatedTodo: TodoData): Promise<TodoData> {
    try {
      const requestConfig = this.createRequestConfig(
        "put",
        `/todos/${id}`,
        updatedTodo
      );
      return await this.circuitBreaker.exec(requestConfig);
    } catch (error) {
      console.error("Error updating todo: ", (error as Error)?.message);
      throw error;
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      const requestConfig = this.createRequestConfig("delete", `/todos/${id}`);
      return await this.circuitBreaker.exec(requestConfig);
    } catch (error) {
      console.error("Error deleting todo: ", (error as Error)?.message);
      throw error;
    }
  }
}
