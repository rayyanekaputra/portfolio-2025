export default class Typewriter {
    constructor(element, options = {}) {
      // Required configuration
      this.element = element;
      
      // Detect and handle existing text
      const existingText = element.textContent.trim();
      if (existingText) {
        if (options.words) {
          this.words = [existingText, ...options.words];
        } else {
          this.words = [existingText];
          options.loop = false;
        }
        this._initialState = {
          word: 0,
          char: existingText.length,
          building: false,
          looped: 0
        };
      } else {
        this.words = options.words || ['Type something amazing!'];
        this._initialState = {
          word: 0,
          char: 0,
          building: true,
          looped: 0
        };
      }
      
      this.delimiter = options.delimiter || ',';
      
      // Fixed loop handling
      this.loop = options.loop !== false;
      this.loopCount = typeof options.loop === 'number' ? options.loop : 
                      (options.loop === false ? 1 : Infinity);
      
      // Timing configuration
      this.delay = options.delay || 200;
      this.deleteDelay = options.deleteDelay || 800;
      
      // Visual configuration
      this.colors = options.colors || ['inherit'];
      this.cursorChar = options.cursorChar || '|';
      this.cursorBlinkSpeed = options.cursorBlinkSpeed || 400;
      this.showCursor = options.showCursor !== false;
      
      // Animation state
      this.progress = { ...this._initialState };
      this.isTyping = false;
      this.colorIndex = 0;
      
      // Callbacks
      this.callbacks = {
        update: options.update || (() => {}),
        begin: options.begin || (() => {}),
        complete: options.complete || (() => {}),
        loopBegin: options.loopBegin || (() => {}),
        loopComplete: options.loopComplete || (() => {}),
        change: options.change || (() => {}),
        changeBegin: options.changeBegin || (() => {}),
        changeComplete: options.changeComplete || (() => {})
      };
      
      // Promise support
      this._finishedPromise = null;
      this._resolveFinished = null;
      this.finished = new Promise((resolve) => {
        this._resolveFinished = resolve;
      });
      
      // Initialize
      this._setupCursor();
      this._setColor();
    }
  
    start() {
      if (!this.isTyping) {
        this.isTyping = true;
        this.callbacks.begin();
        this._triggerLoopBegin();
        this._doTyping();
      }
      return this;
    }
  
    stop() {
      this.isTyping = false;
      return this;
    }
  
    reset() {
      this.progress = { ...this._initialState };
      this.colorIndex = 0;
      this._setColor();
      return this;
    }
  
    toggleCursor(show) {
      this.showCursor = typeof show === 'boolean' ? show : !this.showCursor;
      if (this.cursorElement) {
        this.cursorElement.style.display = this.showCursor ? '' : 'none';
      }
      return this;
    }
  
    _setupCursor() {
      if (!this.showCursor) return;
      
      this.cursorElement = document.createElement('span');
      this.cursorElement.className = 'typewriter-cursor';
      this.cursorElement.textContent = this.cursorChar;
      this.cursorElement.style.transition = `opacity ${this.cursorBlinkSpeed/1000}s`;
      this.element.parentNode.insertBefore(this.cursorElement, this.element.nextSibling);
      
      this._cursorVisible = true;
      this._cursorInterval = setInterval(() => {
        this._cursorVisible = !this._cursorVisible;
        if (this.cursorElement) {
          this.cursorElement.style.opacity = this._cursorVisible ? '1' : '0';
        }
      }, this.cursorBlinkSpeed);
    }
  
    _setColor() {
      this.element.style.color = this.colors[this.colorIndex % this.colors.length];
    }
  
    _doTyping() {
      if (!this.isTyping) return;
      
      const p = this.progress;
      const currentWord = this.words[p.word];
      const currentDisplay = currentWord.slice(0, p.char);
      const atWordEnd = p.building && p.char === currentWord.length;
      const atWordStart = !p.building && p.char === 0;
      
      // Update display
      this.element.textContent = currentDisplay;
      this.callbacks.update(currentDisplay, p);
      this.callbacks.change(currentDisplay, p);
      
      if (p.building) {
        if (!atWordEnd) {
          this.callbacks.changeBegin(currentDisplay, p);
          p.char++;
        } else {
          this.callbacks.changeComplete(currentDisplay, p);
          p.building = false;
          
          // Check for completion after typing last word
          if (!this.loop && p.word === this.words.length - 1) {
            this._completeAnimation();
            return;
          }
        }
      } else {
        if (!atWordStart) {
          this.callbacks.changeBegin(currentDisplay, p);
          p.char--;
        } else {
          this.callbacks.changeComplete(currentDisplay, p);
          p.building = true;
          p.word++;
          this.colorIndex++;
          this._setColor();
          
          // Check for loop completion
          if (p.word >= this.words.length) {
            p.word = 0;
            p.looped++;
            this.callbacks.loopComplete();
            
            if (p.looped >= this.loopCount) {
              this._completeAnimation();
              return;
            }
            this._triggerLoopBegin();
          }
        }
      }
      
      const delay = atWordEnd ? this.deleteDelay : this.delay;
      setTimeout(() => this._doTyping(), delay);
    }
  
    _completeAnimation() {
      this.isTyping = false;
      this.callbacks.complete();
      this._resolveFinished();
    }
  
    _triggerLoopBegin() {
      if (this.progress.word === 0) {
        this.callbacks.loopBegin();
      }
    }
  
    destroy() {
      clearInterval(this._cursorInterval);
      if (this.cursorElement?.parentNode) {
        this.cursorElement.parentNode.removeChild(this.cursorElement);
      }
      this._resolveFinished();
    }
  }