let observer;

function initDynamicContent() {
    // Reveal page (fade in)
    document.body.classList.add('fade-in');

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Set active link based on current URL
    const currentLocation = location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.nav-links a');
    menuItems.forEach(item => {
        const itemPage = item.getAttribute('href');
        if (itemPage === currentLocation) {
            item.className = "active";
        } else {
            item.className = "";
        }
    });

    // Simple scroll animation for cards
    const cards = document.querySelectorAll('.card');
    
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

function navigateTo(url, pushState = true) {
    document.body.classList.remove('fade-in');
    
    setTimeout(async () => {
        try {
            const response = await fetch(url);
            const html = await response.text();
            
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            document.title = newDoc.title;
            
            // Remove everything except audio, toggle, and script
            const childrenToRemove = Array.from(document.body.children).filter(
                el => el.id !== 'bg-music' && el.id !== 'music-toggle' && el.tagName !== 'SCRIPT'
            );
            childrenToRemove.forEach(el => el.remove());
            
            // Add new nodes
            const newChildren = Array.from(newDoc.body.children).filter(
                el => el.id !== 'bg-music' && el.id !== 'music-toggle' && el.tagName !== 'SCRIPT'
            );
            
            const audioEl = document.getElementById('bg-music');
            newChildren.forEach(el => document.body.insertBefore(el, audioEl));
            
            if (pushState) {
                window.history.pushState({}, '', url);
            }
            
            initDynamicContent();
            window.scrollTo(0, 0);
        } catch (err) {
            window.location.href = url; // fallback to hard navigation
        }
    }, 400); // Wait for fade out
}

function initSPA() {
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        // Safer check for internal links
        if (link.hostname === window.location.hostname && !link.getAttribute('target') && !link.getAttribute('href').startsWith('#') && !link.getAttribute('href').startsWith('mailto:')) {
            e.preventDefault();
            navigateTo(link.href, true);
        }
    });

    window.addEventListener('popstate', () => {
        navigateTo(location.href, false);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initDynamicContent();
    initSPA();
    
    // Audio Player Logic
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    
    if (bgMusic && musicToggle) {
        const tryPlayMusic = () => {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    musicToggle.textContent = '🔊';
                    musicToggle.classList.add('playing');
                }).catch(error => {
                    console.log("Autoplay prevented");
                    musicToggle.textContent = '🔇';
                });
            }
        };

        if (sessionStorage.getItem('musicPlaying') !== 'false') {
            setTimeout(tryPlayMusic, 500);
        } else {
            musicToggle.textContent = '🔇';
            bgMusic.pause();
        }

        musicToggle.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play();
                musicToggle.textContent = '🔊';
                musicToggle.classList.add('playing');
                sessionStorage.setItem('musicPlaying', 'true');
            } else {
                bgMusic.pause();
                musicToggle.textContent = '🔇';
                musicToggle.classList.remove('playing');
                sessionStorage.setItem('musicPlaying', 'false');
            }
        });
    }
});
