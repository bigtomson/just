const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const statusText = document.getElementById("status");
const output = document.getElementById("output");
const langSelect = document.getElementById("lang");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let finalTranscript = "";

function setStatus(message) {
  statusText.textContent = `状态：${message}`;
}

function initRecognition() {
  if (!SpeechRecognition) {
    setStatus("当前浏览器不支持语音识别，请使用 Chrome 最新版本");
    startBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = langSelect.value;

  recognition.onstart = () => {
    setStatus("正在采集语音...");
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  recognition.onresult = (event) => {
    let interim = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += `${transcript}\n`;
      } else {
        interim += transcript;
      }
    }

    output.value = `${finalTranscript}${interim}`.trim();
  };

  recognition.onerror = (event) => {
    const messages = {
      "not-allowed": "未获得麦克风权限，请在地址栏中允许麦克风访问",
      "audio-capture": "未检测到麦克风设备",
      network: "网络异常导致识别中断",
      "no-speech": "未检测到语音，请重试",
    };
    setStatus(messages[event.error] || `识别失败：${event.error}`);
  };

  recognition.onend = () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    if (!statusText.textContent.includes("失败")) {
      setStatus("已停止");
    }
  };
}

startBtn.addEventListener("click", () => {
  if (!recognition) {
    initRecognition();
  }

  if (recognition) {
    recognition.lang = langSelect.value;
    recognition.start();
  }
});

stopBtn.addEventListener("click", () => {
  recognition?.stop();
});

copyBtn.addEventListener("click", async () => {
  if (!output.value.trim()) {
    setStatus("暂无可复制文本");
    return;
  }

  try {
    await navigator.clipboard.writeText(output.value);
    setStatus("已复制到剪贴板");
  } catch {
    setStatus("复制失败，请手动复制");
  }
});

clearBtn.addEventListener("click", () => {
  finalTranscript = "";
  output.value = "";
  setStatus("结果已清空");
});

initRecognition();
