// contexts/EcommerceContext.tsx
"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';

interface EcommerceState {
  // سلة التسوق
  cart: {
    items: any[];
    total: number;
    count: number;
  };

  // المنتجات
  products: {
    currentCategory: string | null;
    filters: any;
    sortBy: string;
    viewMode: 'grid' | 'list';
  };

  // UI خاصة بالمتجر
  ui: {
    isCartOpen: boolean;
    isSearchOpen: boolean;
    quickViewProduct: any | null;
  };

  // السكرول (الخاص بيك)
  scroll: {
    isScrolled: boolean;
    isScrolledFar: boolean;
    lastScrollY: number;
  };
  aside: {
    isAsideOpen: boolean;
  };
}

interface EcommerceContextType extends EcommerceState {
  // دوال السلة
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // دوال المنتجات
  setCategory: (category: string) => void;
  setFilters: (filters: any) => void;
  setSortBy: (sort: string) => void;
  toggleViewMode: () => void;

  // دوال UI
  toggleCart: () => void;
  toggleSearch: () => void;
  openQuickView: (product: any) => void;
  closeQuickView: () => void;

  // دوال السكرول
  updateScroll: (scrollY: number) => void;
  toggleAside: () => void;
}

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

export function EcommerceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EcommerceState>({
    cart: {
      items: [],
      total: 0,
      count: 0,
    },
    products: {
      currentCategory: null,
      filters: {},
      sortBy: 'newest',
      viewMode: 'grid',
    },
    ui: {
      isCartOpen: false,
      isSearchOpen: false,
      quickViewProduct: null,
    },
    scroll: {
      isScrolled: false,
      isScrolledFar: false,
      lastScrollY: 0,
    },
    aside: {
      isAsideOpen: false,
    },
  });

  // حساب total و count تلقائياً
  useEffect(() => {
    const total = state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

    setState(prev => ({
      ...prev,
      cart: {
        ...prev.cart,
        total,
        count,
      }
    }));
  }, [state.cart.items]);

  // دوال السلة
  const addToCart = (product: any) => {
    setState(prev => {
      const existingItem = prev.cart.items.find(item => item.id === product.id);

      if (existingItem) {
        return {
          ...prev,
          cart: {
            ...prev.cart,
            items: prev.cart.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }
        };
      }

      return {
        ...prev,
        cart: {
          ...prev.cart,
          items: [...prev.cart.items, { ...product, quantity: 1 }],
        }
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setState(prev => ({
      ...prev,
      cart: {
        ...prev.cart,
        items: prev.cart.items.filter(item => item.id !== productId),
      }
    }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setState(prev => ({
      ...prev,
      cart: {
        ...prev.cart,
        items: prev.cart.items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        ),
      }
    }));
  };

  const clearCart = () => {
    setState(prev => ({
      ...prev,
      cart: {
        items: [],
        total: 0,
        count: 0,
      }
    }));
  };

  // دوال المنتجات
  const setCategory = (category: string) => {
    setState(prev => ({
      ...prev,
      products: { ...prev.products, currentCategory: category }
    }));
  };

  const setFilters = (filters: any) => {
    setState(prev => ({
      ...prev,
      products: { ...prev.products, filters }
    }));
  };

  const setSortBy = (sortBy: string) => {
    setState(prev => ({
      ...prev,
      products: { ...prev.products, sortBy }
    }));
  };

  const toggleViewMode = () => {
    setState(prev => ({
      ...prev,
      products: {
        ...prev.products,
        viewMode: prev.products.viewMode === 'grid' ? 'list' : 'grid'
      }
    }));
  };

  // دوال UI
  const toggleCart = () => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, isCartOpen: !prev.ui.isCartOpen }
    }));
  };

  const toggleSearch = () => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, isSearchOpen: !prev.ui.isSearchOpen }
    }));
  };

  const openQuickView = (product: any) => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, quickViewProduct: product }
    }));
  };

  const closeQuickView = () => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, quickViewProduct: null }
    }));
  };

  // دوال السكرول
  const updateScroll = (scrollY: number) => {
    setState(prev => ({
      ...prev,
      scroll: {
        isScrolled: scrollY > 0,
        isScrolledFar: scrollY > 1100,
        lastScrollY: scrollY,
      }
    }));
  };

  const toggleAside = () => {
    setState(prev => ({
      ...prev,
      aside: { ...prev.aside, isAsideOpen: !prev.aside.isAsideOpen }
    }));
  };

  // إضافة listener السكرول
  useEffect(() => {
    const mainElement = document.querySelector('.main-element');
    if (!mainElement) return;

    const handleScroll = () => updateScroll(mainElement.scrollTop);
    mainElement.addEventListener('scroll', handleScroll);
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <EcommerceContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setCategory,
      setFilters,
      setSortBy,
      toggleViewMode,
      toggleCart,
      toggleSearch,
      openQuickView,
      closeQuickView,
      updateScroll,
      toggleAside,
    }}>
      {children}
    </EcommerceContext.Provider>
  );
}

export function useEcommerce() {
  const context = useContext(EcommerceContext);
  if (context === undefined) {
    throw new Error('useEcommerce must be used within EcommerceProvider');
  }
  return context;
}

// Hooks مساعدة
export function useCart() {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useEcommerce();
  return { cart, addToCart, removeFromCart, updateQuantity, clearCart };
}

export function useProducts() {
  const { products, setCategory, setFilters, setSortBy, toggleViewMode } = useEcommerce();
  return { ...products, setCategory, setFilters, setSortBy, toggleViewMode };
}

export function useEcommerceUI() {
  const { ui, toggleCart, toggleSearch, openQuickView, closeQuickView } = useEcommerce();
  return { ...ui, toggleCart, toggleSearch, openQuickView, closeQuickView };
}

export function useEcommerceScroll() {
  const { scroll } = useEcommerce();
  return scroll;
}

export function useAside() {
  const { aside, toggleAside } = useEcommerce();
  return { ...aside, toggleAside };
}
