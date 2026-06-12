// --- Dreamwed Stories Admin & Sales Page Controller ---

document.addEventListener('DOMContentLoaded', () => {

    // --- State Constants ---
    const whatsappBase = 'https://wa.me/919995412955';
    const API_BASE = localStorage.getItem("dreamwed_api_base") || 
                     (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                        ? 'http://localhost:3000' 
                        : 'https://dreamwed-backend.onrender.com');
    let isAdminMode = false;
    let customBullets = [];

    // --- DOM Elements ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const gridItems = document.querySelectorAll('.portfolio-item');
    const availabilityForm = document.getElementById('availabilityForm');
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Admin Dashboard Elements
    const btnDiscreetAdminToggle = document.getElementById('btnDiscreetAdminToggle');
    const adminDashboard = document.getElementById('adminDashboard');
    const adminTitle = document.getElementById('adminTitle');
    const adminPrice = document.getElementById('adminPrice');
    const adminBadge = document.getElementById('adminBadge');
    
    // Bullet Appender Elements
    const adminCustomText = document.getElementById('adminCustomText');
    const btnAddCustomBullet = document.getElementById('btnAddCustomBullet');
    const addedBulletsList = document.getElementById('addedBulletsList');
    
    // Action Buttons
    const btnPublishPackage = document.getElementById('btnPublishPackage');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    const packagesGrid = document.getElementById('packagesGrid');
    let editingPackageId = null;

    // 1. Mobile Menu Toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }

    // 2. Portfolio Filtering
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            gridItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.4s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 3. Lead Availability Form (WhatsApp redirect)
    if (availabilityForm) {
        availabilityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const date = document.getElementById('weddingDate').value;
            const place = document.getElementById('weddingPlace').value;
            const side = document.getElementById('coverageSide').value;

            let sideText = 'Both Bride & Groom Side';
            if (side === 'bride') sideText = 'Bride Side Only';
            if (side === 'groom') sideText = 'Groom Side Only';

            const message = `Hi Unni! I am visiting your website and want to check your availability for our wedding. 

📅 Wedding Date: ${date}
📍 Place/Location: ${place}
👥 Coverage Scope: ${sideText}

Is this slot available?`;

            const waUrl = `${whatsappBase}?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        });
    }

    // 4. Booking Standard Packages Grid Buttons (Handled via unified event delegation)

    // --- 4.5 ONE-TOUCH FILE SELECTION SYSTEM MODAL CONTROLLER ---
    const oneTouchModal = document.getElementById('oneTouchModal');
    const btnCloseOneTouch = document.getElementById('btnCloseOneTouch');
    const btnUnderstandClose = document.getElementById('btnUnderstandClose');
    const btnBookFromOneTouch = document.getElementById('btnBookFromOneTouch');

    function openOneTouchModal() {
        if (oneTouchModal) {
            oneTouchModal.style.display = 'flex';
        }
    }

    function closeOneTouchModal() {
        if (oneTouchModal) {
            oneTouchModal.style.display = 'none';
        }
    }

    // Bind close buttons
    if (btnCloseOneTouch) {
        btnCloseOneTouch.addEventListener('click', closeOneTouchModal);
    }
    if (btnUnderstandClose) {
        btnUnderstandClose.addEventListener('click', closeOneTouchModal);
    }

    // Close on clicking outside modal-card
    if (oneTouchModal) {
        oneTouchModal.addEventListener('click', (e) => {
            if (e.target === oneTouchModal) {
                closeOneTouchModal();
            }
        });
    }

    // Book from modal button
    if (btnBookFromOneTouch) {
        btnBookFromOneTouch.addEventListener('click', () => {
            closeOneTouchModal();
            // Scroll to packages section
            const packagesSection = document.getElementById('packages');
            if (packagesSection) {
                packagesSection.scrollIntoView({ behavior: 'smooth' });
            }
            // Trigger clicking on standard Package 1 button or focus attention on standard cards
            const firstPkgBtn = document.querySelector('.select-pkg-btn');
            if (firstPkgBtn) {
                firstPkgBtn.classList.add('alert-glow');
                setTimeout(() => {
                    firstPkgBtn.classList.remove('alert-glow');
                }, 3000);
            }
        });
    }

    // Delegate click listener to support both static & dynamic flyers' specialty banners
    document.addEventListener('click', (e) => {
        if (e.target.closest('#specialtyBannerPackage1') || e.target.closest('.specialty-clickable')) {
            openOneTouchModal();
        }
    });

    // 5. FAQ Accordion Click Listeners
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // --- 6. ADMIN SECURITY AUTH & DUAL-TEMPLATE FLYER CREATOR ---

    // Security Gate State
    function isUserAuthenticated() {
        return localStorage.getItem('dreamwed_landing_auth') === 'true';
    }

    // Toggle admin cover selector custom URL input
    const adminSelectCover = document.getElementById('adminSelectCover');
    const customCoverUrlGroup = document.getElementById('customCoverUrlGroup');
    if (adminSelectCover && customCoverUrlGroup) {
        adminSelectCover.addEventListener('change', () => {
            if (adminSelectCover.value === 'custom') {
                customCoverUrlGroup.style.display = 'block';
            } else {
                customCoverUrlGroup.style.display = 'none';
            }
        });
    }

    // Template Selector radio toggles (Show/Hide relevant fields)
    const templateRadios = document.querySelectorAll('input[name="adminTemplateStyle"]');
    const goldFields = document.getElementById('goldTemplateFields');
    const burgundyFields = document.getElementById('burgundyTemplateFields');

    function syncTemplateFields() {
        const selected = document.querySelector('input[name="adminTemplateStyle"]:checked')?.value || 'gold';
        if (selected === 'gold') {
            if (goldFields) goldFields.style.display = 'block';
            if (burgundyFields) burgundyFields.style.display = 'none';
        } else {
            if (goldFields) goldFields.style.display = 'none';
            if (burgundyFields) burgundyFields.style.display = 'block';
        }
    }

    templateRadios.forEach(radio => {
        radio.addEventListener('change', syncTemplateFields);
    });

    // Initial sync
    syncTemplateFields();

    // Secure Login Modal Elements
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const btnCancelLogin = document.getElementById('btnCancelLogin');
    const adminPasswordInput = document.getElementById('adminPassword');
    const btnTogglePassword = document.getElementById('btnTogglePassword');
    const loginErrorMessage = document.getElementById('loginErrorMessage');

    // Password visibility toggle
    if (btnTogglePassword && adminPasswordInput) {
        btnTogglePassword.addEventListener('click', () => {
            const isPassword = adminPasswordInput.getAttribute('type') === 'password';
            adminPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
            btnTogglePassword.querySelector('i').className = isPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        });
    }

    // --- Secure Separate Admin Login Modal Dialog Controls ---
    if (btnDiscreetAdminToggle) {
        btnDiscreetAdminToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `${API_BASE}/admin`;
        });
    }

    // Cancel / Close Admin Login Modal
    if (btnCancelLogin && adminLoginModal) {
        btnCancelLogin.addEventListener('click', () => {
            adminLoginModal.style.display = 'none';
        });
    }

    if (adminLoginModal) {
        adminLoginModal.addEventListener('click', (e) => {
            if (e.target === adminLoginModal) {
                adminLoginModal.style.display = 'none';
            }
        });
    }

    // Admin Login Modal Form Submission Handler
    if (adminLoginForm && adminLoginModal) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = adminPasswordInput.value;

            if (pass === 'dreamwed2026') {
                localStorage.setItem('dreamwed_landing_auth', 'true');
                isAdminMode = true;
                adminLoginModal.style.display = 'none';
                if (loginErrorMessage) loginErrorMessage.style.display = 'none';
                adminPasswordInput.value = '';

                // Show dashboard & highlight discreet navbar button
                if (adminDashboard) adminDashboard.style.display = 'block';
                if (btnDiscreetAdminToggle) {
                    btnDiscreetAdminToggle.style.borderColor = 'var(--primary-gold)';
                    btnDiscreetAdminToggle.style.color = 'white';
                }
                if (adminDashboard) adminDashboard.scrollIntoView({ behavior: 'smooth' });

                renderPackagesGrid();
                fetchBookings();
            } else {
                if (loginErrorMessage) loginErrorMessage.style.display = 'flex';
                // Trigger shake animation on the modal card
                const card = adminLoginModal.querySelector('.modal-card');
                if (card) {
                    card.style.animation = 'none';
                    setTimeout(() => {
                        card.style.animation = 'shake 0.4s ease';
                    }, 10);
                }
            }
        });
    }

    // Admin Dashboard Tabs Switching Controller
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    if (adminTabBtns && adminTabContents) {
        adminTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-admin-tab');

                // Reset buttons
                adminTabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.borderColor = 'transparent';
                    b.style.background = 'none';
                    b.style.color = 'var(--text-muted)';
                });

                // Set active button
                btn.classList.add('active');
                btn.style.borderColor = targetTab === 'bookings' ? 'var(--primary-gold)' : 'hsl(335, 80%, 45%)';
                btn.style.background = targetTab === 'bookings' ? 'rgba(218, 165, 32, 0.05)' : 'rgba(74, 4, 34, 0.1)';
                btn.style.color = targetTab === 'bookings' ? 'var(--primary-gold)' : 'hsl(335, 80%, 65%)';

                // Hide/Show tab contents
                adminTabContents.forEach(content => {
                    if (content.id === 'adminTab' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)) {
                        content.style.display = 'block';
                    } else {
                        content.style.display = 'none';
                    }
                });
            });
        });
    }

        // Add dynamic Logout button inside Admin Console header if logged in
        const consoleHeader = adminDashboard.querySelector('.section-header');
        if (consoleHeader) {
            const logoutLink = document.createElement('div');
            logoutLink.style.marginTop = '16px';
            logoutLink.innerHTML = `
                <button class="btn btn-secondary btn-nav" style="margin: 0 auto;" id="btnAdminLogout">
                    <i class="fa-solid fa-right-from-bracket"></i> Clear Auth (Log Out)
                </button>
            `;
            consoleHeader.appendChild(logoutLink);
            
            const btnAdminLogout = document.getElementById('btnAdminLogout');
            if (btnAdminLogout) {
                btnAdminLogout.addEventListener('click', () => {
                    localStorage.removeItem('dreamwed_landing_auth');
                    isAdminMode = false;
                    adminDashboard.style.display = 'none';
                    if (btnDiscreetAdminToggle) {
                        btnDiscreetAdminToggle.style.borderColor = 'var(--border-glass)';
                        btnDiscreetAdminToggle.style.color = 'var(--text-muted)';
                    }
                    renderPackagesGrid();
                    alert('🔑 You have successfully logged out of Admin Mode!');
                });
            }
        }

    // Add Package Action (Submit advanced dual form or Update existing flyer)
    if (btnPublishPackage && packagesGrid) {
        btnPublishPackage.addEventListener('click', () => {
            const selectedTemplate = document.querySelector('input[name="adminTemplateStyle"]:checked')?.value || 'gold';
            const title = document.getElementById('adminTitle').value.trim();
            const ribbonText = document.getElementById('adminRibbonText').value.trim();
            const whatsappPhone = document.getElementById('adminWhatsAppPhone').value.trim();
            
            // Image selection
            let coverImage = document.getElementById('adminSelectCover').value;
            if (coverImage === 'custom') {
                coverImage = document.getElementById('adminCustomCoverUrl').value.trim() || 'images/deepak.jpg';
            }

            if (!title) {
                alert('Please enter a Package Title.');
                return;
            }

            // Pricing details
            const weddingPrice = parseInt(document.getElementById('adminWeddingPrice').value) || 40000;
            const receptionPrice = parseInt(document.getElementById('adminReceptionPrice').value) || 20000;
            const originalPrice = parseInt(document.getElementById('adminOriginalPrice').value) || 60000;
            const offerPrice = parseInt(document.getElementById('adminOfferPrice').value) || 39999;

            // Columns bullets (split by newline)
            const col1Text = document.getElementById('adminCol1Bullets').value;
            const col2Text = document.getElementById('adminCol2Bullets').value;
            
            const col1Bullets = col1Text.split('\n').map(b => b.trim()).filter(b => b.length > 0);
            const col2Bullets = col2Text.split('\n').map(b => b.trim()).filter(b => b.length > 0);

            // Footnotes (split by newline)
            const footnotesText = document.getElementById('adminFootnotes').value;
            const footnotes = footnotesText.split('\n').map(b => b.trim()).filter(b => b.length > 0);

            // Template-specific inputs
            let malayalamQuote = '';
            let cursiveSubtitle = '';
            let pipeHighlights = '';
            let albumTitle = '';
            let albumBullets = [];

            let burgundyPromo = '';
            let enableSpotlight = false;
            let spotlightNumber = '';
            let spotlightDesc = '';
            let spotlightPrice = '';

            if (selectedTemplate === 'gold') {
                malayalamQuote = document.getElementById('adminMalayalamQuote').value.trim();
                cursiveSubtitle = document.getElementById('adminCursiveSubtitle').value.trim();
                pipeHighlights = document.getElementById('adminPipeHighlights').value.trim();
                albumTitle = document.getElementById('adminGoldAlbumTitle').value.trim();
                const rawAlbumBullets = document.getElementById('adminGoldAlbumBullets').value;
                albumBullets = rawAlbumBullets.split(',').map(b => b.trim()).filter(b => b.length > 0);
            } else {
                burgundyPromo = document.getElementById('adminBurgundyPromo').value.trim();
                enableSpotlight = document.getElementById('adminEnableSpotlight').checked;
                spotlightNumber = document.getElementById('adminSpotlightNumber').value.trim();
                spotlightDesc = document.getElementById('adminSpotlightDesc').value.trim();
                spotlightPrice = document.getElementById('adminSpotlightPrice').value.trim();
            }

            // Construct Flyer Data Object
            const flyerData = {
                templateStyle: selectedTemplate,
                title: title,
                ribbonText: ribbonText,
                whatsappPhone: whatsappPhone,
                coverImage: coverImage,
                weddingPrice: weddingPrice,
                receptionPrice: receptionPrice,
                originalPrice: originalPrice,
                offerPrice: offerPrice,
                col1Bullets: col1Bullets,
                col2Bullets: col2Bullets,
                footnotes: footnotes,
                weCover: document.getElementById('adminWeCoverHeadline').value.trim(),
                whatYouGet: document.getElementById('adminWhatYouGetHeadline').value.trim(),
                
                // Gold specific
                malayalamQuote: malayalamQuote,
                cursiveSubtitle: cursiveSubtitle,
                pipeHighlights: pipeHighlights,
                albumTitle: albumTitle,
                albumBullets: albumBullets,

                // Burgundy specific
                burgundyPromo: burgundyPromo,
                enableSpotlight: enableSpotlight,
                spotlightNumber: spotlightNumber,
                spotlightDesc: spotlightDesc,
                spotlightPrice: spotlightPrice
            };

            const savedPackages = getSavedPackages();

            if (editingPackageId) {
                // Update existing package in-place
                const idx = savedPackages.findIndex(p => p.id === editingPackageId);
                if (idx !== -1) {
                    savedPackages[idx] = {
                        ...savedPackages[idx],
                        ...flyerData
                    };
                    savePackages(savedPackages);
                    alert('🎉 SUCCESS! Your customized flyer package has been successfully updated!');
                }
                const updatedId = editingPackageId;
                resetAdminForm();
                
                // Re-render & Scroll to the updated card
                renderPackagesGrid();
                setTimeout(() => {
                    const updatedCard = document.getElementById(updatedId);
                    if (updatedCard) {
                        updatedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 200);
            } else {
                // Save new package
                const newFlyer = {
                    id: 'pkg_flyer_' + Date.now(),
                    ...flyerData
                };
                savedPackages.push(newFlyer);
                savePackages(savedPackages);
                resetAdminForm();
                
                // Re-render & Scroll to the newly published card
                renderPackagesGrid();
                setTimeout(() => {
                    const newCard = document.getElementById(newFlyer.id);
                    if (newCard) {
                        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 200);
                
                alert('🎉 SUCCESS! Your customized flyer package has been persistently generated on the website!');
            }
        });
    }

    // Cancel Edit Event Listener
    if (btnCancelEdit) {
        btnCancelEdit.addEventListener('click', () => {
            resetAdminForm();
            alert('ℹ️ Package editing cancelled. Form reset to default.');
        });
    }

    // Wire up Specifications Builder compiler logic
    const btnBuildSpecs = document.getElementById('btnBuildSpecs');
    if (btnBuildSpecs) {
        btnBuildSpecs.addEventListener('click', () => {
            // Build Column 1 Bullets (Coverage & Inclusions)
            const col1Items = [];

            // Add Pre-wedding or checkboxes
            if (document.getElementById('helperPreWedding').checked) {
                col1Items.push('PRE-WEDDING PHOTOGRAPHY');
            }
            
            // Photographers & Videographers
            const photographers = document.getElementById('helperPhotographers').value;
            if (photographers) {
                col1Items.push(photographers.toUpperCase());
            }
            
            const videographers = document.getElementById('helperVideographers').value;
            if (videographers) {
                col1Items.push(videographers.toUpperCase());
            }

            if (document.getElementById('helperReceptionPhoto').checked) col1Items.push('WEDDING RECEPTION PHOTOGRAPHY');
            if (document.getElementById('helperReceptionVideo').checked) col1Items.push('WEDDING RECEPTION VIDEOGRAPHY');
            if (document.getElementById('helperWeddingPhoto').checked) col1Items.push('WEDDING PHOTOGRAPHY');
            if (document.getElementById('helperWeddingVideo').checked) col1Items.push('WEDDING VIDEOGRAPHY');
            if (document.getElementById('helperWeddingReel').checked) col1Items.push('WEDDING REEL / INSTAGRAM SHOTS');
            if (document.getElementById('helperSaveDate').checked) col1Items.push('SAVE THE DATE SHOOT');

            const drone = document.getElementById('helperDrone').value;
            if (drone && drone !== 'No Drone Coverage') {
                col1Items.push(drone.toUpperCase());
            }

            // Build Column 2 Bullets (Deliverables)
            const col2Items = [];
            
            const album = document.getElementById('helperAlbum').value;
            if (album) {
                col2Items.push(album.toUpperCase());
            }

            const frames = document.getElementById('helperFrames').value;
            if (frames) {
                col2Items.push(frames.toUpperCase());
            }

            const deliverablesPack = document.getElementById('helperPenDrive').value;
            if (deliverablesPack) {
                if (deliverablesPack.includes('|')) {
                    deliverablesPack.split('|').forEach(part => col2Items.push(part.trim().toUpperCase()));
                } else {
                    col2Items.push(deliverablesPack.toUpperCase());
                }
            }

            // Populate textareas
            document.getElementById('adminCol1Bullets').value = col1Items.join('\n');
            document.getElementById('adminCol2Bullets').value = col2Items.join('\n');

            // Soft highlight effect to show it populated
            const col1Textarea = document.getElementById('adminCol1Bullets');
            const col2Textarea = document.getElementById('adminCol2Bullets');
            if (col1Textarea && col2Textarea) {
                col1Textarea.style.borderColor = 'var(--primary-gold)';
                col2Textarea.style.borderColor = 'var(--primary-gold)';
                setTimeout(() => {
                    col1Textarea.style.borderColor = 'var(--border-glass)';
                    col2Textarea.style.borderColor = 'var(--border-glass)';
                }, 1000);
            }
            
            alert('🪄 Specifications compiled successfully! Textareas below have been updated.');
        });
    }

    // --- Helper persistence & Edit/Reset functions ---
    function getSavedPackages() {
        const pkgs = localStorage.getItem('dreamwed_custom_packages');
        return pkgs ? JSON.parse(pkgs) : [];
    }

    function savePackages(pkgs) {
        localStorage.setItem('dreamwed_custom_packages', JSON.stringify(pkgs));
    }

    function deletePackage(id) {
        let pkgs = getSavedPackages();
        pkgs = pkgs.filter(p => p.id !== id);
        savePackages(pkgs);
        renderPackagesGrid();
    }

    function editPackage(id) {
        const pkgs = getSavedPackages();
        const pkg = pkgs.find(p => p.id === id);
        if (!pkg) return;

        editingPackageId = id;

        // Set radio button for style template
        const radio = document.querySelector(`input[name="adminTemplateStyle"][value="${pkg.templateStyle}"]`);
        if (radio) {
            radio.checked = true;
            // Sync fields
            syncTemplateFields();
        }

        // Prefill fields
        document.getElementById('adminTitle').value = pkg.title || '';
        document.getElementById('adminRibbonText').value = pkg.ribbonText || '';
        document.getElementById('adminWhatsAppPhone').value = pkg.whatsappPhone || '';
        
        // Select Cover Photo
        const selectCover = document.getElementById('adminSelectCover');
        const customCoverGroup = document.getElementById('customCoverUrlGroup');
        const customCoverUrl = document.getElementById('adminCustomCoverUrl');

        if (selectCover) {
            let found = false;
            for (let i = 0; i < selectCover.options.length; i++) {
                if (selectCover.options[i].value === pkg.coverImage) {
                    selectCover.selectedIndex = i;
                    found = true;
                    break;
                }
            }
            if (!found) {
                selectCover.value = 'custom';
                if (customCoverGroup) customCoverGroup.style.display = 'block';
                if (customCoverUrl) customCoverUrl.value = pkg.coverImage || '';
            } else {
                if (customCoverGroup) customCoverGroup.style.display = 'none';
                if (customCoverUrl) customCoverUrl.value = '';
            }
        }

        // Prefill template-specific details
        if (pkg.templateStyle === 'gold') {
            document.getElementById('adminMalayalamQuote').value = pkg.malayalamQuote || '';
            document.getElementById('adminCursiveSubtitle').value = pkg.cursiveSubtitle || '';
            document.getElementById('adminPipeHighlights').value = pkg.pipeHighlights || '';
            document.getElementById('adminGoldAlbumTitle').value = pkg.albumTitle || '';
            document.getElementById('adminGoldAlbumBullets').value = (pkg.albumBullets || []).join(', ');
        } else {
            document.getElementById('adminBurgundyPromo').value = pkg.burgundyPromo || '';
            document.getElementById('adminEnableSpotlight').checked = !!pkg.enableSpotlight;
            document.getElementById('adminSpotlightNumber').value = pkg.spotlightNumber || '';
            document.getElementById('adminSpotlightDesc').value = pkg.spotlightDesc || '';
            document.getElementById('adminSpotlightPrice').value = pkg.spotlightPrice || '';
        }

        // Prefill textareas & columns
        document.getElementById('adminWeCoverHeadline').value = pkg.weCover || '';
        document.getElementById('adminWhatYouGetHeadline').value = pkg.whatYouGet || '';
        document.getElementById('adminCol1Bullets').value = (pkg.col1Bullets || []).join('\n');
        document.getElementById('adminCol2Bullets').value = (pkg.col2Bullets || []).join('\n');

        // Prefill prices
        document.getElementById('adminWeddingPrice').value = pkg.weddingPrice || '';
        document.getElementById('adminReceptionPrice').value = pkg.receptionPrice || '';
        document.getElementById('adminOriginalPrice').value = pkg.originalPrice || '';
        document.getElementById('adminOfferPrice').value = pkg.offerPrice || '';

        // Prefill footnotes
        document.getElementById('adminFootnotes').value = (pkg.footnotes || []).join('\n');

        // Modify button text and display cancel edit
        if (btnPublishPackage) {
            btnPublishPackage.querySelector('span').innerText = 'Update Package Flyer';
            btnPublishPackage.className = 'btn btn-primary btn-large btn-block';
        }
        if (btnCancelEdit) {
            btnCancelEdit.style.display = 'block';
        }

        // Auto-switch to the Flyer Creator tab so the form is visible
        const creatorTabBtn = document.querySelector('.admin-tab-btn[data-admin-tab="creator"]');
        if (creatorTabBtn) {
            creatorTabBtn.click();
        }

        // Scroll to adminDashboard section smoothly
        const adminDashboardSection = document.getElementById('adminDashboard');
        if (adminDashboardSection) {
            adminDashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function resetAdminForm() {
        editingPackageId = null;

        // Auto-switch back to the Bookings tab on reset
        const bookingsTabBtn = document.querySelector('.admin-tab-btn[data-admin-tab="bookings"]');
        if (bookingsTabBtn) {
            bookingsTabBtn.click();
        }

        // Reset text inputs to initial placeholders
        document.getElementById('adminTitle').value = 'BRIDE & GROOM ENGAGEMENT PACKAGE';
        document.getElementById('adminRibbonText').value = 'LIMITED TIME OFFER';
        document.getElementById('adminWhatsAppPhone').value = '9995412955';
        
        const selectCover = document.getElementById('adminSelectCover');
        if (selectCover) selectCover.selectedIndex = 0;
        
        const customCoverGroup = document.getElementById('customCoverUrlGroup');
        if (customCoverGroup) customCoverGroup.style.display = 'none';
        
        const customCoverUrl = document.getElementById('adminCustomCoverUrl');
        if (customCoverUrl) customCoverUrl.value = '';

        document.getElementById('adminMalayalamQuote').value = 'ചില നിമിഷങ്ങൾ എന്നും ഓർമയിൽ സൂക്ഷിക്കാൻ ഉള്ളതാണ്';
        document.getElementById('adminCursiveSubtitle').value = 'Special Package';
        document.getElementById('adminPipeHighlights').value = 'Free Helicam Videography (Drone) | Candid Engagement Photography | Candid Engagement Videography | Reels | Edited Photos For Social Media';
        document.getElementById('adminGoldAlbumTitle').value = 'ENGAGEMENT ALBUM';
        document.getElementById('adminGoldAlbumBullets').value = '80 pages, album bag, glossy mat, candid photos';

        document.getElementById('adminBurgundyPromo').value = 'FREE SAVE THE DATE';
        document.getElementById('adminEnableSpotlight').checked = true;
        document.getElementById('adminSpotlightNumber').value = '1';
        document.getElementById('adminSpotlightDesc').value = 'Photographer + Videographer';
        document.getElementById('adminSpotlightPrice').value = 'Rs. 39,999';

        document.getElementById('adminWeCoverHeadline').value = 'Groom Side (Photo + Video) | Bride Side (Photo + Video) | Candid Photography & Candid Videography [Engagement Traditional Photography + Traditional Videography] | 5 Camera Wedding Coverage';
        document.getElementById('adminWhatYouGetHeadline').value = 'What You Both Will Get...';
        
        document.getElementById('adminCol1Bullets').value = `PRE-WEDDING PHOTOGRAPHY
WEDDING RECEPTION PHOTOGRAPHY
WEDDING RECEPTION VIDEOGRAPHY
WEDDING PHOTOGRAPHY
WEDDING VIDEOGRAPHY
ONE 70 PAGES PREMIUM ALBUM
HIGHLIGHTS VIDEO
FULL HD WEDDING VIDEO
WEDDING REEL`;
        
        document.getElementById('adminCol2Bullets').value = `1 CALENDAR
1 PEN DRIVE
2 Laminated Photo Frames
EDITED PHOTOS FOR SOCIAL MEDIA`;

        document.getElementById('adminWeddingPrice').value = '40000';
        document.getElementById('adminReceptionPrice').value = '20000';
        document.getElementById('adminOriginalPrice').value = '60000';
        document.getElementById('adminOfferPrice').value = '39999';

        document.getElementById('adminFootnotes').value = `*Travel & Stay charges are excluded
*Special Discounted Prices Are Applicable For A Limited Duration Only.`;

        // Restore button state
        if (btnPublishPackage) {
            btnPublishPackage.querySelector('span').innerText = 'Publish Flyer Package to Website';
            btnPublishPackage.className = 'btn btn-success btn-large btn-block';
        }
        if (btnCancelEdit) {
            btnCancelEdit.style.display = 'none';
        }
        
        // Reset helper selects & check-boxes
        if (document.getElementById('helperPhotographers')) document.getElementById('helperPhotographers').value = '';
        if (document.getElementById('helperVideographers')) document.getElementById('helperVideographers').value = '';
        if (document.getElementById('helperDrone')) document.getElementById('helperDrone').value = '';
        if (document.getElementById('helperAlbum')) document.getElementById('helperAlbum').value = '';
        if (document.getElementById('helperFrames')) document.getElementById('helperFrames').value = '';
        if (document.getElementById('helperPenDrive')) document.getElementById('helperPenDrive').value = '';
        if (document.getElementById('helperPreWedding')) document.getElementById('helperPreWedding').checked = true;
        if (document.getElementById('helperReceptionPhoto')) document.getElementById('helperReceptionPhoto').checked = true;
        if (document.getElementById('helperReceptionVideo')) document.getElementById('helperReceptionVideo').checked = true;
        if (document.getElementById('helperWeddingPhoto')) document.getElementById('helperWeddingPhoto').checked = true;
        if (document.getElementById('helperWeddingVideo')) document.getElementById('helperWeddingVideo').checked = true;
        if (document.getElementById('helperWeddingReel')) document.getElementById('helperWeddingReel').checked = true;
        if (document.getElementById('helperSaveDate')) document.getElementById('helperSaveDate').checked = false;

        // Sync visual templates
        syncTemplateFields();
    }

    // Wire booking clicks specifically for custom flyers (Handled via unified event delegation)

    // Render Grid incorporating persistent custom visual flyers
    function renderPackagesGrid() {
        // Clear dynamically added cards, keeping only standard templates
        const cards = packagesGrid.querySelectorAll('.package-card');
        cards.forEach(c => {
            if (c.id !== 'pkgWeddingBasicCard' && c.id !== 'pkgWeddingPreCard' && c.id !== 'pkgCandidCard' && c.id !== 'pkgCandidVideoCard' && c.id !== 'pkgBrideGroomCard') {
                c.remove();
            }
        });

        const customPkgs = getSavedPackages();
        const authenticated = isUserAuthenticated();

        if (customPkgs.length > 0) {
            packagesGrid.classList.add('has-custom');
        } else {
            packagesGrid.classList.remove('has-custom');
        }

        customPkgs.forEach(pkg => {
            const card = document.createElement('div');
            card.id = pkg.id;
            card.setAttribute('data-plan', pkg.title);
            card.setAttribute('data-price', pkg.offerPrice.toString());

            // Display Edit/Delete buttons only in Admin Mode & Authenticated
            const adminButtonsHtml = (isAdminMode && authenticated) ? `
                <button class="edit-pkg-btn" title="Edit Package" data-id="${pkg.id}">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="delete-pkg-btn" title="Delete Package" data-id="${pkg.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            ` : '';

            // Map Column 1 bullets
            let col1Html = '';
            pkg.col1Bullets.forEach(bullet => {
                col1Html += `<li><i class="fa-regular fa-circle-check"></i> ${bullet}</li>`;
            });

            // Map Column 2 bullets
            let col2Html = '';
            pkg.col2Bullets.forEach(bullet => {
                col2Html += `<li><i class="fa-regular fa-circle-check"></i> ${bullet}</li>`;
            });

            // Map Footnotes
            let footnotesHtml = '';
            pkg.footnotes.forEach(note => {
                footnotesHtml += `<div>${note}</div>`;
            });

            // COMPLIMENTARY INCLUSIONS BLOCK (Trust metrics added under columns)
             const additionalServicesHtml = `
                 <div class="flyer-additional-services-box">
                     <h5><i class="fa-solid fa-circle-nodes"></i> Additional Inclusions</h5>
                     <ul style="margin-bottom: 12px;">
                         <li><i class="fa-solid fa-cloud-arrow-up text-primary-gold"></i> 1 Year Google Drive Support</li>
                         <li><i class="fa-solid fa-comments text-primary-gold"></i> WhatsApp Group Support</li>
                         <li><i class="fa-solid fa-file-invoice-dollar text-primary-gold"></i> Transparent Digital Invoice</li>
                     </ul>
                     <!-- Specialty Highlight Banner -->
                     <div class="specialty-highlight-banner specialty-clickable" style="padding: 14px; border: 1.5px solid var(--primary-gold); background: rgba(218,165,32,0.06); border-radius: 10px; text-align: center; box-shadow: var(--gold-glow); margin-top: 10px;">
                         <span style="font-family: 'Outfit', sans-serif; font-size: 9px; font-weight: 800; color: var(--primary-gold); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">🌟 Our Only Specialty</span>
                         <span style="font-size: 11px; font-weight: 700; color: white; display: block; margin-bottom: 6px;">One-Touch File Selection System <span style="font-size: 7px; background: red; color: white; padding: 1px 3px; border-radius: 2px; font-weight: 800; text-transform: uppercase; vertical-align: middle; margin-left: 2px;">FREE</span></span>
                         <p style="font-size: 8.5px; color: #ff8a80; line-height: 1.3; margin-top: 4px; font-weight: 600; border-top: 1px dashed rgba(218,165,32,0.2); padding-top: 4px; text-align: left;">
                             ⚠️ Manual photo selection is tedious and delays album delivery by months.
                         </p>
                         <p style="font-size: 8.5px; color: #2ecc71; line-height: 1.3; margin-top: 3px; font-weight: 700; text-align: left;">
                             ✅ Our ultra-fast selection system makes photo selection effortless, ensuring lightning-fast album delivery!
                         </p>
                         <span class="pulse-glow" style="font-size: 7px; color: var(--primary-gold); display: block; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; border-top: 1px dashed rgba(218,165,32,0.2); padding-top: 4px;">👉 Click to see how it works!</span>
                     </div>
                 </div>
             `;

            if (pkg.templateStyle === 'gold') {
                // RENDER ELEGANCE GOLD STYLE (Flyer 1)
                card.className = 'visual-flyer-card template-gold';

                // Map album highlight bullets
                let albumHtml = '';
                if (pkg.albumBullets && pkg.albumBullets.length > 0) {
                    let albumBulletsHtml = '';
                    pkg.albumBullets.forEach(b => {
                        albumBulletsHtml += `<li><i class="fa-solid fa-circle"></i> ${b}</li>`;
                    });
                    albumHtml = `
                        <div class="flyer-album-highlight-box">
                            <h6>${pkg.albumTitle || 'ENGAGEMENT ALBUM'}</h6>
                            <ul>
                                ${albumBulletsHtml}
                            </ul>
                        </div>
                    `;
                }

                card.innerHTML = `
                    ${adminButtonsHtml}
                    <!-- Diagonal Red Ribbon -->
                    <span class="flyer-ribbon-tag">${pkg.ribbonText || 'LIMITED TIME OFFER'}</span>
                    
                    <!-- DW Logo top-right -->
                    <div class="flyer-brand-logo">
                        <span class="dw-monogram">DW</span>
                    </div>

                    <!-- Cover Photo Wrapper -->
                    <div class="flyer-cover-image-wrapper">
                        <img src="${pkg.coverImage}" class="flyer-cover-photo" alt="Wedding Cover">
                    </div>

                    <!-- Flyer Body contents -->
                    <div class="flyer-body-content">
                        <h4 class="flyer-title">${pkg.title}</h4>
                        <div class="flyer-quote">"${pkg.malayalamQuote}"</div>
                        <div class="flyer-cursive-accent">${pkg.cursiveSubtitle}</div>
                        
                        <!-- Highlights Strip -->
                        <div class="flyer-highlights-pipe-strip">
                            <strong>${pkg.pipeHighlights}</strong>
                        </div>

                        <!-- We Cover For You section -->
                        <div class="flyer-group-header">${pkg.weCover ? 'We Cover For You...' : ''}</div>
                        <div class="flyer-group-description">${pkg.weCover || ''}</div>

                        <!-- 2-Columns grid -->
                        <div class="flyer-columns-wrapper">
                            <div class="flyer-list-column">
                                <h5>Inclusions Checklist</h5>
                                <ul>${col1Html}</ul>
                            </div>
                            <div class="flyer-list-column">
                                <h5>Deliverables & Print</h5>
                                <ul>
                                    ${col2Html}
                                </ul>
                                ${albumHtml}
                            </div>
                        </div>

                        <!-- Complimentary additional trust services box -->
                        ${additionalServicesHtml}

                        <!-- Pricing Area -->
                        <div class="flyer-pricing-container">
                            <div class="flyer-prices-row">
                                <span class="original-price-struck">₹${pkg.originalPrice.toLocaleString()}/-</span>
                                <span class="offer-price-tag">₹${pkg.offerPrice.toLocaleString()}/-</span>
                            </div>
                            <div class="flyer-footnotes">
                                ${footnotesHtml}
                            </div>
                        </div>

                        <!-- CTA Book buttons -->
                        <div class="flyer-footer-cta">
                            <button class="btn btn-primary btn-block select-pkg-btn">BOOK YOUR SLOTS NOW</button>
                            <button class="btn btn-outline btn-block share-pkg-btn" style="margin-top: 8px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-glass); color: white; font-size: 11px; font-weight: 700; padding: 8px; border-radius: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.3s;" data-id="${pkg.id}" data-title="${pkg.title}">
                                <i class="fa-solid fa-share-nodes"></i> Share Package Details
                            </button>
                            <span class="package-legal-disclaimer" style="display: block; text-align: center; font-size: 10px; color: #ff8a80; margin-top: 10px; font-weight: 700; letter-spacing: 0.02em; margin-bottom: 8px;">
                                <i class="fa-solid fa-circle-exclamation"></i> Travel & Stay charges are excluded
                            </span>
                            <div class="flyer-footer-phone">
                                <i class="fa-solid fa-phone"></i> CALL / WHATSAPP: +91 ${pkg.whatsappPhone || '9995412955'}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // RENDER BURGUNDY ROYAL STYLE (Flyer 2)
                card.className = 'visual-flyer-card template-burgundy';

                // Spotlight slant card
                let spotlightHtml = '';
                if (pkg.enableSpotlight) {
                    spotlightHtml = `
                        <div class="flyer-spotlight-box">
                            <div class="spotlight-left-block">
                                <div class="spotlight-big-number">${pkg.spotlightNumber || '1'}</div>
                                <div class="spotlight-desc">${pkg.spotlightDesc || 'Photographer + Videographer'}</div>
                            </div>
                            <div class="spotlight-price">${pkg.spotlightPrice || 'Rs. 39,999'}</div>
                        </div>
                    `;
                }

                card.innerHTML = `
                    ${adminButtonsHtml}
                    <!-- Diagonal Ribbon -->
                    <span class="flyer-ribbon-tag">${pkg.ribbonText || 'SPECIAL OFFER'}</span>
                    
                    <!-- DW Logo top-right -->
                    <div class="flyer-brand-logo">
                        <span class="dw-monogram">DW</span>
                    </div>

                    <!-- Cropped Wide Banner Cover Wrapper -->
                    <div class="flyer-cover-image-wrapper">
                        <img src="${pkg.coverImage}" class="flyer-cover-photo" alt="Wedding Banner">
                    </div>

                    <!-- Flyer Body contents -->
                    <div class="flyer-body-content">
                        <h4 class="flyer-title" style="font-family: 'Outfit', sans-serif;">${pkg.title}</h4>
                        
                        <!-- Glowing Offer Pricing double underlined -->
                        <div class="flyer-prices-row" style="margin: 10px 0 16px;">
                            <div class="flyer-brush-underline-wrapper">
                                <span style="font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: #ffeb3b; letter-spacing: -0.02em;">
                                    Rs. ${pkg.offerPrice.toLocaleString()}
                                </span>
                                <div class="flyer-brush-underline"></div>
                            </div>
                        </div>

                        <!-- Uppercase Bold Promo text -->
                        <div class="flyer-quote">${pkg.burgundyPromo || 'FREE SAVE THE DATE'}</div>

                        <!-- Slanted Spotlight Box -->
                        ${spotlightHtml}

                        <!-- Inclusions Semi-transparent Panel -->
                        <div class="flyer-columns-panel">
                            <div class="flyer-group-header">We Cover For You...</div>
                            <div class="flyer-group-description" style="margin-bottom: 20px; font-size: 10px;">
                                ${pkg.weCover || ''}
                            </div>
                            
                            <!-- Wedding vs Reception standard rates display -->
                            <div class="flyer-wedding-reception-prices">
                                <strong>Wedding Rate:</strong> Rs. ${pkg.weddingPrice.toLocaleString()}/- &nbsp;|&nbsp; 
                                <strong>Reception Rate:</strong> Rs. ${pkg.receptionPrice.toLocaleString()}/-
                            </div>

                            <div class="flyer-columns-wrapper" style="margin-bottom: 0;">
                                <div class="flyer-list-column">
                                    <h5>Coverage Specs</h5>
                                    <ul>${col1Html}</ul>
                                </div>
                                <div class="flyer-list-column">
                                    <h5>Deliverables</h5>
                                    <ul>${col2Html}</ul>
                                </div>
                            </div>
                        </div>

                        <!-- Complimentary additional trust services box -->
                        ${additionalServicesHtml}

                        <!-- Footnotes fine print -->
                        <div class="flyer-footnotes" style="color: #777;">
                            ${footnotesHtml}
                        </div>

                        <!-- CTA Book buttons -->
                        <div class="flyer-footer-cta">
                            <button class="btn btn-success btn-large btn-block select-pkg-btn">
                                <span>BOOK YOUR SLOTS NOW</span> <i class="fa-solid fa-circle-check"></i>
                            </button>
                            <button class="btn btn-outline btn-block share-pkg-btn" style="margin-top: 8px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-glass); color: white; font-size: 11px; font-weight: 700; padding: 8px; border-radius: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.3s;" data-id="${pkg.id}" data-title="${pkg.title}">
                                <i class="fa-solid fa-share-nodes"></i> Share Package Details
                            </button>
                            <span class="package-legal-disclaimer" style="display: block; text-align: center; font-size: 10px; color: #ff8a80; margin-top: 10px; font-weight: 700; letter-spacing: 0.02em; margin-bottom: 8px;">
                                <i class="fa-solid fa-circle-exclamation"></i> Travel & Stay charges are excluded
                            </span>
                            <div class="flyer-footer-phone" style="display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-phone"></i> +91 ${pkg.whatsappPhone || '9995412955'}
                                <span class="flyer-neon-offer-tag">SPECIAL OFFER</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            packagesGrid.appendChild(card);
        });

        // Wire dynamic booking clicks on all flyers (Handled via unified event delegation)

        // Re-wire dynamic WhatsApp buttons on standard cards (Handled via unified event delegation)

        // Wire delete buttons for Admin Mode
        if (isAdminMode && authenticated) {
            packagesGrid.querySelectorAll('.delete-pkg-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    if (confirm('Are you sure you want to permanently delete this package flyer?')) {
                        deletePackage(id);
                    }
                });
            });

            packagesGrid.querySelectorAll('.edit-pkg-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    editPackage(id);
                });
            });
        }
        
        // Inject play buttons for video-mapped packages
        if (typeof injectVideoPlayButtons === 'function') {
            injectVideoPlayButtons();
        }
        if (typeof window.restructurePackageCards === 'function') {
            window.restructurePackageCards();
        }
    }

    // --- 7. HIGH-URGENCY CONVERSION SCARCITY & SOCIAL PROOF SYSTEM ---

    // Ticker Close Event
    const scarcityTicker = document.getElementById('scarcityTicker');
    const btnCloseTicker = document.getElementById('btnCloseTicker');
    const mainHeader = document.getElementById('mainHeader');
    
    if (btnCloseTicker && scarcityTicker) {
        btnCloseTicker.addEventListener('click', () => {
            scarcityTicker.style.display = 'none';
            document.body.classList.remove('has-ticker');
            if (mainHeader) {
                mainHeader.style.top = '0';
            }
        });
    }

    // Countdown Timer Logic
    function initScarcityCountdown() {
        // Target is set to exactly 2 days, 14 hours, 32 minutes from now.
        // We persist it so it feels extremely real and doesn't reset on every refresh.
        let targetTime = localStorage.getItem('dreamwed_urgency_target');
        if (!targetTime) {
            targetTime = Date.now() + (2 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000) + (32 * 60 * 1000);
            localStorage.setItem('dreamwed_urgency_target', targetTime);
        } else {
            targetTime = parseInt(targetTime);
            // If the timer has expired, rolling reset to keep urgency active for new leads
            if (targetTime < Date.now()) {
                targetTime = Date.now() + (2 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000) + (32 * 60 * 1000);
                localStorage.setItem('dreamwed_urgency_target', targetTime);
            }
        }

        function updateTimers() {
            const now = Date.now();
            const distance = targetTime - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const pad = (num) => String(num).padStart(2, '0');
            const timerStr = `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;

            const topTimer = document.getElementById('topTickerTimer');
            const standardCardTimer = document.getElementById('standardCardTimer');
            const comboCardTimer = document.getElementById('comboCardTimer');
            const luxuryCardTimer = document.getElementById('luxuryCardTimer');

            if (topTimer) topTimer.innerText = timerStr;
            if (standardCardTimer) standardCardTimer.innerText = timerStr;
            if (comboCardTimer) comboCardTimer.innerText = timerStr;
            if (luxuryCardTimer) luxuryCardTimer.innerText = timerStr;
        }

        updateTimers();
        const timerInterval = setInterval(updateTimers, 1000);
    }
    
    initScarcityCountdown();

    // Social Proof Booking Notification Toast Queue
    function initRecentBookingToasts() {
        const container = document.getElementById('bookingToastContainer');
        if (!container) return;

        const simulatedBookings = [
            { name: "Rahul & Parvathy", city: "Kollam", action: "booked their Wedding + Reception package", package: "₹39,999 Package", time: "3 mins ago" },
            { name: "Anjali K. R.", city: "Trivandrum", action: "paid ₹5,000/- slot booking advance", package: "Standard Event Plan", time: "12 mins ago" },
            { name: "Abhijith & Sandra", city: "Varkala Cliff Resort", action: "secured their Premium Combo (Wedding + Reception)", package: "₹49,999 Package", time: "28 mins ago" },
            { name: "Siddharth & Meera", city: "Kollam", action: "secured their Wedding + Reception plan", package: "₹39,999 Limited Offer", time: "45 mins ago" },
            { name: "Gokul & Anupama", city: "Kochi", action: "locked their slot for 2026 wedding", package: "Premium Wedding & Reception Plan", time: "1 hour ago" },
            { name: "Parvathi Devi", city: "Trivandrum City", action: "locked the standard 70-page album package", package: "Standard Package", time: "2 hours ago" }
        ];

        let index = 0;

        function showNextToast() {
            // Get current booking data
            const booking = simulatedBookings[index];
            
            // Create element
            const toast = document.createElement('div');
            toast.className = 'booking-toast';
            toast.innerHTML = `
                <div class="toast-icon-box">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="toast-content-box">
                    <div class="toast-headline">⚡ Booking alert: <span>${booking.name}</span></div>
                    <div class="toast-sub">From ${booking.city} just ${booking.action} (${booking.package})</div>
                    <div class="toast-time">${booking.time}</div>
                </div>
            `;

            // Append to container
            container.appendChild(toast);

            // Cycle index
            index = (index + 1) % simulatedBookings.length;

            // Slide out after 6 seconds
            setTimeout(() => {
                toast.classList.add('slide-out');
                // Remove from DOM after transition completes
                setTimeout(() => {
                    toast.remove();
                }, 400);
            }, 6000);
        }

        // Show first toast after 4 seconds, then cycle every 15 seconds
        setTimeout(showNextToast, 4000);
        setInterval(showNextToast, 15000);
    }
    
    initRecentBookingToasts();

    // ==========================================================================
    // CLIENT PORTAL, BOOKING CRM, AND PHOTO CO-SELECTION ENGINE
    // ==========================================================================

    // Photo Assets Array for One-Touch Selection Grid
    const GALLERY_PHOTOS = [
        { id: 0, url: 'images/deepak.jpg', title: 'Deepak Devi Temple' },
        { id: 1, url: 'images/arathi.jpg', title: 'Arathi Traditional Bridal Portrait' },
        { id: 2, url: 'images/dr_arsha.jpg', title: 'Dr. Arsha Christian Wedding Gown' },
        { id: 3, url: 'images/prajith.png', title: 'Prajith Traditional Heritage' },
        { id: 4, url: 'images/dr_fathima_dr_saheed.jpg', title: 'Dr. Fathima & Dr. Saheed Candid Monochrome' },
        { id: 5, url: 'images/muneer.jpg', title: 'Muneer Sunset Beach' }
    ];

    let currentCustomerSession = null; // { name, phone, role, bookingId, packageInterest }
    let localBookings = [];

    function normalizeBookingFromDB(b) {
        return {
            id: b.id,
            name: b.customer_name,
            phone: b.customer_phone,
            email: b.customer_email,
            pincode: b.pincode || '',
            package_interest: b.package_name,
            price_quoted: String(b.total_price || b.package_price || '39999'),
            status: b.status,
            date: b.event_date,
            bride_password: b.bride_password || '',
            groom_password: b.groom_password || '',
            bride_selections: b.bride_selections || [],
            groom_selections: b.groom_selections || [],
            selection_locked: !!b.selection_locked,
            drive_link: b.drive_link || "https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J",
            travel_charges: b.travel_charges || "Excluded",
            stay_charges: b.stay_charges || "Excluded",
            coverage_scope: b.coverage_scope || b.coverage_type || "both"
        };
    }

    async function refreshLocalBookings() {
        try {
            const res = await fetch(`${API_BASE}/api/bookings`);
            const data = await res.json();
            localBookings = data.map(normalizeBookingFromDB);
        } catch (err) {
            console.error("Error refreshing bookings:", err);
        }
    }

    function getSavedBookings() {
        return localBookings;
    }

    async function apiSaveBooking(booking) {
        const dbBooking = {
            customer_name: booking.name,
            customer_phone: booking.phone,
            customer_email: booking.email,
            pincode: booking.pincode,
            event_venue: booking.address || '',
            package_name: booking.package_interest,
            package_price: Number(booking.price_quoted),
            total_price: Number(booking.price_quoted),
            status: booking.status,
            event_date: booking.date,
            bride_password: booking.bride_password,
            groom_password: booking.groom_password,
            bride_selections: booking.bride_selections,
            groom_selections: booking.groom_selections,
            selection_locked: booking.selection_locked,
            drive_link: booking.drive_link,
            travel_charges: booking.travel_charges,
            stay_charges: booking.stay_charges,
            coverage_scope: booking.coverage_scope,
            coverage_type: booking.coverage_scope
        };
        
        try {
            const res = await fetch(`${API_BASE}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbBooking)
            });
            const newBooking = await res.json();
            await refreshLocalBookings();
            return normalizeBookingFromDB(newBooking);
        } catch (err) {
            console.error("Error saving booking:", err);
        }
    }

    async function apiUpdateBooking(id, fields) {
        const dbFields = {};
        if (fields.name !== undefined) dbFields.customer_name = fields.name;
        if (fields.phone !== undefined) dbFields.customer_phone = fields.phone;
        if (fields.email !== undefined) dbFields.customer_email = fields.email;
        if (fields.pincode !== undefined) dbFields.pincode = fields.pincode;
        if (fields.address !== undefined) dbFields.event_venue = fields.address;
        if (fields.package_interest !== undefined) dbFields.package_name = fields.package_interest;
        if (fields.price_quoted !== undefined) {
            dbFields.package_price = Number(fields.price_quoted);
            dbFields.total_price = Number(fields.price_quoted);
        }
        if (fields.status !== undefined) dbFields.status = fields.status;
        if (fields.date !== undefined) dbFields.event_date = fields.date;
        
        if (fields.bride_password !== undefined) dbFields.bride_password = fields.bride_password;
        if (fields.groom_password !== undefined) dbFields.groom_password = fields.groom_password;
        if (fields.bride_selections !== undefined) dbFields.bride_selections = fields.bride_selections;
        if (fields.groom_selections !== undefined) dbFields.groom_selections = fields.groom_selections;
        if (fields.selection_locked !== undefined) dbFields.selection_locked = fields.selection_locked;
        if (fields.drive_link !== undefined) dbFields.drive_link = fields.drive_link;
        if (fields.travel_charges !== undefined) dbFields.travel_charges = fields.travel_charges;
        if (fields.stay_charges !== undefined) dbFields.stay_charges = fields.stay_charges;
        if (fields.coverage_scope !== undefined) dbFields.coverage_scope = fields.coverage_scope;

        try {
            const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbFields)
            });
            const updated = await res.json();
            await refreshLocalBookings();
            return normalizeBookingFromDB(updated);
        } catch (err) {
            console.error("Error updating booking:", err);
        }
    }

    async function apiDeleteBooking(id) {
        try {
            await fetch(`${API_BASE}/api/bookings/${id}`, {
                method: 'DELETE'
            });
            await refreshLocalBookings();
        } catch (err) {
            console.error("Error deleting booking:", err);
        }
    }

    // 1. Customer Portal UI Toggles
    const btnCustomerPortalToggle = document.getElementById('btnCustomerPortalToggle');
    const customerPortalModal = document.getElementById('customerPortalModal');
    const btnCancelCustomerPortal = document.getElementById('btnCancelCustomerPortal');
    const customerPortalForm = document.getElementById('customerPortalForm');
    const customerDashboardSection = document.getElementById('customerDashboardSection');

    if (btnCustomerPortalToggle && customerPortalModal) {
        btnCustomerPortalToggle.addEventListener('click', () => {
            customerPortalModal.style.display = 'flex';
        });
    }

    if (btnCancelCustomerPortal && customerPortalModal) {
        btnCancelCustomerPortal.addEventListener('click', () => {
            customerPortalModal.style.display = 'none';
        });
    }

    const btnGoBackPortal = document.getElementById('btnGoBackPortal');
    if (btnGoBackPortal && customerPortalModal) {
        btnGoBackPortal.addEventListener('click', () => {
            customerPortalModal.style.display = 'none';
        });
    }

    // Handle pink vs blue styling for Role Radios inside Login Modal
    const roleBrideRadio = document.getElementById('roleBride');
    const roleGroomRadio = document.getElementById('roleGroom');
    const roleLabels = document.querySelectorAll('.role-btn-label');

    function syncRoleRadioStyles() {
        roleLabels.forEach(lbl => {
            lbl.classList.remove('active', 'bride-active', 'groom-active');
            lbl.style.background = 'transparent';
            lbl.style.border = '1px solid var(--border-glass)';
            lbl.style.color = 'var(--text-muted)';
        });

        if (roleBrideRadio && roleBrideRadio.checked) {
            const label = document.querySelector('label[for="roleBride"]');
            if (label) {
                label.classList.add('active', 'bride-active');
                label.style.background = 'rgba(255, 133, 162, 0.2)';
                label.style.borderColor = '#ff85a2';
                label.style.color = 'white';
            }
        } else if (roleGroomRadio && roleGroomRadio.checked) {
            const label = document.querySelector('label[for="roleGroom"]');
            if (label) {
                label.classList.add('active', 'groom-active');
                label.style.background = 'rgba(100, 181, 246, 0.2)';
                label.style.borderColor = '#64b5f6';
                label.style.color = 'white';
            }
        }
    }

    if (roleBrideRadio && roleGroomRadio) {
        roleBrideRadio.addEventListener('change', syncRoleRadioStyles);
        roleGroomRadio.addEventListener('change', syncRoleRadioStyles);
    }

    // 2. Customer Portal Authenticator
    const custPortalPhone = document.getElementById('custPortalPhone');
    const roleSelectorGroup = document.querySelector('.role-selector-container')?.closest('.form-group');

    if (custPortalPhone) {
        custPortalPhone.addEventListener('input', () => {
            const phone = custPortalPhone.value.trim();
            if (phone.length === 10) {
                const bookings = getSavedBookings();
                const booking = bookings.find(b => b.phone === phone);
                if (booking) {
                    const scope = booking.coverage_scope || 'both';
                    if (scope === 'bride' || scope === 'groom') {
                        // Single-side login! Hide role selection container and auto-check correct role radio
                        if (roleSelectorGroup) roleSelectorGroup.style.display = 'none';
                        if (scope === 'bride') {
                            document.getElementById('roleBride').checked = true;
                        } else {
                            document.getElementById('roleGroom').checked = true;
                        }
                        syncRoleRadioStyles(); // Refresh custom styles for labels
                    } else {
                        // Double side coverage! Show role selection
                        if (roleSelectorGroup) roleSelectorGroup.style.display = 'block';
                    }
                } else {
                    if (roleSelectorGroup) roleSelectorGroup.style.display = 'block';
                }
            } else {
                if (roleSelectorGroup) roleSelectorGroup.style.display = 'block';
            }
        });
    }

    if (customerPortalForm) {
        customerPortalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('custPortalPhone').value.trim();
            const password = document.getElementById('custPortalPassword').value.trim();

            await refreshLocalBookings();
            const bookings = getSavedBookings();
            const booking = bookings.find(b => b.phone === phone);

            if (!booking) {
                alert('❌ No active booking found with this phone number. Please check your credentials or register below!');
                return;
            }

            const scope = booking.coverage_scope || 'both';
            let activeRole = '';
            let isMatched = false;

            if (scope === 'bride') {
                activeRole = 'bride';
                isMatched = (booking.bride_password === password);
            } else if (scope === 'groom') {
                activeRole = 'groom';
                isMatched = (booking.groom_password === password);
            } else {
                // 'both'
                const role = document.querySelector('input[name="custRole"]:checked')?.value || 'bride';
                activeRole = role;
                if (role === 'bride') {
                    isMatched = (booking.bride_password === password);
                } else {
                    isMatched = (booking.groom_password === password);
                }
            }

            if (!isMatched) {
                alert('❌ Invalid password entered! Please check and try again.');
                return;
            }

            // Set current session
            currentCustomerSession = {
                bookingId: booking.id,
                name: booking.name,
                phone: booking.phone,
                role: activeRole,
                packageInterest: booking.package_interest,
                driveLink: booking.drive_link || '#'
            };

            // Set local and session storage values for unified React portal login
            localStorage.setItem("dreamwed_logged_phone", booking.phone);
            sessionStorage.setItem("dreamwed_auto_login_phone", booking.phone);

            // Close login modal
            customerPortalModal.style.display = 'none';

            // Load and display Selection Dashboard
            loadCustomerDashboard();
            alert(`🎉 Access Granted! Welcome to your Album Selection Studio, logged in as ${activeRole === 'bride' ? '👰 Bride' : '🤵 Groom'}.`);
        });
    }

    // Load Dashboard with active session state
    function loadCustomerDashboard() {
        if (!currentCustomerSession || !customerDashboardSection) return;

        // Draw basic header fields
        const roleBadge = document.getElementById('custDashboardRoleBadge');
        const welcomeName = document.getElementById('custDashboardWelcomeName');
        const packageName = document.getElementById('custDashboardPackageName');
        const driveLinkBtn = document.getElementById('btnGoogleDriveFolderLink');

        if (roleBadge) {
            roleBadge.innerText = currentCustomerSession.role === 'bride' ? '👰 Bride Session' : '🤵 Groom Session';
            roleBadge.className = `badge-role ${currentCustomerSession.role}`;
        }
        if (welcomeName) welcomeName.innerText = currentCustomerSession.name;
        if (packageName) packageName.innerText = currentCustomerSession.packageInterest;
        if (driveLinkBtn) driveLinkBtn.setAttribute('href', currentCustomerSession.driveLink);

        // Make Section Visible & scroll
        customerDashboardSection.style.display = 'block';
        customerDashboardSection.scrollIntoView({ behavior: 'smooth' });

        // Draw Selection Studio Metrics & Photo board
        renderSelectionStudioGrid();
    }

    // Draw selection metrics and photos list
    function renderSelectionStudioGrid(filterType = 'all') {
        if (!currentCustomerSession) return;

        const bookings = getSavedBookings();
        const booking = bookings.find(b => b.id === currentCustomerSession.bookingId);
        if (!booking) return;

        const analyticsGrid = document.querySelector('.dashboard-analytics-grid');
        const studioGrid = document.getElementById('selectionStudioGrid');
        const studioCard = studioGrid ? studioGrid.closest('.glass-card') : null;
        
        let placeholder = document.getElementById('pendingApprovalPlaceholder');
        
        if (booking.status === 'pending') {
            // Hide the actual dashboard panels
            if (analyticsGrid) analyticsGrid.style.display = 'none';
            if (studioCard) studioCard.style.display = 'none';
            
            // Render or show placeholder
            if (!placeholder) {
                placeholder = document.createElement('div');
                placeholder.id = 'pendingApprovalPlaceholder';
                placeholder.className = 'glass-card';
                placeholder.style.cssText = `
                    padding: 50px 30px;
                    text-align: center;
                    border: 1px dashed rgba(218, 165, 32, 0.45);
                    background: rgba(218, 165, 32, 0.02);
                    margin: 30px auto;
                    max-width: 680px;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                `;
                customerDashboardSection.appendChild(placeholder);
            }
            placeholder.style.display = 'block';
            placeholder.innerHTML = `
                <i class="fa-solid fa-clock-rotate-left" style="font-size: 54px; color: var(--primary-gold); margin-bottom: 24px; display: block; animation: pulse 2.5s infinite;"></i>
                <h3 style="color: white; font-size: 22px; font-weight: 700; margin-bottom: 12px; font-family: 'Outfit', sans-serif;">⏳ Pending Admin Approval</h3>
                <p style="color: var(--text-muted); font-size: 13.5px; max-width: 540px; margin: 0 auto 24px; line-height: 1.6;">
                    Hello <strong>${booking.name}</strong>! Your wedding package reservation for <strong>${booking.package_interest}</strong> is registered successfully. 
                    Your workspace and photo selection studio will unlock immediately once Unni approves your advance slot deposit.
                </p>
                <div style="display: inline-flex; flex-direction: column; gap: 10px; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; width: 100%; max-width: 440px;">
                    <span style="font-size: 11px; color: var(--primary-gold); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Advance Deposit Details:</span>
                    <span style="font-size: 15px; font-family: monospace; color: white; font-weight: 700; margin-bottom: 8px;">UPI ID: 9995412955@ybl (Unni)</span>
                    <a href="https://upilinks.in/payment-button/9995412955@ybl/5000" target="_blank" class="btn btn-primary" style="font-size: 12px; padding: 12px 20px; font-weight: 800; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); border: none; border-radius: 8px; color: white; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px rgba(124,58,237,0.35); text-transform: uppercase; letter-spacing: 0.02em;">
                        <i class="fa-solid fa-credit-card"></i> Pay Advance ₹5,000/- via UPI
                    </a>
                </div>
            `;
            return;
        } else {
            // Unlocked! Restore display
            if (analyticsGrid) analyticsGrid.style.display = 'grid';
            if (studioCard) studioCard.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }

        const brideFavs = booking.bride_selections || [];
        const groomFavs = booking.groom_selections || [];

        // Compile metrics elements
        const progressTextBride = document.getElementById('progressTextBride');
        const progressBarBride = document.getElementById('progressBarBride');
        const progressTextGroom = document.getElementById('progressTextGroom');
        const progressBarGroom = document.getElementById('progressBarGroom');
        const progressTextMatches = document.getElementById('progressTextMatches');
        const progressBarMatches = document.getElementById('progressBarMatches');

        const bCount = brideFavs.length;
        const gCount = groomFavs.length;

        // Matches is the intersection of bride and groom selections
        const sharedMatches = brideFavs.filter(id => groomFavs.includes(id));
        const mCount = sharedMatches.length;

        // Update Gauges (Simulating 150 selections cap scale)
        const getPct = (cnt) => Math.min((cnt / 150) * 100, 100);

        if (progressTextBride) progressTextBride.innerText = `${bCount} / 150 Selected`;
        if (progressBarBride) progressBarBride.style.width = `${getPct(bCount)}%`;

        if (progressTextGroom) progressTextGroom.innerText = `${gCount} / 150 Selected`;
        if (progressBarGroom) progressBarGroom.style.width = `${getPct(gCount)}%`;

        if (progressTextMatches) progressTextMatches.innerText = `${mCount} / 150 Agreed`;
        if (progressBarMatches) progressBarMatches.style.width = `${getPct(mCount)}%`;

        const scope = booking.coverage_scope || 'both';

        const barBrideContainer = document.getElementById('progressBarContainerBride');
        const barGroomContainer = document.getElementById('progressBarContainerGroom');
        const barMatchesContainer = document.getElementById('progressBarContainerMatches');

        const filterPartner = document.getElementById('btnFilterPartner');
        const filterMatches = document.getElementById('btnFilterMatches');

        const coSub = document.getElementById('coSelectionSubtitle');
        const lockTitle = document.getElementById('selectionLockTitle');
        const lockDesc = document.getElementById('selectionLockDesc');

        if (scope === 'bride') {
            if (barBrideContainer) barBrideContainer.style.display = 'block';
            if (barGroomContainer) barGroomContainer.style.display = 'none';
            if (barMatchesContainer) barMatchesContainer.style.display = 'none';

            if (filterPartner) filterPartner.style.display = 'none';
            if (filterMatches) filterMatches.style.display = 'none';

            if (coSub) coSub.innerText = 'Click the heart icon to favorite photos for your album print!';
            if (lockTitle) lockTitle.innerText = 'Timeline & Selection Lock';
            if (lockDesc) lockDesc.innerText = 'Once you finalize your favorite selections, lock the list to send it directly to print!';
        } else if (scope === 'groom') {
            if (barBrideContainer) barBrideContainer.style.display = 'none';
            if (barGroomContainer) barGroomContainer.style.display = 'block';
            if (barMatchesContainer) barMatchesContainer.style.display = 'none';

            if (filterPartner) filterPartner.style.display = 'none';
            if (filterMatches) filterMatches.style.display = 'none';

            if (coSub) coSub.innerText = 'Click the heart icon to favorite photos for your album print!';
            if (lockTitle) lockTitle.innerText = 'Timeline & Selection Lock';
            if (lockDesc) lockDesc.innerText = 'Once you finalize your favorite selections, lock the list to send it directly to print!';
        } else {
            // 'both'
            if (barBrideContainer) barBrideContainer.style.display = 'block';
            if (barGroomContainer) barGroomContainer.style.display = 'block';
            if (barMatchesContainer) barMatchesContainer.style.display = 'block';

            if (filterPartner) filterPartner.style.display = 'block';
            if (filterMatches) filterMatches.style.display = 'block';

            if (coSub) coSub.innerText = 'Click the heart icon to favorite photos. Double Matches glow gold and are sent for album print!';
            if (lockTitle) lockTitle.innerText = 'Timeline & Submission Lock';
            if (lockDesc) lockDesc.innerText = 'Once you agree on your Double Matches, lock selections to auto-send lists directly to printer bindery.';
        }

        // Check if selections locked
        const selectionsCount = (scope === 'bride') ? bCount : ((scope === 'groom') ? gCount : mCount);
        const isLocked = booking.selection_locked;
        const lockBtn = document.getElementById('btnLockSelections');
        if (lockBtn) {
            lockBtn.disabled = (selectionsCount < 1) || isLocked;
            if (isLocked) {
                lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i> <span>Selection Completed & Locked!</span>';
                lockBtn.style.background = '#27ae60';
            } else {
                lockBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Submit Selections to Printer</span>';
                lockBtn.style.background = '';
            }
        }

        // Draw Photo cards
        if (!studioGrid) return;
        studioGrid.innerHTML = '';

        GALLERY_PHOTOS.forEach(photo => {
            const isBrideFav = brideFavs.includes(photo.id);
            const isGroomFav = groomFavs.includes(photo.id);
            const isDoubleMatch = isBrideFav && isGroomFav;

            // Apply filters logic
            if (filterType === 'mine') {
                const myFav = currentCustomerSession.role === 'bride' ? isBrideFav : isGroomFav;
                if (!myFav) return;
            } else if (filterType === 'partner') {
                const partnerFav = currentCustomerSession.role === 'bride' ? isGroomFav : isBrideFav;
                if (!partnerFav) return;
            } else if (filterType === 'matches') {
                if (!isDoubleMatch) return;
            }

            const activeClass = (currentCustomerSession.role === 'bride' ? isBrideFav : isGroomFav) ? 'active' : '';
            const groomActiveStyle = (currentCustomerSession.role === 'groom') ? 'groom-active' : '';
            const cardDoubleClass = (scope === 'both' && isDoubleMatch) ? 'double-match' : '';

            // Map Partner indicator badges
            let partnerBadgeHtml = '';
            if (scope === 'both') {
                if (isDoubleMatch) {
                    partnerBadgeHtml = `<span class="partner-badge both-love"><i class="fa-solid fa-heart animate-pulse"></i> 💖 Agreed Match</span>`;
                } else if (isBrideFav) {
                    partnerBadgeHtml = `<span class="partner-badge bride-loves"><i class="fa-solid fa-venus"></i> Bride Loves</span>`;
                } else if (isGroomFav) {
                    partnerBadgeHtml = `<span class="partner-badge groom-loves"><i class="fa-solid fa-mars"></i> Groom Loves</span>`;
                }
            } else {
                const isMyFav = (scope === 'bride') ? isBrideFav : isGroomFav;
                if (isMyFav) {
                    partnerBadgeHtml = `<span class="partner-badge both-love" style="background: rgba(46,204,113,0.15); border-color: rgba(46,204,113,0.35); color: #2ecc71;"><i class="fa-solid fa-heart animate-pulse"></i> Favorited</span>`;
                }
            }

            const card = document.createElement('div');
            card.className = `selection-card ${cardDoubleClass}`;
            card.innerHTML = `
                <div style="position: relative; overflow: hidden; padding-top: 100%;">
                    <img src="${photo.url}" alt="${photo.title}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; transition: transform 0.4s ease;">
                    <button class="btn-heart-select ${activeClass} ${groomActiveStyle}" data-id="${photo.id}" ${isLocked ? 'disabled' : ''}>
                        <i class="fa-solid fa-heart"></i>
                    </button>
                    ${partnerBadgeHtml}
                </div>
                <div style="padding: 14px; background: rgba(0,0,0,0.5);">
                    <h5 style="font-size: 11.5px; font-weight: 700; color: white; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${photo.title}</h5>
                    <p style="font-size: 9px; color: var(--text-muted); margin-top: 4px;">Photo Reference ID: #DW-${String(photo.id + 100).substring(1)}</p>
                </div>
            `;

            // Bind heart click actions
            const heartBtn = card.querySelector('.btn-heart-select');
            if (heartBtn && !isLocked) {
                heartBtn.addEventListener('click', () => {
                    toggleSelection(photo.id);
                });
            }

            studioGrid.appendChild(card);
        });

        // If filtered grid is empty
        if (studioGrid.innerHTML === '') {
            studioGrid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 50px; text-align: center; color: var(--text-muted);">
                    <i class="fa-solid fa-images-blur" style="font-size: 24px; margin-bottom: 8px;"></i>
                    <p style="font-size: 12px;">No photos match the selected filter criteria.</p>
                </div>
            `;
        }
    }

    // Toggle photo selection in database list
    async function toggleSelection(photoId) {
        if (!currentCustomerSession) return;

        const bookings = getSavedBookings();
        const booking = bookings.find(b => b.id === currentCustomerSession.bookingId);
        if (!booking) return;

        const role = currentCustomerSession.role;
        let selections = role === 'bride' ? (booking.bride_selections || []) : (booking.groom_selections || []);

        if (selections.includes(photoId)) {
            // Remove
            selections = selections.filter(id => id !== photoId);
        } else {
            // Add
            selections.push(photoId);
        }

        const updateFields = {};
        if (role === 'bride') {
            updateFields.bride_selections = selections;
        } else {
            updateFields.groom_selections = selections;
        }

        await apiUpdateBooking(booking.id, updateFields);
        renderSelectionStudioGrid(activeDashboardFilter);
        
        // Refresh admin grid view if active
        if (isAdminMode) {
            fetchBookings();
        }
    }

    // 3. Filter button click event bindings
    let activeDashboardFilter = 'all';
    const filterContainer = document.querySelector('.dashboard-filters-wrapper');
    if (filterContainer) {
        filterContainer.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                filterContainer.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeDashboardFilter = btn.getAttribute('data-filter');
                renderSelectionStudioGrid(activeDashboardFilter);
            });
        });
    }

    // 4. Lock Selections Submit handler
    const btnLockSelections = document.getElementById('btnLockSelections');
    if (btnLockSelections) {
        btnLockSelections.addEventListener('click', async () => {
            if (!currentCustomerSession) return;
            if (!confirm('🔒 Are you absolutely sure you want to finalize your selections and send the album list to print? This will lock the board and prevent further edits.')) {
                return;
            }

            const bookings = getSavedBookings();
            const booking = bookings.find(b => b.id === currentCustomerSession.bookingId);
            if (booking) {
                const updatedBooking = await apiUpdateBooking(booking.id, { selection_locked: true });
                
                // Refresh
                renderSelectionStudioGrid(activeDashboardFilter);
                
                // Pop booking toast alert
                alert('🎉 Selections Locked! Album layout sent to Unni & printers successfully. We will notify you in your WhatsApp planning group!');
                
                // Deep link WhatsApp order list
                const scope = updatedBooking.coverage_scope || 'both';
                let message = '';
                if (scope === 'bride') {
                    message = `Hi Unni! We have successfully completed and locked our album photo selections on your website dashboard!\n\n` +
                              `👰 Bride Selections: ${updatedBooking.bride_selections.length} photos favorited for printing!\n\n` +
                              `Please proceed with layout binding. Thank you!`;
                } else if (scope === 'groom') {
                    message = `Hi Unni! We have successfully completed and locked our album photo selections on your website dashboard!\n\n` +
                              `🤵 Groom Selections: ${updatedBooking.groom_selections.length} photos favorited for printing!\n\n` +
                              `Please proceed with layout binding. Thank you!`;
                } else {
                    // 'both'
                    const matches = updatedBooking.bride_selections.filter(id => updatedBooking.groom_selections.includes(id));
                    message = `Hi Unni! We have successfully completed and locked our album photo selections on your website dashboard!\n\n` +
                              `👰 Bride Selections: ${updatedBooking.bride_selections.length} photos\n` +
                              `🤵 Groom Selections: ${updatedBooking.groom_selections.length} photos\n` +
                              `💖 DOUBLE MATCH AGREED LIST: ${matches.length} shared prints locked!\n\n` +
                              `Please proceed with layout binding. Thank you!`;
                }
                window.open(`https://wa.me/919995412955?text=${encodeURIComponent(message)}`, '_blank');
            }
        });
    }

    // 5. Customer Session Logout
    const btnCustomerLogout = document.getElementById('btnCustomerLogout');
    if (btnCustomerLogout) {
        btnCustomerLogout.addEventListener('click', () => {
            currentCustomerSession = null;
            localStorage.removeItem("dreamwed_logged_phone");
            sessionStorage.removeItem("dreamwed_auto_login_phone");
            if (customerDashboardSection) {
                customerDashboardSection.style.display = 'none';
            }
            alert('🔒 You have successfully logged out of the Customer Portal.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 6. CUSTOMER RESERVATION REGISTRATION & OTP SMS ENGINE (Simulated Verification)
    const customerBookingForm = document.getElementById('customerBookingForm');
    const customerOtpForm = document.getElementById('customerOtpForm');
    const bookingStepFields = document.getElementById('bookingStepFields');
    const bookingStepOtp = document.getElementById('bookingStepOtp');
    const customerBookingModal = document.getElementById('customerBookingModal');
    
    // Step 3 Password Bindings
    const bookingStepPassword = document.getElementById('bookingStepPassword');
    const customerPasswordForm = document.getElementById('customerPasswordForm');
    const bookingBridePassGroup = document.getElementById('bookingBridePassGroup');
    const bookingGroomPassGroup = document.getElementById('bookingGroomPassGroup');
    const custBridePasswordInput = document.getElementById('custBridePassword');
    const custGroomPasswordInput = document.getElementById('custGroomPassword');
    const btnToggleBridePassword = document.getElementById('btnToggleBridePassword');
    const btnToggleGroomPassword = document.getElementById('btnToggleGroomPassword');
    const btnBackFromPassword = document.getElementById('btnBackFromPassword');

    let pendingBookingObject = null;
    let generatedOtpCode = null;
    let otpCountdownInterval = null;
    let pendingPhone = null; // E.164 phone returned from dwSendOtp (Supabase)

    function startOtpResendTimer() {
        const timerSpan = document.getElementById('otpResendTimer');
        const resendBtn = document.getElementById('btnResendOtp');
        if (!timerSpan || !resendBtn) return;

        clearInterval(otpCountdownInterval);
        
        let secondsLeft = 60;
        timerSpan.style.display = 'inline';
        timerSpan.textContent = `Resend OTP in ${secondsLeft}s`;
        resendBtn.style.display = 'none';

        otpCountdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft <= 0) {
                clearInterval(otpCountdownInterval);
                timerSpan.style.display = 'none';
                resendBtn.style.display = 'inline-block';
            } else {
                timerSpan.textContent = `Resend OTP in ${secondsLeft}s`;
            }
        }, 1000);
    }

    if (customerBookingForm) {
        customerBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('custName').value.trim();
            const email = document.getElementById('custEmail').value.trim();
            const pincode = document.getElementById('custPincode').value.trim();
            const address = document.getElementById('custAddress').value.trim();
            const phone = document.getElementById('custPhone').value.trim();
            const chosenPlan = currentSelectedPlan || "Package 1 (Frame Package)";
            const planPrice = currentSelectedPrice || "39999";
            const coverageScope = document.getElementById('custCoverageScope').value; // 'both', 'bride', 'groom'

            // Confirm payment step
            const paymentConfirm = confirm(
                `💳 SLOT BOOKING CONFIRMATION\n\n` +
                `To lock in this discounted package date, a booking advance of ₹5,000/- is required.\n\n` +
                `Click OK to proceed to creating your Wedding Hub account password.`
            );

            if (!paymentConfirm) return;

            // Store details in pending object
            pendingBookingObject = {
                id: `INV-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
                name: name,
                phone: phone,
                email: email,
                pincode: pincode,
                address: address,
                package_interest: chosenPlan,
                price_quoted: planPrice,
                status: 'pending',
                date: new Date().toLocaleDateString(),
                coverage_scope: coverageScope,
                bride_password: '',
                groom_password: '',
                bride_selections: [],
                groom_selections: [],
                selection_locked: false,
                drive_link: "https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J",
                travel_charges: "Excluded",
                stay_charges: "Excluded"
            };

            // Switch to Step 3: Password creation screen
            if (bookingStepFields) bookingStepFields.style.display = 'none';
            if (bookingStepPassword) bookingStepPassword.style.display = 'block';

            // Reset password input values
            if (custBridePasswordInput) custBridePasswordInput.value = '';
            if (custGroomPasswordInput) custGroomPasswordInput.value = '';

            // Toggle input groups based on coverage scope
            if (bookingBridePassGroup) {
                bookingBridePassGroup.style.display = (coverageScope === 'both' || coverageScope === 'bride') ? 'block' : 'none';
            }
            if (bookingGroomPassGroup) {
                bookingGroomPassGroup.style.display = (coverageScope === 'both' || coverageScope === 'groom') ? 'block' : 'none';
            }
        });
    }

    if (customerPasswordForm) {
        customerPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!pendingBookingObject) {
                alert('❌ Session error. Please fill out your details again.');
                if (bookingStepPassword) bookingStepPassword.style.display = 'none';
                if (bookingStepFields) bookingStepFields.style.display = 'block';
                return;
            }

            const scope = pendingBookingObject.coverage_scope;
            let bridePass = '';
            let groomPass = '';

            // Retrieve and validate passwords based on role scope
            if (scope === 'both' || scope === 'bride') {
                bridePass = custBridePasswordInput.value.trim();
                if (bridePass.length < 6) {
                    alert('👰 Bride password must be at least 6 characters.');
                    return;
                }
            }

            if (scope === 'both' || scope === 'groom') {
                groomPass = custGroomPasswordInput.value.trim();
                if (groomPass.length < 6) {
                    alert('🤵 Groom password must be at least 6 characters.');
                    return;
                }
            }

            // Assign passwords to pending booking object
            pendingBookingObject.bride_password = bridePass;
            pendingBookingObject.groom_password = groomPass;

            // Submit booking details with custom passwords to database
            const submitBtn = customerPasswordForm.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Finalizing Booking…';
            }

            try {
                const savedBooking = await apiSaveBooking(pendingBookingObject);
                if (!savedBooking) {
                    alert('❌ Backend database error. Please verify the Express backend is running.');
                    return;
                }

                // Auto login!
                currentCustomerSession = {
                    bookingId: savedBooking.id,
                    name: savedBooking.name,
                    phone: savedBooking.phone,
                    role: savedBooking.coverage_scope === 'groom' ? 'groom' : 'bride',
                    packageInterest: savedBooking.package_interest,
                    driveLink: savedBooking.drive_link || '#'
                };

                // Set local and session storage values for unified React portal login
                localStorage.setItem("dreamwed_logged_phone", savedBooking.phone);
                localStorage.setItem("dreamwed_logged_role", savedBooking.coverage_scope === 'groom' ? 'groom' : 'bride');
                sessionStorage.setItem("dreamwed_auto_login_phone", savedBooking.phone);

                alert(`🎉 REGISTRATION & BOOKING COMPLETED SUCCESSFULLY!\n\nWelcome to your Wedding Hub! You have been automatically logged in.`);

                // WhatsApp booking confirm GPay prompt
                const includesPrewedding = (parseInt(savedBooking.price_quoted) === 49999 || parseInt(savedBooking.price_quoted) === 99999 || parseInt(savedBooking.price_quoted) === 110000);
                const surpriseBonusText = includesPrewedding ? `🎁 SURPRISE BONUS: Free Save the Date Photoshoot (worth ₹9,999/-) included!\n` : '';

                const message = `Hi Unni! I have successfully completed registration on your website and locked in my Package slot booking!\n\n` +
                                `👤 Name: ${savedBooking.name}\n` +
                                `📞 Phone: ${savedBooking.phone}\n` +
                                `📍 Pincode: ${savedBooking.pincode}\n` +
                                `🏠 Address: ${savedBooking.address || ''}\n` +
                                `📦 Plan: ${savedBooking.package_interest}\n` +
                                `💰 Quote: ₹${parseInt(savedBooking.price_quoted).toLocaleString()}/- Net\n` +
                                surpriseBonusText + `\n` +
                                `Please guide me with the ₹5,000/- advance slot GPay address to approve my Digital Invoice!`;

                // Close modal
                if (customerBookingModal) customerBookingModal.style.display = 'none';

                // Reset forms
                customerBookingForm.reset();
                customerPasswordForm.reset();
                if (bookingStepFields) bookingStepFields.style.display = 'block';
                if (bookingStepPassword) bookingStepPassword.style.display = 'none';

                // Load and display Selection Dashboard on packages.html immediately
                loadCustomerDashboard();

                let targetWhatsApp = '9995412955';
                if (savedBooking.package_interest.includes('49999') || savedBooking.package_interest.includes('Prewedding') || savedBooking.price_quoted === '49999' || savedBooking.price_quoted === '110000') {
                    targetWhatsApp = '7356297265';
                }
                window.open(`https://wa.me/91${targetWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');

                // Force immediate Admin fetch refresh if active
                fetchBookings();
            } catch (err) {
                console.error("Booking save error:", err);
                alert("❌ Could not complete booking. Please try again.");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Confirm & Complete Registration</span> <i class="fa-solid fa-circle-check"></i>';
                }
            }
        });
    }

    // Step 3: Back Button Click
    if (btnBackFromPassword) {
        btnBackFromPassword.addEventListener('click', () => {
            if (bookingStepPassword) bookingStepPassword.style.display = 'none';
            if (bookingStepFields) bookingStepFields.style.display = 'block';
        });
    }

    // Password visibility toggles for creation screen
    if (btnToggleBridePassword && custBridePasswordInput) {
        btnToggleBridePassword.addEventListener('click', () => {
            const isPassword = custBridePasswordInput.getAttribute('type') === 'password';
            custBridePasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
            btnToggleBridePassword.querySelector('i').className = isPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        });
    }

    if (btnToggleGroomPassword && custGroomPasswordInput) {
        btnToggleGroomPassword.addEventListener('click', () => {
            const isPassword = custGroomPasswordInput.getAttribute('type') === 'password';
            custGroomPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
            btnToggleGroomPassword.querySelector('i').className = isPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        });
    }

    // Change Phone / Details Button click
    const btnBackToFields = document.getElementById('btnBackToFields');
    if (btnBackToFields) {
        btnBackToFields.addEventListener('click', () => {
            clearInterval(otpCountdownInterval);
            if (bookingStepOtp) bookingStepOtp.style.display = 'none';
            if (bookingStepFields) bookingStepFields.style.display = 'block';
        });
    }

    // Resend OTP Button click
    const btnResendOtp = document.getElementById('btnResendOtp');
    if (btnResendOtp) {
        btnResendOtp.addEventListener('click', () => {
            const phone = document.getElementById('custPhone').value.trim();
            fetch(`${API_BASE}/api/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (data.simulated) {
                        generatedOtpCode = data.otp;
                        alert(`💬 Twilio SMS Gateway Simulator:\nOTP code resent to +91 ${phone} is: [ ${generatedOtpCode} ]`);
                    } else {
                        generatedOtpCode = 'REAL';
                    }
                    startOtpResendTimer();
                } else {
                    alert('❌ Failed to resend OTP.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('❌ Connection failed while resending OTP.');
            });
        });
    }

    let currentSelectedPlan = '';
    let currentSelectedPrice = '';
    
    // --- DETAILS MODAL CONTROLLER (screenshot style popup for checklists) ---
        // --- DETAILS MODAL CONTROLLER (screenshot style popup for checklists) ---
    window.openDetailsModal = function(card) {
        // Remove existing modal if any
        const existing = document.getElementById('pkgDetailsModal');
        if (existing) existing.remove();

        const planName = card.getAttribute('data-plan') || 'Wedding Package';
        const planPrice = card.getAttribute('data-price') || '39999';
        
        // Safely extract elements
        const imgEl = card.querySelector('.package-cover-img');
        const imgSrc = imgEl ? imgEl.src : '';
        const h3El = card.querySelector('.package-title, .package-header h3');
        const titleText = h3El ? h3El.innerHTML.replace(/<br\s*\/?>/gi, ' ').trim() : 'Wedding Package';
        const subEl = card.querySelector('.package-subtitle');
        const subtitleText = subEl ? subEl.innerHTML : '';
        const badgeEl = card.querySelector('.package-badge');
        const badgeText = badgeEl ? badgeEl.textContent.trim() : 'Special Offer';
        
        const checklistSource = card.querySelector('.package-event-sections');
        const checklistHtml = checklistSource ? checklistSource.innerHTML : '';
        const listItemsCount = checklistSource ? checklistSource.querySelectorAll('li').length : 0;

        const cardId = card.id;
        const collectionTags = {
            'pkgWeddingBasicCard': 'ESSENTIAL COLLECTION',
            'pkgWeddingPreCard': 'PREMIUM COLLECTION',
            'pkgCandidCard': 'SIGNATURE COLLECTION',
            'pkgCandidVideoCard': 'MULTI-DAY COLLECTION',
            'pkgBrideGroomCard': 'ESSENTIAL COLLECTION'
        };
        const collectionTag = collectionTags[cardId] || 'SPECIAL COLLECTION';

        // Add Package suffix to title if not present
        let displayTitleText = titleText;
        if (!displayTitleText.toLowerCase().endsWith('package')) {
            displayTitleText += ' Package';
        }

        const descriptions = {
            'pkgWeddingBasicCard': "Our highly sought-after single-side coverage package. Designed to capture every detail of the Bride's OR Groom's celebrations with elite creative precision and beautiful physical heirlooms.",
            'pkgWeddingPreCard': 'Our comprehensive premium dual-side package. Ideal for capturing both sides of the celebrations with multiple angles and full coverage.',
            'pkgCandidCard': 'Our absolute signature masterpiece package. Includes premium pre-wedding photos and complete cinematic & portraiture coverage.',
            'pkgCandidVideoCard': 'Our ultimate, all-inclusive multi-day celebration package. Captures your entire wedding story across multiple days.'
        };
        const descriptionText = descriptions[cardId] || subtitleText;

        const modalDiv = document.createElement('div');
        modalDiv.className = 'pkg-details-modal-overlay';
        modalDiv.id = 'pkgDetailsModal';
        modalDiv.innerHTML = `
            <div class="pkg-details-modal-card">
                <button class="pkg-details-modal-close" id="btnClosePkgDetails">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="pkg-details-modal-grid">
                    <div class="pkg-details-modal-left">
                        <img src="${imgSrc}" class="pkg-details-modal-img" alt="${titleText}">
                        <div class="pkg-modal-left-dots">
                            <span></span><span></span><span></span>
                        </div>
                        <div class="pkg-details-modal-watermark">
                            <span class="pkg-watermark-brand">DREAMWED STORIES</span>
                            <h4>Actual Wedding Work Captures</h4>
                            <p>Every pixel captured with high-fidelity professional optics.</p>
                        </div>
                    </div>
                    <div class="pkg-details-modal-right">
                        <div class="pkg-details-modal-header">
                            <span class="pkg-details-modal-badge">${collectionTag}</span>
                            <h3 class="pkg-details-modal-title">${displayTitleText}</h3>
                            <div class="pkg-details-modal-price">₹${parseInt(planPrice).toLocaleString()}/-</div>
                        </div>
                        
                        <div class="pkg-details-modal-scroll-body">
                            <p class="pkg-details-modal-desc">${descriptionText}</p>
                            
                            <div class="pkg-details-modal-standard-box">
                                <div class="pkg-standard-box-icon">
                                    <i class="fa-solid fa-gift"></i>
                                </div>
                                <div class="pkg-standard-box-content">
                                    <strong>DREAMWED STORIES STANDARD</strong>
                                    <p>Premium color-grading, handcrafted album delivery, and a personalized story design consultation session.</p>
                                </div>
                            </div>
                            
                            <div class="pkg-details-modal-checklist-header">
                                COMPLETE DELIVERABLES (SCROLL FOR ALL ${listItemsCount} ITEMS 👇):
                            </div>
                            
                            <div class="pkg-details-modal-checklist-container">
                                ${checklistHtml}
                            </div>
                        </div>
                        
                        <div class="pkg-details-modal-footer">
                            <button class="pkg-modal-book-btn select-pkg-btn" data-plan="${planName}" data-price="${planPrice}">
                                BOOK A CONSULTATION NOW 🌟
                            </button>
                            <div class="pkg-refundable-note">
                                <i class="fa-solid fa-shield-halved"></i> 100% Refundable if your wedding date changes
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);
        document.body.style.overflow = 'hidden';

        // Style all checkmark icons inside the modal list to checkmark style
        const listContainer = modalDiv.querySelector('.pkg-details-modal-checklist-container');
        if (listContainer) {
            const icons = listContainer.querySelectorAll('i');
            icons.forEach(icon => {
                icon.className = 'fa-solid fa-check';
            });
        }

        const closeBtn = modalDiv.querySelector('#btnClosePkgDetails');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modalDiv.remove();
                document.body.style.overflow = '';
            });
        }

        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) {
                modalDiv.remove();
                document.body.style.overflow = '';
            }
        });
    };

    // --- CARDS RESTRUCTURER CONTROLLER (To match the screenshot's compact look) ---
    window.restructurePackageCards = function() {
        const cardData = {
            'pkgWeddingBasicCard': {
                title: 'Bride or Groom<br>Pack 01',
                category: 'SPECIAL PACKAGE COVERAGE',
                desc: "Our highly sought-after single-side coverage package. Designed to capture every detail of the Bride's OR Groom's celebrations with elite creative precision.",
                priceText: 'from ₹49,999',
                priceVal: '49999',
                setup: '<i class="fa-solid fa-camera"></i> 1 Photographer Setup',
                ribbon: '+ FREE PRE-WEDDING PHOTO',
                ribbonClass: '',
                img: 'uploaded_bride_yellow.jpg',
                highlighted: false
            },
            'pkgWeddingPreCard': {
                title: 'Bride & Groom<br>Pack 02',
                category: 'PREMIUM PHOTO & VIDEO PACKAGE',
                desc: 'Our comprehensive premium dual-side package. Ideal for capturing both sides of the celebrations with multiple angles and full coverage.',
                priceText: 'from ₹99,999',
                priceVal: '99999',
                setup: '<i class="fa-solid fa-camera"></i> 4 Camera Setup',
                ribbon: '+ FREE PRE-WEDDING PHOTO',
                ribbonClass: '',
                img: 'uploaded_couple_blackwhite.jpg',
                highlighted: false
            },
            'pkgCandidCard': {
                title: 'Bride & Groom<br>Pack 03',
                category: 'COMPLETE CINEMATIC & PORTRAITURE',
                desc: 'Our absolute signature masterpiece package. Includes premium pre-wedding photos and complete cinematic & portraiture coverage.',
                priceText: 'from ₹1,10,000',
                priceVal: '110000',
                setup: '<i class="fa-solid fa-camera"></i> 4 Camera Setup',
                ribbon: '✦ BEST DEAL (RECOMMENDED)',
                ribbonClass: 'best-deal-ribbon',
                img: 'uploaded_bride_traditional.jpg',
                highlighted: true
            },
            'pkgCandidVideoCard': {
                title: 'Engagement +<br>Wedding Pack 04',
                category: 'MULTI-DAY COMPLETE COVERAGE',
                desc: 'Our ultimate, all-inclusive multi-day celebration package. Captures your entire wedding story across multiple days.',
                priceText: 'from ₹1,59,000',
                priceVal: '159000',
                setup: '<i class="fa-solid fa-plane"></i> Drone Aerial Coverage',
                ribbon: '+ FREE DRONE AERIAL COVERAGE',
                ribbonClass: '',
                img: 'uploaded_couple_blackwhite.jpg',
                highlighted: false
            }
        };

        // Hide the 5th card
        const card5 = document.getElementById('pkgBrideGroomCard');
        if (card5) {
            card5.style.setProperty('display', 'none', 'important');
        }

        Object.keys(cardData).forEach(id => {
            const card = document.getElementById(id);
            if (!card) return;

            // If already restructured, don't overwrite
            if (card.querySelector('.package-card-body')) return;

            const data = cardData[id];

            // Save original features/checklists if not already saved
            let checklistHtml = '';
            const featuresEl = card.querySelector('.package-event-sections');
            if (featuresEl) {
                checklistHtml = featuresEl.innerHTML;
            }

            // Set data attributes for standard booking flow
            card.setAttribute('data-plan', data.title.replace('<br>', ' '));
            card.setAttribute('data-price', data.priceVal);

            // Apply card highlighted styles
            if (data.highlighted) {
                card.classList.add('premium-card');
            } else {
                card.classList.remove('premium-card');
            }

            card.innerHTML = `
                <!-- Background Cover Image -->
                <div class="package-cover-wrapper">
                    <img src="${data.img}" class="package-cover-img" alt="${data.title}">
                    <div class="package-cover-overlay"></div>
                </div>

                <!-- Floating Top Row Elements -->
                <div class="package-card-top-row">
                    <span class="flyer-ribbon-tag ${data.ribbonClass}">${data.ribbon}</span>
                    <button class="card-heart-btn" title="Add to Wishlist">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                </div>

                <!-- Card Content -->
                <div class="package-card-body">
                    <span class="click-details-hint"><i class="fa-solid fa-plane"></i> CLICK FOR PHOTOS & DETAILS</span>
                    <h3 class="package-title">${data.title}</h3>
                    <span class="package-category-title">${data.category}</span>
                    <p class="package-short-desc">${data.desc}</p>
                    
                    <!-- Stacked Pills -->
                    <div class="package-pills-stack">
                        <div class="package-pill price-pill">
                            <i class="fa-solid fa-tag"></i> ${data.priceText}
                        </div>
                        <div class="package-pill setup-pill">
                            ${data.setup}
                        </div>
                    </div>

                    <!-- Secure Offer CTA -->
                    <button class="select-pkg-btn secure-offer-btn" data-plan="${data.title.replace('<br>', ' ')}" data-price="${data.priceVal}">
                        SECURE<br>OFFER
                    </button>
                </div>

                <!-- Keep Inclusions hidden for Modal extractor -->
                <div class="package-event-sections" style="display:none !important;">
                    ${checklistHtml}
                </div>
                
                <div class="package-subtitle" style="display:none !important;">
                    ${data.desc}
                </div>

                <div class="package-badge" style="display:none !important;">
                    ${data.ribbon}
                </div>

                <div class="package-price" style="display:none !important;">
                    <span class="price-value">₹${parseInt(data.priceVal).toLocaleString()}/-</span>
                </div>
            `;
        });
    };


    // Unified event delegation for booking package buttons & cards (static & dynamic)
    document.addEventListener('click', (e) => {
        // Exclude admin dashboard actions so they don't trigger the user booking modal
        if (e.target.closest('.edit-pkg-btn') || e.target.closest('.delete-pkg-btn')) {
            return;
        }

        const btn = e.target.closest('.select-pkg-btn');
        const card = e.target.closest('.package-card, .visual-flyer-card');
        
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close details modal if open
            const detailsModal = document.getElementById('pkgDetailsModal');
            if (detailsModal) {
                detailsModal.remove();
                document.body.style.overflow = '';
            }
            
            currentSelectedPlan = btn.getAttribute('data-plan') || 'Custom Package';
            currentSelectedPrice = btn.getAttribute('data-price') || '39999';
            
            // Toggle surprise bonus banner inside the booking modal based on price
            const surpriseBanner = document.getElementById('surpriseBonusBanner');
            if (surpriseBanner) {
                if (currentSelectedPrice === '49999' || currentSelectedPrice === '99999') {
                    surpriseBanner.style.display = 'block';
                } else {
                    surpriseBanner.style.display = 'none';
                }
            }

            // Filter Coverage Scope options dynamically
            const selectEl = document.getElementById('custCoverageScope');
            if (selectEl) {
                const isSingleSide = currentSelectedPlan.toLowerCase().includes('single side') || 
                                     currentSelectedPlan.toLowerCase().includes('bride or groom') || 
                                     currentSelectedPrice === '39999' || 
                                     currentSelectedPrice === '49999';
                if (isSingleSide) {
                    selectEl.innerHTML = `
                        <option value="bride" selected>Bride Side Only (Single Password)</option>
                        <option value="groom">Groom Side Only (Single Password)</option>
                    `;
                } else {
                    selectEl.innerHTML = `
                        <option value="both" selected>Both Bride & Groom Side (Dual Passwords)</option>
                    `;
                }
            }
            
            if (customerBookingModal) {
                customerBookingModal.style.display = 'flex';
            }
        } else if (card && !e.target.closest('.share-pkg-btn')) {
            e.preventDefault();
            e.stopPropagation();
            
            window.openDetailsModal(card);
        }
    });

    if (document.getElementById('btnCancelBooking') && customerBookingModal) {
        document.getElementById('btnCancelBooking').addEventListener('click', () => {
            customerBookingModal.style.display = 'none';
        });
    }

    const btnGoBackBooking = document.getElementById('btnGoBackBooking');
    if (btnGoBackBooking && customerBookingModal) {
        btnGoBackBooking.addEventListener('click', () => {
            customerBookingModal.style.display = 'none';
        });
    }

    // 7. ADMIN CRM bookings Table renderer
    async function fetchBookings() {
        const tableBody = document.getElementById('bookingsTableBody');
        if (!tableBody) return;

        await refreshLocalBookings();
        const bookings = getSavedBookings();

        if (bookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="padding: 30px; text-align: center; color: var(--text-muted);">
                        <i class="fa-solid fa-box-open" style="margin-right: 8px;"></i> No booking reservations logged yet.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';

        bookings.forEach((b) => {
            const statusClass = b.status === 'approved' ? 'status-approved' : (b.status === 'cancelled' ? 'status-cancelled' : 'status-pending');
            const statusBadgeColor = b.status === 'approved' ? '#2ecc71' : (b.status === 'cancelled' ? '#e74c3c' : '#ffeb3b');
            const statusLabelText = b.status === 'approved' ? 'Approved' : (b.status === 'cancelled' ? 'Cancelled' : 'Pending');

            // Selections counts
            const bSel = b.bride_selections ? b.bride_selections.length : 0;
            const gSel = b.groom_selections ? b.groom_selections.length : 0;
            const shared = b.bride_selections && b.groom_selections ? b.bride_selections.filter(id => b.groom_selections.includes(id)).length : 0;

            const scope = b.coverage_scope || 'both';
            let progressBadge = '';
            if (scope === 'bride') {
                progressBadge = `
                    <div style="font-size: 10px; line-height: 1.4; color: var(--text-light);">
                        <div style="white-space: nowrap;"><span style="color:#ff85a2; font-weight:800;">👰 Bride:</span> <strong>${bSel}</strong></div>
                    </div>
                `;
            } else if (scope === 'groom') {
                progressBadge = `
                    <div style="font-size: 10px; line-height: 1.4; color: var(--text-light);">
                        <div style="white-space: nowrap;"><span style="color:#64b5f6; font-weight:800;">🤵 Groom:</span> <strong>${gSel}</strong></div>
                    </div>
                `;
            } else {
                progressBadge = `
                    <div style="font-size: 10px; line-height: 1.4; color: var(--text-light);">
                        <div style="white-space: nowrap;"><span style="color:#ff85a2;">👰 Bride:</span> <strong>${bSel}</strong></div>
                        <div style="white-space: nowrap;"><span style="color:#64b5f6;">🤵 Groom:</span> <strong>${gSel}</strong></div>
                        <div style="white-space: nowrap; font-weight:800; color:#2ecc71;">💖 Agreed: ${shared}</div>
                    </div>
                `;
            }

            // Action row buttons based on status (Integrated edit booking and UPI link requests)
            let actionBtnHtml = '';
            if (b.status === 'pending') {
                actionBtnHtml = `
                    <button class="btn btn-secondary admin-approve-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.4);">
                        <i class="fa-solid fa-circle-check"></i> Approve
                    </button>
                    <button class="btn btn-secondary admin-edit-booking-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(52, 152, 219, 0.15); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.35); margin-left: 4px;">
                        <i class="fa-solid fa-file-pen"></i> Edit
                    </button>
                    <button class="btn btn-secondary admin-cancel-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(231, 76, 60, 0.15); color: #ff8a80; border: 1px solid rgba(231, 76, 60, 0.3); margin-left: 4px;">
                        <i class="fa-solid fa-ban"></i> Cancel
                    </button>
                    <button class="btn btn-secondary admin-delete-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(231, 76, 60, 0.2); color: #ff8a80; border: 1px solid rgba(231, 76, 60, 0.4); margin-left: 4px;">
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                `;
            } else if (b.status === 'approved') {
                actionBtnHtml = `
                    <button class="btn btn-secondary admin-invoice-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(218, 165, 32, 0.15); color: var(--primary-gold); border: 1px solid rgba(218, 165, 32, 0.35);">
                        <i class="fa-solid fa-file-invoice"></i> Receipt
                    </button>
                    <button class="btn btn-secondary admin-edit-booking-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(52, 152, 219, 0.15); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.35); margin-left: 4px;">
                        <i class="fa-solid fa-file-pen"></i> Edit
                    </button>
                    <button class="btn btn-secondary admin-paylink-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.35); margin-left: 4px;">
                        <i class="fa-solid fa-credit-card"></i> Pay Link
                    </button>
                    <button class="btn btn-secondary admin-cancel-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(231, 76, 60, 0.15); color: #ff8a80; border: 1px solid rgba(231, 76, 60, 0.3); margin-left: 4px;">
                        <i class="fa-solid fa-ban"></i> Cancel
                    </button>
                    <button class="btn btn-secondary admin-delete-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(231, 76, 60, 0.2); color: #ff8a80; border: 1px solid rgba(231, 76, 60, 0.4); margin-left: 4px;">
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                `;
            } else if (b.status === 'cancelled') {
                actionBtnHtml = `
                    <button class="btn btn-secondary admin-approve-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.4);">
                        <i class="fa-solid fa-arrows-rotate"></i> Re-open
                    </button>
                    <button class="btn btn-secondary admin-delete-btn" data-id="${b.id}" style="padding: 4px 8px; font-size: 10px; background: rgba(231, 76, 60, 0.2); color: #ff8a80; border: 1px solid rgba(231, 76, 60, 0.4); margin-left: 4px;">
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                `;
            }

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border-glass)';

            const brideInputHtml = (scope === 'both' || scope === 'bride') 
                ? `<input type="text" class="admin-password-input bride-pwd" data-id="${b.id}" value="${b.bride_password || 'bride123'}" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:3px; color:white; font-size:9.5px; width:70px; padding:2px 4px; text-align:center;">`
                : `<span style="font-size:9.5px; color:var(--text-muted); font-style:italic;">N/A (Groom Only)</span>`;
                
            const groomInputHtml = (scope === 'both' || scope === 'groom')
                ? `<input type="text" class="admin-password-input groom-pwd" data-id="${b.id}" value="${b.groom_password || 'groom123'}" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:3px; color:white; font-size:9.5px; width:70px; padding:2px 4px; text-align:center;">`
                : `<span style="font-size:9.5px; color:var(--text-muted); font-style:italic;">N/A (Bride Only)</span>`;

            tr.innerHTML = `
                <td style="padding: 14px 16px;">
                    <strong>DW-${String(b.id).padStart(3, '0')}</strong>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">${b.date}</div>
                </td>
                <td style="padding: 14px 16px;">
                    <div style="font-weight: 700; color: white;">${b.name}</div>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">
                        <a href="tel:${b.phone}" style="color: var(--primary-gold);"><i class="fa-solid fa-phone" style="font-size: 8px;"></i> +91 ${b.phone}</a> &nbsp;|&nbsp; 
                        <span><i class="fa-solid fa-envelope" style="font-size: 8px;"></i> ${b.email}</span>
                    </div>
                </td>
                <td style="padding: 14px 16px; min-width: 140px;">
                    <div style="font-size: 10px; display: flex; flex-direction: column; gap: 4px;">
                        <div style="display:flex; align-items:center; gap: 4px;">
                            <span style="color:#ff85a2; font-weight:700;">👰 Bride:</span> 
                            ${brideInputHtml}
                        </div>
                        <div style="display:flex; align-items:center; gap: 4px;">
                            <span style="color:#64b5f6; font-weight:700;">🤵 Groom:</span> 
                            ${groomInputHtml}
                        </div>
                    </div>
                </td>
                <td style="padding: 14px 16px;">${progressBadge}</td>
                <td style="padding: 14px 16px; font-weight: 700; color: white;">${b.pincode}</td>
                <td style="padding: 14px 16px; font-size: 11px; color: var(--text-muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.package_interest}</td>
                <td style="padding: 14px 16px; font-weight: 800; color: var(--primary-gold);">₹${parseInt(b.price_quoted).toLocaleString()}</td>
                <td style="padding: 14px 16px;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: ${statusBadgeColor};">${statusLabelText}</span>
                </td>
                <td style="padding: 14px 16px; text-align: center;">
                    <div style="display: flex; gap: 6px; justify-content: center;">
                        ${actionBtnHtml}
                    </div>
                </td>
            `;

            // Bind password onblur changes
            const brideInput = tr.querySelector('.admin-password-input.bride-pwd');
            if (brideInput) {
                brideInput.addEventListener('blur', () => {
                    updateBookingPassword(b.id, 'bride', brideInput.value.trim());
                });
            }

            const groomInput = tr.querySelector('.admin-password-input.groom-pwd');
            if (groomInput) {
                groomInput.addEventListener('blur', () => {
                    updateBookingPassword(b.id, 'groom', groomInput.value.trim());
                });
            }

            // Bind approve/cancel/invoice buttons
            const approveBtn = tr.querySelector('.admin-approve-btn');
            if (approveBtn) {
                approveBtn.addEventListener('click', () => {
                    changeBookingStatus(b.id, 'approved');
                });
            }

            const cancelBtn = tr.querySelector('.admin-cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    changeBookingStatus(b.id, 'cancelled');
                });
            }

            const invoiceBtn = tr.querySelector('.admin-invoice-btn');
            if (invoiceBtn) {
                invoiceBtn.addEventListener('click', () => {
                    compileAndOpenInvoice(b);
                });
            }

            const editBookingBtn = tr.querySelector('.admin-edit-booking-btn');
            if (editBookingBtn) {
                editBookingBtn.addEventListener('click', () => {
                    openEditBookingModal(b.id);
                });
            }

            const paylinkBtn = tr.querySelector('.admin-paylink-btn');
            if (paylinkBtn) {
                paylinkBtn.addEventListener('click', () => {
                    sharePaymentLink(b.id);
                });
            }

            const deleteBtn = tr.querySelector('.admin-delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm('🗑️ Are you sure you want to permanently delete this booking record? This action cannot be undone.')) {
                        deleteBookingRecord(b.id);
                    }
                });
            }

            tableBody.appendChild(tr);
        });

        // Trigger dynamic rendering of upcoming shoot timeline
        renderUpcomingTimeline();
    }

    // Update partner passwords in Admin CRM
    async function updateBookingPassword(id, role, newPassword) {
        if (!newPassword) return;
        const updateFields = {};
        if (role === 'bride') {
            updateFields.bride_password = newPassword;
        } else {
            updateFields.groom_password = newPassword;
        }
        await apiUpdateBooking(id, updateFields);
        console.log(`Password updated for booking ID ${id}: ${role} = ${newPassword}`);
    }

    // Change booking status inside database
    async function changeBookingStatus(id, status) {
        if (status === 'approved') {
            try {
                const res = await fetch(`${API_BASE}/api/bookings/${id}/confirm`, {
                    method: 'POST'
                });
                if (!res.ok) throw new Error("Approval confirmation failed");
                await refreshLocalBookings();
                fetchBookings(); // refresh table & timeline automatically
                alert(`🎉 Booking APPROVED successfully!\nAccess passwords bride / groom are unlocked and ready for client co-selection.`);
            } catch (err) {
                console.error("Error confirming booking:", err);
            }
        } else {
            await apiUpdateBooking(id, { status: status });
            fetchBookings(); // refresh table & timeline automatically
        }
    }

    // Delete booking record from database
    async function deleteBookingRecord(id) {
        await apiDeleteBooking(id);
        fetchBookings(); // refresh table & timeline automatically
        alert('🗑️ Booking record permanently deleted successfully.');
    }

    // --- 7.5 EDIT BOOKING MODAL ACTIONS ---
    const editBookingModal = document.getElementById('editBookingModal');
    const editBookingForm = document.getElementById('editBookingForm');
    const btnCancelEditBooking = document.getElementById('btnCancelEditBooking');
    const btnExitEditBooking = document.getElementById('btnExitEditBooking');
    const editBookingIndexInput = document.getElementById('editBookingIndex');
    const editBookingNameInput = document.getElementById('editBookingName');
    const editBookingPhoneInput = document.getElementById('editBookingPhone');
    const editBookingEmailInput = document.getElementById('editBookingEmail');
    const editBookingDateInput = document.getElementById('editBookingDate');
    const editBookingPackageInput = document.getElementById('editBookingPackage');
    const editBookingPriceInput = document.getElementById('editBookingPrice');
    const editBookingPincodeInput = document.getElementById('editBookingPincode');
    const editBookingTravelInput = document.getElementById('editBookingTravel');
    const editBookingStayInput = document.getElementById('editBookingStay');

    function openEditBookingModal(id) {
        const bookings = getSavedBookings();
        const b = bookings.find(item => item.id === id);
        if (!b) return;

        editBookingIndexInput.value = id;
        editBookingNameInput.value = b.name || '';
        editBookingPhoneInput.value = b.phone || '';
        editBookingEmailInput.value = b.email || '';
        
        // Input type="date" expects yyyy-mm-dd format
        let dateVal = '';
        if (b.date) {
            const parsedDate = new Date(b.date);
            if (!isNaN(parsedDate.getTime())) {
                const yyyy = parsedDate.getFullYear();
                const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
                const dd = String(parsedDate.getDate()).padStart(2, '0');
                dateVal = `${yyyy}-${mm}-${dd}`;
            } else {
                dateVal = b.date;
            }
        }
        editBookingDateInput.value = dateVal;
        
        editBookingPackageInput.value = b.package_interest || '';
        editBookingPriceInput.value = b.price_quoted || '';
        editBookingPincodeInput.value = b.pincode || '';
        editBookingTravelInput.value = b.travel_charges || 'Excluded';
        editBookingStayInput.value = b.stay_charges || 'Excluded';

        if (editBookingModal) {
            editBookingModal.style.display = 'flex';
        }
    }

    function closeEditBookingModal() {
        if (editBookingModal) {
            editBookingModal.style.display = 'none';
        }
    }

    if (editBookingForm) {
        editBookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = Number(editBookingIndexInput.value);
            const bookings = getSavedBookings();
            const booking = bookings.find(item => item.id === id);
            if (!booking) return;

            const name = editBookingNameInput.value.trim();
            const phone = editBookingPhoneInput.value.trim();
            const email = editBookingEmailInput.value.trim();
            
            // Format input back to locale date string
            const rawDate = editBookingDateInput.value;
            let dateStr = rawDate;
            if (rawDate) {
                const parsedDate = new Date(rawDate);
                dateStr = !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString() : rawDate;
            }

            await apiUpdateBooking(id, {
                name: name,
                phone: phone,
                email: email,
                date: dateStr,
                package_interest: editBookingPackageInput.value.trim(),
                price_quoted: editBookingPriceInput.value.trim(),
                pincode: editBookingPincodeInput.value.trim(),
                travel_charges: editBookingTravelInput.value,
                stay_charges: editBookingStayInput.value
            });

            closeEditBookingModal();
            fetchBookings(); // updates timeline as well
            alert('🎉 Booking details successfully updated in CRM!');
        });
    }

    if (btnCancelEditBooking) btnCancelEditBooking.addEventListener('click', closeEditBookingModal);
    if (btnExitEditBooking) btnExitEditBooking.addEventListener('click', closeEditBookingModal);
    if (editBookingModal) {
        editBookingModal.addEventListener('click', (e) => {
            if (e.target === editBookingModal) {
                closeEditBookingModal();
            }
        });
    }

    // --- 7.7 WHATSAPP UPI PAYMENT LINK COMPILER ---
    function sharePaymentLink(id) {
        const bookings = getSavedBookings();
        const b = bookings.find(item => item.id === id);
        if (!b) return;

        const message = `Hi ${b.name}! To lock in your Team Dreamwed Stories photography slot for your wedding on ${b.date}, please complete the advance deposit of *₹5,000/-*.\n\n` +
                        `📱 UPI ID: 9995412955@ybl (Unni - Dreamwed Stories)\n` +
                        `🔗 GPay/UPI Quick Link: https://upilinks.in/payment-button/9995412955@ybl/5000\n\n` +
                        `Thank you! Let's roll! 📸✨`;

        window.open(`https://wa.me/91${b.phone}?text=${encodeURIComponent(message)}`, '_blank');
    }

    // --- 7.9 UPCOMING APPROVED EVENT TIMELINE RENDERER ---
    function renderUpcomingTimeline() {
        const timelineContainer = document.getElementById('upcomingTimelineContainer');
        const timelineGrid = document.getElementById('upcomingTimelineGrid');
        if (!timelineContainer || !timelineGrid) return;

        const bookings = getSavedBookings();
        const approvedBookings = bookings.filter(b => b.status === 'approved');

        if (approvedBookings.length === 0) {
            timelineContainer.style.display = 'none';
            return;
        }

        // Sort approved bookings chronologically by event date
        approvedBookings.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
        });

        timelineContainer.style.display = 'block';
        timelineGrid.innerHTML = '';

        approvedBookings.forEach(b => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const eventDate = new Date(b.date);
            eventDate.setHours(0, 0, 0, 0);
            
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let countdownText = '';
            let countdownClass = '';
            if (diffDays === 0) {
                countdownText = '🎉 Today!';
                countdownClass = 'countdown-today';
            } else if (diffDays === 1) {
                countdownText = '⏳ Tomorrow!';
                countdownClass = 'countdown-tomorrow';
            } else if (diffDays < 0) {
                countdownText = `Passed (${Math.abs(diffDays)}d ago)`;
                countdownClass = 'countdown-passed';
            } else {
                countdownText = `⏳ In ${diffDays} days`;
                countdownClass = 'countdown-future';
            }

            const card = document.createElement('div');
            card.className = 'timeline-card glass-card';
            card.style.cssText = `
                flex: 0 0 250px;
                padding: 15px;
                border: 1px solid rgba(218, 165, 32, 0.22);
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.02);
                text-align: left;
                display: flex;
                flex-direction: column;
                gap: 6px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.25);
                transition: all 0.3s ease;
                cursor: pointer;
            `;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                    <span class="timeline-countdown-badge ${countdownClass}" style="
                        font-size: 9px;
                        font-weight: 800;
                        padding: 3px 8px;
                        border-radius: 100px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    ">${countdownText}</span>
                    <span style="font-size: 9.5px; color: var(--primary-gold); font-weight: 700;"><i class="fa-solid fa-map-pin"></i> ${b.pincode || 'Kerala'}</span>
                </div>
                <h4 style="font-size: 14.5px; font-weight: 700; color: white; margin: 4px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${b.name}</h4>
                <p style="font-size: 11px; color: var(--text-muted); margin: 0; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-regular fa-calendar" style="color: var(--primary-gold); font-size: 10px;"></i> ${b.date}
                </p>
                <div style="
                    margin-top: 6px;
                    padding-top: 6px;
                    border-top: 1px dashed rgba(255,255,255,0.08);
                    font-size: 10px;
                    color: var(--text-light);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">
                    <i class="fa-solid fa-camera" style="color: var(--primary-gold); margin-right: 2px;"></i> ${b.package_interest}
                </div>
            `;
            timelineGrid.appendChild(card);
        });
    }

    // Compile Receipt parameters and load printable Invoice modal sheet
    const invoiceModal = document.getElementById('invoiceModal');
    const btnCloseInvoice = document.getElementById('btnCloseInvoice');
    const btnPrintInvoice = document.getElementById('btnPrintInvoice');
    const btnShareWhatsAppInvoice = document.getElementById('btnShareWhatsAppInvoice');
    
    let activeInvoiceObj = null;

    function compileAndOpenInvoice(booking) {
        if (!invoiceModal) return;
        activeInvoiceObj = booking;

        document.getElementById('invNumber').innerText = booking.id;
        document.getElementById('invDate').innerText = booking.date;
        document.getElementById('invCustName').innerText = booking.name;
        document.getElementById('invCustPhone').innerText = `+91 ${booking.phone}`;
        document.getElementById('invCustEmail').innerText = booking.email;
        document.getElementById('invCustPincode').innerText = booking.pincode;
        document.getElementById('invPlanName').innerText = booking.package_interest;

        const price = parseInt(booking.price_quoted);
        const originalPrice = Math.round(price * 1.5);
        const savings = originalPrice - price;

        document.getElementById('invOriginalPrice').innerText = `₹${originalPrice.toLocaleString()}/-`;
        document.getElementById('invDiscount').innerText = `-₹${savings.toLocaleString()}/-`;
        document.getElementById('invTotalPrice').innerText = `₹${price.toLocaleString()}/-`;

        const balance = price - 5000;
        document.getElementById('invBalance').innerText = `₹${balance.toLocaleString()}/-`;

        // Update travel and stay exclusions dynamically inside modal table
        const travelVal = booking.travel_charges || 'Excluded';
        const stayVal = booking.stay_charges || 'Excluded';

        const travelCostEl = document.getElementById('invTravelCost');
        const stayCostEl = document.getElementById('invStayCost');

        if (travelCostEl) {
            travelCostEl.innerText = travelVal === 'Included' ? 'Included (Free)' : 'Excluded';
            travelCostEl.style.color = travelVal === 'Included' ? '#27ae60' : '#ff8a80';
        }
        if (stayCostEl) {
            stayCostEl.innerText = stayVal === 'Included' ? 'Included (Free)' : 'Excluded';
            stayCostEl.style.color = stayVal === 'Included' ? '#27ae60' : '#ff8a80';
        }

        // Toggle invSurpriseRow row inside itemized table based on selected package price (₹49,999 gets the free photoshoot)
        const invSurpriseRow = document.getElementById('invSurpriseRow');
        if (invSurpriseRow) {
            if (price === 49999 || price === 99999) {
                invSurpriseRow.style.display = 'table-row';
            } else {
                invSurpriseRow.style.display = 'none';
            }
        }

        invoiceModal.style.display = 'flex';
    }

    const btnExitInvoice = document.getElementById('btnExitInvoice');

    function closeInvoiceModal() {
        if (invoiceModal) {
            invoiceModal.style.display = 'none';
        }
    }

    if (btnCloseInvoice && invoiceModal) {
        btnCloseInvoice.addEventListener('click', closeInvoiceModal);
    }

    if (btnExitInvoice) {
        btnExitInvoice.addEventListener('click', closeInvoiceModal);
    }

    // Close on clicking outside of printable receipt sheet
    if (invoiceModal) {
        invoiceModal.addEventListener('click', (e) => {
            if (e.target === invoiceModal) {
                closeInvoiceModal();
            }
        });
    }

    if (btnPrintInvoice) {
        btnPrintInvoice.addEventListener('click', () => {
            window.print();
        });
    }

    if (btnShareWhatsAppInvoice) {
        btnShareWhatsAppInvoice.addEventListener('click', () => {
            if (!activeInvoiceObj) return;

            const b = activeInvoiceObj;
            const scope = b.coverage_scope || 'both';
            let loginDetails = '';
            if (scope === 'bride') {
                loginDetails = `🔑 CUSTOMER SELECTION PORTAL LOGIN:\n` +
                               `👰 Bride Password: ${b.bride_password}\n`;
            } else if (scope === 'groom') {
                loginDetails = `🔑 CUSTOMER SELECTION PORTAL LOGIN:\n` +
                               `🤵 Groom Password: ${b.groom_password}\n`;
            } else {
                loginDetails = `🔑 CO-SELECTION DASHBOARD LOGIN:\n` +
                               `👰 Bride Password: ${b.bride_password}\n` +
                               `🤵 Groom Password: ${b.groom_password}\n`;
            }

            const travelVal = b.travel_charges || 'Excluded';
            const stayVal = b.stay_charges || 'Excluded';
            const travelText = travelVal === 'Included' ? 'Included (Free)' : 'Excluded (Payable by client)';
            const stayText = stayVal === 'Included' ? 'Included (Free)' : 'Excluded (Payable by client)';

            const includesPrewedding = (parseInt(b.price_quoted) === 49999 || parseInt(b.price_quoted) === 99999);
            const surpriseBonusText = includesPrewedding ? `🎁 SURPRISE BONUS: Free Save the Date Photoshoot (worth ₹9,999/-) included!\n` : '';

            const message = `Hi ${b.name}!\n\n` +
                            `Dreamwed Stories has APPROVED your package reservation slot! 📸✨\n\n` +
                            `🧾 INVOICE RECEIPT ID: ${b.id}\n` +
                            `📦 Booked Plan: ${b.package_interest}\n` +
                            `💰 Quote Total: ₹${parseInt(b.price_quoted).toLocaleString()}/- Net\n` +
                            surpriseBonusText +
                            `🚗 Travel Charges: ${travelText}\n` +
                            `🏨 Stay/Accommodation: ${stayText}\n` +
                            `✅ Verified Advance Slot Received: -₹5,000/-\n` +
                            `💵 Balance Fee Payable at Event: ₹${(parseInt(b.price_quoted) - 5000).toLocaleString()}/-\n\n` +
                            `-------------------------------------------\n` +
                            `${loginDetails}` +
                            `🔗 Access the Customer Portal on our website with your registered phone e.g. +91 ${b.phone} to start selecting your printed album favorites!\n\n` +
                            `Thank you for trusting Team Dreamwed stories!`;
            
            window.open(`https://wa.me/91${b.phone}?text=${encodeURIComponent(message)}`, '_blank');
        });
    }


    // Populate initial bookings list on dashboard start
    setTimeout(fetchBookings, 500);

    // --- Video Player Modal Functionality ---
    const videoPlayerModal = document.getElementById('videoPlayerModal');
    const videoPlayerIframe = document.getElementById('videoPlayerIframe');
    const btnCloseVideoPlayer = document.getElementById('btnCloseVideoPlayer');

    function openVideoModal(embedUrl) {
        if (videoPlayerModal && videoPlayerIframe) {
            videoPlayerIframe.src = embedUrl;
            videoPlayerModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Lock background scroll
        }
    }

    function closeVideoModal() {
        if (videoPlayerModal && videoPlayerIframe) {
            videoPlayerModal.style.display = 'none';
            videoPlayerIframe.src = ''; // Stop the video playing in background
            document.body.style.overflow = ''; // Unlock scroll
        }
    }

    if (btnCloseVideoPlayer) {
        btnCloseVideoPlayer.addEventListener('click', closeVideoModal);
    }

    if (videoPlayerModal) {
        videoPlayerModal.addEventListener('click', (e) => {
            if (e.target === videoPlayerModal) {
                closeVideoModal();
            }
        });
    }

    // --- Helper to start the video inline ---
    function startVideoInline(wrapper, playBtn, isMuted) {
        // Hide play button
        playBtn.style.display = 'none';

        // Find parent package card to elevate and glow
        const pkgCard = wrapper.closest('.package-card, .visual-flyer-card');
        if (pkgCard) {
            pkgCard.classList.add('playing-video');
        }

        // Activate theater dimmer element dynamically if not present
        let theaterDimmer = document.querySelector('.theater-dimmer');
        if (!theaterDimmer) {
            theaterDimmer = document.createElement('div');
            theaterDimmer.className = 'theater-dimmer';
            document.body.appendChild(theaterDimmer);
        }
        theaterDimmer.classList.add('active');

        // Create video iframe playing the YouTube video inline (unzoomed, with controls)
        const iframe = document.createElement('iframe');
        iframe.className = 'inline-video-iframe';
        const muteParam = isMuted ? '1' : '0';
        iframe.src = `https://www.youtube.com/embed/S9-SrdnKsMs?autoplay=1&mute=${muteParam}&controls=1&modestbranding=1&rel=0&loop=1&playlist=S9-SrdnKsMs`;
        iframe.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            z-index: 12;
            background: #000;
        `;

        // Create Close Button to stop playing and restore image
        const closeBtn = document.createElement('button');
        closeBtn.className = 'inline-video-close-btn';
        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        closeBtn.title = 'Close video';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            z-index: 15;
            cursor: pointer;
        `;

        // Helper function to stop video and restore static view
        function stopInlineVideo() {
            iframe.remove();
            closeBtn.remove();
            playBtn.style.display = 'flex';
            if (pkgCard) {
                pkgCard.classList.remove('playing-video');
            }
            theaterDimmer.classList.remove('active');
            theaterDimmer.onclick = null;
        }

        closeBtn.addEventListener('click', (closeEvent) => {
            closeEvent.stopPropagation();
            stopInlineVideo();
        });

        // Clicking the dimmed background should also close the video
        theaterDimmer.onclick = (dimmerEvent) => {
            dimmerEvent.stopPropagation();
            stopInlineVideo();
        };

        wrapper.appendChild(iframe);
        wrapper.appendChild(closeBtn);
    }

    // --- Inject Video Play Overlay to Cover Images ---
    function injectVideoPlayButtons() {
        const coverWrappers = document.querySelectorAll('.package-cover-wrapper, .flyer-cover-image-wrapper');
        coverWrappers.forEach(wrapper => {
            const img = wrapper.querySelector('img');
            if (!img) return;

            // Match if image contains 'prajith' or 'package3_cover'
            if (img.src && (img.src.includes('prajith') || img.src.includes('package3_cover'))) {
                if (!wrapper.querySelector('.video-play-overlay')) {
                    const playBtn = document.createElement('div');
                    playBtn.className = 'video-play-overlay';
                    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                    playBtn.title = 'Play Traditional Heritage Shoot highlights';
                    
                    wrapper.style.position = 'relative';
                    
                    playBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Manual clicks: play unmuted (with sound)
                        startVideoInline(wrapper, playBtn, false);
                    });
                    
                    wrapper.appendChild(playBtn);
                }
            }
        });
    }

    // --- Initialize Grid on Page Load ---
    renderPackagesGrid();

    // --- Viewport Intersection Auto-Play Trigger (Muted to bypass browser security) ---
    const prajithCardImg = document.querySelector('.package-cover-wrapper img[src*="prajith"], .package-cover-wrapper img[src*="package3_cover"], .flyer-cover-image-wrapper img[src*="prajith"]');
    if (prajithCardImg) {
        const wrapper = prajithCardImg.parentElement;
        const playBtn = wrapper.querySelector('.video-play-overlay');
        const pkgCard = wrapper.closest('.package-card, .visual-flyer-card');

        if (playBtn && pkgCard) {
            let autoplayTimeout = null;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Stop observing so it only triggers once
                        observer.unobserve(pkgCard);

                        // Start 4-second delay timer when card is in view
                        autoplayTimeout = setTimeout(() => {
                            if (playBtn.style.display !== 'none') {
                                startVideoInline(wrapper, playBtn, true); // Trigger play (muted)
                            }
                        }, 4000);
                    }
                });
            }, {
                threshold: 0.35 // Trigger when 35% of the card is visible on screen
            });

            observer.observe(pkgCard);

            // If user clicks manually before the timeout, clear the automatic timeout
            playBtn.addEventListener('click', () => {
                if (autoplayTimeout) {
                    clearTimeout(autoplayTimeout);
                }
            });
        }
    }

    // --- 8. PREMIUM WEB SHARE INTEGRATION FOR CLIENT SHARING ---
    document.addEventListener('click', async (e) => {
        const shareBtn = e.target.closest('.share-pkg-btn');
        if (!shareBtn) return;

        e.preventDefault();
        e.stopPropagation();

        const packageId = shareBtn.getAttribute('data-id');
        const packageTitle = shareBtn.getAttribute('data-title');
        
        // Generate the shareable URL with query parameter pointing to this card
        const shareUrl = `${window.location.origin}${window.location.pathname}?pkg=${packageId}`;
        const shareText = `Check out this premium wedding package details from Dreamwed Stories: "${packageTitle}"`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Dreamwed Stories Package',
                    text: shareText,
                    url: shareUrl
                });
                console.log('Package shared successfully!');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            // Desktop fallback: Copy to Clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                
                // Show a modern custom floating toast notification
                showToastNotification('📋 Link Copied!', 'Package details link copied to clipboard. Share it with your client!');
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                alert(`Here is the link to share: ${shareUrl}`);
            }
        }
    });

    // Helper to render premium custom toast notifications
    function showToastNotification(title, message) {
        let container = document.getElementById('bookingToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'bookingToastContainer';
            container.className = 'booking-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'booking-toast';
        toast.style.borderLeftColor = 'var(--primary-gold)';
        toast.innerHTML = `
            <div class="toast-icon-box" style="color: var(--primary-gold); border-color: rgba(218, 165, 32, 0.3);">
                <i class="fa-solid fa-link"></i>
            </div>
            <div class="toast-content-box">
                <div class="toast-headline" style="color: white;">${title}</div>
                <div class="toast-sub" style="color: var(--text-muted); font-size: 10px; line-height: 1.3;">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        // Slide out after 5 seconds
        setTimeout(() => {
            toast.classList.add('slide-out');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 5000);
    }

    // --- 9. AUTO-SCROLL & HIGHLIGHT ON SHARED LINK ACCESS ---
    function handleSharedPackageLink() {
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(window.location.search);
        const pkgQuery = urlParams.get('pkg');
        
        if (!hash && !pkgQuery) return;
 
        const targetId = hash ? hash.substring(1) : pkgQuery;
        
        // Wait briefly to ensure dynamic visual-flyer-cards are fully rendered in DOM
        setTimeout(() => {
            const targetCard = document.getElementById(targetId);
            if (targetCard) {
                // Scroll smoothly to target card
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
 
                // Apply gold pulse highlight animation
                targetCard.classList.add('shared-highlight');
                
                // Open the detailed modal automatically
                if (typeof window.openDetailsModal === 'function') {
                    window.openDetailsModal(targetCard);
                }
                
                // Remove highlight class after animation finishes
                setTimeout(() => {
                    targetCard.classList.remove('shared-highlight');
                }, 4500); // 1.5s * 3 repeats
            }
        }, 300);
    }

    // Listen to hash change and window load events
    window.addEventListener('hashchange', handleSharedPackageLink);
    window.addEventListener('load', handleSharedPackageLink);
    // Also run immediately in case DOM is already loaded
    handleSharedPackageLink();

});

