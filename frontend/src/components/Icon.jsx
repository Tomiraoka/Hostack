import {

  FiClipboard,
  FiClock,
  FiCheck,
  FiCheckCircle,
  FiAward,
  FiStar,

  FiTruck,
  FiPackage,
  FiHome,
  FiMapPin,
  FiBell,

  FiCreditCard,
  FiDollarSign,
  FiTag,
  FiGift,

  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiSearch,
  FiInfo,
  FiAlertCircle,
  FiZap,

  FiBarChart2,
  FiBox,
  FiList,
  FiCoffee,

  FiPhone,
  FiMail,
  FiInstagram,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";

const ICON_MAP = {

  accepted: FiClipboard,
  cooking: FiClock,
  ready: FiCheckCircle,
  courier: FiTruck,
  delivered: FiPackage,
  pickedup: FiCheck,

  pickup: FiHome,
  delivery: FiTruck,
  address: FiMapPin,

  card: FiCreditCard,
  cash: FiDollarSign,
  discount: FiTag,
  gift: FiGift,
  reward: FiAward,

  cart: FiShoppingCart,
  add: FiPlus,
  remove: FiMinus,
  trash: FiTrash2,
  edit: FiEdit2,
  close: FiX,
  search: FiSearch,
  bell: FiBell,
  info: FiInfo,
  alert: FiAlertCircle,
  zap: FiZap,
  star: FiStar,

  time: FiClock,
  check: FiCheck,
  checkCircle: FiCheckCircle,

  user: FiUser,
  logout: FiLogOut,

  dashboard: FiBarChart2,
  inventory: FiBox,
  dishes: FiCoffee,
  orders: FiList,

  phone: FiPhone,
  mail: FiMail,
  instagram: FiInstagram,
  telegram: FiSend,
  chat: FiMessageCircle,
};

export default function Icon({ name, size = 16, className = "", style }) {
  const Cmp = ICON_MAP[name];
  if (!Cmp) {

    if (typeof console !== "undefined") {
      console.warn(`[Icon] Unknown icon: "${name}"`);
    }
    return null;
  }
  return <Cmp size={size} className={className} style={style} aria-hidden="true" />;
}
