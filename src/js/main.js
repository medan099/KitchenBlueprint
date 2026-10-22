import '../css/main.css'

const page = document.body.dataset.page || ''

const $ = (selector, scope = document) => scope.querySelector(selector)
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)]

const initNavigation = () => {
  const header = $('.site-header')
  const toggle = $('.menu-toggle')
  const overlay = $('.menu-overlay')
  const close = $('.menu-close')
  const progress = $('.scroll-progress')
  const syncHeaderMetrics = () => {
    const height = header?.getBoundingClientRect().height || 76
    document.documentElement.style.setProperty('--header-height', `${height}px`)
    const index = $('.service-index')
    if (index) document.documentElement.style.setProperty('--service-index-height', `${index.getBoundingClientRect().height}px`)
  }
  const update = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 30)
    syncHeaderMetrics()
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight
      progress.style.width = `${max ? (scrollY / max) * 100 : 0}%`
    }
  }
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', syncHeaderMetrics, { passive: true }); update()
  const setMenu = (open) => { overlay?.classList.toggle('is-open', open); document.body.classList.toggle('menu-open', open); toggle?.setAttribute('aria-expanded', String(open)); toggle?.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu') }
  toggle?.addEventListener('click', () => setMenu(true)); close?.addEventListener('click', () => setMenu(false))
  $$('.menu-overlay a').forEach(link => link.addEventListener('click', () => setMenu(false)))
  addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false) })
  addEventListener('pagehide', () => setMenu(false))
  addEventListener('pageshow', () => setMenu(false))
}

const initExpertiseIndex = () => {
  const index = $('.service-index'), header = $('.site-header')
  if (!index) return
  const links = $$('a[href^="#"]', index)
  const sections = links.map(link => $(link.getAttribute('href'))).filter(Boolean)
  if (!sections.length) return
  const updateActive = () => {
    const offset = (header?.getBoundingClientRect().height || 76) + index.getBoundingClientRect().height + 16
    let active = sections[0]
    sections.forEach(section => { if (section.getBoundingClientRect().top <= offset) active = section })
    links.forEach(link => {
      const selected = $(link.getAttribute('href')) === active
      link.classList.toggle('is-active', selected)
      if (selected) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }
  links.forEach(link => link.addEventListener('click', event => {
    const target = $(link.getAttribute('href'))
    if (!target) return
    event.preventDefault()
    if (window.location.hash !== link.hash) history.pushState(null, '', link.hash)
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    updateActive()
  }))
  let scheduled = false
  const scheduleUpdate = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => { updateActive(); scheduled = false })
  }
  addEventListener('scroll', scheduleUpdate, { passive: true })
  addEventListener('resize', scheduleUpdate, { passive: true })
  addEventListener('hashchange', scheduleUpdate)
  updateActive()
}

const initReveals = () => {
  const elements = $$('.reveal, .clip-reveal')
  if (!('IntersectionObserver' in window)) return elements.forEach(el => el.classList.add('is-visible'))
  const observer = new IntersectionObserver((entries, obs) => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target) } }), { threshold: .12 })
  elements.forEach(el => observer.observe(el))
}

const initMarquee = () => { $$('.marquee-track').forEach(track => { if (!track.dataset.duplicated) { track.innerHTML += track.innerHTML; track.dataset.duplicated = 'true' } }) }

const initBeforeAfter = () => $$('.comparison').forEach(component => {
  const input = $('input[type=range]', component), after = $('.after', component), handle = $('.comparison-handle', component)
  if (!input || !after || !handle) return
  const render = () => { const value = input.value; after.style.clipPath = `inset(0 0 0 ${value}%)`; handle.style.left = `${value}%` }
  input.addEventListener('input', render); render()
})

const initPortfolio = () => {
  const buttons = $$('.filter-button'), items = $$('.portfolio-item')
  if (!buttons.length) return
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false') }); button.classList.add('active'); button.setAttribute('aria-pressed', 'true')
    const filter = button.dataset.filter
    items.forEach(item => { const show = filter === 'all' || item.dataset.category.split(' ').includes(filter); item.classList.toggle('is-hidden', !show) })
  }))
}

const initProcess = () => {
  const steps = $$('.process-step'), copy = $('.step-copy')
  const processCopy = steps.map(step => step.dataset.copy)
  steps.forEach((step, index) => step.addEventListener('mouseenter', () => { steps.forEach(item => item.classList.remove('is-active')); step.classList.add('is-active'); if (copy) copy.textContent = processCopy[index] }))
  if (steps[0]) { steps[0].classList.add('is-active'); if (copy) copy.textContent = processCopy[0] }
}

const initTestimonials = () => {
  const quotes = $$('.testimonial-quote'), prev = $('.quote-prev'), next = $('.quote-next'), count = $('.quote-count')
  if (!quotes.length) return
  let current = 0
  const render = () => { quotes.forEach((item, index) => item.hidden = index !== current); if (count) count.textContent = `0${current + 1} / 0${quotes.length}` }
  prev?.addEventListener('click', () => { current = (current - 1 + quotes.length) % quotes.length; render() }); next?.addEventListener('click', () => { current = (current + 1) % quotes.length; render() }); render()
}

const initCounters = () => {
  const counters = $$('.counter'); if (!counters.length) return
  const animate = el => { const target = Number(el.dataset.target); const suffix = el.dataset.suffix || ''; let start = 0; const duration = 1000; const tick = time => { if (!el._start) el._start = time; const progress = Math.min((time - el._start) / duration, 1); el.textContent = `${Math.floor(progress * target)}${suffix}`; if (progress < 1) requestAnimationFrame(tick) }; requestAnimationFrame(tick) }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { animate(entry.target); observer.unobserve(entry.target) } }), { threshold: .8 }); counters.forEach(counter => observer.observe(counter))
}

const initTimeline = () => {
  const wrap = $('.timeline-wrap'), steps = $$('.timeline-step'); if (!wrap || !steps.length) return
  const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting)), { threshold: .35 }); steps.forEach(step => observer.observe(step))
  addEventListener('scroll', () => { const rect = wrap.getBoundingClientRect(); const progress = Math.max(0, Math.min(100, ((innerHeight * .55 - rect.top) / rect.height) * 100)); wrap.style.setProperty('--progress', `${progress}%`) }, { passive:true })
}

const initContact = () => {
  const form = $('#quote-form'); if (!form) return
  const success = $('.success', form), status = $('.form-status', form)
  form.addEventListener('submit', event => {
    event.preventDefault(); let valid = true
    $$('[required]', form).forEach(field => { const error = $(`[data-error-for="${field.name}"]`, form); if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) { valid = false; if (error) error.textContent = 'Ce champ est requis.' } else if (error) error.textContent = '' })
    const email = $('input[type=email]', form); if (email?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { valid = false; $('[data-error-for="email"]', form).textContent = 'Vérifiez votre adresse email.' }
    if (!valid) { if (status) status.textContent = 'Vérifiez les champs signalés.'; return }
    status.textContent = ''; form.querySelector('.form-grid').hidden = true; $('.submit-row', form).hidden = true; success?.classList.add('is-visible')
  })
}

const initCursor = () => { if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const label = $('.cursor-label'); if (!label) return; addEventListener('pointermove', event => { label.style.left = `${event.clientX}px`; label.style.top = `${event.clientY}px` }); $$('.project-image, .comparison').forEach(target => { target.addEventListener('mouseenter', () => { label.textContent = target.classList.contains('comparison') ? 'GLISSER' : 'VOIR'; label.classList.add('is-visible') }); target.addEventListener('mouseleave', () => label.classList.remove('is-visible')) }) }

initNavigation(); initExpertiseIndex(); initReveals(); initMarquee(); initBeforeAfter(); initPortfolio(); initProcess(); initTestimonials(); initCounters(); initTimeline(); initContact(); initCursor()
