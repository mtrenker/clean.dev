import { describe, expect, it } from 'vitest';

import {
  estimateCost,
  lookupModelPricing,
  BUILTIN_MODEL_PRICING,
} from './cost';

describe('lookupModelPricing', () => {
  it('returns null for null/undefined model', () => {
    expect(lookupModelPricing(null)).toBeNull();
    expect(lookupModelPricing(undefined)).toBeNull();
    expect(lookupModelPricing('')).toBeNull();
  });

  it('returns null for unknown model', () => {
    expect(lookupModelPricing('unknown-model-xyz')).toBeNull();
    expect(lookupModelPricing('future-model-2027')).toBeNull();
  });

  it('matches exact key (case-insensitive)', () => {
    expect(lookupModelPricing('sonnet')).toBe(BUILTIN_MODEL_PRICING['sonnet']);
    expect(lookupModelPricing('SONNET')).toBe(BUILTIN_MODEL_PRICING['sonnet']);
    expect(lookupModelPricing('Sonnet')).toBe(BUILTIN_MODEL_PRICING['sonnet']);
  });

  it('matches claude-3-5-sonnet exactly', () => {
    const rate = lookupModelPricing('claude-3-5-sonnet');
    expect(rate).not.toBeNull();
    expect(rate?.inputPer1M).toBe(3.0);
    expect(rate?.outputPer1M).toBe(15.0);
  });

  it('matches model with version suffix via contains', () => {
    // "claude-3-5-sonnet-20241022" contains "claude-3-5-sonnet"
    const rate = lookupModelPricing('claude-3-5-sonnet-20241022');
    expect(rate).not.toBeNull();
    expect(rate?.inputPer1M).toBe(3.0);
  });

  it('prefers more-specific pattern over shorter one', () => {
    // "claude-3-5-haiku" should win over "haiku" when both match
    const rate = lookupModelPricing('claude-3-5-haiku-20241022');
    expect(rate).not.toBeNull();
    // claude-3-5-haiku: 0.8, haiku: 0.8 (same in this case, but the match should be claude-3-5-haiku)
    expect(rate).toBe(BUILTIN_MODEL_PRICING['claude-3-5-haiku']);
  });

  it('matches claude-opus', () => {
    const rate = lookupModelPricing('claude-opus');
    expect(rate).not.toBeNull();
    expect(rate?.inputPer1M).toBe(15.0);
    expect(rate?.outputPer1M).toBe(75.0);
  });

  it('matches gpt-4o-mini before gpt-4o', () => {
    const rate = lookupModelPricing('gpt-4o-mini');
    expect(rate).not.toBeNull();
    // gpt-4o-mini: 0.15, gpt-4o: 2.5 — mini should win due to longer key
    expect(rate?.inputPer1M).toBe(0.15);
  });

  it('matches gpt-4o', () => {
    const rate = lookupModelPricing('gpt-4o-2024-08-06');
    expect(rate).not.toBeNull();
    expect(rate?.inputPer1M).toBe(2.5);
  });

  it('matches gemini-2.0-flash', () => {
    const rate = lookupModelPricing('gemini-2.0-flash');
    expect(rate).not.toBeNull();
    expect(rate?.inputPer1M).toBe(0.1);
  });

  it('accepts customRates that shadow built-in rates', () => {
    const customRates = { 'my-custom-model': { inputPer1M: 1.0, outputPer1M: 2.0 } };
    const rate = lookupModelPricing('my-custom-model', customRates);
    expect(rate).not.toBeNull();
    expect(rate?.inputPer1M).toBe(1.0);
  });

  it('customRates shadow built-in rates for same key', () => {
    const customRates = { 'sonnet': { inputPer1M: 99.0, outputPer1M: 99.0 } };
    const rate = lookupModelPricing('sonnet', customRates);
    expect(rate?.inputPer1M).toBe(99.0);
  });
});

describe('estimateCost', () => {
  it('returns null for null/undefined model', () => {
    expect(estimateCost(null, 1000, 500)).toBeNull();
    expect(estimateCost(undefined, 1000, 500)).toBeNull();
  });

  it('returns null for unknown model', () => {
    expect(estimateCost('unknown-xyz', 1000, 500)).toBeNull();
  });

  it('computes correct cost for claude-3-5-sonnet', () => {
    // 1M input tokens at $3.00/1M = $3.00
    // 1M output tokens at $15.00/1M = $15.00
    const result = estimateCost('claude-3-5-sonnet', 1_000_000, 1_000_000);
    expect(result).not.toBeNull();
    expect(result?.currency).toBe('USD');
    expect(result?.inputCost).toBe(3.0);
    expect(result?.outputCost).toBe(15.0);
    expect(result?.totalCost).toBe(18.0);
    expect(result?.pricingSource).toBe('estimated');
  });

  it('computes cost for small token counts', () => {
    // 1000 input tokens at $3.00/1M = $0.003
    // 500 output tokens at $15.00/1M = $0.0075
    const result = estimateCost('sonnet', 1_000, 500);
    expect(result).not.toBeNull();
    expect(result?.inputCost).toBeCloseTo(0.003, 6);
    expect(result?.outputCost).toBeCloseTo(0.0075, 6);
    expect(result?.totalCost).toBeCloseTo(0.0105, 6);
    expect(result?.pricingSource).toBe('estimated');
  });

  it('computes zero cost for zero tokens', () => {
    const result = estimateCost('sonnet', 0, 0);
    expect(result).not.toBeNull();
    expect(result?.inputCost).toBe(0);
    expect(result?.outputCost).toBe(0);
    expect(result?.totalCost).toBe(0);
  });

  it('marks pricingSource as estimated on all results', () => {
    const models = ['claude-3-5-sonnet', 'gpt-4o', 'gemini-1.5-pro', 'sonnet', 'haiku', 'opus'];
    for (const model of models) {
      const result = estimateCost(model, 10_000, 5_000);
      expect(result?.pricingSource).toBe('estimated');
    }
  });

  it('uses customRates when provided', () => {
    const customRates = { 'my-model': { inputPer1M: 10.0, outputPer1M: 20.0 } };
    // 100k input = 0.1M * $10 = $1.00
    // 50k output = 0.05M * $20 = $1.00
    const result = estimateCost('my-model', 100_000, 50_000, customRates);
    expect(result).not.toBeNull();
    expect(result?.inputCost).toBe(1.0);
    expect(result?.outputCost).toBe(1.0);
    expect(result?.totalCost).toBe(2.0);
  });

  it('computes haiku costs correctly', () => {
    // haiku: $0.80/1M input, $4.00/1M output
    const result = estimateCost('claude-3-5-haiku', 500_000, 200_000);
    expect(result).not.toBeNull();
    expect(result?.inputCost).toBeCloseTo(0.4, 6); // 0.5M * $0.80
    expect(result?.outputCost).toBeCloseTo(0.8, 6); // 0.2M * $4.00
    expect(result?.totalCost).toBeCloseTo(1.2, 6);
  });

  it('handles model name with version suffix', () => {
    const result = estimateCost('claude-3-5-sonnet-20241022', 1_000_000, 0);
    expect(result).not.toBeNull();
    expect(result?.inputCost).toBe(3.0);
  });

  it('rounds to 6 decimal places', () => {
    // Very small amounts to test rounding
    const result = estimateCost('gpt-4o-mini', 1, 1);
    // 1 token / 1M * $0.15 = 0.00000015
    expect(result?.inputCost.toString().split('.')[1]?.length ?? 0).toBeLessThanOrEqual(6);
  });
});
