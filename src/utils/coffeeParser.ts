// Coffee name parser to extract origin, variety, and process information

interface ParsedCoffeeInfo {
  origin?: string;
  variety?: string;
  process?: string;
}

// Define patterns for each category
const ORIGINS = {
  // Korean names
  '에티오피아': 'Ethiopia',
  '에디오피아': 'Ethiopia',
  '콜롬비아': 'Colombia',
  '콜럼비아': 'Colombia',
  '브라질': 'Brazil',
  '브라질리아': 'Brazil',
  '케냐': 'Kenya',
  '케니아': 'Kenya',
  '과테말라': 'Guatemala',
  '코스타리카': 'Costa Rica',
  '파나마': 'Panama',
  '온두라스': 'Honduras',
  '엘살바도르': 'El Salvador',
  '니카라과': 'Nicaragua',
  '페루': 'Peru',
  '멕시코': 'Mexico',
  '하와이': 'Hawaii',
  '자메이카': 'Jamaica',
  '인도': 'India',
  '인도네시아': 'Indonesia',
  '베트남': 'Vietnam',
  '탄자니아': 'Tanzania',
  '르완다': 'Rwanda',
  '부룬디': 'Burundi',
  '예멘': 'Yemen',
  
  // English names (already normalized)
  'ethiopia': 'Ethiopia',
  'colombia': 'Colombia',
  'brazil': 'Brazil',
  'kenya': 'Kenya',
  'guatemala': 'Guatemala',
  'costa rica': 'Costa Rica',
  'panama': 'Panama',
  'honduras': 'Honduras',
  'el salvador': 'El Salvador',
  'nicaragua': 'Nicaragua',
  'peru': 'Peru',
  'mexico': 'Mexico',
  'hawaii': 'Hawaii',
  'jamaica': 'Jamaica',
  'india': 'India',
  'indonesia': 'Indonesia',
  'vietnam': 'Vietnam',
  'tanzania': 'Tanzania',
  'rwanda': 'Rwanda',
  'burundi': 'Burundi',
  'yemen': 'Yemen',
  
  // Sub-regions that imply countries
  '예가체프': 'Ethiopia',
  'yirgacheffe': 'Ethiopia',
  '시다모': 'Ethiopia',
  'sidamo': 'Ethiopia',
  '하라': 'Ethiopia',
  'harar': 'Ethiopia',
  '안티구아': 'Guatemala',
  'antigua': 'Guatemala',
  '타라주': 'Costa Rica',
  'tarrazu': 'Costa Rica',
  '코나': 'Hawaii',
  'kona': 'Hawaii',
  '블루마운틴': 'Jamaica',
  'blue mountain': 'Jamaica',
};

const VARIETIES = {
  // Korean names
  '게이샤': 'Geisha',
  '게샤': 'Geisha',
  '부르봉': 'Bourbon',
  '버번': 'Bourbon',
  '카투라': 'Caturra',
  '카투아이': 'Catuai',
  '티피카': 'Typica',
  '문도노보': 'Mundo Novo',
  '마라고지페': 'Maragogipe',
  '파카스': 'Pacas',
  '파카마라': 'Pacamara',
  '비야사르치': 'Villa Sarchi',
  
  // English names (already normalized)
  'geisha': 'Geisha',
  'gesha': 'Geisha',
  'bourbon': 'Bourbon',
  'caturra': 'Caturra',
  'catuai': 'Catuai',
  'typica': 'Typica',
  'sl28': 'SL28',
  'sl34': 'SL34',
  'sl-28': 'SL28',
  'sl-34': 'SL34',
  'mundo novo': 'Mundo Novo',
  'maragogipe': 'Maragogipe',
  'pacas': 'Pacas',
  'pacamara': 'Pacamara',
  'villa sarchi': 'Villa Sarchi',
  'kent': 'Kent',
  'castillo': 'Castillo',
  'variedad colombia': 'Variedad Colombia',
  'java': 'Java',
  's795': 'S795',
  'ruiru': 'Ruiru 11',
  'batian': 'Batian',
  'heirloom': 'Heirloom',
};

const PROCESSES = {
  // Korean names
  '워시드': 'Washed',
  '워시': 'Washed',
  '수세식': 'Washed',
  '내추럴': 'Natural',
  '내츄럴': 'Natural',
  '건식': 'Natural',
  '허니': 'Honey',
  '하니': 'Honey',
  '펄프드내추럴': 'Pulped Natural',
  '펄프드': 'Pulped Natural',
  '애너로빅': 'Anaerobic',
  '애너로빅': 'Anaerobic',
  '세미워시드': 'Semi-washed',
  '세미워시': 'Semi-washed',
  '습식': 'Wet',
  '웻': 'Wet',
  '카보닉': 'Carbonic',
  '더블퍼멘테이션': 'Double Fermentation',
  '더블퍼멘티드': 'Double Fermentation',
  
  // English names (already normalized)
  'washed': 'Washed',
  'wash': 'Washed',
  'fully washed': 'Washed',
  'natural': 'Natural',
  'dry': 'Natural',
  'honey': 'Honey',
  'pulped natural': 'Pulped Natural',
  'anaerobic': 'Anaerobic',
  'semi-washed': 'Semi-washed',
  'semi washed': 'Semi-washed',
  'wet': 'Wet',
  'wet hulled': 'Wet Hulled',
  'carbonic': 'Carbonic',
  'carbonic maceration': 'Carbonic Maceration',
  'double fermentation': 'Double Fermentation',
  'double fermented': 'Double Fermentation',
  'experimental': 'Experimental',
  
  // Honey variations
  'yellow honey': 'Yellow Honey',
  'red honey': 'Red Honey',
  'black honey': 'Black Honey',
  'white honey': 'White Honey',
  '옐로우허니': 'Yellow Honey',
  '레드허니': 'Red Honey',
  '블랙허니': 'Black Honey',
  '화이트허니': 'White Honey',
};

// Check if the coffee name indicates a blend
function isBlend(coffeeName: string): boolean {
  const lowerName = coffeeName.toLowerCase();
  return lowerName.includes('블렌드') || 
         lowerName.includes('블랜드') || 
         lowerName.includes('blend');
}

// Extract multiple origins from blend names
function extractBlendOrigins(coffeeName: string): string | undefined {
  const lowerName = coffeeName.toLowerCase();
  
  // Check for percentage patterns (e.g., "브라질 70% 콜롬비아 30%")
  if (/%/.test(coffeeName)) {
    return coffeeName;
  }
  
  // Check for & or + patterns
  const multiOriginPattern = /([가-힣a-zA-Z\s]+)[&+,]\s*([가-힣a-zA-Z\s]+)/;
  const match = coffeeName.match(multiOriginPattern);
  
  if (match) {
    const origins: string[] = [];
    
    // Try to normalize each part
    const part1 = match[1].trim();
    const part2 = match[2].trim();
    
    // Check if parts are known origins
    for (const [pattern, value] of Object.entries(ORIGINS)) {
      if (part1.toLowerCase().includes(pattern.toLowerCase())) {
        origins.push(value);
        break;
      }
    }
    
    for (const [pattern, value] of Object.entries(ORIGINS)) {
      if (part2.toLowerCase().includes(pattern.toLowerCase())) {
        origins.push(value);
        break;
      }
    }
    
    // If we found normalized origins, use them; otherwise use original text
    if (origins.length > 0) {
      return origins.join(', ');
    }
    
    // Return original text if no normalization possible
    return `${part1}, ${part2}`;
  }
  
  return undefined;
}

export function parseCoffeeName(coffeeName: string): ParsedCoffeeInfo {
  if (!coffeeName || coffeeName.trim().length === 0) {
    return {};
  }

  const result: ParsedCoffeeInfo = {};
  const lowerName = coffeeName.toLowerCase();
  const tokens = lowerName.split(/\s+/);

  // Check if it's a blend first
  if (isBlend(coffeeName)) {
    // Try to extract multiple origins
    const blendOrigins = extractBlendOrigins(coffeeName);
    
    if (blendOrigins) {
      result.origin = blendOrigins;
    } else {
      // Default blend origin
      result.origin = '블렌드';
    }
    
    // For blends, we typically don't set variety
    // But we can still try to parse process
    
    // Try to find process
    for (const [pattern, value] of Object.entries(PROCESSES)) {
      if (lowerName.includes(pattern.toLowerCase())) {
        result.process = value;
        break;
      }
    }
    
    return result;
  }

  // Regular (non-blend) parsing continues here
  // Try to find origin
  // Check full string first for multi-word origins
  for (const [pattern, value] of Object.entries(ORIGINS)) {
    if (lowerName.includes(pattern.toLowerCase())) {
      result.origin = value;
      break;
    }
  }

  // If no origin found, check individual tokens
  if (!result.origin) {
    for (const token of tokens) {
      const origin = ORIGINS[token];
      if (origin) {
        result.origin = origin;
        break;
      }
    }
  }

  // Try to find variety
  // Check full string first for multi-word varieties
  for (const [pattern, value] of Object.entries(VARIETIES)) {
    if (lowerName.includes(pattern.toLowerCase())) {
      result.variety = value;
      break;
    }
  }

  // If no variety found, check individual tokens
  if (!result.variety) {
    for (const token of tokens) {
      const variety = VARIETIES[token];
      if (variety) {
        result.variety = variety;
        break;
      }
    }
  }

  // Try to find process
  // Check full string first for multi-word processes
  for (const [pattern, value] of Object.entries(PROCESSES)) {
    if (lowerName.includes(pattern.toLowerCase())) {
      result.process = value;
      break;
    }
  }

  // If no process found, check individual tokens
  if (!result.process) {
    for (const token of tokens) {
      const process = PROCESSES[token];
      if (process) {
        result.process = process;
        break;
      }
    }
  }

  // Special handling for common patterns
  // G1, G2, etc. are grade indicators often used with Ethiopian coffees
  if (!result.origin && /\bg[1-4]\b/i.test(coffeeName)) {
    // If we see G1, G2, etc., and no origin is detected, it might be Ethiopian
    if (lowerName.includes('g1') || lowerName.includes('g2')) {
      // Only set if there's some indication it might be Ethiopian
      if (lowerName.includes('예가') || lowerName.includes('시다') || 
          lowerName.includes('yirg') || lowerName.includes('sida')) {
        result.origin = 'Ethiopia';
      }
    }
  }

  return result;
}

// Export for testing purposes
export const patterns = {
  ORIGINS,
  VARIETIES,
  PROCESSES,
};