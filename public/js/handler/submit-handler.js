// JavaScript code to handle the countdown and redirection
let countdown = 25; // Initial countdown time in seconds

// Function to update the countdown timer and handle redirection
function updateCountdown() {
  const countdownSpan = document.getElementById('countdown');
  countdownSpan.textContent = countdown;

  if (countdown <= 0) {
    // Redirect to the desired URL after the countdown reaches 0
    window.location.href = '/profile';
  } else {
    countdown--; // Decrement the countdown timer
    setTimeout(updateCountdown, 1000); // Update every second (1000 ms)
  }
}

// Start the countdown
updateCountdown();