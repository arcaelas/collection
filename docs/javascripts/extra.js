/**
 * Extra JavaScript for @arcaelas/collection documentation
 * Custom interactions and enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Add copy button feedback
  document.querySelectorAll('.highlight button').forEach(button => {
    button.addEventListener('click', function() {
      const originalText = this.textContent;
      this.textContent = '✓ Copied!';
      setTimeout(() => {
        this.textContent = originalText;
      }, 2000);
    });
  });
});
