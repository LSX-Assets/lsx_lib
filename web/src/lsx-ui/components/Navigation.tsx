import { createContext, useContext, useRef } from "react";
import { create, StoreApi, useStore } from "zustand";
import {SegmentedControl, SegmentProps} from "./SegmentedControl";

export type NavigationStore = {
  pageId: string;
}

export const NavigationContext = createContext<StoreApi<NavigationStore> | null>(null);

export function useNavigation<T>(selector: (state: NavigationStore) => T){
  const navigation = useContext(NavigationContext);
  if(!navigation){
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return useStore(navigation, selector);
}

// Hook to get the store API for setting state
export function useNavigationStore(){
  const navigation = useContext(NavigationContext);
  if(!navigation){
    throw new Error('useNavigationStore must be used within a NavigationProvider');
  }
  return navigation;
}

export function NavigationProvider({ children, defaultPage }: { children: React.ReactNode, defaultPage?: string }){
  const storeRef = useRef<StoreApi<NavigationStore>>(
    create<NavigationStore>(() => ({
      pageId: defaultPage || 'home',
    }))
  );

  return (
    <NavigationContext.Provider value={storeRef.current}>
      {children}
    </NavigationContext.Provider>
  );
}

export function NavBar(props: {
  items: SegmentProps[];
}){
  const pageId = useNavigation((state) => state.pageId);
  const store = useNavigationStore();
  
  return (
    <SegmentedControl
      sounds
      w='100%'
      value={pageId}
      items={props.items}
      onChange={(value) => {
        store.setState({ pageId: value as string });
      }}
    />
  )
}