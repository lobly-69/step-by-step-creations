export interface StepConfig {
  id: string;
  label: string;
  route: string;
}

export const stepsConfig: StepConfig[] = [
  { id: "personalizacao", label: "Personalização", route: "personalizacao" },
  { id: "upload", label: "Fotografia", route: "upload" },
];
