import {
  FaTruck,
  FaCogs,
  FaWarehouse,
  FaUserTie,
  FaBoxOpen,
  FaIndustry,
  FaClipboardCheck,
  FaLaptopCode,
  FaTools,
  FaCalendarAlt,
  FaShippingFast,
  FaHandsHelping,
  FaChartLine,
} from "react-icons/fa";

export const iconMap = {
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
} as const;

export type IconKey = keyof typeof iconMap;
