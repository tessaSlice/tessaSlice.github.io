(function () {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
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
