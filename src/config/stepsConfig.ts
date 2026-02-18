export interface StepConfig {
  id: string;
  label: string;
  route: string;
}

export const stepsConfig: StepConfig[] = [
  { id: "tamanho", label: "Tamanho", route: "tamanho" },
  { id: "cores", label: "Cores", route: "cores" },
  { id: "upload", label: "Fotografia", route: "upload" },
];
