(() => {
  const toggles=[...document.querySelectorAll('.case-study-toggle')];
  const panel=document.querySelector('#project-embed-panel');
  const frame=document.querySelector('#project-embed-frame');
  const title=document.querySelector('#project-embed-title');
  const platform=document.querySelector('#project-embed-platform');
  const loader=document.querySelector('#project-embed-loader');
  const closeButton=document.querySelector('#project-embed-close');
  if(!panel||!frame||!title||!platform||!toggles.length)return;

  let activeToggle=null;

  function clearActive(){
    toggles.forEach(toggle=>{
      toggle.setAttribute('aria-expanded','false');
      toggle.closest('.project-card')?.classList.remove('embed-active');
    });
  }

  function closeEmbed(){
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden','true');
    const previous=activeToggle;
    activeToggle=null;
    clearActive();
    setTimeout(()=>{
      if(panel.classList.contains('is-open'))return;
      frame.src='';
      frame.classList.remove('is-loaded');
      loader?.classList.remove('is-hidden');
    },720);
    return previous;
  }

  function openEmbed(toggle){
    const url=(toggle.dataset.embedUrl||'').trim();
    const projectTitle=toggle.dataset.projectTitle||'Interactive project';
    const projectPlatform=toggle.dataset.projectPlatform||'Interactive dashboard';

    if(!url||url.startsWith('YOUR_')){
      alert(`Add the public embed URL for "${projectTitle}" in index.html first.`);
      return;
    }

    if(activeToggle===toggle&&panel.classList.contains('is-open')){
      closeEmbed();
      return;
    }

    clearActive();
    activeToggle=toggle;
    toggle.setAttribute('aria-expanded','true');
    toggle.closest('.project-card')?.classList.add('embed-active');

    title.textContent=projectTitle;
    platform.textContent=projectPlatform;
    frame.title=`${projectTitle} — ${projectPlatform}`;
    frame.classList.remove('is-loaded');
    loader?.classList.remove('is-hidden');
    frame.src=url;

    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden','false');

    setTimeout(()=>{
      const top=panel.getBoundingClientRect().top+window.scrollY-95;
      window.scrollTo({top,behavior:'smooth'});
    },110);
  }

  toggles.forEach(toggle=>{
    toggle.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      openEmbed(toggle);
    });
  });

  closeButton?.addEventListener('click',()=>{
    const previous=closeEmbed();
    previous?.focus();
  });

  frame.addEventListener('load',()=>{
    frame.classList.add('is-loaded');
    loader?.classList.add('is-hidden');
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&panel.classList.contains('is-open')){
      const previous=closeEmbed();
      previous?.focus();
    }
  });
})();
