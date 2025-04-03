/**
 * Advanced Typewriter Effect
 * @param {HTMLElement} el - Target DOM element
 * @param {string|string[]} texts - Text(s) to display
 * @param {object} options - Customization options
 * @param {function} callback - Optional completion callback
 */
function typewriter(el, texts, options = {}, callback) {
    // Validate inputs
    if (!(el instanceof HTMLElement)) {
      throw new Error('First argument must be an HTMLElement');
    }
    if (!texts || (Array.isArray(texts) && texts.length === 0)) {
      throw new Error('Texts parameter must not be empty');
    }
  
    // Default options
    const {
      typeSpeed = 100,
      deleteSpeed = 50,
      pauseBetween = 1000,
      loop = false,
      delayStart = 0
    } = options;
  
    // Convert single string to array
    if (typeof texts === 'string') texts = [texts];
    
    let textIndex = 0;
    let isDeleting = false;
    let currentText = '';
    let timeout = null;
    let isStopped = false;
  
    const type = () => {
      if (isStopped) return;
  
      const fullText = texts[textIndex];
      
      if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1);
      } else {
        currentText = fullText.substring(0, currentText.length + 1);
      }
  
      el.innerHTML = currentText;
  
      if (!isDeleting && currentText === fullText) {
        if (textIndex < texts.length - 1 || loop) {
          timeout = setTimeout(() => {
            if (!isStopped) {
              isDeleting = true;
              requestAnimationFrame(() => setTimeout(type, deleteSpeed));
            }
          }, pauseBetween);
        } else if (callback) {
          callback();
        }
      } else if (isDeleting && currentText === '') {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        requestAnimationFrame(() => setTimeout(type, typeSpeed));
      } else {
        requestAnimationFrame(() => setTimeout(type, isDeleting ? deleteSpeed : typeSpeed));
      }
    };
  
    // Public methods
    this.stop = () => {
      isStopped = true;
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
  
    this.start = () => {
      if (isStopped) {
        isStopped = false;
        requestAnimationFrame(() => setTimeout(type, typeSpeed));
      }
    };
  
    // Initial start
    requestAnimationFrame(() => setTimeout(type, delayStart));
  }
  
  // Auto-initialize elements with [data-typewriter]
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    try {
      const texts = JSON.parse(el.getAttribute('data-texts') || '[]');
      const options = JSON.parse(el.getAttribute('data-options') || '{}');
      if (texts.length) {
        typewriter(el, texts, options);
      }
    } catch (e) {
      console.warn('Invalid typewriter data attributes for element:', el, e);
    }
  });