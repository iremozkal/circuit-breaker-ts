import { Router } from "express";

/**
 * BaseRouter is an abstract class that serves as the blueprint for creating custom Express.js routers.
 * Derived classes should implement the 'build' method to define the routes and middleware for specific routes.
 * @abstract
 * @class BaseRouter
 */
export abstract class IRouter {
  /**
   * Constructs and returns an Express.js Router instance with defined routes and middleware.
   * @returns {Router} An Express.js Router instance.
   * @memberof BaseRouter
   */
  build(): Router {
    console.error("Error @IRouter: Unimplemented router");
    throw new Error("Unimplemented router!");
  }
}
