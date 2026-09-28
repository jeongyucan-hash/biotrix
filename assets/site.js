(() => {
  const menus = [...document.querySelectorAll('.mobileMenu')];
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    menus.filter(menu => menu.open).forEach(menu => {
      menu.open = false;
      menu.querySelector('summary').focus();
    });
  });
  document.addEventListener('click', event => {
    menus.forEach(menu => { if (!menu.contains(event.target)) menu.open = false; });
  });
  menus.forEach(menu => menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { menu.open = false; });
  }));
})();
