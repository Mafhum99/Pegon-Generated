// Bidirectional Latin ↔ Pegon Translator - JavaScript ES6 Implementation

class PegonTranslator {
  constructor(isCLI = false) {
    // Latin to Pegon conversion mapping based on correct Pegon script rules
    this.latinToPegonMap = {
      // Basic consonants
      'b': 'ب', 't': 'ت', 'ṡ': 'ث', 'j': 'ج', 'c': 'چ', 'ḥ': 'ح', 
      'kh': 'خ', 'sh': 'ش', 'sy': 'ش', 'ṡy': 'ش', 'ṣ': 'ص', 'ḍ': 'ض', 'ṭ': 'ط', 'ẓ': 'ظ', 
      'dz': 'ذ',  // For 'dz' sound in Javanese/Malay
      '‘': 'ع', '’': 'ع',  // Both apostrophes map to ain
      'ġ': 'غ', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'g': 'ݢ', 'l': 'ل', 
      'm': 'م', 'n': 'ن', 'ny': 'ۑ', 'ng': 'ڠ', 'h': 'ه', 'w': 'و', 'y': 'ي', 
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

    // Arabic terms will be loaded from JSON file into this object.
    // Start empty; `loadArabicTerms()` will populate it for Node/browser.
    this.arabicTerms = {};


    // Initialize differently based on environment
    if (!isCLI) {
      this.init();
    }
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




    // Only translate when pressing Ctrl+Enter or Cmd+Enter (for manual translation)
    this.latinInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.translate();
      }
    });

    // Update character count as user types
    this.latinInput.addEventListener('input', () => {
      this.updateCharacterCount();
      // Auto-translate if enabled
      if (this.autoTranslateCheckbox && this.autoTranslateCheckbox.checked) {
        clearTimeout(this.autoTranslateTimeout);
        this.autoTranslateTimeout = setTimeout(() => {
          this.translate();
        }, 1000);
      }
    });

    // Set up quick phrase buttons
    this.setupQuickPhrases();

    // Auto-translate option (default to checked)
    this.setupAutoTranslate();

    // Load Arabic/ Pegon term mappings from JSON (Assets/kamus/serapan-kata-arab.json)
    // This will populate `this.arabicTerms` asynchronously in browser or synchronously in Node.
    this.loadArabicTerms();
  }

  // Load Arabic term mappings from the project's JSON file.
  // - In Node.js: load synchronously from disk if available.
  // - In browser: attempt fetch from relative path `./Assets/kamus/serapan-kata-arab.json`.
  loadArabicTerms() {
    // Node.js environment
    if (typeof module !== 'undefined' && module.exports) {
      try {
        const fs = require('fs');
        const path = require('path');
        const jsonPath = path.join(__dirname, 'Assets', 'kamus', 'serapan-kata-arab.json');

        if (fs.existsSync(jsonPath)) {
          const fileContent = fs.readFileSync(jsonPath, 'utf8');
          const loadedTerms = JSON.parse(fileContent);
          this.arabicTerms = loadedTerms || {};
        }
      } catch (e) {
        console.warn('Could not load Arabic terms from JSON file (Node):', e.message);
        this.arabicTerms = {};
      }
      return;
    }

    // Browser environment - try fetching the JSON file
    const jsonUrl = './Assets/kamus/serapan-kata-arab.json';
    fetch(jsonUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        this.arabicTerms = data || {};
      })
      .catch(err => {
        // If fetching fails, keep arabicTerms empty (fallback behavior)
        console.warn('Could not load Arabic terms from JSON file (browser):', err.message);
        this.arabicTerms = {};
      });
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
    this.pegonOutput.value = pegon;
    this.pegonOutput.classList.add('arabic-text', 'pegon-text');
    this.pegonOutput.classList.remove('placeholder-text'); // Remove placeholder styling if present
    this.pegonOutput.dir = 'rtl';
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
      this.pegonOutput.value = 'Hasil terjemahan Pegon akan muncul di sini...';
      this.pegonOutput.dir = 'ltr';
      this.pegonOutput.classList.remove('arabic-text', 'pegon-text');
      this.pegonOutput.classList.add('placeholder-text');
      return;
    }

    try {
      // Show loading state
      this.pegonOutput.value = 'Menterjemahkan...';

      // Convert using proper Pegon conversion rules
      setTimeout(() => {
        const convertedText = this.convertToPegon(inputText);

        this.pegonOutput.value = convertedText;

        // Set RTL direction and Arabic font for Pegon output
        this.pegonOutput.classList.add('arabic-text', 'pegon-text');
        this.pegonOutput.classList.remove('placeholder-text'); // Remove placeholder styling
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

    // Process each line separately to maintain line breaks
    let lines = result.split('\n');
    let convertedLines = [];

    for (let line of lines) {
      // Process each word in the line separately to maintain proper syllable structure
      let words = line.split(' ');
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

      let convertedLine = convertedWords.join(' ');
      convertedLines.push(convertedLine);
    }

    result = convertedLines.join('\n');

    return result;
  }

  // Convert a single word to Pegon with proper syllable rules
  convertWordToPegon(word) {
    // Check if the word starts with a vowel and handle initial vowel properly
    let startsWithVowel = /^[aeiou]/.test(word.toLowerCase());
    
    // Load Arabic terms from the JSON file or use the default list
    const arabicTerms = this.getArabicTerms();
    
    const lowerWord = word.toLowerCase();
    if (arabicTerms[lowerWord]) {
      return arabicTerms[lowerWord];
    }
    
    // First pass: replace all digraphs and trigraphs
    let result = word.toLowerCase();
    
    // Replace trigraphs first (like 'ngg')
    result = result.replace(/ngg/g, 'ڠݢ');
    
    // Replace digraphs (like 'ng', 'ny', 'sy', 'kh', etc.)
    // We need to be careful about the order - longer matches first
    result = result.replace(/ng/g, 'ڠ');
    result = result.replace(/ny/g, 'ۑ');
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
        // If this is the first character of the word and starts with a vowel, use special initial form
        if (i === 0 && startsWithVowel) {
          finalResult += this.handleInitialVowel(char);
        } else {
          // Always convert Latin vowels to Arabic/Pegon equivalents
          finalResult += this.convertVowelToPegon(char);
        }
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
    // In Pegon script (Arabic-based), according to user requirement:
    // For 'a' sound, we use أ (alif with hamza above) as specified by user
    // For 'i' sound, we use إ (alif with hamza above) 
    // For 'u' and 'o' sounds, we use أ (alif with hamza above)
    const initialVowelMap = {
      'a': 'أ',     // alif with hamza above for initial 'a' as per user requirement
      'i': 'إي',     // alif with hamza above for initial 'i'
      'u': 'أو',     // alif with hamza above for initial 'u'
      'e': 'أ',     // typically 'a' sound in Pegon context
      'o': 'أو'      // alif with hamza above for initial 'o'
    };

    return initialVowelMap[vowel] || 'أ'; // Default to alif with hamza above if not found
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
    this.pegonOutput.value = '';
    this.pegonOutput.dir = '';
    this.pegonOutput.classList.remove('arabic-text', 'pegon-text');
    this.pegonOutput.classList.add('placeholder-text');
  }

  copyToClipboard() {
    const text = this.pegonOutput.value;
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
    const text = this.pegonOutput.value;
    if (!text || text.includes('Silakan masukkan') || text.includes('Hasil terjemahan')) {
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
      this.autoTranslateTimeout = null;

      // Add event listener for auto-translate checkbox
      this.autoTranslateCheckbox.addEventListener('change', (e) => {
        if (!e.target.checked) {
          // Clear any pending timeout when auto-translate is disabled
          clearTimeout(this.autoTranslateTimeout);
        }
        // When auto-translate is enabled, it will be triggered by the input event handler
      });
    }
  }
  
  // Get Arabic terms from JSON file or default list
  getArabicTerms() {
    // Default Arabic terms - provided as fallback
    const defaultArabicTerms = {
      'allah': 'الله',
      'bismillah': 'بسم الله',
      'alhamdulillah': 'الحمد لله',
      'insyaallah': 'إن شاء الله',
      'masyaallah': 'ما شاء الله',
      'subhanallah': 'سبحان الله',
      'astaghfirullah': 'أستغفر الله',
      'alayhisallam': 'عليه السلام',
      'rahimahullah': 'رحمه الله',
      'rahmatullah': 'رحمت الله',
      'muhammad': 'محمد',
      'rasulullah': 'رسول الله',
      'sallallahu alayhi wa sallam': 'صلى الله عليه و سلم',
      'amin': 'آمين',
      'aamiin': 'آمين',
      'assalamualaikum': 'السلام عليكم',
      'waalaikumsalam': 'و عليكم السلام'
    };

    // Check if we're in Node.js environment
    if (typeof module !== 'undefined' && module.exports) {
      try {
        // Load from JSON file in Node.js
        const fs = require('fs');
        const path = require('path');
        const jsonPath = path.join(__dirname, 'Assets', 'kamus', 'serapan-kata-arab.json');
        
        if (fs.existsSync(jsonPath)) {
          const fileContent = fs.readFileSync(jsonPath, 'utf8');
          const loadedTerms = JSON.parse(fileContent);
          return loadedTerms;
        }
      } catch (e) {
        // If there's an error loading the file, use defaults
        console.warn('Could not load Arabic terms from JSON file, using defaults:', e.message);
      }
    } else {
      // Browser environment - try to load via fetch or use defaults
      // For browser environments, we'll use the defaults for now
      // In a production environment, this could be loaded via fetch
    }

    return defaultArabicTerms;
  }
}

// Function to display help information
function showHelp() {
  console.log(`
Pegon Translator CLI - Command Line Interface

Usage:
  pegon-generated [options] [text]

Options:
  -v,--v, --version      Show version information
  -h, --help, --h    Show this help information
  --man              Show manual page

Examples:
  pegon-generated "apa kabar"     # Convert "apa kabar" to Pegon
  pegon-generated "saya sedang belajar"  # Convert longer text
  pegon-generated --help          # Show this help

Description:
  Translates Latin text to Pegon script (Arabic-based writing system).
  Pegon is used for writing Javanese, Sundanese, Madurese and other local languages of Indonesia.
`);
}

// Function to display version information
function showVersion() {
  console.log('Pegon Generated - Version 1.0.1 (Long Term Support)');
}

// Function to display manual page
function showManPage() {
  console.log(`
MANUAL PAGE FOR PEGON-GENERATED CLI TOOL

NAME
  pegon-generated - Latin to Pegon script translator

SYNOPSIS
  pegon-generated [OPTIONS] [TEXT]

DESCRIPTION
  The pegon-generated command translates Latin text to Pegon script.
  Pegon is an Arabic-based writing system used for writing various
  Indonesian local languages such as Javanese, Sundanese, and Madurese.

OPTIONS
  -v, --v, --version
    Display version information
  -h, --help, --h
    Display help information

  --man
    Display this manual page

USAGE EXAMPLE
  $ pegon-generated "apa kabar"
  اڤا كابار

  $ pegon-generated "saya sedang belajar"
  ساي سدڠ بلجر

AUTHOR
  Written by Andi Almafhum for cultural preservation

COPYRIGHT
  This is an open-source tool for preserving Indonesian local languages and scripts.
`);
}

// Main function to handle CLI arguments when running in Node.js
function main() {
  const args = process.argv.slice(2);

  // Check for help flags
  if (args.includes('-h') || args.includes('--help') || args.includes('--h')) {
    showHelp();
    return;
  }
  // Check for version flags
  if (args.includes('-v')|| args.includes('--v') ||args.includes('--version')) {
    showVersion();
    return;
  }

  // Check for man flag
  if (args.includes('--man')) {
    showManPage();
    return;
  }

  // If no arguments provided, show help
  if (args.length === 0) {
    showHelp();
    return;
  }

  // Join all remaining arguments as input text
  const inputText = args.join(' ');

  // Create translator instance and translate the text (with isCLI=true to avoid web UI initialization)
  const translator = new PegonTranslator(true);
  const result = translator.convertToPegon(inputText); // Use the translate method without UI elements

  // Post-process the result to ensure correct ny character in CLI mode
  // Fix for "ny" to "ڽ" conversion (not "ۑ")
  const correctedResult = result.replace(/ۑ/g, 'ڽ');

  // Output the result to stdout
  console.log(correctedResult);
}

// Export the class for use in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PegonTranslator };
  
  // Check if script is run directly (not required as a module)
  if (require.main === module) {
    main();
  }
} else {
  // Browser environment - Initialize the web UI
  document.addEventListener('DOMContentLoaded', () => {
    const translator = new PegonTranslator();

    // Add download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn secondary-btn';
    downloadBtn.id = 'download-output';
    downloadBtn.textContent = ' ⬇️ Download';
    downloadBtn.addEventListener('click', () => translator.downloadTranslation());

    const outputControls = document.querySelector('.output-controls');
    if (outputControls) {
      outputControls.appendChild(downloadBtn);
    }
    
    // Cheatsheet modal functionality
    const cheatsheetBtn = document.getElementById('cheatsheet-btn');
    const modal = document.getElementById('cheatsheet-modal');
    const closeModalBtn = document.getElementById('close-modal');
    
    // Open modal when button is clicked
    if (cheatsheetBtn) {
      cheatsheetBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      });
    }
    
    // Close modal when close button is clicked
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
      });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
      }
    });
    
    // About Pegon modal functionality
    const aboutPegonBtn = document.getElementById('about-pegon-btn');
    const aboutModal = document.getElementById('about-pegon-modal');
    const closeAboutModalBtn = document.getElementById('close-about-modal');

    // Open About Pegon modal when button is clicked
    if (aboutPegonBtn) {
      aboutPegonBtn.addEventListener('click', () => {
        aboutModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      });
    }

    // Close About Pegon modal when close button is clicked
    if (closeAboutModalBtn) {
      closeAboutModalBtn.addEventListener('click', () => {
        aboutModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
      });
    }

    // Close About Pegon modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && aboutModal.classList.contains('active')) {
        aboutModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
      }
    });
  });
}