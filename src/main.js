// Please work... importing Three.js like a pro!
import * as THREE from 'three';

// Main class for the whole solar system. If this breaks, it's all my fault :)
class StellarSystemSimulation {
    constructor() {
        // Scene, camera, renderer... the holy trinity of 3D!
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock(); // Time wizardry
        
        // Animation state
        this.isAnimating = true; // Please don't freeze
        this.globalSpeed = 1.0; // Gotta go fast (or slow)
        this.isDarkTheme = false; // For the night owls
        this.simulationTime = 0; // Time is an illusion
        
        // Performance tracking (FPS flex)
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        // Planet data: I totally didn't Google these numbers (okay, maybe a little)
        this.planetData = [
            {
                name: 'Mercury',
                radius: 2.0, // Small but speedy
                distance: 15,
                speed: 4.15, // Zoom zoom
                color: 0x8C7853,
                description: 'The smallest planet and closest to the Sun. Mercury has extreme temperature variations.',
                realDistance: '57.9 million km',
                orbitalPeriod: '88 Earth days',
                diameter: '4,879 km',
                rotationSpeed: 0.01, // Not dizzy yet
                glowColor: 0x8C7853,
                trails: []
            },
            {
                name: 'Venus',
                radius: 2.8, // Increased from 1.2
                distance: 20,
                speed: 1.62,
                color: 0xFFC649,
                description: 'The hottest planet due to its thick atmosphere and greenhouse effect.',
                realDistance: '108.2 million km',
                orbitalPeriod: '225 Earth days',
                diameter: '12,104 km',
                rotationSpeed: 0.008,
                glowColor: 0xFFC649,
                trails: []
            },
            {
                name: 'Earth',
                radius: 3.0, // Increased from 1.3
                distance: 25,
                speed: 1.0,
                color: 0x6B93D6,
                description: 'Our home planet. The only known planet with life in the universe.',
                realDistance: '149.6 million km',
                orbitalPeriod: '365.25 Earth days',
                diameter: '12,756 km',
                rotationSpeed: 0.02,
                glowColor: 0x6B93D6,
                trails: []
            },
            {
                name: 'Mars',
                radius: 2.5, // Increased from 1.0
                distance: 30,
                speed: 0.53,
                color: 0xC1440E,
                description: 'The Red Planet. Home to the largest volcano and canyon in the solar system.',
                realDistance: '227.9 million km',
                orbitalPeriod: '687 Earth days',
                diameter: '6,792 km',
                rotationSpeed: 0.018,
                glowColor: 0xC1440E,
                trails: []
            },
            {
                name: 'Jupiter',
                radius: 8.0, // Increased from 3.5
                distance: 45,
                speed: 0.084,
                color: 0xD8CA9D,
                description: 'The largest planet. Its Great Red Spot is a storm larger than Earth.',
                realDistance: '778.5 million km',
                orbitalPeriod: '11.9 Earth years',
                diameter: '142,984 km',
                rotationSpeed: 0.04,
                glowColor: 0xD8CA9D,
                trails: []
            },
            {
                name: 'Saturn',
                radius: 7.0, // Increased from 3.0
                distance: 60,
                speed: 0.034,
                color: 0xFAD5A5,
                description: 'Famous for its spectacular ring system. Less dense than water.',
                realDistance: '1.43 billion km',
                orbitalPeriod: '29.5 Earth years',
                diameter: '120,536 km',
                rotationSpeed: 0.038,
                glowColor: 0xFAD5A5,
                trails: []
            },
            {
                name: 'Uranus',
                radius: 5.5, // Increased from 2.2
                distance: 75,
                speed: 0.012,
                color: 0x4FD0E7,
                description: 'An ice giant that rotates on its side. Has faint rings and 27 moons.',
                realDistance: '2.87 billion km',
                orbitalPeriod: '84 Earth years',
                diameter: '51,118 km',
                rotationSpeed: 0.03,
                glowColor: 0x4FD0E7,
                trails: []
            },
            {
                name: 'Neptune',
                radius: 5.2, // Increased from 2.1
                distance: 90,
                speed: 0.006,
                color: 0x4B70DD,
                description: 'The windiest planet with speeds up to 2,100 km/h. Deep blue color.',
                realDistance: '4.50 billion km',
                orbitalPeriod: '165 Earth years',
                diameter: '49,528 km',
                rotationSpeed: 0.032,
                glowColor: 0x4B70DD,
                trails: []
            }
        ];
        
        this.planets = [];
        this.orbitLines = [];
        this.planetLabels = [];
        this.stars = null;
        this.sun = null;
        this.planetTrails = [];
        this.asteroidBelt = null;
        this.kuiperBelt = null;
        this.solarWind = null;
        
        // Mouse interaction (for all you clickers)
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.hoveredPlanet = null;
        
        // Camera controls (don't get lost in space)
        this.cameraControls = {
            isMouseDown: false,
            mouseX: 0,
            mouseY: 0,
            targetRotationX: 0.3, // Just a little tilt
            targetRotationY: 0,
            currentRotationX: 0.3,
            currentRotationY: 0,
            distance: 150, // Not too close, not too far
            targetDistance: 150
        };
        
        this.init(); // Fingers crossed!
    }
    
    async init() {
        await this.showLoadingScreen(); // Loading... please wait (or go make coffee)
        this.setupScene();
        this.createSolarSystem();
        this.setupEventListeners();
        this.createPlanetControls();
        this.hideLoadingScreen();
        this.animate(); // And we're off!
    }
    
    async showLoadingScreen() {
        // Dramatic loading sequence
        const loadingProgress = document.getElementById('loadingProgress');
        const loadingText = document.querySelector('.loading-text');
        
        const steps = [
            'Initializing Three.js engine... (please work)',
            'Creating celestial bodies... (no pressure)',
            'Calculating orbital mechanics... (math magic)',
            'Setting up lighting system... (let there be light!)',
            'Generating star field... (wish upon one)',
            'Creating asteroid belts... (space pebbles)',
            'Finalizing solar system... (almost there!)'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            loadingText.textContent = steps[i];
            loadingProgress.style.width = `${((i + 1) / steps.length) * 100}%`;
            await new Promise(resolve => setTimeout(resolve, 300)); // Just enough time to panic
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const appContainer = document.getElementById('appContainer');
        
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            appContainer.classList.add('loaded');
        }, 500);
    }
    
    setupScene() {
        const canvas = document.getElementById('solarSystemCanvas');
        const container = canvas.parentElement;
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Camera setup with better positioning
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            2000
        );
        this.camera.position.set(0, 50, 150);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer setup with enhanced quality
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Handle resize
        this.handleResize();
    }
    
    createSolarSystem() {
        this.createStars();
        this.createSun();
        this.createPlanets();
        this.createOrbitLines();
        this.createAsteroidBelt();
        this.createKuiperBelt();
        this.createSolarWind();
        this.setupLighting();
        this.updateStats();
    }
    
    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            // Position stars in a sphere around the solar system
            const radius = 500 + Math.random() * 1000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Vary star colors (white, blue, yellow, red)
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                // White stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 1;
            } else if (colorChoice < 0.85) {
                // Blue stars
                colors[i * 3] = 0.7;
                colors[i * 3 + 1] = 0.8;
                colors[i * 3 + 2] = 1;
            } else if (colorChoice < 0.95) {
                // Yellow stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 0.7;
            } else {
                // Red stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.7;
                colors[i * 3 + 2] = 0.7;
            }
            
            sizes[i] = Math.random() * 3 + 0.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float twinkle = sin(time * 2.0 + position.x * 0.01) * 0.3 + 0.7;
                    gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
                    if (r > 0.5) discard;
                    float alpha = 1.0 - smoothstep(0.0, 0.5, r);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }
    
    createSun() {
        // Sun geometry with higher detail
        const sunGeometry = new THREE.SphereGeometry(8, 64, 64); // Increased from 5
        
        // Enhanced sun material with shader
        const sunMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0xFFD700) },
                color2: { value: new THREE.Color(0xFF4500) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    float noise = sin(vPosition.x * 2.0 + time) * sin(vPosition.y * 2.0 + time * 1.5) * sin(vPosition.z * 2.0 + time * 0.8);
                    vec3 color = mix(color1, color2, noise * 0.3 + 0.5);
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.name = 'Sun';
        this.scene.add(this.sun);
        
        // Sun glow effect
        const glowGeometry = new THREE.SphereGeometry(12, 32, 32); // Increased from 7
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    float pulse = sin(time * 2.0) * 0.1 + 0.9;
                    gl_FragColor = vec4(1.0, 0.8, 0.0, intensity * pulse * 0.3);
                }
            `,
            transparent: true,
            side: THREE.BackSide
        });
        
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(sunGlow);
        
        // Corona effect
        const coronaGeometry = new THREE.SphereGeometry(16, 32, 32); // Increased from 10
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
                    float flicker = sin(time * 3.0) * 0.05 + 0.95;
                    gl_FragColor = vec4(1.0, 0.6, 0.0, intensity * flicker * 0.1);
                }
            `,
            transparent: true,
            side: THREE.BackSide
        });
        
        const sunCorona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.scene.add(sunCorona);
    }
    
    createPlanets() {
        this.planetData.forEach((data, index) => {
            // Enhanced planet geometry with higher detail
            const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
            
            // Enhanced planet material with shader
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    planetColor: { value: new THREE.Color(data.color) },
                    glowColor: { value: new THREE.Color(data.glowColor) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    
                    void main() {
                        vUv = uv;
                        vNormal = normalize(normalMatrix * normal);
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 planetColor;
                    uniform vec3 glowColor;
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    
                    void main() {
                        // Surface texture simulation
                        float noise = sin(vPosition.x * 10.0 + time * 0.1) * sin(vPosition.y * 10.0) * sin(vPosition.z * 10.0);
                        vec3 color = planetColor + noise * 0.1;
                        
                        // Atmospheric glow
                        float fresnel = pow(1.0 - dot(vNormal, vec3(0, 0, 1)), 2.0);
                        color = mix(color, glowColor, fresnel * 0.3);
                        
                        gl_FragColor = vec4(color, 1.0);
                    }
                `
            });
            
            const planet = new THREE.Mesh(geometry, material);
            planet.name = data.name;
            planet.userData = {
                ...data,
                angle: Math.random() * Math.PI * 2,
                individualSpeed: 1.0,
                material: material
            };
            
            // Position planet
            planet.position.x = Math.cos(planet.userData.angle) * data.distance;
            planet.position.z = Math.sin(planet.userData.angle) * data.distance;
            
            planet.castShadow = true;
            planet.receiveShadow = true;
            
            // Planet atmosphere
            if (data.name === 'Earth' || data.name === 'Venus' || data.name === 'Mars') {
                const atmosphereGeometry = new THREE.SphereGeometry(data.radius * 1.1, 32, 32);
                const atmosphereMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        glowColor: { value: new THREE.Color(data.glowColor) }
                    },
                    vertexShader: `
                        varying vec3 vNormal;
                        void main() {
                            vNormal = normalize(normalMatrix * normal);
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform vec3 glowColor;
                        varying vec3 vNormal;
                        void main() {
                            float intensity = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                            gl_FragColor = vec4(glowColor, intensity * 0.2);
                        }
                    `,
                    transparent: true,
                    side: THREE.BackSide
                });
                
                const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
                planet.add(atmosphere);
            }
            
            // Saturn's rings (adjusted for bigger planet)
            if (data.name === 'Saturn') {
                const ringGeometry = new THREE.RingGeometry(data.radius * 1.2, data.radius * 2.5, 64);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xFAD5A5,
                    transparent: true,
                    opacity: 0.7,
                    side: THREE.DoubleSide
                });
                const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                rings.rotation.x = Math.PI / 2;
                planet.add(rings);
            }
            
            // Jupiter's Great Red Spot
            if (data.name === 'Jupiter') {
                const spotGeometry = new THREE.SphereGeometry(data.radius * 0.3, 16, 16);
                const spotMaterial = new THREE.MeshBasicMaterial({
                    color: 0xFF4500,
                    transparent: true,
                    opacity: 0.8
                });
                const redSpot = new THREE.Mesh(spotGeometry, spotMaterial);
                redSpot.position.set(data.radius * 0.9, 0, 0);
                planet.add(redSpot);
            }
            
            this.planets.push(planet);
            this.scene.add(planet);
        });
    }
    
    createOrbitLines() {
        this.planetData.forEach(data => {
            const points = [];
            const segments = 128;
            
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * data.distance,
                    0,
                    Math.sin(angle) * data.distance
                ));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.3
            });
            
            const orbitLine = new THREE.Line(geometry, material);
            orbitLine.name = `${data.name}_orbit`;
            this.orbitLines.push(orbitLine);
            this.scene.add(orbitLine);
        });
    }
    
    createAsteroidBelt() {
        const asteroidCount = 2000;
        const asteroidGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(asteroidCount * 3);
        const colors = new Float32Array(asteroidCount * 3);
        const sizes = new Float32Array(asteroidCount);
        
        for (let i = 0; i < asteroidCount; i++) {
            // Position asteroids between Mars and Jupiter
            const angle = Math.random() * Math.PI * 2;
            const radius = 35 + Math.random() * 8; // Between Mars (30) and Jupiter (45)
            const height = (Math.random() - 0.5) * 2;
            
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            
            // Gray/brown colors for asteroids
            const grayValue = 0.3 + Math.random() * 0.3;
            colors[i * 3] = grayValue;
            colors[i * 3 + 1] = grayValue * 0.8;
            colors[i * 3 + 2] = grayValue * 0.6;
            
            sizes[i] = Math.random() * 0.5 + 0.1;
        }
        
        asteroidGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        asteroidGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        asteroidGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const asteroidMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
        this.scene.add(this.asteroidBelt);
    }
    
    createKuiperBelt() {
        const kuiperCount = 1500;
        const kuiperGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(kuiperCount * 3);
        const colors = new Float32Array(kuiperCount * 3);
        const sizes = new Float32Array(kuiperCount);
        
        for (let i = 0; i < kuiperCount; i++) {
            // Position objects beyond Neptune
            const angle = Math.random() * Math.PI * 2;
            const radius = 100 + Math.random() * 50;
            const height = (Math.random() - 0.5) * 5;
            
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            
            // Icy blue/white colors
            colors[i * 3] = 0.8 + Math.random() * 0.2;
            colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
            colors[i * 3 + 2] = 1.0;
            
            sizes[i] = Math.random() * 0.3 + 0.05;
        }
        
        kuiperGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        kuiperGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        kuiperGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const kuiperMaterial = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });
        
        this.kuiperBelt = new THREE.Points(kuiperGeometry, kuiperMaterial);
        this.scene.add(this.kuiperBelt);
    }
    
    createSolarWind() {
        const windCount = 1000;
        const windGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(windCount * 3);
        const velocities = new Float32Array(windCount * 3);
        
        for (let i = 0; i < windCount; i++) {
            // Start particles near the sun
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 5;
            
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            
            // Velocity pointing outward
            velocities[i * 3] = Math.cos(angle) * 0.5;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 2] = Math.sin(angle) * 0.5;
        }
        
        windGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        windGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const windMaterial = new THREE.PointsMaterial({
            color: 0xFFFFAA,
            size: 0.1,
            transparent: true,
            opacity: 0.3
        });
        
        this.solarWind = new THREE.Points(windGeometry, windMaterial);
        this.scene.add(this.solarWind);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Sun light (point light)
        const sunLight = new THREE.PointLight(0xFFFFFF, 4, 800);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 800;
        this.scene.add(sunLight);
        
        // Directional light for better visibility
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.6);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }
    
    createPlanetControls() {
        const controlsContainer = document.getElementById('planetControls');
        
        this.planetData.forEach((data, index) => {
            const controlDiv = document.createElement('div');
            controlDiv.className = 'planet-control';
            
            controlDiv.innerHTML = `
                <h4>
                    <span class="planet-color" style="background-color: #${data.color.toString(16).padStart(6, '0')}"></span>
                    ${data.name}
                </h4>
                <div class="speed-control">
                    <label>Orbital Speed:</label>
                    <div class="slider-container">
                        <input type="range" id="speed-${index}" min="0" max="5" step="0.1" value="1" class="speed-slider">
                    </div>
                    <div class="speed-display">
                        <span id="speed-value-${index}">1.0x</span>
                    </div>
                </div>
            `;
            
            controlsContainer.appendChild(controlDiv);
            
            // Add event listener for speed control
            const speedSlider = document.getElementById(`speed-${index}`);
            const speedValue = document.getElementById(`speed-value-${index}`);
            
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                this.planets[index].userData.individualSpeed = speed;
                speedValue.textContent = `${speed.toFixed(1)}x`;
            });
        });
    }
    
    setupEventListeners() {
        const canvas = document.getElementById('solarSystemCanvas');
        
        // System controls
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.toggleAnimation();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSystem();
        });
        
        document.getElementById('themeBtn').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Global speed control
        const globalSpeedSlider = document.getElementById('globalSpeed');
        const globalSpeedValue = document.getElementById('globalSpeedValue');
        const speedIndicator = document.getElementById('speedIndicator');
        
        globalSpeedSlider.addEventListener('input', (e) => {
            this.globalSpeed = parseFloat(e.target.value);
            globalSpeedValue.textContent = `${this.globalSpeed.toFixed(1)}x`;
            speedIndicator.textContent = `${this.globalSpeed.toFixed(1)}x`;
        });
        
        // Camera presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCameraPreset(e.target.closest('.preset-btn').dataset.preset);
            });
        });
        
        // Visual options
        document.getElementById('showOrbits').addEventListener('change', (e) => {
            this.toggleOrbits(e.target.checked);
        });
        
        document.getElementById('showLabels').addEventListener('change', (e) => {
            this.toggleLabels(e.target.checked);
        });
        
        document.getElementById('showStars').addEventListener('change', (e) => {
            this.toggleStars(e.target.checked);
        });
        
        document.getElementById('showTrails').addEventListener('change', (e) => {
            this.toggleTrails(e.target.checked);
        });
        
        // Mouse controls
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', () => this.onMouseUp());
        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        canvas.addEventListener('mouseleave', () => this.onMouseUp());
        
        // Touch controls
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        canvas.addEventListener('touchend', () => this.onTouchEnd());
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.toggleAnimation();
                    break;
                case 'KeyR':
                    this.resetSystem();
                    break;
                case 'KeyT':
                    this.toggleTheme();
                    break;
                case 'KeyF':
                    this.toggleFullscreen();
                    break;
                case 'KeyH':
                    this.toggleShortcutsHelp();
                    break;
                case 'Digit1':
                    this.setCameraPreset('overview');
                    break;
                case 'Digit2':
                    this.setCameraPreset('inner');
                    break;
                case 'Digit3':
                    this.setCameraPreset('outer');
                    break;
                case 'Digit4':
                    this.setCameraPreset('sun');
                    break;
            }
        });
        
        // Panel toggle for mobile
        document.getElementById('panelToggle').addEventListener('click', () => {
            this.togglePanel();
        });
    }
    
    onMouseDown(event) {
        this.cameraControls.isMouseDown = true;
        this.cameraControls.mouseX = event.clientX;
        this.cameraControls.mouseY = event.clientY;
    }
    
    onMouseMove(event) {
        // Update mouse position for raycasting
        const canvas = document.getElementById('solarSystemCanvas');
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        if (this.cameraControls.isMouseDown) {
            const deltaX = event.clientX - this.cameraControls.mouseX;
            const deltaY = event.clientY - this.cameraControls.mouseY;
            
            this.cameraControls.targetRotationY += deltaX * 0.01;
            this.cameraControls.targetRotationX += deltaY * 0.01;
            
            // Limit vertical rotation
            this.cameraControls.targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.cameraControls.targetRotationX));
            
            this.cameraControls.mouseX = event.clientX;
            this.cameraControls.mouseY = event.clientY;
        } else {
            // Handle planet hover
            this.handlePlanetHover();
        }
    }
    
    onMouseUp() {
        this.cameraControls.isMouseDown = false;
    }
    
    onWheel(event) {
        event.preventDefault();
        const zoomSpeed = 5;
        this.cameraControls.targetDistance += event.deltaY > 0 ? zoomSpeed : -zoomSpeed;
        this.cameraControls.targetDistance = Math.max(30, Math.min(400, this.cameraControls.targetDistance));
    }
    
    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.cameraControls.isMouseDown = true;
            this.cameraControls.mouseX = event.touches[0].clientX;
            this.cameraControls.mouseY = event.touches[0].clientY;
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1 && this.cameraControls.isMouseDown) {
            const deltaX = event.touches[0].clientX - this.cameraControls.mouseX;
            const deltaY = event.touches[0].clientY - this.cameraControls.mouseY;
            
            this.cameraControls.targetRotationY += deltaX * 0.01;
            this.cameraControls.targetRotationX += deltaY * 0.01;
            
            this.cameraControls.targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.cameraControls.targetRotationX));
            
            this.cameraControls.mouseX = event.touches[0].clientX;
            this.cameraControls.mouseY = event.touches[0].clientY;
        }
    }
    
    onTouchEnd() {
        this.cameraControls.isMouseDown = false;
    }
    
    handlePlanetHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.planets);
        
        if (intersects.length > 0) {
            const planet = intersects[0].object;
            if (planet !== this.hoveredPlanet) {
                this.hoveredPlanet = planet;
                this.showPlanetTooltip(planet);
            }
        } else {
            if (this.hoveredPlanet) {
                this.hidePlanetTooltip();
                this.hoveredPlanet = null;
            }
        }
    }
    
    showPlanetTooltip(planet) {
        const tooltip = document.getElementById('planetTooltip');
        const nameElement = document.getElementById('tooltipName');
        const iconElement = document.getElementById('tooltipIcon');
        const descriptionElement = document.getElementById('tooltipDescription');
        const distanceElement = document.getElementById('tooltipDistance');
        const periodElement = document.getElementById('tooltipPeriod');
        const diameterElement = document.getElementById('tooltipDiameter');
        
        const data = planet.userData;
        
        nameElement.textContent = data.name;
        iconElement.style.backgroundColor = `#${data.color.toString(16).padStart(6, '0')}`;
        descriptionElement.textContent = data.description;
        distanceElement.textContent = data.realDistance;
        periodElement.textContent = data.orbitalPeriod;
        diameterElement.textContent = data.diameter;
        
        tooltip.classList.add('visible');
        
        // Position tooltip near mouse
        const canvas = document.getElementById('solarSystemCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = (this.mouse.x + 1) * rect.width / 2 + rect.left + 10;
        const y = (-this.mouse.y + 1) * rect.height / 2 + rect.top - 10;
        
        tooltip.style.left = `${Math.min(x, window.innerWidth - tooltip.offsetWidth - 20)}px`;
        tooltip.style.top = `${Math.max(y, 20)}px`;
    }
    
    hidePlanetTooltip() {
        const tooltip = document.getElementById('planetTooltip');
        tooltip.classList.remove('visible');
    }
    
    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        const btn = document.getElementById('pauseBtn');
        const btnIcon = btn.querySelector('.btn-icon');
        const btnText = btn.querySelector('.btn-text');
        const systemStatus = document.getElementById('systemStatus');
        
        if (this.isAnimating) {
            btnIcon.textContent = '⏸️';
            btnText.textContent = 'Pause';
            systemStatus.textContent = 'RUNNING';
            systemStatus.className = 'stat-value status-running';
        } else {
            btnIcon.textContent = '▶️';
            btnText.textContent = 'Resume';
            systemStatus.textContent = 'PAUSED';
            systemStatus.className = 'stat-value status-paused';
        }
    }
    
    resetSystem() {
        // Reset all planet positions and speeds
        this.planets.forEach((planet, index) => {
            planet.userData.angle = Math.random() * Math.PI * 2;
            planet.userData.individualSpeed = 1.0;
            
            // Reset UI controls
            document.getElementById(`speed-${index}`).value = 1.0;
            document.getElementById(`speed-value-${index}`).textContent = '1.0x';
        });
        
        // Reset global speed
        this.globalSpeed = 1.0;
        document.getElementById('globalSpeed').value = 1.0;
        document.getElementById('globalSpeedValue').textContent = '1.0x';
        document.getElementById('speedIndicator').textContent = '1.0x';
        
        // Reset simulation time
        this.simulationTime = 0;
        
        // Reset camera
        this.setCameraPreset('overview');
    }
    
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('dark-theme', this.isDarkTheme);
        
        const btn = document.getElementById('themeBtn');
        const btnIcon = btn.querySelector('.btn-icon');
        const btnText = btn.querySelector('.btn-text');
        
        if (this.isDarkTheme) {
            btnIcon.textContent = '☀️';
            btnText.textContent = 'Light Mode';
            this.scene.background = new THREE.Color(0x000000);
        } else {
            btnIcon.textContent = '🌙';
            btnText.textContent = 'Dark Mode';
            this.scene.background = new THREE.Color(0x000011);
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    toggleShortcutsHelp() {
        const help = document.getElementById('shortcutsHelp');
        help.classList.toggle('visible');
    }
    
    togglePanel() {
        const panel = document.getElementById('panelContent');
        panel.classList.toggle('collapsed');
    }
    
    setCameraPreset(preset) {
        switch(preset) {
            case 'overview':
                this.cameraControls.targetDistance = 150;
                this.cameraControls.targetRotationX = 0.3;
                this.cameraControls.targetRotationY = 0;
                break;
            case 'inner':
                this.cameraControls.targetDistance = 80;
                this.cameraControls.targetRotationX = 0.2;
                this.cameraControls.targetRotationY = 0;
                break;
            case 'outer':
                this.cameraControls.targetDistance = 250;
                this.cameraControls.targetRotationX = 0.1;
                this.cameraControls.targetRotationY = 0;
                break;
            case 'sun':
                this.cameraControls.targetDistance = 50;
                this.cameraControls.targetRotationX = 0;
                this.cameraControls.targetRotationY = 0;
                break;
        }
    }
    
    toggleOrbits(show) {
        this.orbitLines.forEach(orbit => {
            orbit.visible = show;
        });
    }
    
    toggleLabels(show) {
        // Labels implementation would go here
        console.log('Toggle labels:', show);
    }
    
    toggleStars(show) {
        if (this.stars) {
            this.stars.visible = show;
        }
    }
    
    toggleTrails(show) {
        // Trails implementation would go here
        console.log('Toggle trails:', show);
    }
    
    updateCameraPosition() {
        // Smooth camera movement
        this.cameraControls.currentRotationX += (this.cameraControls.targetRotationX - this.cameraControls.currentRotationX) * 0.05;
        this.cameraControls.currentRotationY += (this.cameraControls.targetRotationY - this.cameraControls.currentRotationY) * 0.05;
        this.cameraControls.distance += (this.cameraControls.targetDistance - this.cameraControls.distance) * 0.05;
        
        // Calculate camera position
        const x = Math.cos(this.cameraControls.currentRotationY) * Math.cos(this.cameraControls.currentRotationX) * this.cameraControls.distance;
        const y = Math.sin(this.cameraControls.currentRotationX) * this.cameraControls.distance;
        const z = Math.sin(this.cameraControls.currentRotationY) * Math.cos(this.cameraControls.currentRotationX) * this.cameraControls.distance;
        
        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }
    
    updateShaderUniforms() {
        // Safely update shader uniforms
        if (this.sun && this.sun.material && this.sun.material.uniforms && this.sun.material.uniforms.time) {
            this.sun.material.uniforms.time.value = this.simulationTime;
        }
        
        if (this.stars && this.stars.material && this.stars.material.uniforms && this.stars.material.uniforms.time) {
            this.stars.material.uniforms.time.value = this.simulationTime;
        }
        
        this.planets.forEach(planet => {
            if (planet.userData.material && planet.userData.material.uniforms && planet.userData.material.uniforms.time) {
                planet.userData.material.uniforms.time.value = this.simulationTime;
            }
        });
    }
    
    updatePlanets() {
        if (!this.isAnimating) return;
        
        const deltaTime = this.clock.getDelta();
        this.simulationTime += deltaTime * this.globalSpeed;
        
        // Update simulation time display
        const days = Math.floor(this.simulationTime * 10); // Accelerated time
        document.getElementById('simulationTime').textContent = `${days} days`;
        
        this.planets.forEach(planet => {
            const data = planet.userData;
            
            // Update orbital position
            data.angle += data.speed * data.individualSpeed * this.globalSpeed * deltaTime;
            
            planet.position.x = Math.cos(data.angle) * data.distance;
            planet.position.z = Math.sin(data.angle) * data.distance;
            
            // Rotate planet on its axis
            planet.rotation.y += data.rotationSpeed * deltaTime;
        });
        
        // Update shader uniforms safely
        this.updateShaderUniforms();
        
        // Rotate asteroid belt slowly
        if (this.asteroidBelt) {
            this.asteroidBelt.rotation.y += 0.001 * deltaTime;
        }
        
        // Rotate Kuiper belt even slower
        if (this.kuiperBelt) {
            this.kuiperBelt.rotation.y += 0.0005 * deltaTime;
        }
        
        // Update solar wind particles
        if (this.solarWind) {
            const positions = this.solarWind.geometry.attributes.position.array;
            const velocities = this.solarWind.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i] * deltaTime * 10;
                positions[i + 1] += velocities[i + 1] * deltaTime * 10;
                positions[i + 2] += velocities[i + 2] * deltaTime * 10;
                
                // Reset particles that are too far
                const distance = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2);
                if (distance > 200) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 10 + Math.random() * 5;
                    positions[i] = Math.cos(angle) * radius;
                    positions[i + 1] = (Math.random() - 0.5) * 2;
                    positions[i + 2] = Math.sin(angle) * radius;
                }
            }
            
            this.solarWind.geometry.attributes.position.needsUpdate = true;
        }
        
        // Rotate stars slowly
        if (this.stars) {
            this.stars.rotation.y += 0.0001 * deltaTime;
        }
    }
    
    updateStats() {
        // Update FPS
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            document.getElementById('fpsDisplay').textContent = this.fps;
            
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        
        // Update object count
        document.getElementById('objectCount').textContent = this.scene.children.length;
    }
    
    handleResize() {
        const canvas = document.getElementById('solarSystemCanvas');
        const container = canvas.parentElement;
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateCameraPosition();
        this.updatePlanets();
        this.updateStats();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    destroy() {
        // Clean up resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const stellarSystem = new StellarSystemSimulation();
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        stellarSystem.destroy();
    });
    
    // Add keyboard shortcuts info to console
    console.log('🌌 STELLAR SYSTEM - Keyboard Shortcuts:');
    console.log('Space: Pause/Resume animation');
    console.log('R: Reset system');
    console.log('T: Toggle theme');
    console.log('F: Toggle fullscreen');
    console.log('H: Show/hide help');
    console.log('1-4: Camera presets');
    console.log('Mouse: Drag to rotate, scroll to zoom');
    console.log('Touch: Drag to navigate on mobile');
});