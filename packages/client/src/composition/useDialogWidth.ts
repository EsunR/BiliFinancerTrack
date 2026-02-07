export function useDialogWidth(maxWidth = 400) {
  const dialogWidth = ref(0);

  const updateDialogWidth = () => {
    const width = window.innerWidth;
    dialogWidth.value = width < maxWidth ? width - 40 : maxWidth;
  };

  onMounted(() => {
    updateDialogWidth();
    window.addEventListener('resize', updateDialogWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateDialogWidth);
  });

  return dialogWidth;
}
