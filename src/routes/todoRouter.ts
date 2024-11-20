import { Router } from "express";
import { TodoController } from "../controllers/todoController";
import { IRouter } from "../interfaces";
import { asyncHandler, errorHandler } from "../middlewares";

export class TodoRouter extends IRouter {
  static build(): Router {
    const controller = new TodoController();
    const router = Router();

    router
      .get("/", asyncHandler(controller.get))
      .post("/", asyncHandler(controller.create))
      .put("/:id", asyncHandler(controller.update))
      .delete("/:id", asyncHandler(controller.delete));

    router.use(errorHandler);
    return router;
  }
}
