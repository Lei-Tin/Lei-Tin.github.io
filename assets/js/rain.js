const container = document.getElementById('rain-container');
let today = new Date();
let hour = today.getHours();

const numberOfDrops = Math.floor(50 * Math.cos(Math.PI / 12 * (hour - 2)) + 100);

// Function to create a single drop
function createDrop() {
  const drop = document.createElement('div');
  drop.className = 'drop';
  drop.style.left = `${Math.random() * 100}vw`;
  drop.style.width = `${Math.random() * 0.7 + 0.1}vh`;

  drop.style.height = `${Math.random() * (10 * Math.cos(Math.PI / 12 * (hour - 2)) + 2) + 2}vh`;
  drop.style.animationDuration = `2s, ${Math.random() * (-2.5 * Math.cos(Math.PI / 12 * (hour - 2))) + 2.5}s`; // Random duration

  // Remove the animation delay for the fade in
  drop.style.animationDelay = `0s, ${Math.random() * -5}s`; // Random delay

  drop.style.filter = `blur(${Math.random() * 3}px)`;
  container.appendChild(drop);

  // Set up an event listener to reposition the drop when the animation ends
  drop.addEventListener('animationiteration', () => {
    drop.style.left = `${Math.random() * 100}vw`; // Random horizontal position
  });
}

// Create multiple drops
for (let i = 0; i < numberOfDrops; i++) {
  createDrop();
}
