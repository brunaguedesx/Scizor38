import { Output, streamText, NoObjectGeneratedError, APICallError } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider } from "./gateway-helpers.server";
import { GEMINI_MODEL } from "../contracts";

export async function askCapimAI<T>(
  key: string,
  schema: z.ZodType<T>,
  system: string,
  prompt: string,
  block: (reason: string) => Promise<void>,
): Promise<T> {
  const provider = createLovableAiGatewayProvider(key, undefined, {
    baseURL: "https://ai.gateway.lovable.dev/v1",
  });
  try {
    const result = streamText({
      model: provider(GEMINI_MODEL),
      output: Output.object({ schema }),
      system: `${system}\nResponda exclusivamente com um objeto JSON válido, sem markdown nem explicação fora do JSON.`,
      prompt,
      maxRetries: 0,
    });
    return await result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      try {
        return schema.parse(
          JSON.parse((error.text ?? "").replace(/^```(?:json)?\s*|\s*```$/g, "").trim()),
        );
      } catch {
        throw new Error("O CapimAI não retornou uma interpretação válida. Use os filtros manuais.");
      }
    }
    if (APICallError.isInstance(error)) {
      let message = "Não foi possível consultar o CapimAI. Use os filtros manuais.";
      let type = "";
      try {
        const body = JSON.parse(error.responseBody ?? "{}");
        message = body.message ?? body.error?.message ?? message;
        type = body.type ?? body.error?.type ?? "";
      } catch {
        /* Never expose SDK request bodies or credentials. */
      }
      if (
        error.statusCode === 403 &&
        ![
          "credit_limit_reached",
          "model_vendor_not_enabled",
          "model_requires_retention_consent",
          "provider_not_available_in_region",
        ].includes(type)
      )
        await block(message);
      if (error.statusCode === 401)
        message = "A integração CapimAI precisa de configuração pelo responsável do projeto.";
      throw new Error(message);
    }
    throw new Error(
      "A análise CapimAI não foi concluída. Os filtros manuais continuam disponíveis.",
    );
  }
}
