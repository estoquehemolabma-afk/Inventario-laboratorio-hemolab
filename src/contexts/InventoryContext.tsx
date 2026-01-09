import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UBS, Equipment, UBSSummary, EquipmentSummary, EquipmentType } from '@/types/inventory';
import { supabase } from '@/integrations/supabase/client';

interface InventoryContextType {
  ubsList: UBS[];
  equipmentList: Equipment[];
  selectedUBS: string | null;
  setSelectedUBS: (id: string | null) => void;
  getUBSSummary: (ubsId: string) => UBSSummary | null;
  getAllSummaries: () => UBSSummary[];
  getEquipmentByUBS: (ubsId: string) => Equipment[];
  addUBS: (ubs: Omit<UBS, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUBS: (id: string, ubs: Partial<UBS>) => Promise<void>;
  deleteUBS: (id: string) => Promise<void>;
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'maintenanceLogs'>) => Promise<void>;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Helper to map database equipment type to local type
const mapEquipmentType = (type: string): EquipmentType => {
  const typeMap: Record<string, EquipmentType> = {
    'PC': 'PC',
    'Impressora': 'Impressora',
    'Monitor': 'Monitor',
    'Estabilizador': 'Estabilizador',
    'Scanner': 'Scanner',
    'Notebook': 'Notebook',
    'Roteador': 'Roteador',
    'Switch': 'Switch',
    'Nobreak': 'Nobreak',
  };
  return typeMap[type] || 'PC';
};

// Helper to map database conservation state to local type
const mapConservationState = (state: string): 'Funcionando' | 'Manutenção' | 'Sucata' => {
  const stateMap: Record<string, 'Funcionando' | 'Manutenção' | 'Sucata'> = {
    'Funcionando': 'Funcionando',
    'Manutenção': 'Manutenção',
    'Sucata': 'Sucata',
  };
  return stateMap[state] || 'Funcionando';
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ubsList, setUBSList] = useState<UBS[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedUBS, setSelectedUBS] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch UBS
      const { data: ubsData, error: ubsError } = await supabase
        .from('ubs')
        .select('*')
        .order('name');

      if (ubsError) throw ubsError;

      const mappedUBS: UBS[] = (ubsData || []).map((ubs) => ({
        id: ubs.id,
        name: ubs.name,
        address: ubs.address || '',
        responsible: ubs.responsible || '',
        phone: ubs.phone || undefined,
        email: ubs.email || undefined,
        createdAt: ubs.created_at,
        updatedAt: ubs.updated_at,
      }));

      setUBSList(mappedUBS);

      // Fetch Equipment
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (equipmentError) throw equipmentError;

      const mappedEquipment: Equipment[] = (equipmentData || []).map((eq) => ({
        id: eq.id,
        ubsId: eq.ubs_id,
        type: mapEquipmentType(eq.type),
        brand: eq.brand || '',
        model: eq.model || '',
        serialNumber: eq.serial_number || '',
        patrimonyNumber: eq.patrimony_number || '',
        location: eq.location,
        conservationState: mapConservationState(eq.conservation_state),
        installationDate: eq.installation_date || '',
        observations: eq.observations || '',
        maintenanceLogs: [],
        createdAt: eq.created_at,
        updatedAt: eq.updated_at,
      }));

      setEquipmentList(mappedEquipment);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

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

  const addUBS = async (ubs: Omit<UBS, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase.from('ubs').insert({
      name: ubs.name,
      address: ubs.address,
      responsible: ubs.responsible,
      phone: ubs.phone || null,
      email: ubs.email || null,
    });

    if (error) throw error;
    await refreshData();
  };

  const updateUBS = async (id: string, ubs: Partial<UBS>) => {
    const { error } = await supabase.from('ubs').update({
      name: ubs.name,
      address: ubs.address,
      responsible: ubs.responsible,
      phone: ubs.phone || null,
      email: ubs.email || null,
    }).eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  const deleteUBS = async (id: string) => {
    const { error } = await supabase.from('ubs').delete().eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const addEquipment = async (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'maintenanceLogs'>) => {
    const { error } = await supabase.from('equipment').insert({
      ubs_id: equipment.ubsId,
      type: equipment.type,
      brand: equipment.brand,
      model: equipment.model,
      serial_number: equipment.serialNumber,
      patrimony_number: equipment.patrimonyNumber,
      location: equipment.location,
      conservation_state: equipment.conservationState,
      installation_date: equipment.installationDate || null,
      observations: equipment.observations,
    });

    if (error) throw error;
    await refreshData();
  };

  const updateEquipment = async (id: string, equipment: Partial<Equipment>) => {
    const updateData: Record<string, unknown> = {};
    
    if (equipment.ubsId !== undefined) updateData.ubs_id = equipment.ubsId;
    if (equipment.type !== undefined) updateData.type = equipment.type;
    if (equipment.brand !== undefined) updateData.brand = equipment.brand;
    if (equipment.model !== undefined) updateData.model = equipment.model;
    if (equipment.serialNumber !== undefined) updateData.serial_number = equipment.serialNumber;
    if (equipment.patrimonyNumber !== undefined) updateData.patrimony_number = equipment.patrimonyNumber;
    if (equipment.location !== undefined) updateData.location = equipment.location;
    if (equipment.conservationState !== undefined) updateData.conservation_state = equipment.conservationState;
    if (equipment.installationDate !== undefined) updateData.installation_date = equipment.installationDate || null;
    if (equipment.observations !== undefined) updateData.observations = equipment.observations;

    const { error } = await supabase.from('equipment').update(updateData).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const deleteEquipment = async (id: string) => {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) throw error;
    await refreshData();
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
        loading,
        refreshData,
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
