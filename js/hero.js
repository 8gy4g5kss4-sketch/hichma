const video = document.querySelector('.hero-bg video');

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

document.addEventListener('mousemove', (e) => {
  targetX = (e.clientX / window.innerWidth - 0.5) * 20;
  targetY = (e.clientY / window.innerHeight - 0.5) * 20;
});

function animate() {
  currentX += (targetX - currentX) * 0.04;
  currentY += (targetY - currentY) * 0.04;

  video.style.transform = `scale(1.1) translate(${currentX}px, ${currentY}px)`;

  requestAnimationFrame(animate);
}

animate();