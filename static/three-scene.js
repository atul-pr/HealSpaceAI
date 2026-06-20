/**
 * three-scene.js — HealSpace AI 3D Visuals
 * ==========================================
 * Calm, soft animations for a mental-health context.
 * Requires Three.js r128 (loaded as a global via CDN <script> before this file).
 *
 * Features:
 *  1. Hero Breathing Orb  — gentle pulsing sphere behind the headline
 *  2. Affirmation Particles — slow drifting dust-mote particles
 *  3. Chatbot Mascot       — soft wobbling blob companion
 *  4. Scroll Parallax      — layered background gradient blobs move at different speeds
 *
 * All effects respect prefers-reduced-motion and degrade gracefully
 * when WebGL is unavailable.
 */

(function () {
    'use strict';

    /* -------------------------------------------------------
       GUARDS
    ------------------------------------------------------- */
    // Reduced-motion: disable or simplify all animations
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // WebGL availability check
    function webglSupported() {
        try {
            const c = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (c.getContext('webgl') || c.getContext('experimental-webgl')));
        } catch (e) { return false; }
    }

    // Low-end device heuristic (mobile + small RAM if API available)
    const isLowEnd = (
        /Mobi|Android/i.test(navigator.userAgent) &&
        (navigator.deviceMemory !== undefined ? navigator.deviceMemory < 4 : false)
    );

    const canUseWebGL = webglSupported() && !isLowEnd;

    /* -------------------------------------------------------
       WAIT FOR THREE.JS TO BE READY
    ------------------------------------------------------- */
    function init() {
        if (typeof THREE === 'undefined') {
            // THREE not yet loaded — try again shortly
            setTimeout(init, 100);
            return;
        }
        if (canUseWebGL) {
            initBreathingOrb();
            initParticles();
            initMascot();
        }
        // Feature-card tilt works without WebGL (pure CSS/JS)
        initCardTilt();
        initScrollParallax();
    }

    /* =======================================================
       1. HERO BREATHING ORB
       A semi-transparent sphere that breathes (scale pulse)
       behind the hero headline. Rendered on its own canvas
       absolutely positioned within .hero.
    ======================================================= */
    function initBreathingOrb() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Create canvas inside hero, pointer-events none
        const canvas = document.createElement('canvas');
        canvas.id = 'orb-canvas';
        canvas.style.cssText = [
            'position:absolute',
            'top:50%', 'left:50%',
            'transform:translate(-50%,-55%)',
            'width:520px', 'height:520px',
            'max-width:90vw', 'max-height:90vw',
            'pointer-events:none',
            'z-index:0',
            'opacity:0',
            'transition:opacity 1.5s ease'
        ].join(';');
        hero.insertBefore(canvas, hero.firstChild);

        // Ensure hero has position:relative (already set in CSS)
        hero.style.position = 'relative';

        const W = 520, H = 520;
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 4;

        // Soft sphere geometry
        const geo = new THREE.SphereGeometry(1.35, 64, 64);

        // Multi-layer material for soft glow effect
        // Core sphere — translucent indigo/purple
        const mat = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x6366f1),
            emissive: new THREE.Color(0x4338ca),
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.18,
            wireframe: false,
            shininess: 10
        });
        const sphere = new THREE.Mesh(geo, mat);
        scene.add(sphere);

        // Outer glow shell — slightly larger, more transparent
        const glowGeo = new THREE.SphereGeometry(1.55, 32, 32);
        const glowMat = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xa855f7),
            emissive: new THREE.Color(0x7c3aed),
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.07,
            side: THREE.BackSide,
            wireframe: false
        });
        const glowShell = new THREE.Mesh(glowGeo, glowMat);
        scene.add(glowShell);

        // Ambient + directional lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));
        const dLight = new THREE.DirectionalLight(0xa5b4fc, 0.8);
        dLight.position.set(2, 3, 4);
        scene.add(dLight);
        const dLight2 = new THREE.DirectionalLight(0xc084fc, 0.5);
        dLight2.position.set(-2, -1, 2);
        scene.add(dLight2);

        // Fade in after a short delay
        setTimeout(() => { canvas.style.opacity = '1'; }, 300);

        // Animation: breathing scale + very slow rotation
        let t = 0;
        const BREATH_PERIOD = reduced ? 0 : 4; // seconds

        function animate() {
            requestAnimationFrame(animate);
            t += 0.016; // ~60fps delta

            if (!reduced) {
                // Breathing: smooth sine wave, period ~4s
                const breath = 1 + 0.08 * Math.sin((t / BREATH_PERIOD) * Math.PI * 2);
                sphere.scale.setScalar(breath);
                glowShell.scale.setScalar(breath * 1.02);

                // Very gentle rotation
                sphere.rotation.y += 0.002;
                sphere.rotation.x += 0.0005;
                glowShell.rotation.y -= 0.001;
            }

            renderer.render(scene, camera);
        }
        animate();
    }

    /* =======================================================
       2. AFFIRMATION CARD — FLOATING PARTICLES
       Slow-drifting dust-mote particles rendered on a canvas
       overlaid behind .affirmation-box.
    ======================================================= */
    function initParticles() {
        const box = document.querySelector('.affirmation-box');
        if (!box) return;

        // Wrap in a relative container if not already
        if (getComputedStyle(box).position === 'static') {
            box.style.position = 'relative';
        }

        const canvas = document.createElement('canvas');
        canvas.style.cssText = [
            'position:absolute',
            'inset:0',
            'width:100%', 'height:100%',
            'pointer-events:none',
            'z-index:0',
            'border-radius:30px',
            'overflow:hidden'
        ].join(';');
        box.insertBefore(canvas, box.firstChild);

        // Make sure text content sits above canvas
        Array.from(box.children).forEach(el => {
            if (el !== canvas) el.style.position = 'relative';
        });

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setPixelRatio(1); // keep cheap on mobile
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        // Orthographic camera mapped to canvas size for 2D-feel
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        function resize() {
            const w = box.offsetWidth, h = box.offsetHeight;
            renderer.setSize(w, h, false);
            camera.left = -w / 2; camera.right = w / 2;
            camera.top = h / 2; camera.bottom = -h / 2;
            camera.updateProjectionMatrix();
        }
        resize();
        window.addEventListener('resize', resize);

        // Particle setup
        const COUNT = 38;
        const positions = new Float32Array(COUNT * 3);
        const velocities = [];

        for (let i = 0; i < COUNT; i++) {
            const w = box.offsetWidth, h = box.offsetHeight;
            positions[i * 3]     = (Math.random() - 0.5) * w;
            positions[i * 3 + 1] = (Math.random() - 0.5) * h;
            positions[i * 3 + 2] = 0;
            velocities.push({
                x: (Math.random() - 0.5) * 0.12,
                y: (Math.random() - 0.5) * 0.12
            });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x818cf8,
            size: 2.5,
            transparent: true,
            opacity: 0.45,
            sizeAttenuation: false
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            if (reduced) { renderer.render(scene, camera); return; }

            const pos = geo.attributes.position.array;
            const w = box.offsetWidth / 2, h = box.offsetHeight / 2;

            for (let i = 0; i < COUNT; i++) {
                pos[i * 3]     += velocities[i].x;
                pos[i * 3 + 1] += velocities[i].y;
                // Wrap around edges
                if (pos[i * 3] > w)  pos[i * 3] = -w;
                if (pos[i * 3] < -w) pos[i * 3] =  w;
                if (pos[i * 3 + 1] > h)  pos[i * 3 + 1] = -h;
                if (pos[i * 3 + 1] < -h) pos[i * 3 + 1] =  h;
            }
            geo.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        }
        animateParticles();
    }

    /* =======================================================
       3. CHATBOT MASCOT
       A soft abstract blob companion near the CTA section.
       Gentle idle rotation + wobble. Wakes on scroll-into-view.
    ======================================================= */
    function initMascot() {
        const target = document.getElementById('mascot-anchor');
        if (!target) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'mascot-canvas';
        canvas.style.cssText = [
            'display:block',
            'width:180px', 'height:180px',
            'margin:0 auto 20px',
            'pointer-events:none',
            'opacity:0',
            'transform:scale(0.85)',
            'transition:opacity 0.9s ease, transform 0.9s ease'
        ].join(';');
        target.prepend(canvas);

        const SIZE = 180;
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(SIZE, SIZE);
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
        camera.position.z = 3.5;

        // Use IcosahedronGeometry subdivided as a blob stand-in
        // (MeshDistortMaterial requires drei — not available; we animate vertex positions instead)
        const geo = new THREE.IcosahedronGeometry(1.0, 4);

        // Store original positions for wobble
        const origPos = geo.attributes.position.array.slice();

        const mat = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x6366f1),
            emissive: new THREE.Color(0x4338ca),
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.82,
            shininess: 40,
            specular: new THREE.Color(0xc084fc)
        });

        const blob = new THREE.Mesh(geo, mat);
        scene.add(blob);

        // Outer glow ring
        const ringGeo = new THREE.TorusGeometry(1.25, 0.04, 8, 60);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xa5b4fc,
            transparent: true,
            opacity: 0.25
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        scene.add(ring);

        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const l1 = new THREE.DirectionalLight(0xc4b5fd, 1.0);
        l1.position.set(2, 2, 3);
        scene.add(l1);
        const l2 = new THREE.DirectionalLight(0x818cf8, 0.5);
        l2.position.set(-2, -1, 1);
        scene.add(l2);

        let awake = false;
        let glowScale = 0;

        // Wake on scroll-into-view
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !awake) {
                awake = true;
                canvas.style.opacity = '1';
                canvas.style.transform = 'scale(1)';
                glowScale = 1;
            }
        }, { threshold: 0.3 });
        observer.observe(target);

        let t = 0;

        function animateMascot() {
            requestAnimationFrame(animateMascot);
            t += 0.016;

            if (!reduced) {
                // Gentle idle rotation
                blob.rotation.y += 0.006;
                blob.rotation.x = Math.sin(t * 0.4) * 0.12;
                ring.rotation.z += 0.004;
                ring.rotation.x = Math.sin(t * 0.3) * 0.08;

                // Vertex wobble for organic blob feel
                const pos = geo.attributes.position.array;
                const freq = 1.2, amp = 0.06;
                for (let i = 0; i < pos.length; i += 3) {
                    const ox = origPos[i], oy = origPos[i + 1], oz = origPos[i + 2];
                    const noise = Math.sin(ox * freq + t) * Math.cos(oy * freq + t * 0.7) * amp;
                    pos[i]     = ox + noise;
                    pos[i + 1] = oy + noise * 0.8;
                    pos[i + 2] = oz + noise * 0.6;
                }
                geo.attributes.position.needsUpdate = true;
                geo.computeVertexNormals();

                // Glow pulse when awake
                if (awake) {
                    const glow = 0.82 + 0.08 * Math.sin(t * 1.5);
                    mat.emissiveIntensity = glow * 0.6;
                    ringMat.opacity = 0.25 + 0.12 * Math.sin(t * 1.2);
                }
            }

            renderer.render(scene, camera);
        }
        animateMascot();
    }

    /* =======================================================
       4. FEATURE CARD TILT (CSS 3D, no WebGL needed)
       Cursor-following perspective tilt, max ~7 degrees.
       Soft highlight/sheen follows the tilt direction.
    ======================================================= */
    function initCardTilt() {
        if (reduced) return;

        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            // Inject sheen overlay
            const sheen = document.createElement('div');
            sheen.className = 'card-sheen';
            sheen.style.cssText = [
                'position:absolute', 'inset:0',
                'border-radius:inherit',
                'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 65%)',
                'pointer-events:none',
                'opacity:0',
                'transition:opacity 0.3s',
                'z-index:1'
            ].join(';');
            card.appendChild(sheen);

            card.style.transformStyle = 'preserve-3d';
            card.style.willChange = 'transform';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
                const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1

                const rotX = -dy * 7;  // max 7deg
                const rotY =  dx * 7;

                card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;

                // Move sheen highlight to follow cursor
                const sheenX = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
                const sheenY = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
                sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.08) 0%, transparent 60%)`;
                sheen.style.opacity = '1';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
                sheen.style.opacity = '0';
                // Override the hover translateY from CSS when tilt is active
                card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
                setTimeout(() => { card.style.transition = ''; }, 500);
            });
        });
    }

    /* =======================================================
       5. SCROLL PARALLAX for gradient blobs
       The .soft-bg pseudo-element is handled via CSS vars
       that we update on scroll. Lighter layers move slower,
       giving a sense of depth.
    ======================================================= */
    function initScrollParallax() {
        if (reduced) return;

        // Create 3 absolutely-positioned blobs in the body background layer
        const blobs = [
            { el: null, speed: 0.08,  x: '15%',  y: '10%',  color: 'rgba(99,102,241,0.07)',  size: '600px' },
            { el: null, speed: 0.05,  x: '75%',  y: '55%',  color: 'rgba(168,85,247,0.06)',  size: '500px' },
            { el: null, speed: 0.12,  x: '40%',  y: '80%',  color: 'rgba(99,102,241,0.05)',  size: '700px' }
        ];

        const blobLayer = document.createElement('div');
        blobLayer.style.cssText = [
            'position:fixed', 'inset:0',
            'pointer-events:none',
            'z-index:0',
            'overflow:hidden'
        ].join(';');
        document.body.prepend(blobLayer);

        blobs.forEach(b => {
            const el = document.createElement('div');
            el.style.cssText = [
                `position:absolute`,
                `left:${b.x}`, `top:${b.y}`,
                `width:${b.size}`, `height:${b.size}`,
                `background:radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
                `transform:translate(-50%,-50%)`,
                `filter:blur(60px)`,
                `will-change:transform`
            ].join(';');
            blobLayer.appendChild(el);
            b.el = el;
        });

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const sy = window.scrollY;
                    blobs.forEach(b => {
                        const offset = sy * b.speed;
                        b.el.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* -------------------------------------------------------
       KICK OFF on DOMContentLoaded (or immediately if ready)
    ------------------------------------------------------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
