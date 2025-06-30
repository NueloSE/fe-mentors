const toggleBtn = document.querySelector(
  '[aria-controls="primary-navigation"]'
);
const navList = document.getElementById('primary-navigation')




toggleBtn.addEventListener('click', () =>{

    const toggleOpened = toggleBtn.getAttribute('aria-expanded');

    if (toggleOpened === 'false') {
        toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

})