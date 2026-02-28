document.addEventListener('DOMContentLoaded', () => {
    // Reveal page (fade in)
    document.body.classList.add('fade-in');

    // Handle page transitions (fade out) for links
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply to internal links
            if (this.hostname === window.location.hostname && !this.getAttribute('target') && this.href.indexOf('#') === -1) {
                e.preventDefault();
                const targetUrl = this.href;
                
                // Fade out
                document.body.classList.remove('fade-in');
                
                // Navigate after transition finishes
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 400); // match CSS duration
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Set active link based on current URL
    const currentLocation = location.href;
    const menuItems = document.querySelectorAll('.nav-links a');
    const menuLength = menuItems.length;
    for (let i = 0; i < menuLength; i++) {
        if (menuItems[i].href === currentLocation) {
            menuItems[i].className = "active";
        }
    }

    // Simple scroll animation for cards
    const cards = document.querySelectorAll('.card');
    
    const observer = new IntersectionObserver(entries => {
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

    // Audio Player Logic
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    
    if (bgMusic && musicToggle) {
        // Restore playback position
        const savedTime = sessionStorage.getItem('musicTime');
        if (savedTime !== null) {
            bgMusic.currentTime = parseFloat(savedTime);
        }

        // Save position continuously before the user leaves the page
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('musicTime', bgMusic.currentTime);
        });

        // Function to attempt playing music
        const tryPlayMusic = () => {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    musicToggle.textContent = '🔊';
                    musicToggle.classList.add('playing');
                    sessionStorage.setItem('musicPlaying', 'true');
                }).catch(error => {
                    console.log("Autoplay prevented by browser: ", error);
                    musicToggle.textContent = '🔇';
                    sessionStorage.setItem('musicPlaying', 'false');
                });
            }
        };

        // Try to play immediately if sessionStorage says it should, OR if it has not been explicitly paused
        const playState = sessionStorage.getItem('musicPlaying');
        if (playState !== 'false') {
            setTimeout(tryPlayMusic, 500); // Slight delay helps with some browsers
        } else {
            musicToggle.textContent = '🔇';
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
