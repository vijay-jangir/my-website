export class LlmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmError";
  }
}

export class LlmUnavailable extends LlmError {
  constructor() {
    super("No LLM provider is configured");
    this.name = "LlmUnavailable";
  }
}

export class LlmQuotaExceeded extends LlmError {
  constructor() {
    super("Daily LLM call limit exceeded");
    this.name = "LlmQuotaExceeded";
  }
}

export class LlmTimeout extends LlmError {
  constructor() {
    super("LLM request timed out");
    this.name = "LlmTimeout";
  }
}

export interface LlmProvider {
  complete(opts: {
    system: string;
    prompt: string;
    maxTokens?: number;
  }): Promise<string>;
}
