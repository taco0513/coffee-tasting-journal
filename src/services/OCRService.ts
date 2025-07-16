import { NativeModules, Platform } from 'react-native';

interface OCRResult {
  text: string;
  confidence: number;
}

interface ParsedCoffeeInfo {
  coffeeName?: string;
  roastery?: string;
  origin?: string;
  variety?: string;
  process?: string;
  altitude?: string;
}

class OCRService {
  private static instance: OCRService;
  
  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async recognizeText(imagePath: string): Promise<OCRResult> {
    try {
      if (Platform.OS === 'ios') {
        const result = await NativeModules.VisionTextRecognition.recognizeText(imagePath);
        return {
          text: result.text || '',
          confidence: result.confidence || 0
        };
      } else {
        // For Android, we would implement ML Kit Text Recognition
        // For now, return empty result
        return { text: '', confidence: 0 };
      }
    } catch (error) {
      console.error('OCR Text Recognition Error:', error);
      return { text: '', confidence: 0 };
    }
  }

  parseCoffeeInfo(text: string): ParsedCoffeeInfo {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const result: ParsedCoffeeInfo = {};

    // Common roastery patterns
    const roasteryPatterns = [
      /roastery[:\s]*([^,\n]+)/i,
      /roasted\s+by[:\s]*([^,\n]+)/i,
      /로스터리[:\s]*([^,\n]+)/i,
      /로스팅[:\s]*([^,\n]+)/i,
    ];

    // Origin patterns
    const originPatterns = [
      /origin[:\s]*([^,\n]+)/i,
      /from[:\s]*([^,\n]+)/i,
      /생산지[:\s]*([^,\n]+)/i,
      /원산지[:\s]*([^,\n]+)/i,
      /(ethiopia|ethiopian|brazil|brazilian|colombia|colombian|guatemala|guatemalan|kenya|kenyan|costa rica|panama|jamaica|hawaii|yemen|peru|bolivia|ecuador|honduras|nicaragua|el salvador|myanmar|indonesia|vietnam|india|china|taiwan|thailand|philippines|papua new guinea|australia|rwanda|burundi|tanzania|uganda|malawi|zambia|zimbabwe|cameroon|ivory coast|madagascar|reunion|mauritius|st helena)/i,
    ];

    // Variety patterns
    const varietyPatterns = [
      /variety[:\s]*([^,\n]+)/i,
      /varietal[:\s]*([^,\n]+)/i,
      /품종[:\s]*([^,\n]+)/i,
      /(bourbon|typica|caturra|catuai|mundo novo|geisha|gesha|pacamara|maragogype|java|mokka|heirloom|sl28|sl34|ruiru|batian|kent|catimor|sarchimor|villa sarchi|tekisic|acaia|yellow bourbon|red bourbon|pink bourbon|laurina|eugenioides|liberica|excelsa)/i,
    ];

    // Process patterns
    const processPatterns = [
      /process[:\s]*([^,\n]+)/i,
      /processing[:\s]*([^,\n]+)/i,
      /method[:\s]*([^,\n]+)/i,
      /가공[:\s]*([^,\n]+)/i,
      /처리[:\s]*([^,\n]+)/i,
      /(washed|natural|honey|semi-washed|wet-hulled|anaerobic|carbonic|pulped natural|black honey|yellow honey|red honey|white honey|fermented|extended fermentation|워시드|내추럴|허니|세미워시드|펄프드|발효)/i,
    ];

    // Altitude patterns
    const altitudePatterns = [
      /altitude[:\s]*([^,\n]+)/i,
      /elevation[:\s]*([^,\n]+)/i,
      /고도[:\s]*([^,\n]+)/i,
      /(\d+\s*[-~]\s*\d+\s*m)/i,
      /(\d+\s*m)/i,
      /(\d+\s*[-~]\s*\d+\s*ft)/i,
      /(\d+\s*ft)/i,
    ];

    // Process each line
    for (const line of lines) {
      // Try to match roastery
      if (!result.roastery) {
        for (const pattern of roasteryPatterns) {
          const match = line.match(pattern);
          if (match) {
            result.roastery = match[1].trim();
            break;
          }
        }
      }

      // Try to match origin
      if (!result.origin) {
        for (const pattern of originPatterns) {
          const match = line.match(pattern);
          if (match) {
            result.origin = match[1].trim();
            break;
          }
        }
      }

      // Try to match variety
      if (!result.variety) {
        for (const pattern of varietyPatterns) {
          const match = line.match(pattern);
          if (match) {
            result.variety = match[1].trim();
            break;
          }
        }
      }

      // Try to match process
      if (!result.process) {
        for (const pattern of processPatterns) {
          const match = line.match(pattern);
          if (match) {
            result.process = match[1].trim();
            break;
          }
        }
      }

      // Try to match altitude
      if (!result.altitude) {
        for (const pattern of altitudePatterns) {
          const match = line.match(pattern);
          if (match) {
            result.altitude = match[1].trim();
            break;
          }
        }
      }
    }

    // Try to infer coffee name (usually the longest line or first line that's not matched)
    if (!result.coffeeName) {
      for (const line of lines) {
        // Skip lines that look like they contain other info
        if (line.toLowerCase().includes('roastery') || 
            line.toLowerCase().includes('origin') || 
            line.toLowerCase().includes('variety') ||
            line.toLowerCase().includes('process') ||
            line.toLowerCase().includes('altitude') ||
            line.toLowerCase().includes('로스터리') ||
            line.toLowerCase().includes('생산지') ||
            line.toLowerCase().includes('품종') ||
            line.toLowerCase().includes('가공') ||
            line.toLowerCase().includes('고도')) {
          continue;
        }
        
        // Look for lines that might be coffee names
        if (line.length > 3 && line.length < 100) {
          result.coffeeName = line;
          break;
        }
      }
    }

    return result;
  }

  // Clean up extracted text
  private cleanText(text: string): string {
    return text
      .replace(/[^\w\s가-힣]/g, ' ') // Keep only alphanumeric, spaces, and Korean characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Validate extracted information
  validateExtractedInfo(info: ParsedCoffeeInfo): ParsedCoffeeInfo {
    const validated: ParsedCoffeeInfo = {};

    // Validate coffee name
    if (info.coffeeName && info.coffeeName.length > 2 && info.coffeeName.length < 100) {
      validated.coffeeName = this.cleanText(info.coffeeName);
    }

    // Validate roastery
    if (info.roastery && info.roastery.length > 2 && info.roastery.length < 50) {
      validated.roastery = this.cleanText(info.roastery);
    }

    // Validate origin
    if (info.origin && info.origin.length > 2 && info.origin.length < 50) {
      validated.origin = this.cleanText(info.origin);
    }

    // Validate variety
    if (info.variety && info.variety.length > 2 && info.variety.length < 30) {
      validated.variety = this.cleanText(info.variety);
    }

    // Validate process
    if (info.process && info.process.length > 2 && info.process.length < 30) {
      validated.process = this.cleanText(info.process);
    }

    // Validate altitude
    if (info.altitude && info.altitude.length > 1 && info.altitude.length < 20) {
      validated.altitude = this.cleanText(info.altitude);
    }

    return validated;
  }
}

export default OCRService;
export type { OCRResult, ParsedCoffeeInfo };