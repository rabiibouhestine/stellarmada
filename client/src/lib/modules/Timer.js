class Timer {
    constructor(callback, delay) {
      this.callback = callback;
      this.delay = delay;
      this.timerId = null;
      this.isRunning = false;
      this.remainingTime = this.delay;
      this.timeLeft = this.remainingTime;
    }
  
    start() {
      if (!this.isRunning) {
        this.isRunning = true;
        this.remainingTime = this.remainingTime || this.delay;
        this.timerId = setInterval(() => {
          this.remainingTime -= 1000; // Subtract one second
          this.timeLeft = this.remainingTime;
          if (this.remainingTime <= 0) {
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
      this.remainingTime = this.delay;
      this.timeLeft = this.remainingTime;
    }
}

export default Timer;
