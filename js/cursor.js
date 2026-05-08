/* ============================================
   HICHMA — CURSOR
   ============================================ */

const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');

// Direct position for dot
document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';

  cursorFollower.style.left = e.clientX + 'px';
  cursorFollower.style.top  = e.clientY + 'px';
});

// Expand on hover
document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
  el.addEventListener('mouseenter', () => cursorFollower.classList.add('is-hovering'));
  el.addEventListener('mouseleave', () => cursorFollower.classList.remove('is-hovering'));
});

// Hide when leaving window
document.addEventListener('mouseleave', () => {
  cursor.style.opacity         = '0';
  cursorFollower.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursor.style.opacity         = '1';
  cursorFollower.style.opacity = '1';
});