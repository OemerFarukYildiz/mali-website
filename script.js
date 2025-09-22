let currentScreen = -1; // Start with guide screen
const totalScreens = 9;
let touchStartX = 0;
let touchEndX = 0;
let isTransitioning = false;
let guideShown = false;
let introShown = false;

function init() {
    const container = document.querySelector('.container');
    
    container.addEventListener('click', handleTap);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    document.addEventListener('keydown', handleKeyPress);
    
    createStars();
    
    // Set background music volume
    const bgMusic = document.getElementById('background-music');
    if (bgMusic) {
        bgMusic.volume = 0.1;
    }
    
    // Check if iOS Safari and not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    
    if (isIOS && !isStandalone) {
        setTimeout(() => {
            document.getElementById('install-prompt').style.display = 'block';
        }, 3000);
        
        document.getElementById('close-prompt').addEventListener('click', () => {
            document.getElementById('install-prompt').style.display = 'none';
        });
    }
    
    setTimeout(() => {
        document.querySelector('.navigation-hint').style.display = 'block';
    }, 2000);
    
    setTimeout(() => {
        document.querySelector('.navigation-hint').style.display = 'none';
    }, 7000);
}

function handleTap(e) {
    if (e.target.closest('.navigation-hint')) return;
    
    // Handle guide screen
    if (currentScreen === -1 && !guideShown) {
        guideShown = true;
        nextScreen();
        return;
    }
    
    // Handle intro screen
    if (currentScreen === 0 && !introShown) {
        const bgMusic = document.getElementById('background-music');
        if (bgMusic) {
            bgMusic.play();
        }
        introShown = true;
        nextScreen();
        return;
    }
    
    nextScreen();
}

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    if (isTransitioning) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextScreen();
        } else {
            previousScreen();
        }
    }
}

function handleKeyPress(e) {
    if (isTransitioning) return;
    
    switch(e.key) {
        case 'ArrowRight':
        case ' ':
            nextScreen();
            break;
        case 'ArrowLeft':
            previousScreen();
            break;
    }
}

function nextScreen() {
    if (isTransitioning) return;
    
    // Handle transition from guide to intro
    if (currentScreen === -1) {
        isTransitioning = true;
        const guide = document.querySelector('#guide');
        const intro = document.querySelector('#intro');
        
        guide.classList.remove('active');
        guide.classList.add('prev');
        intro.classList.add('active');
        
        currentScreen = 0;
        
        setTimeout(() => {
            isTransitioning = false;
        }, 600);
        return;
    }
    
    // Handle transition from intro to screen1
    if (currentScreen === 0) {
        isTransitioning = true;
        const intro = document.querySelector('#intro');
        const next = document.querySelector('#screen1');
        
        intro.classList.remove('active');
        intro.classList.add('prev');
        next.classList.add('active');
        
        currentScreen = 1;
        
        setTimeout(() => {
            isTransitioning = false;
        }, 600);
        return;
    }
    
    if (currentScreen >= totalScreens) return;
    
    isTransitioning = true;
    const current = document.querySelector(`#screen${currentScreen}`);
    const next = document.querySelector(`#screen${currentScreen + 1}`);
    
    current.classList.remove('active');
    current.classList.add('prev');
    next.classList.add('active');
    
    currentScreen++;
    
    setTimeout(() => {
        isTransitioning = false;
    }, 600);
    
    if (currentScreen === totalScreens) {
        // Send notification when last screen is reached
        sendCompletionNotification();
        setTimeout(() => {
            showRestartOption();
        }, 2000);
    }
}

function previousScreen() {
    if (isTransitioning || currentScreen <= 1) return;
    
    isTransitioning = true;
    const current = document.querySelector(`#screen${currentScreen}`);
    const prev = document.querySelector(`#screen${currentScreen - 1}`);
    
    current.classList.remove('active');
    prev.classList.remove('prev');
    prev.classList.add('active');
    
    currentScreen--;
    
    setTimeout(() => {
        isTransitioning = false;
    }, 600);
}

function showRestartOption() {
    const hint = document.querySelector('.navigation-hint span');
    hint.textContent = 'Tippe um von vorne zu beginnen';
    document.querySelector('.navigation-hint').style.display = 'block';
    
    document.querySelector('.container').addEventListener('click', restartExperience, { once: true });
}

function restartExperience() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active', 'prev');
    });
    
    currentScreen = -1;
    guideShown = false;
    introShown = false;
    document.querySelector('#guide').classList.add('active');
    
    const hint = document.querySelector('.navigation-hint span');
    hint.textContent = 'Tippe um fortzufahren';
    
    setTimeout(() => {
        document.querySelector('.navigation-hint').style.display = 'none';
    }, 3000);
}

function createStars() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars';
    
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.opacity = Math.random();
        starsContainer.appendChild(star);
    }
    
    document.body.appendChild(starsContainer);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}


function sendCompletionNotification() {
    // Initialize EmailJS with your public key
    emailjs.init("s-_UyjGmfRGMXir4q");
    
    const timestamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    
    // Send email notification
    emailjs.send("service_7bsxupt", "template_z9e9zl8", {
        to_email: "yildiz-faruk@hotmail.com",
        message: `Mali hat die letzte Seite erreicht! 💕`,
        time: timestamp
    }).then(
        function(response) {
            console.log('Email sent successfully');
        },
        function(error) {
            console.log('Email sent');
        }
    );
}

window.addEventListener('DOMContentLoaded', init);