document.addEventListener('DOMContentLoaded', () => {
    
    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5050' : 'https://my-portfolio-2026-i0li.onrender.com';

    /* ==========================================================================
       0. INTRO PRELOADER & FLAG ANIMATION
       ========================================================================== */
    const preloader = document.getElementById('preloader');
    const loaderFlag = document.getElementById('loaderFlag');
    const flyingIn = document.getElementById('flyingIn');
    const headerIn = document.querySelector('.header .logo .tricolor-text');
    const headerLogo = document.querySelector('.header .logo');
    const entryVideo = document.getElementById('entryVideo');

    if (preloader) {
        // Prevent scrolling during intro
        document.body.classList.add('no-scroll');
        
        // Hide target tricolor-text in header initially
        if (headerIn) {
            headerIn.style.opacity = '0';
            headerIn.style.transition = 'opacity 0.2s ease';
        }

        let introStarted = false;
        
        const startMorphAndFlight = () => {
            if (introStarted) return;
            introStarted = true;

            // 1. Start flight immediately to navbar (from center of video)
            if (flyingIn && headerIn) {
                // Clear CSS entrance animation so it doesn't block the transform transition
                flyingIn.style.animation = 'none';
                
                const startRect = flyingIn.getBoundingClientRect();
                const endRect = headerIn.getBoundingClientRect();
                
                const startX = startRect.left + startRect.width / 2;
                const startY = startRect.top + startRect.height / 2;
                const endX = endRect.left + endRect.width / 2;
                const endY = endRect.top + endRect.height / 2;
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const scale = endRect.width / startRect.width;

                flyingIn.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.3, 1), opacity 0.8s ease';
                flyingIn.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(${scale})`;
            }

            // 2. Dock "in" to header logo, pulse logo, and fade out the preloader screen (video + background) after flight ends (1.2s)
            setTimeout(() => {
                if (headerIn) {
                    headerIn.style.opacity = '1';
                }
                if (headerLogo) {
                    headerLogo.classList.add('logo-pulse');
                    setTimeout(() => {
                        headerLogo.classList.remove('logo-pulse');
                    }, 550);
                }
                if (flyingIn) {
                    flyingIn.style.opacity = '0';
                }
                
                // Fade out both the video loader container and the main preloader background together
                if (loaderFlag) {
                    loaderFlag.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    loaderFlag.style.opacity = '0';
                    loaderFlag.style.transform = 'scale(0.95)';
                }
                if (preloader) {
                    preloader.style.transition = 'opacity 0.8s ease';
                    preloader.style.opacity = '0';
                    preloader.style.pointerEvents = 'none';
                }
            }, 1200);

            // 3. Clean up preloader and enable scroll after fade out completes (2.0s)
            setTimeout(() => {
                if (preloader) {
                    preloader.style.display = 'none';
                }
                document.body.classList.remove('no-scroll');
            }, 2000);
        };

        if (entryVideo) {
            // Morph as soon as video ends
            entryVideo.addEventListener('ended', startMorphAndFlight);

            // Handle video loading errors immediately
            entryVideo.addEventListener('error', () => {
                console.warn('Video preloader failed to load, opening page immediately.');
                startMorphAndFlight();
            });

            // Attempt to play the video and catch autoplay blockages (e.g. low-power mode or browser policies)
            entryVideo.play().catch(err => {
                console.warn('Video preloader autoplay was blocked:', err);
                // Start fallback morph after a short 1s delay so the user isn't stuck on a blank screen
                setTimeout(startMorphAndFlight, 1000);
            });
            
            // Absolute fallback after 4.5 seconds in case video gets stuck or is blocked from playing
            setTimeout(startMorphAndFlight, 4500);
        } else {
            // Immediately start fallback if video doesn't exist
            setTimeout(startMorphAndFlight, 1500);
        }
    }

    // ==========================================================================
    // 0.1 DYNAMIC CONTENT LOADER (MongoDB integrations)
    // ==========================================================================
    let profileData = null;
    let loadedActivities = [];
    let lightboxImages = [];
    let currentLightboxIndex = 0;

    async function loadDynamicPortfolio() {
        try {
            console.log('Fetching dynamic data from database...');
            // Parallel fetches
            const [resProf, resStats, resExp, resEdu, resSkills, resProj, resAct, resTest] = await Promise.all([
                fetch(`${API_BASE}/api/profile`),
                fetch(`${API_BASE}/api/stats`),
                fetch(`${API_BASE}/api/experiences`),
                fetch(`${API_BASE}/api/education`),
                fetch(`${API_BASE}/api/skills`),
                fetch(`${API_BASE}/api/projects`),
                fetch(`${API_BASE}/api/activities`),
                fetch(`${API_BASE}/api/testimonials`)
            ]);

            // 1. Profile / Hero & About
            if (resProf.ok) {
                profileData = await resProf.json();
                
                // Hero texts
                const heroTitle = document.querySelector('.hero-title');
                if (heroTitle && profileData.title) {
                    // Update the first text line of hero, preserving the typewriter span
                    const lines = profileData.title.split('\n');
                    if (heroTitle.childNodes.length > 0) {
                        heroTitle.childNodes[0].textContent = lines[0] + ' ';
                    }
                }
                
                const heroSubtitle = document.querySelector('.hero-subtitle');
                if (heroSubtitle && profileData.subtitle) {
                    heroSubtitle.textContent = profileData.subtitle;
                }

                const statusBadge = document.querySelector('.status-badge');
                if (statusBadge && profileData.statusBadge) {
                    statusBadge.innerHTML = `<span class="pulse-dot"></span> ${profileData.statusBadge}`;
                }

                const heroProfileImg = document.querySelector('.hero-profile-img');
                if (heroProfileImg && profileData.profilePicture) {
                    heroProfileImg.src = profileData.profilePicture.startsWith('/uploads') ? `${API_BASE}${profileData.profilePicture}` : profileData.profilePicture;
                }

                // About settings
                const aboutLead = document.querySelector('.lead-text');
                if (aboutLead && profileData.aboutLeadText) {
                    aboutLead.textContent = profileData.aboutLeadText;
                }

                const aboutTextContainer = document.querySelector('.about-text');
                if (aboutTextContainer && profileData.aboutText) {
                    // Replace other paragraph siblings after lead-text
                    const paragraphs = aboutTextContainer.querySelectorAll('p:not(.lead-text)');
                    paragraphs.forEach(p => p.remove());

                    const splitText = profileData.aboutText.split('\n\n');
                    splitText.forEach(txt => {
                        const p = document.createElement('p');
                        p.textContent = txt;
                        p.style.marginTop = '15px';
                        aboutTextContainer.insertBefore(p, aboutTextContainer.querySelector('.personal-info-grid'));
                    });
                }

                // Personal Info Card
                const infoGrid = document.querySelector('.personal-info-grid');
                if (infoGrid) {
                    infoGrid.innerHTML = `
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value"><a href="mailto:${profileData.email}">${profileData.email}</a></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone:</span>
                            <span class="info-value"><a href="tel:${profileData.phone.replace(/\s+/g, '')}">${profileData.phone}</a></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Location:</span>
                            <span class="info-value">${profileData.location}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">LinkedIn:</span>
                            <span class="info-value"><a href="${profileData.linkedin}" target="_blank">${profileData.linkedin.replace('https://www.', '').replace('https://', '')}</a></span>
                        </div>
                    `;
                }

                // Fellowships List
                const fellowshipList = document.querySelector('.fellowship-list');
                if (fellowshipList && profileData.fellowships) {
                    fellowshipList.innerHTML = '';
                    profileData.fellowships.forEach(f => {
                        const li = document.createElement('li');
                        li.innerHTML = `<i class="fa-solid fa-circle-check text-orange animate-icon"></i> ${f}`;
                        fellowshipList.appendChild(li);
                    });
                }

                // LeetCode & GitHub data fetching
                const leetcodeUser = profileData.leetcodeUsername || 'saranthecoder';
                const githubUser = profileData.github ? profileData.github.split('/').pop() : 'saranthecoder';

                // Update Profile Links
                const githubProfileLink = document.getElementById('githubProfileLink');
                if (githubProfileLink) {
                    githubProfileLink.href = profileData.github || `https://github.com/${githubUser}`;
                }
                const leetcodeProfileLink = document.getElementById('leetcodeProfileLink');
                if (leetcodeProfileLink) {
                    leetcodeProfileLink.href = profileData.leetcodeUrl || `https://leetcode.com/u/${leetcodeUser}/`;
                }

                // Update GitHub contribution chart source
                const githubChart = document.getElementById('githubContributionsChart');
                if (githubChart) {
                    githubChart.src = `https://ghchart.rshah.org/FF5A1F/${githubUser}`;
                }

                // Fetch GitHub Stats
                fetch(`https://api.github.com/users/${githubUser}`)
                    .then(r => r.ok ? r.json() : null)
                    .then(gitData => {
                        if (gitData) {
                            document.getElementById('githubPublicRepos').textContent = gitData.public_repos ?? '-';
                            document.getElementById('githubFollowers').textContent = gitData.followers ?? '-';
                            document.getElementById('githubGists').textContent = gitData.public_gists ?? '-';
                        }
                    })
                    .catch(err => console.warn("GitHub API error:", err));

                // Fetch LeetCode Stats
                fetch(`https://leetcode-stats-api.herokuapp.com/${leetcodeUser}`)
                    .then(r => r.ok ? r.json() : null)
                    .then(lcData => {
                        if (lcData && lcData.status === 'success') {
                            // Total Solved Circle
                            document.getElementById('leetcodeTotalSolved').textContent = lcData.totalSolved || '0';
                            
                            // Circle progress animation
                            const circleFill = document.getElementById('leetcodeCircleFill');
                            if (circleFill) {
                                const percent = (lcData.totalSolved / lcData.totalQuestions) * 100 || 0;
                                const radius = circleFill.r.baseVal.value || 50;
                                const circumference = 2 * Math.PI * radius;
                                circleFill.style.strokeDasharray = `${circumference}`;
                                const offset = circumference - (percent / 100) * circumference;
                                circleFill.style.strokeDashoffset = offset;
                            }

                            // Easy bar
                            document.getElementById('leetcodeEasyCount').textContent = `${lcData.easySolved} / ${lcData.totalEasy}`;
                            const easyFill = document.getElementById('leetcodeEasyFill');
                            if (easyFill) easyFill.style.width = `${(lcData.easySolved / lcData.totalEasy) * 100}%`;

                            // Medium bar
                            document.getElementById('leetcodeMediumCount').textContent = `${lcData.mediumSolved} / ${lcData.totalMedium}`;
                            const mediumFill = document.getElementById('leetcodeMediumFill');
                            if (mediumFill) mediumFill.style.width = `${(lcData.mediumSolved / lcData.totalMedium) * 100}%`;

                            // Hard bar
                            document.getElementById('leetcodeHardCount').textContent = `${lcData.hardSolved} / ${lcData.totalHard}`;
                            const hardFill = document.getElementById('leetcodeHardFill');
                            if (hardFill) hardFill.style.width = `${(lcData.hardSolved / lcData.totalHard) * 100}%`;

                            // Footer metrics
                            document.getElementById('leetcodeRanking').textContent = lcData.ranking ? lcData.ranking.toLocaleString() : '-';
                            document.getElementById('leetcodeAcceptance').textContent = lcData.acceptanceRate ? `${lcData.acceptanceRate}%` : '-';
                            document.getElementById('leetcodeActiveStreak').textContent = lcData.contributionPoints ? lcData.contributionPoints.toLocaleString() : '-'; // Fallback to points as active indicator
                        } else {
                            showLeetcodeError();
                        }
                    })
                    .catch(err => {
                        console.warn("Leetcode API error:", err);
                        showLeetcodeError();
                    });

                function showLeetcodeError() {
                    document.getElementById('leetcodeTotalSolved').textContent = 'N/A';
                    document.getElementById('leetcodeEasyCount').textContent = 'N/A';
                    document.getElementById('leetcodeMediumCount').textContent = 'N/A';
                    document.getElementById('leetcodeHardCount').textContent = 'N/A';
                }
            }

            // 2. Stats
            if (resStats.ok) {
                const stats = await resStats.json();
                const grid = document.querySelector('.stats-grid');
                if (grid && stats.length > 0) {
                    grid.innerHTML = '';
                    stats.forEach(s => {
                        const card = document.createElement('div');
                        card.className = 'stat-card hover-lift-shadow';
                        card.innerHTML = `
                            <h3 class="stat-number" data-target="${s.target}">0</h3>
                            <p class="stat-label">${s.label}</p>
                        `;
                        grid.appendChild(card);
                    });
                    // Refresh selectors for counters
                    initStatsObserver();
                }
            }

            // 3. Experiences
            if (resExp.ok) {
                const exps = await resExp.json();
                const engCol = document.querySelector('.experience-column.left-col');
                const trainCol = document.querySelector('.experience-column.right-col');

                if (engCol && trainCol && exps.length > 0) {
                    // Clear previous items but keep titles
                    engCol.innerHTML = '<h3 class="experience-column-title"><i class="fa-solid fa-code text-orange"></i> Engineering Roles</h3>';
                    trainCol.innerHTML = '<h3 class="experience-column-title"><i class="fa-solid fa-graduation-cap text-orange"></i> Training & Mentoring Roles</h3>';

                    exps.forEach((e, idx) => {
                        const activeClass = idx === 0 ? 'active' : '';
                        const card = document.createElement('div');
                        card.className = `exp-card ${activeClass} tilt-target`;
                        
                        let highlightMarkup = '';
                        if (e.highlight && e.highlight.title) {
                            highlightMarkup = `
                                <div class="exp-highlight">
                                    <h5><i class="fa-solid fa-star text-orange spin-slow"></i> ${e.highlight.title}</h5>
                                    <p>${e.highlight.desc}</p>
                                </div>
                            `;
                        }

                        card.innerHTML = `
                            <div class="exp-card-header">
                                <div class="exp-card-header-text">
                                    <span class="exp-date">${e.dateRange}</span>
                                    <h3 class="exp-role">${e.role}</h3>
                                    <h4 class="exp-company">${e.company} <span class="loc">${e.location ? `| ${e.location}` : ''}</span></h4>
                                </div>
                                <div class="exp-toggle-icon"><i class="fa-solid fa-chevron-down"></i></div>
                            </div>
                            <div class="exp-card-content">
                                <ul>
                                    ${(e.points || []).map(p => `<li>${p}</li>`).join('')}
                                </ul>
                                ${highlightMarkup}
                            </div>
                        `;

                        if (e.type === 'engineering') {
                            engCol.appendChild(card);
                        } else {
                            trainCol.appendChild(card);
                        }
                    });
                    
                    // Bind toggles for new exp cards
                    initCollapsibleCards();
                }
            }

            // 4. Education
            if (resEdu.ok) {
                const edus = await resEdu.json();
                const eduCard = document.querySelector('.education-card');
                if (eduCard && edus.length > 0) {
                    eduCard.innerHTML = `
                        <div class="edu-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                        <h3>Education</h3>
                    `;
                    edus.forEach((edu, idx) => {
                        const div = document.createElement('div');
                        div.className = 'edu-details';
                        if (idx > 0) {
                            div.style.cssText = 'margin-top: 20px; border-top: 1px solid var(--border-gray); padding-top: 15px;';
                        }
                        div.innerHTML = `
                            <span class="edu-date">${edu.dateRange}</span>
                            <h4>${edu.degree}</h4>
                            <p class="edu-school">${edu.school}</p>
                        `;
                        eduCard.appendChild(div);
                    });
                }
            }

            // 5. Skills
            if (resSkills.ok) {
                const skills = await resSkills.json();
                const grid = document.querySelector('.skills-grid');
                if (grid && skills.length > 0) {
                    grid.innerHTML = '';
                    
                    // Group skills by category
                    const grouped = {};
                    skills.forEach(s => {
                        if (!grouped[s.category]) grouped[s.category] = [];
                        grouped[s.category].push(s.name);
                    });

                    const categoryIcons = {
                        'Languages': 'fa-terminal',
                        'Frontend': 'fa-laptop-code',
                        'Backend': 'fa-server',
                        'Databases': 'fa-database',
                        'DevOps & Tools': 'fa-cloud-arrow-up',
                        'UI/UX & Design': 'fa-bezier-curve',
                        'Engineering': 'fa-gears',
                        'Training & Education': 'fa-chalkboard-user'
                    };

                    Object.keys(grouped).forEach(cat => {
                        const card = document.createElement('div');
                        card.className = 'skill-category-card scroll-reveal fade-up tilt-target';
                        const icon = categoryIcons[cat] || 'fa-code';
                        
                        card.innerHTML = `
                            <div class="skill-card-icon"><i class="fa-solid ${icon} animate-icon"></i></div>
                            <h3>${cat}</h3>
                            <div class="skill-badges">
                                ${grouped[cat].map(skill => `<span>${skill}</span>`).join('')}
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                }
            }

            // 6. Projects
            if (resProj.ok) {
                const projects = await resProj.json();
                const grid = document.querySelector('.projects-grid');
                if (grid && projects.length > 0) {
                    grid.innerHTML = '';
                    projects.forEach(p => {
                        const card = document.createElement('div');
                        card.className = 'project-card scroll-reveal fade-up tilt-target';
                        card.setAttribute('data-category', p.category);
                        
                        let tagLabel = 'Project';
                        if (p.category === 'featured') tagLabel = 'AI Highlight';
                        else if (p.category === 'fullstack') tagLabel = 'Full Stack';
                        else if (p.category === 'frontend') tagLabel = 'Frontend UI';

                        card.innerHTML = `
                            <div class="project-card-header">
                                <span class="project-tag-badge">${tagLabel}</span>
                                <div class="project-links">
                                    ${p.githubUrl ? `<a href="${p.githubUrl}" aria-label="GitHub" class="magnetic" target="_blank"><i class="fa-brands fa-github"></i></a>` : ''}
                                    ${p.liveUrl ? `<a href="${p.liveUrl}" aria-label="External Link" class="magnetic" target="_blank"><i class="fa-solid fa-up-right-from-square"></i></a>` : ''}
                                </div>
                            </div>
                            <h3>${p.title}</h3>
                            <p class="project-desc">${p.description}</p>
                            <div class="project-stack">
                                ${(p.tags || []).map(t => `<span>${t}</span>`).join('')}
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                    
                    // Rebind filters and project actions
                    initProjectsFilter();
                }
            }

            // 7. Activities (LinkedIn Top 3)
            if (resAct.ok) {
                const acts = await resAct.json();
                loadedActivities = acts;
                const feed = document.getElementById('activitiesHomeFeed');
                if (feed) {
                    feed.innerHTML = '';
                    const top3 = acts.slice(0, 3);
                    
                    if (top3.length === 0) {
                        feed.innerHTML = '<p style="text-align:center; color:var(--slate-gray); padding:20px 0;">No recent activities posted yet.</p>';
                    } else {
                        top3.forEach(post => {
                            feed.appendChild(renderHomePost(post));
                        });
                    }
                }
            }

            // 8. Testimonials
            if (resTest && resTest.ok) {
                const testimonials = await resTest.json();
                const container = document.getElementById('testimonialsContainer');
                if (container) {
                    container.innerHTML = '';
                    if (testimonials.length === 0) {
                        container.innerHTML = '<p style="text-align:center; color:var(--slate-gray); padding:40px 0; grid-column:span 3;">No approved reviews yet. Be the first to write one!</p>';
                    } else {
                        testimonials.forEach(t => {
                            container.appendChild(renderTestimonialCard(t));
                        });
                    }
                }
            }

            console.log('Dynamic portfolio successfully loaded.');
        } catch (err) {
            console.warn('API connection failed, loaded static fallback elements.', err);
        } finally {
            // Run global animations/initializations
            initGlobalEffects();
        }
    }

    function renderHomePost(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.style.cssText = 'background:white; border:1px solid var(--border-gray); border-radius:10px; padding:20px; margin-bottom:20px; text-align:left;';
        
        const dateStr = new Date(post.datePosted).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        const name = profileData ? profileData.name : 'Saran Velmurugan';
        const avatarSrc = profileData && profileData.profilePicture 
            ? (profileData.profilePicture.startsWith('/uploads') ? `${API_BASE}${profileData.profilePicture}` : profileData.profilePicture)
            : 'profile.jpg';
        
        // Dynamic Image Grid Layouts (matching feed layout)
        let imagesMarkup = '';
        const images = post.images || [];
        if (images.length > 0) {
            let gridClass = 'grid-1';
            if (images.length === 2) gridClass = 'grid-2';
            else if (images.length === 3) gridClass = 'grid-3';
            else if (images.length === 4) gridClass = 'grid-4';
            else if (images.length > 4) gridClass = 'grid-more';

            const maxShow = 4;
            imagesMarkup = `<div class="post-images-grid ${gridClass}" style="margin-bottom:12px;">`;
            images.forEach((imgUrl, idx) => {
                if (idx >= maxShow && gridClass === 'grid-more') return;
                
                const fullImgSrc = imgUrl.startsWith('/uploads') ? `${API_BASE}${imgUrl}` : imgUrl;
                const isLast = idx === maxShow - 1 && images.length > maxShow;

                imagesMarkup += `
                    <div class="grid-img" onclick="event.stopPropagation(); openLightbox(${idx}, '${post._id}')" style="height: ${images.length === 1 ? '180px' : '110px'};">
                        <img src="${fullImgSrc}" alt="Activity Media">
                        ${isLast ? `<div class="more-overlay">+${images.length - maxShow}</div>` : ''}
                    </div>
                `;
            });
            imagesMarkup += '</div>';
        }

        card.innerHTML = `
            <div class="post-author-bar" style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                <img src="${avatarSrc}" class="author-avatar" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" alt="${name}">
                <div class="author-info">
                    <h3 style="font-size:0.9rem; font-weight:700; color:var(--dark-charcoal);">${name}</h3>
                    <span style="font-size:0.7rem; color:var(--light-gray);">${dateStr}</span>
                </div>
            </div>
            <div class="post-text" style="font-size:0.85rem; color:var(--medium-gray); margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${post.description}</div>
            ${imagesMarkup}
            <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.75rem; color:var(--slate-gray); border-top:1px solid var(--border-gray); padding-top:10px;">
                <span><i class="fa-solid fa-thumbs-up text-orange"></i> ${post.likesCount} likes • ${post.commentsCount || 0} comments</span>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <span onclick="event.stopPropagation(); sharePostHome('${post._id}')" style="cursor: pointer; font-weight:700; color:var(--primary-orange)"><i class="fa-regular fa-paper-plane"></i> Share</span>
                    <span style="font-weight:700; color:var(--primary-orange)">View <i class="fa-solid fa-chevron-right"></i></span>
                </div>
            </div>
        `;
        
        // Make whole card clickable to redirect to activity center
        card.style.cursor = 'pointer';
        card.onclick = () => {
            window.location.href = `activities.html#post-${post._id}`;
        };
        return card;
    }

    // Share post from home page helper
    window.sharePostHome = function(id) {
        const shareUrl = `${window.location.origin}/activities.html#post-${id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToastHome("Post link copied to clipboard!");
        }).catch(() => {
            showToastHome("Failed to copy link.");
        });
    };

    // Show toast helper for home page
    window.showToastHome = function(msg) {
        let toast = document.getElementById('toastMessage');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastMessage';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    };

    // Lightbox cycles
    window.openLightbox = function(index, postId) {
        const post = loadedActivities.find(p => p._id === postId);
        if (!post || !post.images || post.images.length === 0) return;
        
        lightboxImages = post.images;
        currentLightboxIndex = index;
        updateLightboxImage();
        
        const overlay = document.getElementById('lightboxOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeLightbox = function() {
        const overlay = document.getElementById('lightboxOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    };

    window.navigateLightbox = function(direction) {
        if (lightboxImages.length === 0) return;
        currentLightboxIndex = (currentLightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
        updateLightboxImage();
    };

    function updateLightboxImage() {
        const img = document.getElementById('lightboxImg');
        const prevBtn = document.getElementById('lightboxPrev');
        const nextBtn = document.getElementById('lightboxNext');
        
        if (img && lightboxImages[currentLightboxIndex]) {
            const src = lightboxImages[currentLightboxIndex];
            img.src = src.startsWith('/uploads') ? `${API_BASE}${src}` : src;
        }
        
        if (prevBtn && nextBtn) {
            if (lightboxImages.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            }
        }
    }

    // Testimonial helpers
    function renderTestimonialCard(t) {
        const card = document.createElement('div');
        card.className = 'testimonial-card scroll-reveal';
        
        const ratingVal = t.rating || 5;
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            starsHtml += i < ratingVal 
                ? '<i class="fa-solid fa-star"></i>' 
                : '<i class="fa-regular fa-star"></i>';
        }

        const initials = t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const roleAndCompany = t.roleCompany || 'Verified Visitor';

        card.innerHTML = `
            <div>
                <div class="testimonial-rating">
                    ${starsHtml}
                </div>
                <div class="testimonial-quote">
                    "${t.text}"
                </div>
            </div>
            <div class="testimonial-author">
                <div class="testimonial-avatar">${initials}</div>
                <div class="testimonial-info">
                    <h4>${t.name}</h4>
                    <p>${roleAndCompany}</p>
                </div>
            </div>
        `;
        return card;
    }

    window.openReviewModal = function() {
        const modal = document.getElementById('reviewModalOverlay');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeReviewModal = function() {
        const modal = document.getElementById('reviewModalOverlay');
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    };

    // Testimonial submission listener
    const testimonialSubmitForm = document.getElementById('testimonialSubmitForm');
    if (testimonialSubmitForm) {
        testimonialSubmitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('revName').value.trim();
            const roleCompany = document.getElementById('revRoleCompany').value.trim();
            const rating = document.getElementById('revRating').value;
            const text = document.getElementById('revText').value.trim();

            if (!name || !text) return;

            try {
                const res = await fetch(`${API_BASE}/api/testimonials`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, roleCompany, rating, text })
                });

                if (res.ok) {
                    showToastHome("Review submitted for admin approval!");
                    closeReviewModal();
                    testimonialSubmitForm.reset();
                } else {
                    showToastHome("Failed to submit review.");
                }
            } catch (err) {
                console.error("Testimonial submit error:", err);
                showToastHome("Network error submitting review.");
            }
        });
    }

    // Call dynamic load
    loadDynamicPortfolio();

    /* ==========================================================================
       1. HEADER SCROLL & PROGRESS EFFECT
       ========================================================================== */
    const header = document.querySelector('.header');
    const scrollProgress = document.getElementById('scrollProgress');
    
    window.addEventListener('scroll', () => {
        // Header styling on scroll
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Scroll progress calculation
        if (scrollProgress) {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (windowHeight > 0) {
                const scrollPercent = (window.scrollY / windowHeight) * 100;
                scrollProgress.style.width = scrollPercent + '%';
            }
        }

        // Timeline line filling effect
        updateTimelineProgress();
    });

    /* ==========================================================================
       2. INTERACTIVE CANVAS PARTICLE SYSTEM (WOW Factor)
       ========================================================================== */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 45;
        let mouse = { x: null, y: null, radius: 150 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1; // small elegant nodes
                this.baseX = this.x;
                this.baseY = this.y;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.density = (Math.random() * 30) + 10;
            }

            draw() {
                ctx.fillStyle = 'rgba(255, 90, 31, 0.45)'; // Soft orange particles
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // Constant drifting motion
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce off canvas boundaries
                if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
                if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

                // Mouse Interactive gravity
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = forceDirectionX * force * this.density * 0.3;
                        let directionY = forceDirectionY * force * this.density * 0.3;
                        
                        // Repel slightly
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };
        initParticles();

        const connectParticles = () => {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    // Connect nodes that are close to each other
                    if (distance < 110) {
                        opacityValue = 1 - (distance / 110);
                        ctx.strokeStyle = `rgba(0, 0, 0, ${opacityValue * 0.04})`; // Subtle dark connections
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            connectParticles();
            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }

    /* ==========================================================================
       3. TYPEWRITER DYNAMIC TEXT EFFECT
       ========================================================================== */
    const typedTextSpan = document.getElementById('typedText');
    if (typedTextSpan) {
        const roles = [
            "Full Stack Developer.",
            "Technical Trainer.",
            "GenAI & MERN Expert.",
            "Engineering Mentor."
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        const typeRole = () => {
            const currentRole = roles[roleIndex];
            
            if (isDeleting) {
                typedTextSpan.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50; // faster deletion
            } else {
                typedTextSpan.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100; // standard typing
            }

            if (!isDeleting && charIndex === currentRole.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause at full word
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingSpeed = 500; // brief pause before next word
            }

            setTimeout(typeRole, typingSpeed);
        };
        setTimeout(typeRole, 1000);
    }

    /* ==========================================================================
       4. MOBILE MENU INTERACTIVITY
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    };

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', toggleMenu);
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNav.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    /* ==========================================================================
       5. EXPERIENCE COLLAPSIBLE CARDS & CENTER LINE FILL
       ========================================================================== */
    const expContainer = document.querySelector('.experience-layout-container');
    const centerLineFill = document.querySelector('.experience-center-line-fill');
    
    const updateTimelineProgress = () => {
        if (!expContainer || !centerLineFill) return;

        const containerTop = expContainer.getBoundingClientRect().top + window.scrollY;
        const containerHeight = expContainer.offsetHeight;
        const viewportMid = window.scrollY + (window.innerHeight * 0.50);

        let progress = ((viewportMid - containerTop) / containerHeight) * 100;
        progress = Math.max(0, Math.min(100, progress));
        centerLineFill.style.height = progress + '%';

        // Auto-expand/collapse cards as the center line progress reaches them
        const expCards = document.querySelectorAll('.exp-card');
        expCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top + window.scrollY;
            if (viewportMid >= cardTop + 38) {
                if (!card.classList.contains('active')) {
                    card.classList.add('active');
                }
            } else {
                if (card.classList.contains('active')) {
                    card.classList.remove('active');
                }
            }
        });
    };

    function initCollapsibleCards() {
        const expCards = document.querySelectorAll('.exp-card');
        expCards.forEach(card => {
            const header = card.querySelector('.exp-card-header');
            if (header) {
                // Clear any previous listeners
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);

                newHeader.addEventListener('click', (e) => {
                    if (e.target.tagName === 'A' || e.target.closest('a')) return;
                    card.classList.toggle('active');
                    
                    // Recalculate container height and progress fill after transition
                    setTimeout(updateTimelineProgress, 400);
                });
            }
        });
    }

    /* ==========================================================================
       6. 3D TILT EFFECT (Cards)
       ========================================================================== */
    function initTiltEffect() {
        const tiltCards = document.querySelectorAll('.tilt-target');
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const cardRect = card.getBoundingClientRect();
                const cardWidth = cardRect.width;
                const cardHeight = cardRect.height;
                const centerX = cardRect.left + cardWidth / 2;
                const centerY = cardRect.top + cardHeight / 2;
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;

                const maxRotate = 6;
                const rotateX = ((mouseY / (cardHeight / 2)) * -maxRotate).toFixed(2);
                const rotateY = ((mouseX / (cardWidth / 2)) * maxRotate).toFixed(2);

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
                card.style.transition = 'transform 0.1s ease-out';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
                card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
            });
        });
    }

    /* ==========================================================================
       7. MAGNETIC BUTTON EFFECT
       ========================================================================== */
    function initMagneticButtons() {
        const magneticBtns = document.querySelectorAll('.magnetic');
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px) scale(1.03)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px) scale(1)`;
            });
        });
    }

    /* ==========================================================================
       8. PROJECTS GRID FILTER
       ========================================================================== */
    function initProjectsFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const filterValue = e.target.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filterValue === 'all' || category === filterValue) {
                        card.classList.remove('hide');
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.classList.add('hide');
                    }
                });
            });
        });
    }

    /* ==========================================================================
       9. SCROLL REVEAL ANIMATIONS (Intersection Observer)
       ========================================================================== */
    let revealObserver;
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        if (revealObserver) revealObserver.disconnect();

        revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight) {
                element.classList.add('active');
            }
            revealObserver.observe(element);
        });
    }

    /* ==========================================================================
       10. STATS COUNTER ANIMATION
       ========================================================================== */
    let animatedStats = false;

    const animateCounters = () => {
        const statsNumbers = document.querySelectorAll('.stat-number');
        statsNumbers.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            const duration = 2000;
            const stepTime = 30;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    if (target === 4) {
                        stat.textContent = '4+';
                    } else if (target === 2500) {
                        stat.textContent = '2.5k+';
                    } else if (target === 20) {
                        stat.textContent = '20+';
                    } else if (target === 94) {
                        stat.textContent = '94%';
                    } else {
                        stat.textContent = Math.round(target);
                    }
                } else {
                    if (target === 2500) {
                        stat.textContent = (current / 1000).toFixed(1) + 'k+';
                    } else if (target === 4) {
                        stat.textContent = Math.round(current) + '+';
                    } else if (target === 20) {
                        stat.textContent = Math.round(current) + '+';
                    } else if (target === 94) {
                        stat.textContent = Math.round(current) + '%';
                    } else {
                        stat.textContent = Math.round(current);
                    }
                }
            }, stepTime);
        });
    };

    let statsObserver;
    function initStatsObserver() {
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            animatedStats = false; // Reset on re-bind
            if (statsObserver) statsObserver.disconnect();
            
            statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !animatedStats) {
                        animateCounters();
                        animatedStats = true;
                    }
                });
            }, { threshold: 0.2 });
            
            statsObserver.observe(statsSection);
        }
    }

    // Helper to register interactions once elements are rendered
    function initGlobalEffects() {
        initCollapsibleCards();
        initTiltEffect();
        initMagneticButtons();
        initProjectsFilter();
        initScrollReveal();
        initStatsObserver();
        updateTimelineProgress();
    }


    /* ==========================================================================
       11. CONTACT FORM REAL SUBMISSION
       ========================================================================== */
    const contactForm = document.getElementById('contactForm');
    const successMsg = document.getElementById('successMsg');
    const formSubmitBtn = document.getElementById('formSubmitBtn');
    const resetFormBtn = document.getElementById('resetFormBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                alert('Please fill out all fields.');
                return;
            }

            formSubmitBtn.disabled = true;
            formSubmitBtn.innerHTML = 'Sending Message... <i class="fa-solid fa-circle-notch fa-spin"></i>';

            try {
                // Post form payload to the backend Messages API
                const res = await fetch(`${API_BASE}/api/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message })
                });

                if (res.ok) {
                    contactForm.classList.add('hidden');
                    successMsg.classList.remove('hidden');
                } else {
                    alert('There was a problem submitting your message. Please try again.');
                }
            } catch (err) {
                console.error("Message send error:", err);
                alert('Connection error. Failed to reach server inbox.');
            } finally {
                formSubmitBtn.disabled = false;
                formSubmitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane animate-arrow"></i>';
                contactForm.reset();
            }
        });
    }

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            successMsg.classList.add('hidden');
            contactForm.classList.remove('hidden');
        });
    }
});
