(function () {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    let theme = 'light';
    // first check if they prefer dark mode
    if (prefersDark) {
        theme = 'dark';
    }
    // then check if they have a saved theme (this has higher priority)
    if (savedTheme) {
        theme = savedTheme;
    }

    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        document.documentElement.style.setProperty('--background-color', 'var(--dark-background-color)');
        document.documentElement.style.setProperty('--text-color', 'var(--dark-text-color)');
        document.documentElement.style.setProperty('--button-background-color', 'var(--dark-button-background-color)');
        document.documentElement.style.setProperty('--button-text-color', 'var(--dark-button-text-color)');
    } else {
        document.documentElement.style.setProperty('--background-color', 'var(--default-background-color)');
        document.documentElement.style.setProperty('--text-color', 'var(--default-text-color)');
        document.documentElement.style.setProperty('--button-background-color', 'var(--default-button-background-color)');
        document.documentElement.style.setProperty('--button-text-color', 'var(--default-button-text-color)');
    }
})();
