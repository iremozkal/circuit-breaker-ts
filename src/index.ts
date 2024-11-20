import { Request, Response } from "express";
import { getApp } from "./app";
import { APP_CONFIGS } from "./shared/envConfigs";

getApp().then((app) => {
  app.listen(APP_CONFIGS.port, () => {
    console.log(`🔔 Server is listening on port:${APP_CONFIGS.port}`);
  });

  app.get("/", function (req: Request, res: Response) {
    res.status(200).send("Service is healthy.");
  });
});
