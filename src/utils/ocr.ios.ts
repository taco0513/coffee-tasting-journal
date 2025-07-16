import { NativeModules } from 'react-native';

const { OCRModule } = NativeModules;

export const recognizeText = async (imagePath: string): Promise<string[]> => {
  try {
    if (!OCRModule) {
      console.error('OCRModule을 찾을 수 없습니다');
      return [];
    }
    
    console.log('Native OCR 시작:', imagePath);
    const texts = await OCRModule.recognizeText(imagePath);
    console.log('Native OCR 결과:', texts);
    
    return texts;
  } catch (error) {
    console.error('OCR 에러:', error);
    return [];
  }
};