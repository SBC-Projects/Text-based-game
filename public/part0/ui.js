export function updateOutput(text) {
  const output = document.getElementById('output');
  if (output) {
    output.textContent = text;
  }
}

export function clearTextArea() {
  const textarea = document.getElementById('textarea');
  if (textarea) {
    textarea.value = '';
  }
}

export function clearGeminiInput() {
  const geminiInput = document.getElementById('geminiInput');
  if (geminiInput) {
    geminiInput.value = '';
  }
}

export function appendBananaImage() {
  const img = document.createElement('img');
  img.src = 'images/BananaWalk.gif';
  img.style.position = 'absolute';
  img.style.left = '50%';
  img.style.top = '20%';
  img.style.transform = 'translateX(-50%)';
  document.body.appendChild(img);
}

export function setupUIHandlers({ onCommand, onGemini }) {
  const textarea = document.getElementById('textarea');
  const enterButton = document.getElementById('enterButton');
  const geminiInput = document.getElementById('geminiInput');
  const geminiButton = document.getElementById('geminiButton');

  if (textarea) {
    textarea.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const command = textarea.value;
        onCommand(command);
        clearTextArea();
      }
    });
  }

  if (enterButton && textarea) {
    enterButton.addEventListener('click', function() {
      const command = textarea.value;
      onCommand(command);
      clearTextArea();
    });
  }

  if (geminiInput && geminiButton) {
    geminiButton.addEventListener('click', function() {
      onGemini(geminiInput.value);
    });

    geminiInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        onGemini(geminiInput.value);
      }
    });
  }
}
