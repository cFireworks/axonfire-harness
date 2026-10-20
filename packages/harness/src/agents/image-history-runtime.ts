/** Explicit dependencies for native image interceptors, not a replacement blob codec. */
export type ImageHistoryRuntime = {
  blobService?: {
    storeFromDataUri(
      data: string,
      source?: string,
      originalFilename?: string,
    ): Promise<unknown>;
    resetImageTracking(): void;
    isImageBlobRef(value: unknown): boolean;
    trackImageDelivered(blobId: string, source?: string): void;
    processHistoryForApi(input: any[], retainRounds: number): Promise<any[]>;
  };
  imageUtils?: {
    getImageCompressionMaxDimension(): number;
    compressImage(data: string, maxDimension: number): Promise<string>;
  };
};
