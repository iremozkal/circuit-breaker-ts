import { Router } from "express";
import { TodoRouter } from "./";
import { IRouter } from "../interfaces";

/**
 * This class aggregates and maps all other routers in the application.
 * It defines mappings for different routes based on the router classes provided.
 * @class MainRouter
 */
export default class MainRouter {
  // A mapping of route prefixes to their respective routers.
  // Modify this mapping to add or remove routes from the application.
  static mappings: Record<string, IRouter> = {
    "/todo": TodoRouter,
  };

  static build(): Router {
    const router = Router();
    for (const r in this.mappings) {
      router.use(r, this.mappings[r].build());
    }
    return router;
  }
}
