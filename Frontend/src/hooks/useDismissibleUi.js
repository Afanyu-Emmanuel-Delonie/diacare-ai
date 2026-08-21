import { useCallback, useState } from 'react';
import { isUiItemDismissed, persistUiItemDismissal } from '../utils/uiStateStorage.js';

function useDismissibleUi(scope, id) {
  const [dismissed, setDismissed] = useState(() => isUiItemDismissed(scope, id));

  const dismiss = useCallback(() => {
    persistUiItemDismissal(scope, id);
    setDismissed(true);
  }, [id, scope]);

  return { dismissed, dismiss };
}

export default useDismissibleUi;

