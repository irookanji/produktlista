import { useSignals } from "@preact/signals-react/runtime";

import { BottomNav } from "./components/BottomNav.tsx";
import { MasterList } from "./components/MasterList.tsx";
import { ShoppingList } from "./components/ShoppingList.tsx";
import { activeTab$ } from "./store/groceryStore.ts";
import { shareFeedback$ } from "./store/householdSync.ts";

const App = () => {
  useSignals();

  const activeTab = activeTab$.value;
  const shareFeedback = shareFeedback$.value;

  return (
    <div className="min-h-dvh bg-page">
      <div className="relative mx-auto flex h-dvh w-full max-w-app flex-col overflow-hidden bg-surface shadow-app">
        {activeTab === "master" ? <MasterList /> : <ShoppingList />}
        <BottomNav />
        {shareFeedback ? (
          <p
            role="status"
            className="pointer-events-none absolute inset-x-lg bottom-[calc(var(--spacing-nav)+var(--spacing-lg))] z-overlay rounded-pill bg-ink px-xl py-sm text-center text-step font-semibold text-surface"
          >
            {shareFeedback === "copied" ? "Link copied" : "Couldn't copy link"}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default App;
