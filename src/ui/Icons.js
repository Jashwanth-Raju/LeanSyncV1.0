import { jsx as _jsx } from "react/jsx-runtime";
import { FaBoxOpen, FaCalendarAlt, FaChartLine, FaClipboardCheck, FaCogs, FaHandsHelping, FaIndustry, FaLaptopCode, FaShippingFast, FaTools, FaTrash, FaTruck, FaUndo, FaRedo, FaWarehouse, FaUserTie } from "react-icons/fa";
export const iconMap = {
    truck: _jsx(FaTruck, {}),
    manufacturing: _jsx(FaCogs, {}),
    inspection: _jsx(FaUserTie, {}),
    warehouse: _jsx(FaWarehouse, {}),
    inventory: _jsx(FaBoxOpen, {}),
    industry: _jsx(FaIndustry, {}),
    quality: _jsx(FaClipboardCheck, {}),
    digital: _jsx(FaLaptopCode, {}),
    maintenance: _jsx(FaTools, {}),
    planning: _jsx(FaCalendarAlt, {}),
    shipping: _jsx(FaShippingFast, {}),
    support: _jsx(FaHandsHelping, {}),
    performance: _jsx(FaChartLine, {}),
    delete: _jsx(FaTrash, {}),
    undo: _jsx(FaUndo, {}),
    redo: _jsx(FaRedo, {}),
};
export const getIcon = (key) => {
    if (iconMap[key])
        return iconMap[key];
    return _jsx(FaIndustry, {});
};
