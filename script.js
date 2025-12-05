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

      // Vowel sounds - these will be handled with proper harakah in context
      // These are for standalone vowels or initial vowels in words
      'a': 'ا',  // Alif for 'a' sound at word start
      'i': 'ي',  // Ya for 'i' sound at word start
      'u': 'و',  // Waw for 'u' sound at word start
      'e': ' ',   // 'e' sound (pepet) - will be handled with special harakah in context
      'o': 'و',  // 'o' often rendered as 'u' in Indonesian Pegon context

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

        // Set RTL direction and Arabic font for Pegon output
        this.pegonOutput.classList.add('arabic-text', 'pegon-text');
        this.pegonOutput.dir = 'rtl';
      }, 300);
    } catch (error) {
      console.error('Translation error:', error);
      this.pegonOutput.textContent = 'Terjadi kesalahan dalam penerjemahan. Silakan coba lagi.';
    }
  }

  // Convert Latin text to Pegon with context for pepet handling
  convertToPegon(text) {
    // First, handle word boundaries and apply special rules for consonant combinations
    let result = text.toLowerCase();

    // Apply special rules that handle context (like 'ng', 'ny' before vowels)
    // This replaces patterns like 'ny' followed by vowels with 'ڽ'
    this.specialRules.forEach(rule => {
      result = result.replace(rule.pattern, rule.replacement);
    });

    // Apply character-by-character conversion
    // We'll process the text in a way that handles both single and multi-character patterns
    // We'll also keep track of where 'e' characters were originally located
    let output = '';
    let i = 0;

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
          if (singleChar === 'e') {
            // For 'e', we add a placeholder marker that will be handled in harakah
            output += 'E'; // Use 'E' as a temporary marker for 'e' positions
          } else {
            output += this.latinToPegonMap[singleChar];
          }
        } else {
          // Handle spaces, punctuation, and numbers properly
          if (singleChar === ' ') {
            output += ' '; // Space remains space
          } else if (/[0-9]/.test(singleChar)) {
            // Numbers remain as Latin digits
            output += singleChar;
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
          } else {
            output += singleChar; // Keep other characters as is
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
    } else {
      // Remove the temporary 'E' markers if harakah is disabled
      output = output.replace(/E/g, '');
    }

    return output;
  }

  // Format words to follow Pegon conventions
  formatWords(text) {
    // Handle multiple spaces
    return text.replace(/\s+/g, ' ');
  }

  // Add harakah (diacritics) to Pegon text - with pepet support
  addHarakah(text) {
    // In proper Arabic/Pegon script, harakah are diacritics added to consonants
    // to indicate short vowels
    
    // Fatha ( َ ) - short 'a' sound
    // Kasra ( ِ ) - short 'i' sound  
    // Damma ( ُ ) - short 'u' sound
    // Pepet ( ۤ ) - short 'e' sound in Pegon script  
    // Sukun ( ْ ) - absence of vowel sound

    // Apply harakah rules in proper order

    // First, handle general vowel rules (before handling 'e' markers)
    // For consonant followed by 'a' sound:
    text = text.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)ا/g, '$1َا');  // consonant with fatha + alif
    
    // For consonant followed by 'i' sound:
    text = text.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)ي/g, '$1ِي');  // consonant with kasra + ya
    
    // For consonant followed by 'u' sound:
    text = text.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)و/g, '$1ُو');  // consonant with damma + waw
    
    // Handle consonant + 'E' pattern for 'e' (pepet) sound
    // This should replace 'E' that appears after consonants with pepet
    text = text.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)([E])/g, '$1ۤ');
    
    // Handle any remaining 'E' markers by replacing them with pepet
    text = text.replace(/[E]/g, 'ۤ');
    
    // For standalone consonants (not followed by vowels), add sukun
    // This should be done after all other vowel processing
    text = text.replace(/(ب|ت|س|ج|ه|ك|ل|م|ن|ڤ|ر|ف|ق|ݢ|ڠ|ڽ|چ|خ|ش|ث|ذ|ز|ض|ظ|غ|ع|ح|ص|د)(?=\s|\.|,|;|:|!|\?|،|؟|۔|$|[^ا-ي])/g, '$1ْ');

    return text;
  }

  // Handle proper vowel patterns in Pegon
  handleVowelPatterns(text) {
    // This function is maintained for compatibility
    return text;
  }

  clearInput() {
    this.latinInput.value = '';
    this.latinInput.focus();
    this.updateCharacterCount();
  }

  clearOutput() {
    this.pegonOutput.textContent = '';
    this.pegonOutput.dir = '';
    this.pegonOutput.classList.remove('arabic-text', 'pegon-text');
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