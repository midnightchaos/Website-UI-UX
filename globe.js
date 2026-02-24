// Globe.js - 3D Globe Implementation with HUD Tour

class GlobePortfolio {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.markers = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Project Content Expanded
        this.projects = [
            { id: 'work_01', title: '01. QUANTUM UI', desc: 'Research-led design system for decentralized financial architectures. Optimized for high-density cognitive tasks.', lat: 37.7749, lng: -122.4194 },
            { id: 'work_02', title: '02. HYPERSPACE.WEB', desc: 'Next-gen e-commerce engine utilizing WebGL for immersive storytelling and spatial interactions.', lat: 35.6762, lng: 139.6503 },
            { id: 'work_03', title: '03. NEURAL DASH', desc: 'Minimalist dashboard for AI cluster management. Prioritizing accessibility and ergonomic dark-mode.', lat: 51.5074, lng: -0.1278 },
            { id: 'work_04', title: '04. AURA DESIGN', desc: 'Sustainability-focused mobile interface for eco-tracking and carbon footprint visualization.', lat: -34.6037, lng: -58.3816 },
            { id: 'work_05', title: '05. SINGAPORE HUB', desc: 'Smart city integration dashboard visualizing real-time maritime logistics and energy flow.', lat: 1.3521, lng: 103.8198 },
            { id: 'signal', title: 'SIGNAL GATE', desc: 'Transmission active. Encrypted communication channel open for global design collaborations. Contact initiated.', lat: -33.8688, lng: 151.2093 }
        ];

        // Tour State
        this.currentProjectIndex = 0;
        this.tourTimer = 0;
        this.isTourPaused = false;
        this.isUserInteracting = false;
        this.isHoveringMarker = false;

        // HUD Elements
        this.hudPopup = document.getElementById('hud-popup');
        this.hudTitle = document.getElementById('hud-title');
        this.hudDesc = document.getElementById('hud-desc');
        this.hudLine = document.getElementById('hud-line');
        this.hudDot = document.getElementById('hud-dot');

        this.typewriterTimeout = null;

        this.init();
    }

    init() {
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 400;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);

        this.createStars();

        // Earth - Neon Wireframe (Enlarged for impact)
        const geometry = new THREE.SphereGeometry(140, 44, 44); // Radius reduced to 140
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        this.earth = new THREE.Mesh(geometry, wireframeMaterial);
        this.scene.add(this.earth);

        const outerShell = new THREE.Mesh(
            new THREE.SphereGeometry(142, 24, 24),
            new THREE.MeshBasicMaterial({ color: 0x00f2ff, wireframe: true, transparent: true, opacity: 0.04 })
        );
        this.earth.add(outerShell);

        const core = new THREE.Mesh(
            new THREE.SphereGeometry(138, 36, 36),
            new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.8 })
        );
        this.earth.add(core);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = false;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;

        this.addMarkers();

        // HUD Hover Listener
        this.hudPopup.addEventListener('mouseenter', () => this.isTourPaused = true);
        this.hudPopup.addEventListener('mouseleave', () => this.isTourPaused = false);

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', () => this.isUserInteracting = true);
        window.addEventListener('mouseup', () => {
            setTimeout(() => this.isUserInteracting = false, 5000); // Resume tour after 5s of no interaction
        });

        this.animate();
    }

    createStars() {
        const starVertices = [];
        for (let i = 0; i < 5000; i++) {
            starVertices.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, -Math.random() * 1000);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })));
    }

    addMarkers() {
        this.projects.forEach(proj => {
            const marker = this.createMarker(proj);
            this.earth.add(marker);
            this.markers.push({ mesh: marker, info: proj });
        });
    }

    createMarker(loc) {
        const phi = (90 - loc.lat) * (Math.PI / 180);
        const theta = (loc.lng + 180) * (Math.PI / 180);
        const radius = 140; // Updated radius
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        const marker = new THREE.Mesh(
            new THREE.SphereGeometry(2, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0x00f2ff })
        );
        marker.position.set(x, y, z);

        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(4, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.2 })
        );
        marker.add(glow);
        return marker;
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.markers.map(m => m.mesh));

        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            const hoveredMesh = intersects[0].object;
            const index = this.markers.findIndex(m => m.mesh === hoveredMesh);

            if (index !== -1) {
                if (index !== this.currentProjectIndex || !this.isHoveringMarker) {
                    this.currentProjectIndex = index;
                    this.isHoveringMarker = true;
                    if (this.hudTitle.textContent !== this.markers[index].info.title) {
                        this.hudPopup.classList.remove('active');
                    }
                }
                this.markers.forEach((m, i) => m.mesh.scale.set(i === index ? 2 : 1, i === index ? 2 : 1, i === index ? 2 : 1));
            }
        } else {
            document.body.style.cursor = 'default';
            if (this.isHoveringMarker) {
                this.isHoveringMarker = false;
                this.markers.forEach(m => m.mesh.scale.set(1, 1, 1));
            }
        }
    }

    typewrite(text) {
        clearTimeout(this.typewriterTimeout);
        this.hudDesc.textContent = '';
        let i = 0;
        const speed = 25;

        const type = () => {
            if (i < text.length) {
                this.hudDesc.textContent += text.charAt(i);
                i++;
                this.typewriterTimeout = setTimeout(type, speed);
            }
        };
        type();
    }

    updateHUD() {
        if (this.isUserInteracting && !this.isHoveringMarker) {
            this.hudPopup.classList.remove('active');
            return;
        }

        const currentMarker = this.markers[this.currentProjectIndex];
        const vector = currentMarker.mesh.getWorldPosition(new THREE.Vector3());

        const cameraToMarker = vector.clone().sub(this.camera.position);
        const normal = vector.clone().normalize();
        const dot = cameraToMarker.dot(normal);

        vector.project(this.camera);

        const x = (vector.x * 0.5 + 0.5) * this.width;
        const y = (-(vector.y * 0.5) + 0.5) * this.height;

        // HUD is visible if marker is in front (dot < 0) and (not paused OR user is hovering)
        if (dot < 0 && (!this.isTourPaused || this.isHoveringMarker)) {
            if (!this.isHoveringMarker) {
                this.tourTimer += 0.016;
            }

            // Auto tour switch logic
            if (this.tourTimer > 7 && !this.isHoveringMarker) {
                this.currentProjectIndex = (this.currentProjectIndex + 1) % this.markers.length;
                this.tourTimer = 0;
                this.hudPopup.classList.remove('active');
            } else if (this.tourTimer > 0.5 || this.isHoveringMarker) {
                const proj = this.markers[this.currentProjectIndex].info;

                if (!this.hudPopup.classList.contains('active') || (this.isHoveringMarker && this.hudTitle.textContent !== proj.title)) {
                    this.hudTitle.textContent = proj.title;
                    this.typewrite(proj.desc);
                    this.hudPopup.classList.add('active');
                }

                this.hudPopup.style.left = `${x + 60}px`;
                this.hudPopup.style.top = `${y - 60}px`;

                this.hudLine.setAttribute('d', `M${x},${y} L${x + 30},${y - 30} L${x + 60},${y - 30}`);
                this.hudDot.setAttribute('cx', x);
                this.hudDot.setAttribute('cy', y);
            }
        } else {
            this.hudPopup.classList.remove('active');
        }
    }

    onResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.camera.aspect = this.width / this.height;

        // Dynamic camera distance based on viewport
        const aspect = this.width / this.height;
        if (this.width < 768) {
            this.camera.position.z = 620; // Slightly adjusted for smaller globe
        } else {
            this.camera.position.z = 520; // Slightly closer for 140 radius
        }

        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.updateHUD();
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => new GlobePortfolio('globe-container'));
