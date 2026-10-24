import { test } from "node:test";
import { createNativeHttpController } from "../src/http/native-http-controller.js";
import { httpControllerScenario } from "../scripts/helpers/http-controller-scenarios.js";
test("original MVC registration routes concurrent decorated controller calls, parameters, JSON views and exception handlers", async () => {
  await httpControllerScenario(createNativeHttpController);
});
