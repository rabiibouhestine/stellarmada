class Timer {
    constructor(callback, delay) {
      this.callback = callback;
      this.delay = delay;
      this.timerId = null;
      this.isRunning = false;
      this.timeLeft = this.delay;
    }

    start() {
      if (!this.isRunning) {
        this.isRunning = true;
        this.timerId = setInterval(() => {
          this.timeLeft -= 1000; // Subtract one second
          if (this.timeLeft <= 0) {
            this.stop();
            this.callback();
          }
        }, 1000);

      }
    }
  
    stop() {
      if (this.isRunning) {
        clearInterval(this.timerId);
        this.isRunning = false;
      }
    }
  
    reset() {
      this.stop();
      this.timeLeft = this.delay;
    }
}

export default Timer;
