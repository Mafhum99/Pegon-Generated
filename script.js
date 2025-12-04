// Bidirectional Latin ↔ Pegon Translator - JavaScript ES6 Implementation

class PegonTranslator {
  constructor() {
    // Latin to Pegon conversion mapping
    this.latinToPegonMap = {
      // Basic consonants (vowels will be handled with diacritics when needed)
      'b': 'ب',
      't': 'ت',
      's': 'س',
      'j': 'ج',
      'h': 'ه',
      'k': 'ك',
      'l': 'ل',
      'm': 'م',
      'n': 'ن',
      'p': 'ڤ',
      'r': 'ر',
      'w': 'و',
      'y': 'ي',
      'f': 'ف',
      'v': 'ڤ', // 'v' is typically rendered as 'p' in Indonesian
      'q': 'ق',
      'g': 'ݢ', // Using the Javanese-specific g character
      'd': 'د', // Adding 'd' which was missing and likely causing issues
      'c': 'چ', // Adding 'c' which might be needed

      // Doubled consonants (with shadda)
      'bb': 'بّ',
      'tt': 'تّ',
      'dd': 'دّ',
      'cc': 'چّ',
      'jj': 'جّ',
      'hh': 'هّ',
      'kk': 'كّ',
      'll': 'لّ',
      'mm': 'مّ',
      'nn': 'نّ',
      'pp': 'ڤّ',
      'rr': 'رّ',
      'ss': 'سّ',
      'ff': 'فّ',
      'gg': 'ݢّ',

      // Consonant combinations
      'ch': 'چ',
      'ny': 'ڽ',
      'ng': 'ڠ', // This is the Indonesian/ng character
      'kh': 'خ',
      'sy': 'ش',
      'th': 'ث',
      'dh': 'ذ',
      'zh': 'ز',
      'dz': 'ز',

      // Vowel sounds - these should be handled as diacritics in proper context
      // but we'll include them for cases where they appear standalone
      'a': 'ا',
      'i': 'ي',
      'u': 'و',
      'e': 'ا',
      'o': 'و',

      // Numbers (Eastern Arabic/Pegon numerals)
      '0': '٠',
      '1': '١',
      '2': '٢',
      '3': '٣',
      '4': '٤',
      '5': '٥',
      '6': '٦',
      '7': '٧',
      '8': '٨',
      '9': '٩',

      // Additional combinations that might appear in Indonesian
      'ai': 'اي',
      'au': 'اُو', // or 'اُو' - depends on context
      'oi': 'وِي',

      // Capital letters
      'B': 'ب',
      'T': 'ت',
      'S': 'س',
      'J': 'ج',
      'H': 'ه',
      'K': 'ك',
      'L': 'ل',
      'M': 'م',
      'N': 'ن',
      'P': 'ڤ',
      'R': 'ر',
      'W': 'و',
      'Y': 'ي',
      'F': 'ف',
      'V': 'ڤ',
      'Q': 'ق',
      'G': 'ݢ',
      'D': 'د', // Adding capital D
      'C': 'چ', // Adding capital C

      // Additional capital combinations
      'CH': 'چ',
      'NY': 'ڽ',
      'NG': 'ڠ',
      'KH': 'خ',
      'SY': 'ش',
      'TH': 'ث',
      'DH': 'ذ',
      'ZH': 'ز',
      'DZ': 'ز',
    };

    // Additional special mappings for proper conversion
    this.specialRules = [
      { pattern: /ng(?=[aeiou])/g, replacement: 'ڠ' },
      { pattern: /ny(?=[aeiou])/g, replacement: 'ڽ' },
      { pattern: /sy(?=[aeiou])/g, replacement: 'ش' },
      { pattern: /kh(?=[aeiou])/g, replacement: 'خ' },
      { pattern: /ch(?=[aeiou])/g, replacement: 'چ' },
      { pattern: /dz(?=[aeiou])/g, replacement: 'ز' },
      { pattern: /th(?=[aeiou])/g, replacement: 'ث' },
      { pattern: /dh(?=[aeiou])/g, replacement: 'ذ' },
      { pattern: /gh(?=[aeiou])/g, replacement: 'غ' },
      { pattern: /ph(?=[aeiou])/g, replacement: 'ف' },
    ];

    // Common phrases for quick translation
    this.commonPhrases = [
      { latin: 'Saya sedang belajar', pegon: 'ساي سدڠ بلجر' },
      { latin: 'Apa kabar?', pegon: 'اڤا كابار؟' },
      { latin: 'Terima kasih', pegon: 'تريما كاسيه' },
      { latin: 'Selamat pagi', pegon: 'سلاamt ڤڬي' },
      { latin: 'Bagaimana kabarmu?', pegon: 'بڬيمان كابرمو؟' }
    ];

    this.showHarakah = false; // Whether to show harakah/diacritics
    this.init();
  }

  init() {
    // Initialize DOM elements
    this.latinInput = document.getElementById('latin-input');
    this.pegonOutput = document.getElementById('pegon-output');
    this.translateBtn = document.getElementById('translate-btn');
    this.clearInputBtn = document.getElementById('clear-input');
    this.clearOutputBtn = document.getElementById('clear-output');
    this.copyOutputBtn = document.getElementById('copy-output');
    this.harakahToggle = document.getElementById('harakah-toggle');
    this.autoTranslateCheckbox = document.getElementById('auto-translate');

    // Set up event listeners
    this.translateBtn.addEventListener('click', () => this.translate());
    this.clearInputBtn.addEventListener('click', () => this.clearInput());
    this.clearOutputBtn.addEventListener('click', () => this.clearOutput());
    this.copyOutputBtn.addEventListener('click', () => this.copyToClipboard());
    this.harakahToggle.addEventListener('change', (e) => {
      this.showHarakah = e.target.checked;
      // Re-translate to apply harakah changes if there's content
      if (this.pegonOutput.textContent && !this.pegonOutput.textContent.includes('Silakan')) {
        this.translate();
      }
    });

    // Also translate when pressing Enter (but not Shift+Enter)
    this.latinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.translate();
      }
    });

    // Update character count as user types
    this.latinInput.addEventListener('input', () => this.updateCharacterCount());

    // Auto-translate option (default to checked)
    this.setupAutoTranslate();
  }

  // Check if text contains Arabic/Pegon script
  containsArabicScript(text) {
    // Check if the text contains Arabic characters (including Pegon extensions)
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  }

  // Setup auto-translate option
  setupAutoTranslate() {
    // Add event listener for auto-translate
    const autoTranslateCheckbox = document.getElementById('auto-translate');
    if (autoTranslateCheckbox) {
      autoTranslateCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.latinInput.addEventListener('input', this.debounce(() => this.translate(), 1000));
        } else {
          this.latinInput.removeEventListener('input', this.debounce(() => this.translate(), 1000));
        }
      });
    }
  }

  // Debounce function to limit translation calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Update character count
  updateCharacterCount() {
    const count = this.latinInput.value.length;

    // Create or update character counter element
    let counterElement = document.getElementById('char-counter');
    if (!counterElement) {
      counterElement = document.createElement('div');
      counterElement.id = 'char-counter';
      counterElement.className = 'char-counter';

      // Insert after the textarea
      this.latinInput.parentNode.insertBefore(counterElement, this.latinInput.nextSibling);
    }

    counterElement.textContent = `${count} karakter`;
  }

  // Main translation method - Latin to Pegon only
  translate() {
    const inputText = this.latinInput.value.trim();
    if (!inputText) {
      this.pegonOutput.textContent = 'Silakan masukkan teks untuk diterjemahkan.';
      return;
    }

    try {
      // Show loading state
      this.pegonOutput.innerHTML = '<span class="loading"></span> Menterjemahkan...';

      // Convert to lowercase to ensure consistent translations regardless of case
      const normalizedText = inputText.toLowerCase();

      // Perform translation after a short delay to show loading
      setTimeout(() => {
        const convertedText = this.convertToPegon(normalizedText);

        this.pegonOutput.textContent = convertedText;

        // Set RTL direction for Pegon output
        this.pegonOutput.style.direction = 'rtl';
        this.pegonOutput.style.textAlign = 'right';
      }, 300);
    } catch (error) {
      console.error('Translation error:', error);
      this.pegonOutput.textContent = 'Terjadi kesalahan dalam penerjemahan. Silakan coba lagi.';
    }
  }

  // Convert Latin text to Pegon
  convertToPegon(text) {
    // First, handle word boundaries and apply special rules
    let result = text;

    // Apply special rules that handle context (like 'ng', 'ny' before vowels)
    this.specialRules.forEach(rule => {
      result = result.replace(rule.pattern, rule.replacement);
    });

    // Apply character-by-character conversion
    // We'll process the text in a way that handles both single and multi-character patterns
    let output = '';
    let i = 0;

    // Keep track of consonant/vowel patterns to avoid issues like "dan" -> "دان"
    let consonantPattern = '';

    while (i < result.length) {
      let found = false;

      // Check for 3-character patterns first (longest first to avoid partial matches)
      if (i < result.length - 2) {
        const threeChar = result.substring(i, i + 3);
        if (this.latinToPegonMap[threeChar]) {
          output += this.latinToPegonMap[threeChar];
          i += 3;
          found = true;
        }
      }

      // Check for 2-character patterns (like 'ng', 'ny', etc.)
      if (!found && i < result.length - 1) {
        const twoChar = result.substring(i, i + 2);
        if (this.latinToPegonMap[twoChar]) {
          output += this.latinToPegonMap[twoChar];
          i += 2;
          found = true;
        }
      }

      // If no multi-char match, check single character
      if (!found) {
        const singleChar = result[i];
        if (this.latinToPegonMap[singleChar]) {
          output += this.latinToPegonMap[singleChar];

          // Track consonant/vowel for context
          if (/[aeiou]/.test(singleChar)) {
            consonantPattern += 'V'; // vowel
          } else if (/[bcdfghjklmnpqrstvwxyz]/.test(singleChar)) {
            consonantPattern += 'C'; // consonant
          } else {
            consonantPattern += singleChar; // space, punctuation, numbers
          }
        } else {
          // Keep the original character if no mapping exists
          // But handle spaces, punctuation, and numbers properly
          if (singleChar === ' ') {
            output += ' '; // Space remains space
            consonantPattern += ' '; // Add space to pattern too
          } else if (/[0-9]/.test(singleChar)) {
            // Numbers remain as Latin digits
            output += singleChar;
            consonantPattern += singleChar; // Keep numbers in pattern
          } else if (/[.,!?;:()\-'"[\]/\\]/.test(singleChar)) {
            // Punctuation marks - use corresponding Arabic punctuation if needed
            const punctMap = {
              '.': '۔',
              ',': '،',
              '?': '؟',
              '!': '!',
              ';': '؛',
              '(': '(',
              ')': ')',
              '[': '[',
              ']': ']',
              '-': '-',
              '"': '"',
              "'": "'",
              ':': ':',
              '/': '/',
              '\\': '\\',
              '_': '_',
              '@': '@',
              '#': '#',
              '$': '$',
              '%': '%',
              '&': '&',
              '*': '*',
              '+': '+',
              '=': '=',
              '<': '<',
              '>': '>'
            };
            output += punctMap[singleChar] || singleChar;
            consonantPattern += singleChar; // Keep punctuation in pattern
          } else {
            output += singleChar; // Keep other characters as is
            consonantPattern += singleChar; // Keep in pattern
          }
        }
        i++;
      }
    }

    // Handle vowel patterns after consonant conversion - but carefully
    output = this.handleVowelPatterns(output);

    // Apply word-level formatting
    output = this.formatWords(output);

    // Add harakah (diacritics) if enabled
    if (this.showHarakah) {
      output = this.addHarakah(output);
    }

    return output;
  }

  // Format words to follow Pegon conventions
  formatWords(text) {
    // In Pegon, words are typically written connected without spaces
    // Though in our implementation we might want to keep word boundaries for readability
    // For now, we'll just clean up any potential formatting issues

    // Handle multiple spaces
    return text.replace(/\s+/g, ' ');
  }

  // Add harakah (diacritics) to Pegon text
  addHarakah(text) {
    // For proper harakah implementation, we need to go back to the original context
    // and apply harakah based on the vowel sounds that were in the original Latin text
    // Also add sukun ( ْ ) for consonants not followed by vowels in proper contexts

    // Create a copy of the text to work with
    let result = text;

    // Replace patterns systematically:
    // When we have a consonant followed by what was originally a vowel letter,
    // we add the appropriate harakah to the consonant and adjust the vowel letter

    // Pattern 1: Consonant followed by 'ا' (alif) representing an 'a' sound
    // This should become consonant + fatha + alif
    result = result.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)(ا)(?=\s|\.|,|;|:|!|\?|،|؟|۔|$|[^ا-ي])/g, '$1َا');
    result = result.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)(ا)(?=[ب-ي])/g, '$1َا');

    // Pattern 2: Consonant followed by 'ي' (ya) representing an 'i' sound
    // This should become consonant + kasra + ya
    result = result.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)(ي)(?=\s|\.|,|;|:|!|\?|،|؟|۔|$|[^ا-ي])/g, '$1ِي');
    result = result.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)(ي)(?=[ب-ي])/g, '$1ِي');

    // Pattern 3: Consonant followed by 'و' (wawu) representing a 'u' sound
    // This should become consonant + damma + wawu
    result = result.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)(و)(?=\s|\.|,|;|:|!|\?|،|؟|۔|$|[^ا-ي])/g, '$1ُو');
    result = result.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)(و)(?=[ب-ي])/g, '$1ُو');

    // Add sukun ( ْ ) to consonants that are not followed by vowels and not at word end
    // Only when followed by another consonant and not already marked with other harakah
    result = result.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)(?=[ب-ي])(?![َُِّايو])(?!\s|\.|,|;|:|!|\?|،|؟|۔|$)/g, '$1ْ');

    return result;
  }

  // Handle proper vowel patterns in Pegon
  handleVowelPatterns(text) {
    // In Pegon, vowels are often marked with diacritics or use specific letters
    // We'll apply rules to make the output more accurate

    // The issue was that standalone 'a', 'i', 'u' were being converted to alif, ya, wawu
    // which caused problems like "dan" becoming "دaن" and then "dan"
    // We should preserve vowels that are between consonants

    // For now, we'll keep this function minimal to prevent over-conversion
    // The main conversion should happen during the character mapping

    return text;
  }

  clearInput() {
    this.latinInput.value = '';
    this.latinInput.focus();
    this.updateCharacterCount();
  }

  clearOutput() {
    this.pegonOutput.textContent = '';
    this.pegonOutput.style.direction = '';
    this.pegonOutput.style.textAlign = '';
  }

  copyToClipboard() {
    const text = this.pegonOutput.textContent;
    if (!text || text.includes('Silakan masukkan')) return;

    navigator.clipboard.writeText(text)
      .then(() => {
        // Show feedback
        const originalText = this.copyOutputBtn.textContent;
        this.copyOutputBtn.textContent = 'Disalin!';
        setTimeout(() => {
          this.copyOutputBtn.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Gagal menyalin teks. Silakan pilih dan salin secara manual.');
      });
  }

  // Download translated text as file
  downloadTranslation() {
    const text = this.pegonOutput.textContent;
    if (!text || text.includes('Silakan masukkan')) {
      alert('Tidak ada teks untuk diunduh.');
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'terjemahan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Update auto-translate to use the checkbox element and ensure it works by default
  setupAutoTranslate() {
    // Check the auto-translate checkbox by default
    if (this.autoTranslateCheckbox) {
      this.autoTranslateCheckbox.checked = true;
      
      // Add event listener for auto-translate
      let autoTranslateTimeout;
      this.autoTranslateCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.latinInput.addEventListener('input', () => {
            clearTimeout(autoTranslateTimeout);
            autoTranslateTimeout = setTimeout(() => {
              this.translate();
            }, 1000);
          });
        } else {
          // Clear any pending timeout when auto-translate is disabled
          clearTimeout(autoTranslateTimeout);
        }
      });
      
      // Also trigger auto-translate by default since checkbox is checked
      if (this.autoTranslateCheckbox.checked) {
        this.latinInput.addEventListener('input', () => {
          clearTimeout(autoTranslateTimeout);
          autoTranslateTimeout = setTimeout(() => {
            this.translate();
          }, 1000);
        });
      }
    }
  }
}

// Initialize the translator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const translator = new PegonTranslator();

  // Add download button
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'btn secondary-btn';
  downloadBtn.id = 'download-output';
  downloadBtn.textContent = 'Unduh Teks';
  downloadBtn.addEventListener('click', () => translator.downloadTranslation());

  const outputControls = document.querySelector('.output-controls');
  if (outputControls) {
    outputControls.appendChild(downloadBtn);
  }
});