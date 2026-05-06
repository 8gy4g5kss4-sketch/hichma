// Select video element
const video = document.querySelector('.hero-bg video');

// Target movement (mouse)
let targetX = 0;
let targetY = 0;

// Current position (smooth interpolation)
let currentX = 0;
let currentY = 0;

// Mouse move tracking
document.addEventListener('mousemove', (e) => {
  targetX = (e.clientX / window.innerWidth - 0.5) * 15;
  targetY = (e.clientY / window.innerHeight - 0.5) * 15;
});

// Animation loop (smooth movement)
function animate() {
  currentX += (targetX - currentX) * 0.05;
  currentY += (targetY - currentY) * 0.05;

  video.style.transform = `scale(1.15) translate(${currentX}px, ${currentY}px)`;

  requestAnimationFrame(animate);
}

// Start animation
animate();