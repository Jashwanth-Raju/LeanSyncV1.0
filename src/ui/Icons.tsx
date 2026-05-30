import { FaBoxOpen, FaCalendarAlt, FaChartLine, FaClipboardCheck, FaCogs, FaHandsHelping, FaIndustry, FaLaptopCode, FaShippingFast, FaTools, FaTrash, FaTruck, FaUndo, FaRedo, FaWarehouse, FaUserTie } from "react-icons/fa";

export const iconMap: Record<string, JSX.Element> = {
  truck: <FaTruck />,
  manufacturing: <FaCogs />,
  inspection: <FaUserTie />,
  warehouse: <FaWarehouse />,
  inventory: <FaBoxOpen />,
  industry: <FaIndustry />,
  quality: <FaClipboardCheck />,
  digital: <FaLaptopCode />,
  maintenance: <FaTools />,
  planning: <FaCalendarAlt />,
  shipping: <FaShippingFast />,
  support: <FaHandsHelping />,
  performance: <FaChartLine />,
  delete: <FaTrash />,
  undo: <FaUndo />,
  redo: <FaRedo />,  
};

export type IconKey = keyof typeof iconMap;

export const getIcon = (key: string): JSX.Element | null => {
  if (iconMap[key]) return iconMap[key];
  return <FaIndustry />;
};
