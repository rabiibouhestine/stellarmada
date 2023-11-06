class Timer {
    constructor(callback, duration) {
      this.callback = callback;
      this.duration = duration;
      this.timerId = null;
      this.isRunning = false;
      this.timeLeft = this.duration;
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
  
    reset(newDuration = null, start = false) {
      this.stop();
      if (newDuration) {
        this.duration = newDuration;
      }
      this.timeLeft = this.duration;
      if (start) {
        this.start();
      }
    }
}

export default Timer;
