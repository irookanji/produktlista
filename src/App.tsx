import { useSignals } from "@preact/signals-react/runtime";

import { BottomNav } from "./components/BottomNav.tsx";
import { MasterList } from "./components/MasterList.tsx";
import { ShoppingList } from "./components/ShoppingList.tsx";
import { activeTab$ } from "./store/groceryStore.ts";

const App = () => {
  useSignals();

  const activeTab = activeTab$.value;

  return (
    <div className="min-h-dvh bg-page">
      <div className="mx-auto flex h-dvh w-full max-w-app flex-col overflow-hidden bg-surface shadow-app">
        {activeTab === "master" ? <MasterList /> : <ShoppingList />}
        <BottomNav />
      </div>
    </div>
  );
};

export default App;
