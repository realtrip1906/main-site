import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Custom Cursor ---
  const cursor = document.getElementById('custom-cursor');
  const cursorText = cursor.querySelector('.cursor-text');

  window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: "power2.out"
    });
  });

  document.querySelectorAll('a, button, .experience-card, .fleet-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      if (el.closest('.slider-container')) {
        cursorText.style.opacity = 1;
        cursorText.innerText = 'DRAG';
      } else {
        cursorText.style.opacity = 0;
      }
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
      cursorText.style.opacity = 0;
    });
  });

  // --- 2. Magnetic Buttons ---
  const magneticItems = document.querySelectorAll('.btn-primary, .btn-accent');
  magneticItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(item, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });

  // --- 3. Hero Entrance ---
  const heroTl = gsap.timeline();
  heroTl.from('.hero-bg', { scale: 1.2, duration: 2, ease: 'power2.out' })
    .from('.hero h1', { y: 100, opacity: 0, duration: 1.2, ease: 'power4.out' }, "-=1.5")
    .from('.hero .text-meta', { y: 20, opacity: 0, duration: 0.8 }, "-=0.8");

  // --- 4. Horizontal Scroll & Progress ---
  const experiencesTrack = document.querySelector('.gsap-track');
  const progressBar = document.querySelector('.experience-progress-bar');

  if (experiencesTrack) {
    const cards = gsap.utils.toArray('.experience-card');

    gsap.to(cards, {
      x: () => -(experiencesTrack.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        id: "experiences",
        trigger: "#experiences",
        pin: true,
        scrub: 1,
        start: "top top",
        end: () => "+=" + experiencesTrack.scrollWidth,
        onUpdate: (self) => {
          if (progressBar) {
            gsap.set(progressBar, { width: (self.progress * 100) + "%" });
          }
        }
      }
    });

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      cards.forEach(card => {
        gsap.to(card, {
          backgroundPosition: "70% 50%",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "left right",
            end: "right left",
            scrub: true,
            containerAnimation: gsap.getById("experiences")
          }
        });
      });
    });
  }

  // --- 5. Journey Path Drawing ---
  const path = document.querySelector('#path-1');
  if (path) {
    const pathLength = path.getTotalLength();
    gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
      }
    });
  }

  // --- 6. Parallax Scroller (Flowing Text) ---
  const flowingText = document.querySelector('.flowing-text');
  if (flowingText) {
    gsap.to(flowingText, {
      xPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: ".parallax-scroller",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });
  }

  // --- 7. Section Reveal Animations ---
  gsap.utils.toArray('.section, .fleet-card, .journal-post, .anatomy-grid').forEach((el) => {
    gsap.from(el, {
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });

  // --- 8. Anatomy Steps Stagger ---
  const steps = gsap.utils.toArray('.step-item');
  if (steps.length > 0) {
    gsap.from(steps, {
      x: -30,
      opacity: 0,
      stagger: 0.3,
      duration: 0.8,
      scrollTrigger: {
        trigger: ".anatomy-steps",
        start: "top 80%",
      }
    });
  }

  // --- 9. Follow Our Journey Scattered Parallax ---
  const items = gsap.utils.toArray('.scatter-item');
  const journeySection = document.querySelector('.image-scatter-v2');

  if (journeySection && items.length > 0) {
    const positions = [
      { top: '5%', left: '5%', rotation: -15, scale: 0.7 },
      { top: '10%', left: '80%', rotation: 10, scale: 0.8 },
      { top: '50%', left: '2%', rotation: -5, scale: 0.9 },
      { top: '75%', left: '85%', rotation: 12, scale: 0.75 },
      { top: '5%', left: '40%', rotation: 5, scale: 0.85 },
      { top: '70%', left: '30%', rotation: -8, scale: 0.8 },
      { top: '40%', left: '75%', rotation: 15, scale: 0.7 },
      { top: '80%', left: '10%', rotation: -10, scale: 0.9 },
    ];

    items.forEach((item, i) => {
      const pos = positions[i % positions.length];
      if (window.innerWidth < 768) {
        gsap.set(item, { width: '150px', height: '220px' });
      }

      gsap.set(item, {
        top: pos.top,
        left: pos.left,
        rotation: pos.rotation,
        scale: pos.scale,
        opacity: 0,
        y: 150
      });
    });

    gsap.to(items, {
      opacity: 1,
      y: 0,
      stagger: { amount: 2, from: "random" },
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: journeySection,
        start: "top 70%",
        toggleActions: "play none none reverse"
      }
    });

    items.forEach((item, i) => {
      gsap.to(item, {
        y: (i % 2 === 0 ? -250 : 250),
        rotation: (i % 2 === 0 ? 5 : -5),
        ease: "none",
        scrollTrigger: {
          trigger: journeySection,
          start: "top bottom",
          end: "bottom top",
          scrub: 2
        }
      });
    });
  }

});
