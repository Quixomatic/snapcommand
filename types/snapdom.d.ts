declare module "@zumer/snapdom" {
  export interface SnapdomResult {
    toPng(): Promise<{ src: string }>;
    toJpeg(quality?: number): Promise<{ src: string }>;
    toWebp(quality?: number): Promise<{ src: string }>;
  }

  export function snapdom(element: HTMLElement): Promise<SnapdomResult>;
}
