export enum Tab {
  Simulator = 'Simulator',
  EnglishLiteracy = 'English & Literacy'
}

export enum EnglishTool {
  Story = 'Story Generator',
  Vocabulary = 'Vocabulary Builder',
  Grammar = 'Grammar Checker',
  Analysis = 'Literary Analysis'
}

export interface SimulationState {
  description: string;
  choices: string[];
  is_final_state: boolean;
  imageUrl?: string;
}