document.addEventListener('DOMContentLoaded', function() {
  const languageSelector = document.querySelector('.md-select');

  if (languageSelector) {
    const savedLanguage = localStorage.getItem('preferredLanguage');

    if (savedLanguage) {
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/');
      const lastPart = pathParts[pathParts.length - 1];

      if (lastPart && !lastPart.includes(savedLanguage) && savedLanguage !== 'en') {
        const newPath = lastPart.replace(/\.(md|html)$/, `.${savedLanguage}.$1`);
        pathParts[pathParts.length - 1] = newPath;
        const targetPath = pathParts.join('/');

        fetch(targetPath, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              window.location.pathname = targetPath;
            }
          })
          .catch(() => {});
      }
    }

    languageSelector.addEventListener('change', function(e) {
      const selectedLang = e.target.value;
      localStorage.setItem('preferredLanguage', selectedLang);
    });
  }

  const codeBlocks = document.querySelectorAll('pre > code');
  codeBlocks.forEach(function(block) {
    const pre = block.parentElement;
    if (!pre.querySelector('.copy-button')) {
      const button = document.createElement('button');
      button.className = 'md-clipboard md-icon copy-button';
      button.title = 'Copy to clipboard';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg>';

      button.addEventListener('click', function() {
        const code = block.textContent;
        navigator.clipboard.writeText(code).then(function() {
          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg>';
          setTimeout(function() {
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg>';
          }, 2000);
        });
      });
    }
  });
});
