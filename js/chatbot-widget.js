(function () {
  var CHATBOT_SUPABASE_URL = "https://dlwywhbvxgjpceugvmkd.supabase.co";
  var CHATBOT_SUPABASE_KEY = "sb_publishable_A_Nqa9U-4fAv5dRTdatFoA_h7o_xT6-";

  if (typeof supabase === "undefined") {
    console.error("Chatbot widget: Supabase library not loaded.");
    return;
  }

  var chatbotSupabaseClient = supabase.createClient(CHATBOT_SUPABASE_URL, CHATBOT_SUPABASE_KEY);

  var toggleBtn = document.getElementById("chatbotToggle");
  var panel = document.getElementById("chatbotPanel");
  var closeBtn = document.getElementById("chatbotClose");
  var messagesEl = document.getElementById("chatbotMessages");
  var form = document.getElementById("chatbotForm");
  var input = document.getElementById("chatbotInput");

  if (!toggleBtn || !panel || !messagesEl || !form || !input) return;

  var faqs = [];
  var greeted = false;

  async function loadFaqs() {
    try {
      var result = await chatbotSupabaseClient
        .from("chatbot_faqs")
        .select("question, keywords, answer, category");

      if (result.error) {
        console.error("Chatbot FAQ load error:", result.error);
        return;
      }
      faqs = result.data || [];
    } catch (err) {
      console.error("Chatbot FAQ load exception:", err);
    }
  }

  loadFaqs();

  function addMessage(html, sender) {
    var msg = document.createElement("div");
    msg.className = "chatbot-msg " + sender;
    msg.innerHTML = html;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function showTyping() {
    var typing = document.createElement("div");
    typing.className = "chatbot-typing";
    typing.id = "chatbotTyping";
    typing.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    var typing = document.getElementById("chatbotTyping");
    if (typing) typing.remove();
  }

  function findBestMatch(userMessage) {
    var message = userMessage.toLowerCase().trim();
    var best = null;
    var bestScore = 0;

    faqs.forEach(function (faq) {
      if (!faq.keywords) return;

      var keywords = faq.keywords
        .split(",")
        .map(function (k) { return k.trim().toLowerCase(); })
        .filter(Boolean);

      var score = 0;
      keywords.forEach(function (keyword) {
        if (message.includes(keyword)) score++;
      });

      if (score > bestScore) {
        bestScore = score;
        best = faq;
      }
    });

    return bestScore > 0 ? best : null;
  }

  function handleUserMessage(text) {
    addMessage(escapeHtml(text), "user");
    showTyping();

    setTimeout(function () {
      hideTyping();
      var match = findBestMatch(text);

      if (match) {
        addMessage(escapeHtml(match.answer), "bot");
      } else {
        addMessage(
          "معذرت، مجھے اس سوال کا صحیح جواب نہیں مل سکا۔ براہ کرم ہم سے براہ راست رابطہ کریں۔" +
          '<br><a href="https://wa.me/923006027667" target="_blank" rel="noopener noreferrer" class="chatbot-whatsapp-link">WhatsApp Us</a>',
          "bot"
        );
      }
    }, 400);
  }

  toggleBtn.addEventListener("click", function () {
    var isOpen = panel.classList.toggle("open");
    toggleBtn.setAttribute("aria-expanded", isOpen);

    if (isOpen && !greeted) {
      greeted = true;
      addMessage(
        "السلام علیکم! میں Asraa School System کا AI اسسٹنٹ ہوں۔ آپ فیس، داخلہ، ٹائمنگ یا کسی بھی چیز کے بارے میں پوچھ سکتے ہیں۔",
        "bot"
      );
    }

    if (isOpen) input.focus();
  });

  closeBtn.addEventListener("click", function () {
    panel.classList.remove("open");
    toggleBtn.setAttribute("aria-expanded", "false");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    handleUserMessage(text);
  });
})();
