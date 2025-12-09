// Bidirectional Latin ↔ Pegon Translator - JavaScript ES6 Implementation

class PegonTranslator {
  constructor() {
    // Latin to Pegon conversion mapping based on correct Pegon script rules
    this.latinToPegonMap = {
      // Basic consonants
      'b': 'ب', 't': 'ت', 'ṡ': 'ث', 'j': 'ج', 'c': 'چ', 'ḥ': 'ح', 
      'kh': 'خ', 'sh': 'ش', 'sy': 'ش', 'ṡy': 'ش', 'ṣ': 'ص', 'ḍ': 'ض', 'ṭ': 'ط', 'ẓ': 'ظ', 
      'dz': 'ذ',  // For 'dz' sound in Javanese/Malay
      '‘': 'ع', '’': 'ع',  // Both apostrophes map to ain
      'ġ': 'غ', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'g': 'ݢ', 'l': 'ل', 
      'm': 'م', 'n': 'ن', 'ny': 'ڽ', 'ng': 'ڠ', 'h': 'ه', 'w': 'و', 'y': 'ي', 
      'z': 'ز', 'r': 'ر', 's': 'س', 'd': 'د', 'v': 'ڤ', 'p': 'ڤ',
      
      // Vowel combinations in Pegon
      'ai': 'اي', 'au': 'اُو', 'ei': 'اِي', 'eu': 'اُي', 'oi': 'وِي',
      
      // Punctuation marks in Arabic/Pegon
      '.': '۔',  // Arabic full stop
      ',': '،',   // Arabic comma
      '?': '؟',   // Arabic question mark
      ';': '؛',   // Arabic semicolon
      '!': '!',   // Exclamation mark (kept as is)
      
      // Numbers in Eastern Arabic numerals
      '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤', 
      '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };

    // Consonant cluster handling rules - these should be applied after converting Latin to Arabic characters
    // We'll handle these in the conversion process instead of using regex on Latin characters
    this.clusterRules = [];
    


    // Syllable pattern rules for proper Pegon conversion
    this.syllablePatterns = [
      // Pattern for consonant+vowel combinations
      { pattern: /([ب-ي])([aiueo])/g, replacement: '$1$2' }, 
      // Pattern for final vowels
      { pattern: /([ب-ي])([aiueo])$/g, replacement: '$1$2' },
    ];

    // Common phrases for quick translation
    this.commonPhrases = [
      { latin: 'saya sedang belajar', pegon: 'ساي سدڠ بلجر' },
      { latin: 'apa kabar?', pegon: 'اڤا كابار؟' },
      { latin: 'terima kasih', pegon: 'تريما كاسيه' },
      { latin: 'selamat pagi', pegon: 'سلامت ڤڬي' },
      { latin: 'bagaimana kabarmu?', pegon: 'بڬيمان كابرمو؟' },
      { latin: 'assalamu\'alaikum', pegon: 'سلااموعلايكום' },
      { latin: 'mohon maaf', pegon: 'موهن ماف' },
      { latin: 'silakan duduk', pegon: 'سلاكن دودوق' }
    ];


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

    this.autoTranslateCheckbox = document.getElementById('auto-translate');


    // Set up event listeners
    this.translateBtn.addEventListener('click', () => this.translate());
    this.clearInputBtn.addEventListener('click', () => this.clearInput());
    this.clearOutputBtn.addEventListener('click', () => this.clearOutput());
    this.copyOutputBtn.addEventListener('click', () => this.copyToClipboard());




    // Also translate when pressing Enter (but not Shift+Enter)
    this.latinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.translate();
      }
    });

    // Update character count as user types
    this.latinInput.addEventListener('input', () => this.updateCharacterCount());

    // Set up quick phrase buttons
    this.setupQuickPhrases();

    // Auto-translate option (default to checked)
    this.setupAutoTranslate();
  }

  // Setup quick phrase buttons
  setupQuickPhrases() {
    const phraseButtons = document.querySelectorAll('.quick-phrases .btn[data-latin][data-pegon]');
    phraseButtons.forEach(button => {
      button.addEventListener('click', () => {
        const latin = button.getAttribute('data-latin');
        const pegon = button.getAttribute('data-pegon');
        this.fillExample(latin, pegon);
      });
    });
  }

  // Fill example text
  fillExample(latin, pegon) {
    this.latinInput.value = latin;
    this.pegonOutput.textContent = pegon;
    this.pegonOutput.classList.add('arabic-text', 'pegon-text');
    this.pegonOutput.dir = 'rtl';
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
      this.pegonOutput.dir = 'ltr';
      this.pegonOutput.classList.remove('arabic-text', 'pegon-text');
      return;
    }

    try {
      // Show loading state
      this.pegonOutput.innerHTML = '<span class="loading"></span> Menterjemahkan...';

      // Convert using proper Pegon conversion rules
      setTimeout(() => {
        const convertedText = this.convertToPegon(inputText);

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

  // Convert Latin text to Pegon with proper Pegon writing rules
  convertToPegon(text) {
    // First normalize the text: handle special combinations
    let result = text.toLowerCase();

    // Process each word separately to maintain proper syllable structure
    let words = result.split(' ');
    let convertedWords = [];

    for (let word of words) {
      if (word.length === 0) {
        convertedWords.push('');
        continue;
      }

      // Apply proper syllable segmentation for Pegon
      let convertedWord = this.convertWordToPegon(word);
      convertedWords.push(convertedWord);
    }

    result = convertedWords.join(' ');



    return result;
  }

  // Convert a single word to Pegon with proper syllable rules
  convertWordToPegon(word) {
    // First pass: replace all digraphs and trigraphs
    let result = word.toLowerCase();
    
    // Replace trigraphs first (like 'ngg')
    result = result.replace(/ngg/g, 'ڠݢ');
    
    // Replace digraphs (like 'ng', 'ny', 'sy', 'kh', etc.)
    // We need to be careful about the order - longer matches first
    result = result.replace(/ng/g, 'ڠ');
    result = result.replace(/ny/g, 'ڽ');
    result = result.replace(/sy/g, 'ش');
    result = result.replace(/sh/g, 'ش');
    result = result.replace(/kh/g, 'خ');
    result = result.replace(/dz/g, 'ذ');
    
    // Now process single characters character by character
    let finalResult = '';
    let i = 0;
    const vowels = 'aeiou';
    
    while (i < result.length) {
      const char = result[i];
      
      // If this character is already a Pegon character (from digraph/trigraph replacement), use it directly
      if (['ڠ', 'ڽ', 'ش', 'خ', 'ذ'].includes(char)) {
        finalResult += char;
      } 
      // Check for single character mappings
      else if (this.latinToPegonMap[char]) {
        finalResult += this.latinToPegonMap[char];
      } 
      // Handle vowels - convert all Latin vowels to Arabic equivalents
      else if (vowels.includes(char)) {
        // Always convert Latin vowels to Arabic/Pegon equivalents
        finalResult += this.convertVowelToPegon(char);
      } 
      // Non-alphabetic characters
      else {
        finalResult += char; // Punctuation, spaces, etc.
      }
      
      i++;
    }
    
    // Apply vowel dropping rules for more authentic Pegon
    finalResult = this.applyPegonVowelDropping(finalResult);
    
    return finalResult;
  }
  
  // Helper function to identify if a character is a consonant
  isConsonant(char) {
    const vowels = 'aeiouAEIOU';
    return char && char.length === 1 && /[a-zA-Z]/.test(char) && !vowels.includes(char);
  }

  // Handle special consonant combinations for Pegon script
  handleConsonantCombinations(word) {
    // Handle 'ng' combination - very common in Indonesian/Javanese
    word = word.replace(/ng(?=[aiueo]|$)/g, 'ng'); // Keep 'ng' as a consonant cluster
    word = word.replace(/ngg/g, 'ڠݢ'); // For 'ngg' sound as in Javanese
    word = word.replace(/ny/g, 'ny'); // Keep 'ny' as a consonant cluster
    word = word.replace(/sy/g, 'sy'); // Keep 'sy' as a consonant cluster
    word = word.replace(/kh/g, 'kh'); // Keep 'kh' as a consonant cluster
    
    // Return the word with identified consonant clusters
    return word;
  }

  // Convert Latin vowels to Arabic/Pegon equivalents
  convertVowelToPegon(vowel) {
    // Map Latin vowels to Arabic/Pegon equivalents
    const vowelMap = {
      'a': 'ا',  // alif
      'i': 'ي',  // ya with sukun context
      'u': 'و',  // waw with sukun context
      'e': ' ',  // typically 'a' sound in Pegon context
      'o': 'و'   // waw for 'o' sound
    };
    
    return vowelMap[vowel] || 'ا'; // Default to alif if not found
  }

  // Handle initial vowels in Pegon (add alif)
  handleInitialVowel(vowel) {
    // In Pegon script, initial vowels are typically preceded by an alif (ا)
    // This helps with proper pronunciation and script flow
    return this.convertVowelToPegon(vowel);
  }

  // Handle final vowels in Pegon
  handleFinalVowel(vowel) {
    // For final vowels, convert to appropriate Arabic character
    return this.convertVowelToPegon(vowel);
  }

  // Apply Pegon vowel dropping rules: keep vowels at word boundaries, drop internal ones
  applyPegonVowelDropping(text) {
    // In Pegon script (Arabic-based), many short vowels are dropped for readability
    // This function removes unnecessary vowel diacritics while preserving meaning
    

    
    let result = '';
    let words = text.split(' ');

    for (let w = 0; w < words.length; w++) {
      if (w > 0) result += ' ';

      const word = words[w];
      if (word.length === 0) continue;

      let processedWord = '';
      let i = 0;

      while (i < word.length) {
        const currentChar = word[i];
        
        // Check if this is an Arabic/Pegon character that represents a vowel
        // These include: ا (alif), ي (ya with fatha), و (waw with damma), etc.
        // But also include Arabic diacritics (harakat)
        const isArabicVowelMark = /[\u064B-\u065F\u0670]/.test(currentChar); // fatha, kasra, damma, etc.
        
        // For Pegon, we keep the main consonants and basic vowel letters but may drop diacritics
        // However, since our previous conversion may have mixed Latin and Arabic characters,
        // we first need to check if this is a Latin vowel that shouldn't be here
        
        // If character is a Latin vowel (which should not happen if conversion was proper),
        // this means there's an issue in the conversion process
        if (/[aeiouAEIOU]/.test(currentChar)) {
          // If we still have Latin vowels, it means conversion wasn't complete
          // We should have converted these to proper Arabic characters already
          // For now, we'll skip them to avoid mixing scripts
          if (i === 0 || i === word.length - 1) {
            // At word boundaries, maybe convert to alif or appropriate Arabic vowel
            processedWord += 'ا'; // alif as placeholder for initial/final vowels
          }
          // Skip internal Latin vowels completely
        } else {
          processedWord += currentChar;
        }
        
        i++;
      }

      result += processedWord;
    }

    return result;
  }

  // Format words to follow Pegon conventions
  formatWords(text) {
    // Handle multiple spaces
    return text.replace(/\s+/g, ' ');
  }



  // Apply specific corrections for common Pegon patterns that result from vowel dropping
  applyPegonPatternCorrections(output) {
    // After vowel dropping and conversion, apply specific corrections
    // This handles cases where the simple vowel dropping algorithm doesn't produce the correct Pegon form
    
    // Common corrections based on expected patterns
    // For patterns that emerge after vowel dropping and conversion
    // If we have the Arabic form that should be corrected
    
    return output;
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