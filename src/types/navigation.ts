export type RootStackParamList = {
    Home: undefined;
    HomeMain: undefined;
    CoffeeInfo: { ocrText?: string } | undefined;
    OCRScan: undefined;
    OCRResult: { parsedInfo: any; rawTexts: string[] };
    RoasterNotes: undefined;
    FlavorLevel1: undefined;
    FlavorLevel2: undefined;
    FlavorLevel3: undefined;
    FlavorLevel4: undefined;
    Sensory: undefined;
    Result: undefined;
    TastingDetail: { tastingId: string };
    Stats: undefined;
  };