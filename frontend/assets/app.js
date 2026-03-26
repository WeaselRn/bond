/**
 * Bond Escrow — Shared frontend utility functions
 */

// updateStepperState: highlight the correct step
window.updateStepperState = function (currentState) {
  const ORDER = ['CREATED', 'FUNDED', 'DELIVERED', 'CONFIRMED', 'RELEASED'];
  const idx = ORDER.indexOf(currentState);
  document.querySelectorAll('.stepper .step').forEach((el) => {
    const s = el.dataset.state;
    const sIdx = ORDER.indexOf(s);
    el.classList.remove('active', 'done');
    if (s === currentState) el.classList.add('active');
    else if (sIdx < idx) el.classList.add('done');
  });
  document.querySelectorAll('.stepper .step-line').forEach((el, i) => {
    el.classList.toggle('done-line', i < idx);
  });
};
