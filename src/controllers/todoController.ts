import { Request } from "express";
import { TodoData } from "../interfaces";
import { validateRequest } from "../middlewares";
import { ServiceProvider } from "../providers";
import { ApplicationValidationError } from "../shared/errors";
import { APP_MESSAGES } from "../shared/constants";
import { GetByIdBody } from "../validations";

export class TodoController {
  private todoService = ServiceProvider.getTodoService();

  // Handle the GET request to fetch todos (either all or by id)
  get = async (req: Request): Promise<TodoData[] | TodoData> => {
    const { id, ...rest } = await validateRequest(GetByIdBody, req.query);

    if (Object.keys(rest).length > 0) {
      throw new ApplicationValidationError(
        APP_MESSAGES.defaultValidationErrorDesc,
        Object.keys(rest).map((param) => ({
          field: param,
          message: "Invalid parameter",
        }))
      );
    }

    if (id) {
      return await this.todoService.getById(id);
    }
    return await this.todoService.getAll();
  };

  // Handle the POST request to create a new todo
  create = async (req: Request): Promise<TodoData> => {
    const newTodo = req.body;
    return await this.todoService.create(newTodo);
  };

  // Handle the PUT request to update a todo
  update = async (req: Request): Promise<TodoData> => {
    const { id } = req.params;
    const updatedTodo = req.body;
    return await this.todoService.update(parseInt(id), updatedTodo);
  };

  // Handle the DELETE request to delete a todo
  delete = async (req: Request): Promise<void> => {
    const { id } = req.params;
    return await this.todoService.delete(parseInt(id));
  };
}
