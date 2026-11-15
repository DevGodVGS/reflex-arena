/**
 * Reflex Arena - Scalable Analytics & Telemetry Layer
 * Compatible with PostHog, Segment, and local telemetry logging.
 */

export type AnalyticsEvent =
  | "user_registration"
  | "game_start"
  | "game_complete"
  | "game_abandoned"
  | "personal_best_achieved"
  | "challenge_created"
  | "challenge_accepted"
  | "daily_challenge_participated"
  | "tournament_joined"
  | "premium_conversion"
  | "cosmetic_purchased";

class AnalyticsTracker {
  private enabled: boolean = true;

  public track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
    if (!this.enabled) return;

    const payload = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        clientTime: new Date().toISOString(),
      },
    };

    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics Track] ${event}`, payload.properties);
    }

    // Window PostHog dispatch if initialized
    if (typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (name: string, props: unknown) => void } }).posthog) {
      (window as unknown as { posthog: { capture: (name: string, props: unknown) => void } }).posthog.capture(event, properties);
    }
  }

  public trackGameStart(gameId: string, mode: string = "standard") {
    this.track("game_start", { gameId, mode });
  }

  public trackGameComplete(gameId: string, score: number, durationMs: number, isPb: boolean) {
    this.track("game_complete", { gameId, score, durationMs, isPb });
    if (isPb) {
      this.track("personal_best_achieved", { gameId, score });
    }
  }

  public trackPurchase(itemId: string, priceCoins: number) {
    this.track("cosmetic_purchased", { itemId, priceCoins });
  }

  public trackDailyParticipation(gameId: string, score: number) {
    this.track("daily_challenge_participated", { gameId, score });
  }
}

export const analytics = new AnalyticsTracker();
