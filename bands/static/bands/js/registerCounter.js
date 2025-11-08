// Select all member blocks
const memberBlocks = document.querySelectorAll('.member-block');

memberBlocks.forEach(block => {
  const plusBtn = block.querySelector('.plus');
  const minusBtn = block.querySelector('.minus');
  const valueSpan = block.querySelector('.drummer-value');
  const hiddenInput = block.querySelector('.drummer');

  plusBtn.addEventListener('click', () => {
    let val = parseInt(valueSpan.textContent, 10);
    val = (isNaN(val) ? 0 : val) + 1;
    const paddedVal = val.toString().padStart(2, '0');
    valueSpan.textContent = paddedVal;
    hiddenInput.value = paddedVal;
  });

  minusBtn.addEventListener('click', () => {
    let val = parseInt(valueSpan.textContent, 10);
    val = (isNaN(val) ? 0 : val) - 1;
    val = Math.max(0, val); // prevent negative
    const paddedVal = val.toString().padStart(2, '0');
    valueSpan.textContent = paddedVal;
    hiddenInput.value = paddedVal;
  });
});
