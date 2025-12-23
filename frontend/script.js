document.addEventListener('DOMContentLoaded', () => {
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  const pullHandle = document.getElementById('pullHandle');
  const langList = document.getElementById('langList');
  const chatStage = document.getElementById('chatStage');
  const stageEl = document.getElementById('stage');
  const selectedLangLabel = document.getElementById('selectedLangLabel');
  const chatBody = document.getElementById('chatBody');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const micBtn = document.getElementById('micBtn');

  const greetings = {
    en: ["Hi there 👋 I’m your AI Assistant.", "Please choose your language to continue."],
    es: ["¡Hola! 👋 Soy tu asistente de IA.", "Por favor, selecciona tu idioma."],
    ne: ["नमस्ते 👋 म तपाईंको AI सहायक हुँ।", "कृपया भाषा चयन गर्नुहोस्।"],
    hi: ["नमस्ते 👋 मैं आपका AI सहायक हूँ।", "कृपया अपनी भाषा चुनें।"],
    fr: ["Bonjour 👋 Je suis votre assistant IA.", "Veuillez choisir votre langue."]
  };

  const langMap = {
    en: 'en-US',
    es: 'es-ES',
    ne: 'ne-NP',
    hi: 'hi-IN',
    fr: 'fr-FR'
  };

  async function typewriter(el, text, speed = 40) {
    el.textContent = "";
    for (let i = 0; i < text.length; i++) {
      el.textContent += text.charAt(i);
      await new Promise(r => setTimeout(r, speed));
    }
  }

  async function startGreeting() {
    const greetingLines = greetings.en;
    await typewriter(line1, greetingLines[0]);
    speak(greetingLines[0], 'en-US');
    await new Promise(r => setTimeout(r, 400));
    await typewriter(line2, greetingLines[1]);
    speak(greetingLines[1], 'en-US');
  }
  startGreeting();

  pullHandle.addEventListener('click', () => {
    langList.classList.toggle('show');
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const lang = btn.dataset.lang;
      const label = btn.textContent.trim();
      selectedLangLabel.textContent = label;
      await transitionToChat(lang);
    });
  });

  async function transitionToChat(lang) {
    stageEl.style.opacity = '0';
    setTimeout(() => {
      stageEl.style.display = 'none';
      chatStage.classList.add('active');
      addAiMessage(`Welcome! How can I assist you today?`, true);
      speak(`Welcome! How can I assist you today?`, langMap[lang]);
    }, 600);
  }

  chatForm.addEventListener('submit', async e => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    userInput.value = '';

    try {
      const res = await fetch('http://localhost:3001/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });

      const data = await res.json();
      addAiMessage(data.answer || 'No answer found.', true);
      speak(data.answer || 'No answer found.');
    } catch (error) {
      console.error('Error:', error);
      addAiMessage('⚠️ Error connecting to the server.');
    }
  });

  function addAiMessage(msg, animate = false) {
    const el = document.createElement('div');
    el.className = 'msg ai';
    el.textContent = msg;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;

    if (animate) {
      el.classList.add('ai-speaking');
      setTimeout(() => el.classList.remove('ai-speaking'), msg.length * 50 + 1000);
    }
  }

  function addUserMessage(msg) {
    const el = document.createElement('div');
    el.className = 'msg user';
    el.textContent = msg;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // 💖 SWEET VOICE
  function speak(text, langCode = 'en-US') {
    if (!('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.pitch = 1.3;
    utterance.rate = 0.95;
    utterance.volume = 1.0;

    const speakNow = () => {
      const voices = synth.getVoices();
      const preferredVoice = voices.find(v =>
        /Google UK English Female|Google US English|Microsoft Zira|Samantha|Amelie|Ava|Microsoft Heera/i.test(v.name)
      );
      utterance.voice =
        preferredVoice ||
        voices.find(v => v.lang.startsWith(langCode.split('-')[0])) ||
        voices[0];
      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) synth.onvoiceschanged = () => speakNow();
    else speakNow();
  }

  // 🎙️ REAL-TIME VOICE TYPING
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    micBtn.addEventListener('click', () => {
      try {
        recognition.start();
        micBtn.classList.add('listening');
        addAiMessage("🎙️ Listening…");
      } catch (err) {
        console.error("Mic error:", err);
      }
    });

    recognition.addEventListener('result', e => {
      let liveText = '';
      for (const result of e.results) {
        liveText += result[0].transcript;
      }
      userInput.value = liveText; // 💬 live typing while speaking

      // when done speaking, auto send
      if (e.results[0].isFinal) {
        micBtn.classList.remove('listening');
        chatForm.dispatchEvent(new Event('submit'));
      }
    });

    recognition.addEventListener('end', () => {
      micBtn.classList.remove('listening');
    });

    recognition.addEventListener('error', e => {
      console.error('Voice error:', e.error);
      micBtn.classList.remove('listening');
      addAiMessage('⚠️ Voice recognition error. Please allow microphone access.');
    });
  } else {
    micBtn.disabled = true;
    micBtn.title = "Voice not supported in this browser";
  }
});
