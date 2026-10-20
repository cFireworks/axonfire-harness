/** Native ModelUtils.getCurrentModel subset, with explicit services instead of DI. */
export async function getCurrentImageModel(
  agents: any,
  session?: any,
  logger: any = { info() {}, debug() {}, warn() {} },
): Promise<any> {
  const agent = await agents.getDefault(),
    fallback = await agents.getModel(agent.name);
  if (!session) {
    logger.info(
      `No session provided, using agent default model: ${fallback.id}`,
      "ModelUtils",
    );
    return fallback;
  }
  const requested = session.requestOptions?.model || session.options?.model;
  if (!requested) {
    logger.debug(
      `[ModelUtils] Session ${session.id} has no model set, falling back to agent default: ${fallback.id}`,
    );
    return fallback;
  }
  const models = await agents.getModels(agent.name),
    model = models.find(
      (model: any) => model.name === requested || model.id === requested,
    );
  if (model)
    logger.debug(
      `[ModelUtils] Session ${session.id} model resolved: ${model.id}`,
    );
  else
    logger.warn(
      `[ModelUtils] Session ${session.id} model "${requested}" not found in ${models.length} known models, wrapping as custom model`,
    );
  return model || { id: requested, name: requested };
}
