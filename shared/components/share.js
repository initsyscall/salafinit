const Share = (() => {
  function copyText(text, opts = {}) {
    const { btn, toast, btnDuration = 2000 } = opts;
    navigator.clipboard.writeText(text).then(() => {
      if (btn) showBtnFeedback(btn, btnDuration);
      Utils.showToast(toast || 'Copied to clipboard!');
    }).catch(() => {
      Utils.showToast('Failed to copy', 'error');
    });
  }

  function copyLink(hash, opts = {}) {
    const url = `${window.location.origin}${window.location.pathname}${hash}`;
    copyText(url, { ...opts, toast: opts.toast || 'Link copied!' });
  }

  function showBtnFeedback(btn, duration = 2000) {
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    setTimeout(() => { btn.innerHTML = orig; }, duration);
  }

  async function captureImage(element, filename, opts = {}) {
    const { scale = 2, captureClass, onBefore, onAfter, toast } = opts;
    try {
      if (typeof snapdom === 'undefined') {
        Utils.showToast('Image capture not available', 'error');
        return false;
      }
      document.getSelection()?.removeAllRanges();
      if (onBefore) onBefore(element);
      if (captureClass) element.classList.add(captureClass);
      const img = await snapdom.toPng(element, { scale });
      const a = document.createElement('a');
      a.href = img.src;
      a.download = filename;
      a.click();
      Utils.showToast(toast || 'Image downloaded!');
      return true;
    } catch (err) {
      console.error('Share image error:', err);
      Utils.showToast('Failed to generate image', 'error');
      return false;
    } finally {
      if (captureClass) element.classList.remove(captureClass);
      if (onAfter) onAfter(element);
    }
  }

  return { copyText, copyLink, captureImage, showBtnFeedback };
})();

window.Share = Share;
