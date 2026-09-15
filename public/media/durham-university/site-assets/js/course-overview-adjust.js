// set height of overview if details is longer on larger screens, tidy layout on mobile by adding margin
const adjustCourseOverview = () => {
  const overview = document.querySelector('#scroll-stop .course-page-section');
  const details = document.querySelector('#scroll-stop .col-sm-12:nth-child(2) .text-long');
  //remove blank paragraphs with line breaks added for spacing
  const emptyPs = overview.querySelectorAll('p');
  emptyPs.forEach(p => {
    if (p.innerHTML.trim() === '<br>' || p.innerHTML.trim() === '') {
      p.remove();
    }
  });
  overview.style.minHeight = '';
  overview.style.marginBottom = '';
  if (window.innerWidth > 768) {
    const detailsHeight = details.offsetHeight;
    const overviewHeight = overview.offsetHeight;
    if (detailsHeight > overviewHeight) {
      overview.style.minHeight = `${detailsHeight}px`;
    }
  } else {
    overview.style.marginBottom = '2rem';
  }
};
window.addEventListener('load', adjustCourseOverview);
window.addEventListener('resize', adjustCourseOverview);