import { useEffect, useMemo, useState } from 'react';
import { SaleItem } from '../types';
import { toast } from 'sonner';

const ITEMS_STORAGE_KEY = 'sale-note-items';
const BUSINESS_NAME_STORAGE_KEY = 'sale-note-business-name';
const DEFAULT_BUSINESS_NAME = 'MI NEGOCIO';

export const useSaleNote = () => {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [businessName, setBusinessName] = useState(DEFAULT_BUSINESS_NAME);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const initialState: SaleItem[] = [
    {
      id: crypto.randomUUID(),
      quantity: 1,
      description: '',
      price: 0,
    },
  ];

  useEffect(() => {
    const savedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
    const savedBusinessName = localStorage.getItem(BUSINESS_NAME_STORAGE_KEY);

    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (error) {
        toast.error('Failed to load saved items. Starting with an empty list.');
        setItems(initialState);
      }
    } else {
      setItems(initialState);
    }

    if (savedBusinessName) {
      setBusinessName(savedBusinessName);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(BUSINESS_NAME_STORAGE_KEY, businessName);
    }
  }, [items, businessName, isHydrated]);

  const addItem = (item: Omit<SaleItem, 'id'>) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
    };

    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, updatedItem: SaleItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? updatedItem : item)),
    );
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const clearNote = () => {
    setItems(initialState);
  };

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  }, [items]);

  return {
    items,
    businessName,
    total,
    addItem,
    updateItem,
    removeItem,
    setBusinessName,
    isHydrated,
    clearNote
  };
};
