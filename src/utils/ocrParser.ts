export interface ParsedCoffeeInfo {
  roastery?: string;
  coffeeName?: string;
  origin?: string;
  variety?: string;
  process?: string;
  altitude?: string;
  roasterNotes?: string;
}

// OCR 오류 자동 수정 함수
const fixCommonOCRErrors = (text: string): string => {
  return text
    // 커피 품종 관련
    .replace(/sI(\d+)/g, 'SL$1')  // sI28 → SL28
    .replace(/sl(\d+)/g, 'SL$1')   // sl28 → SL28
    .replace(/SI(\d+)/g, 'SL$1')   // SI28 → SL28
    // 숫자/문자 혼동
    .replace(/O(\d)/g, '0$1')      // O4 → 04
    .replace(/(\d)O/g, '$10')      // 4O → 40
    .replace(/l(\d)/g, '1$1')      // l0 → 10
    // 공통 단어
    .replace(/STEROSCOPE/g, 'STEREOSCOPE')
    .replace(/Wash3d/g, 'Washed')
    .replace(/Natural1y/g, 'Naturally');
};

export const parseOCRResult = (texts: string[]): ParsedCoffeeInfo => {
  // 모든 텍스트에 자동 수정 적용
  const correctedTexts = texts.map(text => fixCommonOCRErrors(text));
  
  const result: ParsedCoffeeInfo = {};
  
  // 텍스트 배열을 하나의 문자열로 합치기
  const fullText = correctedTexts.join(' ');
  
  // 키워드 기반 파싱
  correctedTexts.forEach((text, index) => {
    const lowerText = text.toLowerCase();
    
    // Process 찾기
    if (lowerText === 'process' && correctedTexts[index + 1]) {
      result.process = correctedTexts[index + 1];
    }
    
    // Varietal/Variety 찾기
    if ((lowerText === 'varietal' || lowerText === 'variety') && correctedTexts[index + 1]) {
      result.variety = correctedTexts[index + 1];
    }
    
    // Region 찾기
    if (lowerText === 'region' && correctedTexts[index + 1]) {
      result.origin = correctedTexts[index + 1];
    }
    
    // 국가명 찾기 (대문자로만 이루어진 단어)
    if (text === text.toUpperCase() && text.length > 2 && !text.includes(',')) {
      // KENYA, ETHIOPIA 등
      if (!result.origin) {
        result.origin = text;
      } else if (!result.origin.includes(text)) {
        result.origin = text + ' / ' + result.origin;
      }
    }
    
    // 로스터리 찾기 (마지막 대문자 단어가 보통 로스터리)
    if (text === 'STEREOSCOPE' || text.includes('COFFEE') || text.includes('ROASTERS')) {
      result.roastery = text;
    }
  });
  
  // 커피 이름 찾기 (보통 2-3번째 줄)
  if (correctedTexts.length > 2) {
    // 숫자나 국가명이 아닌 첫 번째 긴 텍스트
    for (let i = 1; i < correctedTexts.length; i++) {
      const text = correctedTexts[i];
      if (text.length > 5 && 
          !text.match(/^\d+$/) && 
          text !== text.toUpperCase() &&
          !['Region', 'Process', 'Varietal', 'Variety'].includes(text)) {
        result.coffeeName = text;
        break;
      }
    }
  }
  
  // 컵노트 찾기 개선
  // 1. 콤마가 포함된 텍스트
  // 2. 과일, 향미 관련 키워드가 포함된 텍스트
  const flavorKeywords = ['fruit', 'berry', 'chocolate', 'caramel', 'nutty', 
                         'floral', 'citrus', 'sweet', 'creamy', 'cherry', 
                         'pineapple', 'passion'];
  
  const noteTexts = correctedTexts.filter(text => {
    const lowerText = text.toLowerCase();
    return text.includes(',') || 
           flavorKeywords.some(keyword => lowerText.includes(keyword));
  });
  
  if (noteTexts.length > 0) {
    // 콤마로 끝나는 텍스트는 다음 텍스트와 합치기
    let combinedNotes = '';
    for (let i = 0; i < noteTexts.length; i++) {
      if (noteTexts[i].endsWith(',') && i < noteTexts.length - 1) {
        combinedNotes += noteTexts[i] + ' ' + noteTexts[i + 1];
        i++; // 다음 텍스트 건너뛰기
      } else {
        combinedNotes += (combinedNotes ? ' ' : '') + noteTexts[i];
      }
    }
    result.roasterNotes = combinedNotes;
  }
  
  return result;
};