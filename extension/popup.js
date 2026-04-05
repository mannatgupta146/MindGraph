(function() {
  "use strict";

  document.addEventListener('DOMContentLoaded', async () => {
    const elements = {
      tabTitle: document.getElementById('tab-title'),
      tabUrl: document.getElementById('tab-url'),
      tabImage: document.getElementById('tab-image'),
      tabType: document.getElementById('tab-type'),
      saveBtn: document.getElementById('save-btn'),
      message: document.getElementById('message'),
      captureInterface: document.getElementById('capture-interface'),
      authInterface: document.getElementById('auth-interface'),
      loginBtn: document.getElementById('login-redirect-btn')
    };

    const API_BASE = 'http://localhost:3000/api';
    
    // 🛡️ NEURAL CONTEXT GUARD (Resilient Storage Bridge)
    const storage = (typeof chrome !== 'undefined' && chrome.storage) ? chrome.storage.local : {
      get: (key) => Promise.resolve({ [key]: localStorage.getItem(key) }),
      set: (obj) => Promise.resolve(Object.keys(obj).forEach(k => localStorage.setItem(k, obj[k]))),
      remove: (key) => Promise.resolve(localStorage.removeItem(key))
    };

    // 🧠 GLOBAL STATE (Isolated inside IIFE)
    let currentMode = 'auto'; 
    let selectedFile = null;
    let currentTab = null;
    let metadata = {
      title: '',
      url: '',
      type: 'article',
      domain: '',
      source: 'Chrome',
      imageUrl: '',
      content: ''
    };

    // 🖱️ UI EVENT REGISTRATION
    if (elements.loginBtn) {
      elements.loginBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:5173/login' });
      });
    }

    // 🔗 NEURAL PIN PAIRING LOGIC
    const verifyPinBtn = document.getElementById('verify-pin-btn');
    const pinInput = document.getElementById('pairing-pin-input');

    if (verifyPinBtn && pinInput) {
      verifyPinBtn.addEventListener('click', async () => {
        const pin = pinInput.value.trim();
        if (pin.length !== 6) {
          elements.message.textContent = 'Enter 6 Digits 🛰️';
          elements.message.className = 'feedback error';
          return;
        }

        verifyPinBtn.disabled = true;
        verifyPinBtn.textContent = 'Syncing...';

        try {
          const res = await fetch(`${API_BASE}/auth/verify-pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
          });
          const data = await res.json();

          if (res.ok && data.token) {
            await storage.set({ token: data.token });
            elements.message.textContent = 'Neural Link Established ✅';
            elements.message.className = 'feedback success';
            setTimeout(() => window.location.reload(), 1000);
          } else {
            throw new Error(data.message || 'Invalid PIN');
          }
        } catch (err) {
          elements.message.textContent = err.message;
          elements.message.className = 'feedback error';
          verifyPinBtn.disabled = false;
          verifyPinBtn.textContent = 'Connect Instantly';
        }
      });
    }

    const modeBtns = document.querySelectorAll('.mode-btn');
    const captureSections = {
      auto: document.getElementById('section-auto'),
      manual: document.getElementById('section-manual'),
      file: document.getElementById('section-file')
    };

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetMode = btn.getAttribute('data-mode');
        
        // Toggle Buttons
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Toggle Sections
        Object.keys(captureSections).forEach(mode => {
          if (captureSections[mode]) {
            if (mode === targetMode) {
              captureSections[mode].classList.remove('hidden');
            } else {
              captureSections[mode].classList.add('hidden');
            }
          }
        });

        currentMode = targetMode;
        elements.message.textContent = '';
        elements.saveBtn.disabled = (currentMode === 'file' && !selectedFile);
      });
    });

    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const fileNameDisplay = document.getElementById('file-name');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
          fileNameDisplay.textContent = `Ready: ${selectedFile.name}`;
          elements.saveBtn.disabled = false;
        }
      });
    }

    // 1. Proactive Identity Check (Startup Handshake)
    // Initially hide everything for a clean check
    elements.captureInterface.classList.add('hidden');
    elements.authInterface.classList.add('hidden');

    const { token } = await storage.get('token');
    
    if (!token) {
      showAuthInterface();
    } else {
      elements.captureInterface.classList.remove('hidden');
      // Show mode nav
      const nav = document.querySelector('.mode-nav');
      if (nav) nav.classList.remove('hidden');
    }

    if (!token) return;

    // 2. Initialize Neural Link (Detect Active Tab & Scrape)
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0) {
        currentTab = tabs[0];
        metadata.title = currentTab.title || "No Title Found";
        metadata.url = currentTab.url || '';
        
        if (!metadata.url.startsWith("chrome://") && !metadata.url.startsWith("about:")) {
          metadata.domain = new URL(metadata.url).hostname;
          
          if (metadata.domain.includes('youtube.com') || metadata.domain.includes('youtu.be')) {
            metadata.type = 'youtube';
            metadata.source = 'YouTube';
          } else if (metadata.domain.includes('twitter.com') || metadata.domain.includes('x.com')) {
            metadata.type = 'tweet';
            metadata.source = 'Twitter';
          } else if (metadata.url.match(/\.pdf$/i) || metadata.domain.includes('pdf')) {
            metadata.type = 'pdf';
          }

          elements.tabTitle.textContent = metadata.title;
          elements.tabUrl.textContent = metadata.url;
          elements.tabType.textContent = metadata.type;

          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            func: () => {
              const getMeta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.content;
              const img = document.querySelector('img');
              const selection = window.getSelection().toString().trim();
              return {
                ogImage: getMeta('og:image'),
                twitterImage: getMeta('twitter:image'),
                firstImg: img ? img.src : null,
                selection: selection
              };
            }
          }, (results) => {
            if (results && results[0] && results[0].result) {
              const data = results[0].result;
              if (data.selection) metadata.content = data.selection;
              
              if (metadata.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                metadata.type = 'image';
                metadata.imageUrl = metadata.url;
              } else {
                metadata.imageUrl = data.ogImage || data.twitterImage || data.firstImg || '';
              }
          if (metadata.imageUrl) elements.tabImage.style.backgroundImage = `url("${metadata.imageUrl}")`;
          elements.tabType.textContent = metadata.type;
        }
      });
    } else {
      // 🚨 Handle Unsupported Page (Chrome Settings, Blank Tab, etc.)
      elements.tabTitle.textContent = "Unsupported Page";
      elements.tabUrl.textContent = "Open a website to save it to MindGraph.";
      elements.tabType.textContent = "Inactive";
      elements.saveBtn.disabled = true;
      elements.saveBtn.querySelector('.btn-text').textContent = "Visit a Site to Save";
    }
  } else {
    // 🚨 Handle Entirely Empty State
    elements.tabTitle.textContent = "No Data Found";
    elements.tabUrl.textContent = "Navigate to a page to capture it.";
    elements.saveBtn.disabled = true;
  }
} catch (err) {
      console.warn('[Neural Link] Handshake partial:', err.message);
    }

    // 3. Unified Siphon Action
    elements.saveBtn.addEventListener('click', async () => {
      elements.saveBtn.disabled = true;
      elements.saveBtn.querySelector('.btn-text').textContent = 'Siphoning...';
      elements.message.textContent = '';

      try {
        const { token } = await storage.get('token');
        let payload;
        let headers = { 'Authorization': `Bearer ${token}` };

        if (currentMode === 'file') {
          const fileTitle = document.getElementById('file-title').value.trim() || selectedFile.name;
          payload = new FormData();
          payload.append('file', selectedFile);
          payload.append('title', fileTitle);
          payload.append('type', selectedFile.type.includes('pdf') ? 'pdf' : 'image');
        } else {
          headers['Content-Type'] = 'application/json';
          if (currentMode === 'manual') {
            const manualUrl = document.getElementById('manual-url').value.trim();
            const manualTitle = document.getElementById('manual-title').value.trim() || 'Manual Ingestion';
            
            if (!manualUrl) {
              elements.message.textContent = 'URL Required 🛰️';
              elements.message.className = 'feedback error';
              elements.saveBtn.disabled = false;
              elements.saveBtn.querySelector('.btn-text').textContent = 'Save to MindGraph';
              return;
            }

            metadata.url = manualUrl;
            metadata.title = manualTitle;
            metadata.type = 'article';
          } else if (currentMode === 'auto') {
            const customAutoTitle = document.getElementById('auto-title').value.trim();
            if (customAutoTitle) {
              metadata.title = customAutoTitle;
            }
          }
          payload = JSON.stringify(metadata);
        }

        const response = await fetch(`${API_BASE}/items/save`, {
          method: 'POST',
          headers: headers,
          body: payload
        });

        if (response.status === 401) {
          showAuthInterface();
          return;
        }

        if (response.ok) {
          elements.message.className = 'feedback success';
          elements.message.textContent = 'Saved Successfully ✅';
          setTimeout(() => window.close(), 1500);
        } else {
          throw new Error('Sync Error');
        }
      } catch (err) {
        elements.message.className = 'feedback error';
        elements.message.textContent = 'Save Failed ❌';
        elements.saveBtn.disabled = false;
        elements.saveBtn.querySelector('.btn-text').textContent = 'Try Again';
      }
    });

    function showAuthInterface() {
      elements.captureInterface.classList.add('hidden');
      elements.authInterface.classList.remove('hidden');
      const nav = document.querySelector('.mode-nav');
      if (nav) nav.classList.add('hidden');
    }
  });
})();
