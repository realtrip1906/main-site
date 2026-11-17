import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Custom Cursor ---
  const cursor = document.getElementById("custom-cursor");
  const cursorText = cursor.querySelector(".cursor-text");

  // enable custom cursor only when JS is running and cursor exists
  if (cursor) {
    document.body.classList.add("custom-cursor-enabled");
  }

  window.addEventListener("mousemove", (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: "power2.out",
    });
  });

  document
    .querySelectorAll("a, button, .experience-card, .fleet-card")
    .forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("active");
        if (el.closest(".slider-container")) {
          cursorText.style.opacity = 1;
          cursorText.innerText = "DRAG";
        } else {
          cursorText.style.opacity = 0;
        }
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("active");
        cursorText.style.opacity = 0;
      });
    });

  // --- 2. Magnetic Buttons ---
  const magneticItems = document.querySelectorAll(".btn-primary, .btn-accent");
  magneticItems.forEach((item) => {
    item.addEventListener("mousemove", (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(item, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    item.addEventListener("mouseleave", () => {
      gsap.to(item, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
      });
    });
  });

  // --- 3. Hero Entrance ---
  const heroTl = gsap.timeline();
  heroTl
    .from(".hero-bg", { scale: 1.2, duration: 2, ease: "power2.out" })
    .from(
      ".hero h1",
      { y: 100, opacity: 0, duration: 1.2, ease: "power4.out" },
      "-=1.5",
    )
    .from(".hero .text-meta", { y: 20, opacity: 0, duration: 0.8 }, "-=0.8");

  // --- 4. Horizontal Scroll & Progress ---
  const experiencesTrack = document.querySelector(".gsap-track");
  const progressBar = document.querySelector(".experience-progress-bar");

  if (experiencesTrack) {
    // Use native horizontal scrolling inside the track's container.
    // When the user scrolls (wheel/trackpad) while the pointer is over the section,
    // convert vertical wheel delta to horizontal scroll so the section scrolls horizontally
    // but otherwise the page scroll behaves normally.
    const slider = experiencesTrack;
    const sliderContainer =
      slider.closest(".slider-container") || slider.parentElement;

    // Ensure the container allows horizontal overflow
    if (sliderContainer) {
      sliderContainer.style.overflowX = "auto";
      sliderContainer.style.overflowY = "hidden";
      sliderContainer.style.webkitOverflowScrolling = "touch";

      // Shared eased scroll target (wheel + keyboard share this value)
      let _targetScrollLeft = 0;
      const _sliderMaxScroll = () =>
        Math.max(0, sliderContainer.scrollWidth - sliderContainer.clientWidth);

      // Wheel -> horizontal GSAP-eased scroll while pointer is inside the container
      sliderContainer.addEventListener(
        "wheel",
        (e) => {
          // Only convert when there's a vertical delta
          if (Math.abs(e.deltaY) > 0) {
            e.preventDefault();
            _targetScrollLeft = Math.max(
              0,
              Math.min(_sliderMaxScroll(), _targetScrollLeft + e.deltaY),
            );
            gsap.to(sliderContainer, {
              scrollLeft: _targetScrollLeft,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        },
        { passive: false },
      );

      // Update progress bar based on horizontal scroll
      const updateProgress = () => {
        if (!progressBar) return;
        const max = Math.max(
          0,
          slider.scrollWidth - sliderContainer.clientWidth,
        );
        const pct = max === 0 ? 0 : sliderContainer.scrollLeft / max;
        progressBar.style.width = Math.min(100, Math.max(0, pct * 100)) + "%";
      };

      sliderContainer.addEventListener("scroll", updateProgress, {
        passive: true,
      });
      // initial update
      setTimeout(updateProgress, 100);

      // make slider focusable for keyboard navigation
      try {
        sliderContainer.setAttribute("tabindex", "0");
      } catch (err) {}

      // --- Drag-to-scroll (pointer) ---
      let isDown = false;
      let startX = 0;
      let scrollLeftStart = 0;
      let activePointerId = null;

      sliderContainer.addEventListener("pointerdown", (e) => {
        isDown = true;
        activePointerId = e.pointerId;
        try {
          sliderContainer.setPointerCapture(activePointerId);
        } catch (err) {}
        sliderContainer.classList.add("dragging");
        startX = e.clientX;
        scrollLeftStart = sliderContainer.scrollLeft;
      });

      sliderContainer.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.clientX;
        const walk = startX - x;
        sliderContainer.scrollLeft = scrollLeftStart + walk;
      });

      const endDrag = (e) => {
        if (!isDown) return;
        isDown = false;
        try {
          sliderContainer.releasePointerCapture(activePointerId);
        } catch (err) {}
        _targetScrollLeft = sliderContainer.scrollLeft; // sync eased target with dragged position
        sliderContainer.classList.remove("dragging");
      };

      sliderContainer.addEventListener("pointerup", endDrag);
      sliderContainer.addEventListener("pointercancel", endDrag);
      sliderContainer.addEventListener("mouseleave", endDrag);

      // --- Keyboard navigation (when focused or hovered) ---
      let isPointerOver = false;
      sliderContainer.addEventListener(
        "mouseenter",
        () => (isPointerOver = true),
      );
      sliderContainer.addEventListener(
        "mouseleave",
        () => (isPointerOver = false),
      );

      document.addEventListener("keydown", (e) => {
        const active =
          document.activeElement === sliderContainer || isPointerOver;
        if (!active) return;
        const step = Math.round(sliderContainer.clientWidth * 0.5);
        if (e.key === "ArrowRight" || e.key === "Right") {
          e.preventDefault();
          _targetScrollLeft = Math.min(
            _sliderMaxScroll(),
            _targetScrollLeft + step,
          );
          gsap.to(sliderContainer, {
            scrollLeft: _targetScrollLeft,
            duration: 0.65,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        } else if (e.key === "ArrowLeft" || e.key === "Left") {
          e.preventDefault();
          _targetScrollLeft = Math.max(0, _targetScrollLeft - step);
          gsap.to(sliderContainer, {
            scrollLeft: _targetScrollLeft,
            duration: 0.65,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        }
      });

      // --- GSAP per-card parallax using container as scroller ---
      try {
        const cards = gsap.utils.toArray(".experience-card");
        const mmParallax = gsap.matchMedia();
        mmParallax.add("(min-width: 768px)", () => {
          cards.forEach((card) => {
            gsap.to(card, {
              backgroundPosition: "70% 50%",
              ease: "none",
              scrollTrigger: {
                scroller: sliderContainer,
                trigger: card,
                start: "left center",
                end: "right center",
                scrub: true,
              },
            });
          });
        });
      } catch (err) {
        // ignore if ScrollTrigger setup fails
      }

      // --- Card h3 text fade-reveal horizontally (slides in from right on enter) ---
      try {
        const expCards = gsap.utils.toArray(".experience-card");
        expCards.forEach((card) => {
          const h3 = card.querySelector("h3");
          if (h3) gsap.set(h3, { opacity: 0, x: 50 });
        });
        const textRevealObs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const h3 = entry.target.querySelector("h3");
              if (!h3) return;
              if (entry.isIntersecting) {
                gsap.to(h3, {
                  opacity: 1,
                  x: 0,
                  duration: 0.55,
                  ease: "power2.out",
                  clearProps: "transform",
                });
              } else {
                gsap.set(h3, { opacity: 0, x: 50 });
              }
            });
          },
          { root: sliderContainer, threshold: 0.35 },
        );
        expCards.forEach((card) => textRevealObs.observe(card));
      } catch (err) {}
    }
  }

  // --- 5. Journey Path Drawing ---
  const path = document.querySelector("#path-1");
  if (path) {
    const pathLength = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
  }

  // --- 6. Parallax Scroller (Flowing Text) ---
  const flowingText = document.querySelector(".flowing-text");
  if (flowingText) {
    gsap.to(flowingText, {
      xPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: ".parallax-scroller",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  }

  // --- 7. Section Reveal Animations ---
  gsap.utils
    .toArray(".section, .fleet-card, .journal-post, .anatomy-grid")
    .forEach((el) => {
      gsap.from(el, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

  // --- 8. Anatomy Steps Stagger ---
  const steps = gsap.utils.toArray(".step-item");
  if (steps.length > 0) {
    gsap.from(steps, {
      x: -30,
      opacity: 0,
      stagger: 0.3,
      duration: 0.8,
      scrollTrigger: {
        trigger: ".anatomy-steps",
        start: "top 80%",
      },
    });
  }

  // --- 9. Follow Our Journey Scattered Parallax ---
  const items = gsap.utils.toArray(".scatter-item");
  const journeySection = document.querySelector(".image-scatter-v2");

  if (journeySection && items.length > 0) {
    const positions = [
      { top: "5%", left: "5%", rotation: -15, scale: 0.7 },
      { top: "10%", left: "80%", rotation: 10, scale: 0.8 },
      { top: "50%", left: "2%", rotation: -5, scale: 0.9 },
      { top: "75%", left: "85%", rotation: 12, scale: 0.75 },
      { top: "5%", left: "40%", rotation: 5, scale: 0.85 },
      { top: "70%", left: "30%", rotation: -8, scale: 0.8 },
      { top: "40%", left: "75%", rotation: 15, scale: 0.7 },
      { top: "80%", left: "10%", rotation: -10, scale: 0.9 },
    ];

    items.forEach((item, i) => {
      const pos = positions[i % positions.length];
      if (window.innerWidth < 768) {
        gsap.set(item, { width: "150px", height: "220px" });
      }

      gsap.set(item, {
        top: pos.top,
        left: pos.left,
        rotation: pos.rotation,
        scale: pos.scale,
        opacity: 0,
        y: 150,
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
        toggleActions: "play none none reverse",
      },
    });

    items.forEach((item, i) => {
      gsap.to(item, {
        y: i % 2 === 0 ? -250 : 250,
        rotation: i % 2 === 0 ? 5 : -5,
        ease: "none",
        scrollTrigger: {
          trigger: journeySection,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      });
    });
  }

  // --- Mobile Menu Toggle ---
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");
  const mobileOverlay = document.getElementById("mobileOverlay");
  const mobileClose = document.getElementById("mobileClose");

  if (hamburger && mobileNav && mobileOverlay) {
    const toggleMenu = (forceClose = false) => {
      if (forceClose) {
        hamburger.classList.remove("active");
        mobileNav.classList.remove("active");
        mobileOverlay.classList.remove("active");
        document.body.style.overflow = "";
      } else {
        hamburger.classList.toggle("active");
        mobileNav.classList.toggle("active");
        mobileOverlay.classList.toggle("active");
        document.body.style.overflow = hamburger.classList.contains("active")
          ? "hidden"
          : "";
      }
    };

    // Open/close with hamburger
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close with overlay click
    mobileOverlay.addEventListener("click", () => {
      toggleMenu(true);
    });

    // Close with close button
    if (mobileClose) {
      mobileClose.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu(true);
      });
    }

    // Close menu when clicking a link
    const mobileLinks = mobileNav.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        toggleMenu(true);
      });
    });

    // Prevent clicks inside mobile nav from closing it
    mobileNav.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // --- Accordion Toggle for Package Itineraries ---
  const accordionToggles = document.querySelectorAll(".accordion-toggle");

  accordionToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("data-accordion");
      const content = document.getElementById(targetId);

      // Toggle active state
      toggle.classList.toggle("active");
      content.classList.toggle("active");

      // Close other accordions
      accordionToggles.forEach((otherToggle) => {
        if (otherToggle !== toggle) {
          otherToggle.classList.remove("active");
          const otherTargetId = otherToggle.getAttribute("data-accordion");
          const otherContent = document.getElementById(otherTargetId);
          otherContent.classList.remove("active");
        }
      });
    });
  });

  // --- Package Card Slideshow (locations folder images) ---
  const packageImageMap = {
    darjeeling: [
      "./images/locations/darjeeling/darjeeling.jpg",
      "./images/locations/darjeeling/batasialoop.jpg",
      "./images/locations/darjeeling/darjeelingzoo.webp",
      "./images/locations/darjeeling/ghoommonastry.jpg",
      "./images/locations/darjeeling/miriklake.jpg",
      "./images/locations/darjeeling/tenzingrock.jpg",
    ],
    "darjeeling-offbeat": [
      "./images/locations/darjeelingoffbeat/darjeelingoffbeat.jpg",
      "./images/locations/darjeelingoffbeat/lepchajagat.jpg",
      "./images/locations/darjeelingoffbeat/peshok.webp",
      "./images/locations/darjeelingoffbeat/sittong.jpg",
    ],
    "silk-route": [
      "./images/locations/silkroute/silkroute.jpg",
      "./images/locations/silkroute/abhijit-bala-tLC3b81wF14-unsplash.jpg",
      "./images/locations/silkroute/dhruvin-pandya-2CtylGpCLNQ-unsplash.jpg",
      "./images/locations/silkroute/dhruvin-pandya-E6b0IJ-mETE-unsplash.jpg",
      "./images/locations/silkroute/dhruvin-pandya-Mrp0rnWgFI0-unsplash.jpg",
    ],
    "west-sikkim": [
      "./images/locations/westsikkim/westsikkim.jpg",
      "./images/locations/westsikkim/pemayangtse-monastery-featured.jpg",
      "./images/locations/westsikkim/pratap-chhetri-aiWjc9WoWeA-unsplash.jpg",
      "./images/locations/westsikkim/prodeepta-bera-OyaRMukq4gI-unsplash.jpg",
      "./images/locations/westsikkim/z-pelling-khecheolpalri.jpg",
    ],
    "north-sikkim": [
      "./images/locations/northsikkim/northsikkim.jpg",
      "./images/locations/northsikkim/aakanksha-A0vabw8DVx0-unsplash.jpg",
      "./images/locations/northsikkim/abhishek-singh-xJDJ4PxkHvU-unsplash.jpg",
      "./images/locations/northsikkim/anshika-7vHDicrPYOI-unsplash.jpg",
      "./images/locations/northsikkim/bhaskar-agarwal-2LxJQfP40-o-unsplash.jpg",
      "./images/locations/northsikkim/bhaskar-palit-I8DKi3ely24-unsplash.jpg",
      "./images/locations/northsikkim/karthik-swarnkar-wjpdD8H_n7Y-unsplash.jpg",
    ],
    "kalimpong-offbeat": [
      "./images/locations/kalimpong/kalimpong.jpg",
      "./images/locations/kalimpong/abhi-shek-tCyfoYRpjiM-unsplash.jpg",
      "./images/locations/kalimpong/aman-upadhyay-5nPDGyAmZ10-unsplash.jpg",
      "./images/locations/kalimpong/tiasha-dhar---kpJZYdvP0-unsplash.jpg",
    ],
    arunachal: [
      "./images/locations/arunachal/arunachal.jpg",
      "./images/locations/arunachal/nagarjun-parthasarathy-Vm4FK5GGo9Q-unsplash.jpg",
      "./images/locations/arunachal/sohan-rayguru-8pg0LoPoGEo-unsplash.jpg",
      "./images/locations/arunachal/unexplored-northeast-gAMDoqWIifs-unsplash.jpg",
    ],
    himachal: [
      "./images/locations/himachal/himachal.jpg",
      "./images/locations/himachal/mohit-khatri-YdROcw9okMw-unsplash.jpg",
      "./images/locations/himachal/rishabh-pandoh-m1PFxGQ-5x0-unsplash.jpg",
      "./images/locations/himachal/sajal-das-rc5eyrn5lBU-unsplash.jpg",
    ],
    spiti: [
      "./images/locations/spitivalley/spitivalley.jpg",
      "./images/locations/spitivalley/bisakha-datta-gdOwnNFZh4k-unsplash.jpg",
      "./images/locations/spitivalley/parth-viradiya-t-xBaR5iQO8-unsplash.jpg",
      "./images/locations/spitivalley/rohit-dey-keQTJcO-tvA-unsplash.jpg",
    ],
    kashmir: [
      "./images/locations/kashmir/kashmir.jpg",
      "./images/locations/kashmir/arif-khan-4hr8MStXT7s-unsplash.jpg",
      "./images/locations/kashmir/divya-agrawal-qa8VhqvJGIo-unsplash.jpg",
      "./images/locations/kashmir/isa-72GwiojCwoI-unsplash.jpg",
      "./images/locations/kashmir/praneet-kumar-H8dcf-v98mA-unsplash.jpg",
    ],
    andaman: [
      "./images/locations/andaman/andaman.jpg",
      "./images/locations/andaman/dileesh-kumar-KbirwZJIq7g-unsplash.jpg",
      "./images/locations/andaman/smit-shah-8WvGIQmRGLM-unsplash.jpg",
      "./images/locations/andaman/tatonomusic-1X3YSIuqYeM-unsplash.jpg",
    ],
    dooars: [
      "./images/locations/dooars/dooars.jpg",
      "./images/locations/dooars/boudhayan-bardhan-3pqTIQ1IDP4-unsplash.jpg",
      "./images/locations/dooars/boudhayan-bardhan-4CIdV3mSGBg-unsplash.jpg",
      "./images/locations/dooars/boudhayan-bardhan-mtM_wMeNYUA-unsplash.jpg",
      "./images/locations/dooars/boudhayan-bardhan-wulpLo7McHU-unsplash.jpg",
    ],
  };

  const packageCards = document.querySelectorAll(".package-detail-card");
  packageCards.forEach((card) => {
    const key = card.id;
    const images = packageImageMap[key];
    const imgContainer = card.querySelector(".pkg-img");
    if (!imgContainer || !images || images.length === 0) return;

    // Keep first image as fallback/background.
    imgContainer.style.backgroundImage = `url('${images[0]}')`;
    imgContainer
      .querySelectorAll(".pkg-img-slideshow")
      .forEach((n) => n.remove());

    const slides = [];
    const ROTATE_INTERVAL = 1800;
    images.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        const div = document.createElement("div");
        div.className = "pkg-img-slideshow";
        div.style.backgroundImage = `url('${url}')`;
        imgContainer.appendChild(div);
        slides.push(div);
      };
      img.onerror = () => {
        // ignore missing files so slideshow still works with available images
      };
      img.src = url;
    });

    let currentIndex = 0;
    let interval = null;

    const play = () => {
      if (interval) return;
      if (slides.length === 0) {
        setTimeout(play, 250);
        return;
      }
      if (currentIndex >= slides.length) currentIndex = 0;
      slides.forEach((s) => s.classList.remove("active"));
      slides[currentIndex].classList.add("active");
      interval = setInterval(() => {
        slides[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add("active");
      }, ROTATE_INTERVAL);
    };

    const pause = () => {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
      // Reset to first slide when hover ends
      slides.forEach((s) => s.classList.remove("active"));
      currentIndex = 0;
    };

    // Only play on hover
    card.addEventListener("mouseenter", play);
    card.addEventListener("mouseleave", pause);
  });

  // --- Homestay Image Slideshow on Hover (exact known image sets, no 404 spam) ---
  const HOMESTAY_IMAGES = {
    aritar: [1, 2, 3, 4, 5].map((i) => `./images/homestays/aritar/${i}.jpg`),
    darjeeling: [1, 2, 3, 4, 5, 6, 7].map(
      (i) =>
        `./images/homestays/darjeeling/DarjeelingDeluxeRoomStarting 2600pernight/1-${i}.jpeg`,
    ),
    lava: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
      (i) => `./images/homestays/lava/${i}.jpg`,
    ),
    lepchajagat: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
      (i) => `./images/homestays/lepchajagat/${i}.jpg`,
    ),
    phadamchen: [1, 2].map((i) => `./images/homestays/phadamchen/${i}.jpg`),
    ramdhura: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
      (i) => `./images/homestays/ramdhura/${i}.jpg`,
    ),
    sillerygaon: [1, 2, 3, 4, 5].map(
      (i) => `./images/homestays/sillerygaon/${i}.jpg`,
    ),
    sittong: [1, 2, 3, 4, 5, 6, 7, 8].map(
      (i) => `./images/homestays/sittong/${i}.jpeg`,
    ),
  };

  const homestayCards = document.querySelectorAll(".homestay-detail-card");
  homestayCards.forEach((card) => {
    const imgContainer = card.querySelector(".homestay-img");
    if (!imgContainer) return;

    let folder = imgContainer.dataset.folder;
    if (!folder) {
      const bg = imgContainer.style.backgroundImage || "";
      const m = bg.match(/images\/homestays\/([^/\\]+)\//);
      folder = m ? m[1] : null;
    }
    if (!folder) return;

    const list = HOMESTAY_IMAGES[folder] || [];
    if (list.length === 0) return;

    // clear any existing static slideshow nodes
    const existing = imgContainer.querySelectorAll(".homestay-img-slideshow");
    existing.forEach((n) => n.remove());

    const slides = [];
    const ROTATE_INTERVAL = 1500;

    list.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        const div = document.createElement("div");
        div.className = "homestay-img-slideshow";
        div.style.backgroundImage = `url('${url}')`;
        imgContainer.appendChild(div);
        slides.push(div);
      };
      img.src = url;
    });

    let currentIndex = 0;
    let interval = null;

    const play = () => {
      if (interval) return;
      if (slides.length === 0) {
        setTimeout(play, 300);
        return;
      }
      if (currentIndex >= slides.length) currentIndex = 0;
      slides.forEach((s) => s.classList.remove("active"));
      slides[currentIndex].classList.add("active");
      interval = setInterval(() => {
        slides[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add("active");
      }, ROTATE_INTERVAL);
    };

    const pause = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    play();
    card.addEventListener("mouseenter", pause);
    card.addEventListener("mouseleave", play);
  });

  // --- Floating WhatsApp + Scroll-to-Top (all pages) ---
  const floatingActions = document.createElement("div");
  floatingActions.className = "floating-actions";
  floatingActions.innerHTML = `
    <a
      href="https://www.instagram.com/realtrip.in"
      class="floating-btn instagram"
      target="_blank"
      rel="noopener"
      aria-label="Visit our Instagram"
      title="Instagram"
    >
      <i class="fa-brands fa-instagram"></i>
    </a>
    <a
      href="https://wa.me/918972516305?text=Hi%20Real%20Trip%2C%20I%20want%20to%20plan%20a%20trip."
      class="floating-btn whatsapp"
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <i class="fa-brands fa-whatsapp"></i>
    </a>
    <button
      type="button"
      class="floating-btn scroll-top"
      id="scrollTopBtn"
      aria-label="Scroll to top"
      title="Back to top"
    >
      <i class="fa-solid fa-arrow-up"></i>
    </button>
  `;
  document.body.appendChild(floatingActions);

  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const toggleScrollTopVisibility = () => {
    if (!scrollTopBtn) return;
    scrollTopBtn.classList.toggle("visible", window.scrollY > 300);
  };

  window.addEventListener("scroll", toggleScrollTopVisibility, {
    passive: true,
  });
  toggleScrollTopVisibility();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // --- About Page Narrative Reveal ---
  const narrativeSteps = document.querySelectorAll(".narrative-step");
  if (narrativeSteps.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    narrativeSteps.forEach((step) => observer.observe(step));
  }

  // --- Smooth Anchor Scrolling ---
  const scrollToSection = (targetId, behavior = "smooth") => {
    const target = document.querySelector(targetId);
    if (!target) return;

    // Get navbar height for offset
    const navbar = document.querySelector(".navbar");
    const navbarHeight = navbar ? navbar.offsetHeight + 20 : 80;

    const targetPosition =
      target.getBoundingClientRect().top + window.scrollY - navbarHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: behavior,
    });
  };

  // Handle anchor link clicks
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href === "#!") return;

      const targetId = href;
      const target = document.querySelector(targetId);

      if (target) {
        e.preventDefault();

        // Close mobile menu first if open
        if (mobileNav && mobileNav.classList.contains("active")) {
          hamburger.classList.remove("active");
          mobileNav.classList.remove("active");
          mobileOverlay.classList.remove("active");
          document.body.style.overflow = "";

          // Wait for menu to close, then scroll
          setTimeout(() => {
            scrollToSection(targetId);
          }, 300);
        } else {
          scrollToSection(targetId);
        }
      }
    });
  });

  // Handle hash on page load (e.g., coming from another page)
  if (window.location.hash) {
    // Wait for page to fully load and animations to settle
    setTimeout(() => {
      scrollToSection(window.location.hash, "auto");
    }, 100);
  }

  // --- Background music (global: persists across pages via localStorage) ---
  const musicToggle = document.getElementById("musicToggle");
  const bgAudio = document.getElementById("bg-audio");
  if (musicToggle && bgAudio) {
    const LS_TIME = "bgAudioTime";
    const LS_PLAYING = "bgAudioPlaying";

    bgAudio.volume = 0.18;
    let isPlaying = false;

    const setIcon = () => {
      musicToggle.innerHTML = isPlaying
        ? '<i class="fa-solid fa-volume-high"></i>'
        : '<i class="fa-solid fa-music"></i>';
      musicToggle.classList.toggle("playing", isPlaying);
    };

    // Restore saved playhead position
    const restoreTime = () => {
      const saved = parseFloat(localStorage.getItem(LS_TIME) || "0");
      if (!Number.isNaN(saved) && saved > 0) {
        bgAudio.currentTime = saved;
      }
    };

    const wasPlaying = localStorage.getItem(LS_PLAYING) === "true";

    if (wasPlaying) {
      bgAudio.preload = "auto";
      // Once enough data is available, set time and attempt resume
      bgAudio.addEventListener(
        "canplay",
        () => {
          restoreTime();
          bgAudio
            .play()
            .then(() => {
              isPlaying = true;
              setIcon();
            })
            .catch(() => {
              isPlaying = false;
              setIcon();
            });
        },
        { once: true },
      );

      // If canplay already fired (cached), restore immediately
      if (bgAudio.readyState >= 3) {
        restoreTime();
        bgAudio
          .play()
          .then(() => {
            isPlaying = true;
            setIcon();
          })
          .catch(() => {});
      }
    } else {
      bgAudio.preload = "none";
      setIcon();
    }

    // Save time to localStorage every second (throttled)
    let saveTimer = null;
    bgAudio.addEventListener("timeupdate", () => {
      if (saveTimer) return;
      saveTimer = setTimeout(() => {
        localStorage.setItem(LS_TIME, String(bgAudio.currentTime || 0));
        localStorage.setItem(LS_PLAYING, (!bgAudio.paused).toString());
        saveTimer = null;
      }, 1000);
    });

    // Save immediately on page navigation / tab hide
    const saveNow = () => {
      localStorage.setItem(LS_TIME, String(bgAudio.currentTime || 0));
      localStorage.setItem(LS_PLAYING, (!bgAudio.paused).toString());
    };
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) saveNow();
    });
    window.addEventListener("pagehide", saveNow);
    window.addEventListener("beforeunload", saveNow);

    musicToggle.addEventListener("click", (e) => {
      e.preventDefault();
      if (isPlaying) {
        bgAudio.pause();
        isPlaying = false;
      } else {
        if (bgAudio.preload === "none") {
          bgAudio.preload = "auto";
          bgAudio.load();
        }
        restoreTime();
        bgAudio.play().catch(() => {});
        isPlaying = true;
      }
      setIcon();
      saveNow();
    });
  }

  // --- Lazy play CTA Video ---
  const ctaVideo = document.getElementById("ctaVideo");
  if (ctaVideo && "IntersectionObserver" in window) {
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (ctaVideo.paused) {
              ctaVideo.play().catch(() => {});
            }
          } else {
            if (!ctaVideo.paused) {
              ctaVideo.pause();
            }
          }
        });
      },
      { rootMargin: "250px" },
    );
    ctaObserver.observe(ctaVideo);
  }

  // --- Fast Intra-Navigation Link Prefetcher ---
  (function () {
    const prefetched = new Set();
    const prefetchLink = (url) => {
      if (!url || prefetched.has(url)) return;
      try {
        const u = new URL(url, window.location.href);
        if (u.origin !== window.location.origin) return;
        if (
          u.pathname === window.location.pathname &&
          u.search === window.location.search
        )
          return;
        prefetched.add(url);
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = u.href;
        document.head.appendChild(link);
      } catch (e) {
        // ignore
      }
    };

    document.addEventListener(
      "mouseover",
      (e) => {
        const a = e.target.closest("a");
        if (a && a.href) prefetchLink(a.href);
      },
      { passive: true },
    );

    document.addEventListener(
      "touchstart",
      (e) => {
        const a = e.target.closest("a");
        if (a && a.href) prefetchLink(a.href);
      },
      { passive: true },
    );
  })();

  // --- Customized Itinerary Modal & 12-Second Floating Prompt ---
  (function () {
    const WHATSAPP_PHONE = "918972516305";

    // 1. Inject Modal HTML into body if not already present
    if (!document.getElementById("custom-itinerary-modal")) {
      const modalEl = document.createElement("div");
      modalEl.id = "custom-itinerary-modal";
      modalEl.className = "itinerary-modal-backdrop";
      modalEl.innerHTML = `
        <div class="itinerary-modal-card" role="dialog" aria-modal="true" aria-labelledby="itinerary-modal-title">
          <div class="itinerary-modal-header">
            <span class="popular-pkg-tag">TAILORED JOURNEYS</span>
            <h3 id="itinerary-modal-title">Get Your Customized Itinerary</h3>
            <p>Tell us your dream route and preferences. Our Himalayan travel experts will curate a personalized plan and send it directly on WhatsApp.</p>
            <button type="button" class="itinerary-modal-close" aria-label="Close modal">&times;</button>
          </div>
          <form class="itinerary-modal-form" id="custom-itinerary-form">
            <div class="itinerary-form-group">
              <label for="itin-destination">Destination / Tour Interest</label>
              <select id="itin-destination" required>
                <option value="Darjeeling & Offbeat Tour">Darjeeling & Offbeat (Sittong, Lepchajagat, Tinchuley)</option>
                <option value="Darjeeling 2 Nights 3 Days">Darjeeling 2 Nights 3 Days</option>
                <option value="Darjeeling Offbeat 3 Nights 4 Days">Darjeeling Offbeat 3 Nights 4 Days</option>
                <option value="Darjeeling Offbeat 4 Nights 5 Days">Darjeeling Offbeat 4 Nights 5 Days</option>
                <option value="Darjeeling Offbeat 5 Nights 6 Days">Darjeeling Offbeat 5 Nights 6 Days</option>
                <option value="Sikkim & North Sikkim">Sikkim & North Sikkim (Gangtok, Lachung, Yumthang)</option>
                <option value="Silk Route Old Route">Silk Route (Aritar, Zuluk, Nathang)</option>
                <option value="Kalimpong & Lava">Kalimpong & Lava Offbeat</option>
                <option value="Kashmir Valley">Kashmir Paradise Tour</option>
                <option value="Meghalaya & Northeast">Meghalaya Cloud Trails</option>
                <option value="Andaman Islands">Andaman Deep Blue</option>
                <option value="Custom Multi-Destination">Other / Custom Multi-Destination</option>
              </select>
            </div>

            <div class="itinerary-form-row">
              <div class="itinerary-form-group">
                <label for="itin-name">Your Full Name</label>
                <input type="text" id="itin-name" placeholder="e.g. Rahul Sharma" required />
              </div>
              <div class="itinerary-form-group">
                <label for="itin-phone">WhatsApp Number</label>
                <input type="tel" id="itin-phone" placeholder="e.g. +91 98765 43210" required />
              </div>
            </div>

            <div class="itinerary-form-row">
              <div class="itinerary-form-group">
                <label for="itin-dates">Planned Travel Dates / Month</label>
                <input type="text" id="itin-dates" placeholder="e.g. Next month / 15-20 Oct" required />
              </div>
              <div class="itinerary-form-group">
                <label for="itin-pax">Total Travellers</label>
                <select id="itin-pax" required>
                  <option value="2 Adults (Couple)">2 Adults (Couple)</option>
                  <option value="3-4 Persons (Family/Friends)">3–4 Persons (Family/Friends)</option>
                  <option value="5-6 Persons (Min. 6 Persons group)" selected>5–6 Persons (Standard Group)</option>
                  <option value="7-10 Persons (Large Group)">7–10 Persons (Large Group)</option>
                  <option value="10+ Persons (Corporate/Tour)">10+ Persons (Corporate / Large Tour)</option>
                </select>
              </div>
            </div>

            <div class="itinerary-form-group">
              <label for="itin-notes">Special Requirements / Notes (Optional)</label>
              <textarea id="itin-notes" placeholder="e.g. Mountain-facing homestay, sunrise at Tiger Hill, vehicle preference..."></textarea>
            </div>

            <button type="submit" class="btn-whatsapp-redirect">
              <i class="fa-brands fa-whatsapp" style="font-size: 1.25rem;"></i> Send to WhatsApp Expert
            </button>
            <div class="itinerary-direct-chat">
              Prefer quick chat? <a href="https://wa.me/918972516305?text=Hi%20Real%20Trip%2C%20I%20would%20like%20to%20get%20a%20customized%20tour%20itinerary!" target="_blank" rel="noopener">Chat directly on WhatsApp</a>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    // 2. Inject 12-Second Floating Prompt Toast if not already present
    if (!document.getElementById("itinerary-floating-prompt")) {
      const toastEl = document.createElement("div");
      toastEl.id = "itinerary-floating-prompt";
      toastEl.className = "itinerary-floating-prompt";
      toastEl.setAttribute("role", "status");
      toastEl.innerHTML = `
        <button type="button" class="floating-prompt-close" aria-label="Close inquiry prompt">&times;</button>
        <span class="floating-prompt-tag">
          <i class="fa-solid fa-compass"></i> PLANNING A HIMALAYAN TRIP?
        </span>
        <h4 class="floating-prompt-title">Get a Customized Itinerary</h4>
        <p class="floating-prompt-desc">Tell us your dates & travel style. We craft personalized itineraries with verified homestays & private cabs.</p>
        <div class="floating-prompt-actions">
          <a href="https://wa.me/918972516305?text=Hi%20Real%20Trip%2C%20I%20would%20like%20to%20get%20a%20customized%20tour%20itinerary!" target="_blank" rel="noopener" class="floating-prompt-btn-wa">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
          <button type="button" class="floating-prompt-btn-form open-itinerary-modal">
            Plan Itinerary →
          </button>
        </div>
      `;
      document.body.appendChild(toastEl);
    }

    const modal = document.getElementById("custom-itinerary-modal");
    const toast = document.getElementById("itinerary-floating-prompt");
    const closeBtn = modal?.querySelector(".itinerary-modal-close");
    const form = document.getElementById("custom-itinerary-form");
    const toastCloseBtn = toast?.querySelector(".floating-prompt-close");

    const openModal = (defaultDest) => {
      if (!modal) return;
      if (defaultDest) {
        const destSelect = modal.querySelector("#itin-destination");
        if (destSelect) {
          const match = Array.from(destSelect.options).find((opt) =>
            opt.value.toLowerCase().includes(defaultDest.toLowerCase()),
          );
          if (match) destSelect.value = match.value;
        }
      }
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove("active");
      document.body.style.overflow = "";
    };

    // Open triggers
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(".open-itinerary-modal");
      if (trigger) {
        e.preventDefault();
        const dest = trigger.dataset.destination || "";
        openModal(dest);
      }
    });

    closeBtn?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("active")) {
        closeModal();
      }
    });

    // Form submit -> WhatsApp redirect
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const dest = document.getElementById("itin-destination")?.value || "";
      const name = document.getElementById("itin-name")?.value || "";
      const phone = document.getElementById("itin-phone")?.value || "";
      const dates = document.getElementById("itin-dates")?.value || "";
      const pax = document.getElementById("itin-pax")?.value || "";
      const notes = document.getElementById("itin-notes")?.value || "None";

      const message =
        `Hello Real Trip Team! 🏔️\n` +
        `I would like to request a *Customized Tour Itinerary*:\n\n` +
        `📍 *Destination:* ${dest}\n` +
        `👤 *Name:* ${name}\n` +
        `📞 *Contact:* ${phone}\n` +
        `📅 *Travel Dates:* ${dates}\n` +
        `👥 *Travellers:* ${pax}\n` +
        `📝 *Special Notes:* ${notes}\n\n` +
        `Looking forward to your customized proposal!`;

      const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      closeModal();
      form.reset();
    });

    // 12-Second Prompt logic
    const PROMPT_SESSION_KEY = "rt_itinerary_prompt_dismissed";
    if (toast && sessionStorage.getItem(PROMPT_SESSION_KEY) !== "true") {
      setTimeout(() => {
        if (sessionStorage.getItem(PROMPT_SESSION_KEY) !== "true") {
          toast.classList.add("show");
        }
      }, 12000); // 12 seconds
    }

    toastCloseBtn?.addEventListener("click", () => {
      if (toast) toast.classList.remove("show");
      sessionStorage.setItem(PROMPT_SESSION_KEY, "true");
    });
  })();

  // --- 10. Prevent image download and dragging (practical deterrent) ---
  (function () {
    // disable right-click on images
    document.addEventListener(
      "contextmenu",
      function (e) {
        if (e.target && e.target.tagName === "IMG") e.preventDefault();
      },
      false,
    );

    // prevent dragstart on existing images
    document.querySelectorAll("img").forEach((img) => {
      img.setAttribute("draggable", "false");
      img.addEventListener("dragstart", (ev) => ev.preventDefault());
      img.addEventListener("contextmenu", (ev) => ev.preventDefault());
    });

    // observe DOM for newly added images (e.g., lazy loaders)
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          try {
            if (!node) return;
            if (node.tagName === "IMG") {
              node.setAttribute("draggable", "false");
              node.addEventListener("dragstart", (ev) => ev.preventDefault());
              node.addEventListener("contextmenu", (ev) => ev.preventDefault());
            } else if (node.querySelectorAll) {
              node.querySelectorAll("img").forEach((img) => {
                img.setAttribute("draggable", "false");
                img.addEventListener("dragstart", (ev) => ev.preventDefault());
                img.addEventListener("contextmenu", (ev) =>
                  ev.preventDefault(),
                );
              });
            }
          } catch (err) {
            // ignore
          }
        });
      });
    });

    mo.observe(document.body, { childList: true, subtree: true });
  })();
});
