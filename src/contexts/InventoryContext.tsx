import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UBS, Equipment, UBSSummary, EquipmentSummary, EquipmentType } from '@/types/inventory';
import { mockUBS, mockEquipment } from '@/data/mockData';

interface InventoryContextType {
  ubsList: UBS[];
  equipmentList: Equipment[];
  selectedUBS: string | null;
  setSelectedUBS: (id: string | null) => void;
  getUBSSummary: (ubsId: string) => UBSSummary | null;
  getAllSummaries: () => UBSSummary[];
  getEquipmentByUBS: (ubsId: string) => Equipment[];
  addUBS: (ubs: Omit<UBS, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUBS: (id: string, ubs: Partial<UBS>) => void;
  deleteUBS: (id: string) => void;
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'maintenanceLogs'>) => void;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  UBS: 'ubs-inventory-list',
  EQUIPMENT: 'equipment-inventory-list',
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ubsList, setUBSList] = useState<UBS[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedUBS, setSelectedUBS] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUBS = localStorage.getItem(STORAGE_KEYS.UBS);
    const storedEquipment = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);

    if (storedUBS) {
      setUBSList(JSON.parse(storedUBS));
    } else {
      setUBSList(mockUBS);
      localStorage.setItem(STORAGE_KEYS.UBS, JSON.stringify(mockUBS));
    }

    if (storedEquipment) {
      setEquipmentList(JSON.parse(storedEquipment));
    } else {
      setEquipmentList(mockEquipment);
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(mockEquipment));
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (ubsList.length > 0) {
      localStorage.setItem(STORAGE_KEYS.UBS, JSON.stringify(ubsList));
    }
  }, [ubsList]);

  useEffect(() => {
    if (equipmentList.length > 0) {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipmentList));
    }
  }, [equipmentList]);

  const getEquipmentByUBS = (ubsId: string): Equipment[] => {
    return equipmentList.filter((eq) => eq.ubsId === ubsId);
  };

  const getUBSSummary = (ubsId: string): UBSSummary | null => {
    const ubs = ubsList.find((u) => u.id === ubsId);
    if (!ubs) return null;

    const ubsEquipment = getEquipmentByUBS(ubsId);
    const equipmentTypes: EquipmentType[] = ['PC', 'Impressora', 'Monitor', 'Estabilizador', 'Scanner', 'Notebook', 'Roteador', 'Switch', 'Nobreak'];

    const equipmentByType: EquipmentSummary[] = equipmentTypes.map((type) => {
      const typeEquipment = ubsEquipment.filter((eq) => eq.type === type);
      return {
        type,
        total: typeEquipment.length,
        operational: typeEquipment.filter((eq) => eq.conservationState === 'Funcionando').length,
        maintenance: typeEquipment.filter((eq) => eq.conservationState === 'Manutenção').length,
        decommissioned: typeEquipment.filter((eq) => eq.conservationState === 'Sucata').length,
      };
    }).filter((summary) => summary.total > 0);

    return {
      ubs,
      totalEquipment: ubsEquipment.length,
      equipmentByType,
      equipmentByState: {
        operational: ubsEquipment.filter((eq) => eq.conservationState === 'Funcionando').length,
        maintenance: ubsEquipment.filter((eq) => eq.conservationState === 'Manutenção').length,
        decommissioned: ubsEquipment.filter((eq) => eq.conservationState === 'Sucata').length,
      },
    };
  };

  const getAllSummaries = (): UBSSummary[] => {
    return ubsList
      .map((ubs) => getUBSSummary(ubs.id))
      .filter((summary): summary is UBSSummary => summary !== null);
  };

  const addUBS = (ubs: Omit<UBS, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUBS: UBS = {
      ...ubs,
      id: `ubs-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUBSList((prev) => [...prev, newUBS]);
  };

  const updateUBS = (id: string, ubs: Partial<UBS>) => {
    setUBSList((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, ...ubs, updatedAt: new Date().toISOString() } : u
      )
    );
  };

  const deleteUBS = (id: string) => {
    setUBSList((prev) => prev.filter((u) => u.id !== id));
    setEquipmentList((prev) => prev.filter((eq) => eq.ubsId !== id));
  };

  const addEquipment = (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'maintenanceLogs'>) => {
    const newEquipment: Equipment = {
      ...equipment,
      id: `equip-${Date.now()}`,
      maintenanceLogs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEquipmentList((prev) => [...prev, newEquipment]);
  };

  const updateEquipment = (id: string, equipment: Partial<Equipment>) => {
    setEquipmentList((prev) =>
      prev.map((eq) =>
        eq.id === id ? { ...eq, ...equipment, updatedAt: new Date().toISOString() } : eq
      )
    );
  };

  const deleteEquipment = (id: string) => {
    setEquipmentList((prev) => prev.filter((eq) => eq.id !== id));
  };

  return (
    <InventoryContext.Provider
      value={{
        ubsList,
        equipmentList,
        selectedUBS,
        setSelectedUBS,
        getUBSSummary,
        getAllSummaries,
        getEquipmentByUBS,
        addUBS,
        updateUBS,
        deleteUBS,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
