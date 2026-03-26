export interface SummarizeInput {
  text: string;
}

export interface SummarizeOutput {
  summary: string;
}

export interface ClassifyInput {
  text: string;
}

export interface ClassifyOutput {
  label: string;
  score: number;
}

export interface EmbedInput {
  text: string;
}

export interface EmbedOutput {
  vector: number[];
}

export interface DraftInput {
  prompt: string;
}

export interface DraftOutput {
  draft: string;
}

export interface ModelProvider {
  summarize(input: SummarizeInput): Promise<SummarizeOutput>;
  classify(input: ClassifyInput): Promise<ClassifyOutput>;
  embed(input: EmbedInput): Promise<EmbedOutput>;
  draft(input: DraftInput): Promise<DraftOutput>;
}

export class StubModelProvider implements ModelProvider {
  async summarize(input: SummarizeInput): Promise<SummarizeOutput> {
    return { summary: input.text.slice(0, 280) };
  }

  async classify(_input: ClassifyInput): Promise<ClassifyOutput> {
    return { label: "neutral", score: 0.5 };
  }

  async embed(_input: EmbedInput): Promise<EmbedOutput> {
    return { vector: [0, 0, 0] };
  }

  async draft(input: DraftInput): Promise<DraftOutput> {
    return { draft: `Draft: ${input.prompt.slice(0, 300)}` };
  }
}
