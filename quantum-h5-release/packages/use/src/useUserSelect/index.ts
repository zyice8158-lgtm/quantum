/** 拖动时禁用选中 */
export const useUserSelect = () => {
  let lastUserSelect = '';
  const onStartUserSelect = () => {
    if (window.getComputedStyle(document.body).userSelect != 'none') {
      lastUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = 'none';
    }
  };
  const onEndUserSelect = () => {
    document.body.style.userSelect = lastUserSelect;
  };
  return {
    onStartUserSelect,
    onEndUserSelect,
  };
};