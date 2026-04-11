export const toast = {
  notify(message, type = 'success') {
    const event = new CustomEvent('showToast', { detail: { message, type } });
    window.dispatchEvent(event);
  },
  success(message) {
    this.notify(message, 'success');
  },
  error(message) {
    this.notify(message, 'error');
  }
};
