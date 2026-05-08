/**
 * Approximate cost estimation for LLM token usage.
 *
 * ALL values are ESTIMATES only. Prices are sourced from public provider
 * documentation and may be out of date. Do not use these values for billing,
 * invoicing, or any financial decision-making. They are provided solely to give
 * rough order-of-magnitude comparisons between tasks and models in the Cockpit UI.
 *
 * The pricingSource field of every returned estimate is set to 'estimated' to
 * make the approximation status explicit.
 */

export interface ModelPricingRate {
  /** USD cost per 1,000,000 input tokens */
  inputPer1M: number;
  /** USD cost per 1,000,000 output tokens */
  outputPer1M: number;
}

/**
 * Built-in model pricing rates keyed by lowercase pattern.
 *
 * Keys are matched against the model name using contains(), sorted by
 * descending key length so that more-specific patterns win. For example,
 * 'claude-3-5-haiku' matches before 'haiku'.
 *
 * All prices are approximate public list prices as of mid-2025.
 */
export const BUILTIN_MODEL_PRICING: Record<string, ModelPricingRate> = {
  // ── Anthropic Claude family ─────────────────────────────────────────────────
  'claude-3-5-sonnet': { inputPer1M: 3.0, outputPer1M: 15.0 },
  'claude-3-7-sonnet': { inputPer1M: 3.0, outputPer1M: 15.0 },
  'claude-3-5-haiku': { inputPer1M: 0.8, outputPer1M: 4.0 },
  'claude-3-opus': { inputPer1M: 15.0, outputPer1M: 75.0 },
  'claude-3-sonnet': { inputPer1M: 3.0, outputPer1M: 15.0 },
  'claude-3-haiku': { inputPer1M: 0.25, outputPer1M: 1.25 },
  'claude-opus': { inputPer1M: 15.0, outputPer1M: 75.0 },
  'claude-sonnet': { inputPer1M: 3.0, outputPer1M: 15.0 },
  'claude-haiku': { inputPer1M: 0.8, outputPer1M: 4.0 },
  // Short bare names — only match if no more-specific pattern matched
  'opus': { inputPer1M: 15.0, outputPer1M: 75.0 },
  'sonnet': { inputPer1M: 3.0, outputPer1M: 15.0 },
  'haiku': { inputPer1M: 0.8, outputPer1M: 4.0 },

  // ── OpenAI GPT / o-series ───────────────────────────────────────────────────
  'gpt-4o-mini': { inputPer1M: 0.15, outputPer1M: 0.6 },
  'gpt-4o': { inputPer1M: 2.5, outputPer1M: 10.0 },
  'gpt-4-turbo': { inputPer1M: 10.0, outputPer1M: 30.0 },
  'gpt-4.1-mini': { inputPer1M: 0.4, outputPer1M: 1.6 },
  'gpt-4.1': { inputPer1M: 2.0, outputPer1M: 8.0 },
  'gpt-4': { inputPer1M: 30.0, outputPer1M: 60.0 },
  'gpt-3.5-turbo': { inputPer1M: 0.5, outputPer1M: 1.5 },
  'o3-mini': { inputPer1M: 1.1, outputPer1M: 4.4 },
  'o1-mini': { inputPer1M: 3.0, outputPer1M: 12.0 },
  'o3': { inputPer1M: 10.0, outputPer1M: 40.0 },
  'o1': { inputPer1M: 15.0, outputPer1M: 60.0 },

  // ── Google Gemini ───────────────────────────────────────────────────────────
  'gemini-2.0-flash': { inputPer1M: 0.1, outputPer1M: 0.4 },
  'gemini-1.5-flash': { inputPer1M: 0.075, outputPer1M: 0.3 },
  'gemini-1.5-pro': { inputPer1M: 3.5, outputPer1M: 10.5 },
  'gemini-1.0-pro': { inputPer1M: 0.5, outputPer1M: 1.5 },
};

/**
 * Looks up a pricing rate for the given model name.
 *
 * Matching strategy (case-insensitive):
 *   1. Exact match
 *   2. Contains match against keys, sorted by key length descending so
 *      more-specific patterns take precedence over shorter ones
 *
 * Returns null when no pricing is known for the model.
 *
 * @param model      Model identifier string (e.g. "claude-3-5-sonnet-20241022")
 * @param customRates Optional override table merged on top of the built-in rates;
 *                    custom entries shadow built-in entries with the same key.
 */
export const lookupModelPricing = (
  model: string | null | undefined,
  customRates?: Record<string, ModelPricingRate>,
): ModelPricingRate | null => {
  if (!model) return null;

  const rates: Record<string, ModelPricingRate> = {
    ...BUILTIN_MODEL_PRICING,
    ...(customRates ?? {}),
  };

  const key = model.toLowerCase().trim();

  // 1. Exact match
  if (key in rates) return rates[key]!;

  // 2. Contains match, longest key wins (more specific pattern preferred)
  const sortedKeys = Object.keys(rates).sort((a, b) => b.length - a.length);
  for (const rateKey of sortedKeys) {
    if (key.includes(rateKey)) return rates[rateKey]!;
  }

  return null;
};

export interface CostEstimate {
  currency: 'USD';
  inputCost: number;
  outputCost: number;
  totalCost: number;
  /**
   * Always 'estimated'. Callers must not surface these values as billing-grade.
   */
  pricingSource: string;
}

/**
 * Estimates the USD cost of a task given its token usage and model.
 *
 * Returns null when:
 *   - model is null/undefined/empty
 *   - no pricing rate is found for the model
 *
 * All returned values are ESTIMATES. The pricingSource field is always set to
 * 'estimated' to make the approximation explicit. Do not use for billing.
 *
 * @param model        Model identifier; may include version suffixes like "-20241022"
 * @param inputTokens  Number of input/prompt tokens consumed
 * @param outputTokens Number of output/completion tokens generated
 * @param customRates  Optional override rate table (see lookupModelPricing)
 */
export const estimateCost = (
  model: string | null | undefined,
  inputTokens: number,
  outputTokens: number,
  customRates?: Record<string, ModelPricingRate>,
): CostEstimate | null => {
  const rate = lookupModelPricing(model, customRates);
  if (!rate) return null;

  const inputCost = round6((inputTokens / 1_000_000) * rate.inputPer1M);
  const outputCost = round6((outputTokens / 1_000_000) * rate.outputPer1M);
  const totalCost = round6(inputCost + outputCost);

  return {
    currency: 'USD',
    inputCost,
    outputCost,
    totalCost,
    pricingSource: 'estimated',
  };
};

/** Round to 6 decimal places to avoid IEEE-754 drift in cost fields. */
const round6 = (n: number): number => Math.round(n * 1_000_000) / 1_000_000;
