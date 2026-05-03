import Icon from "./Icon";
import { useTick } from "../hooks/useTick";
import "./OrderTimeline.css";

const PICKUP_STEPS = [
  { status: "ACCEPTED",  label: "Принят",    iconName: "accepted",  etaField: null },
  { status: "COOKING",   label: "Готовится", iconName: "cooking",   etaField: "estimatedCookingAt" },
  { status: "READY",     label: "Готов",     iconName: "ready",     etaField: "estimatedReadyAt" },
  { status: "PICKED_UP", label: "Выдан",     iconName: "pickedup",  etaField: null }
];

const DELIVERY_STEPS = [
  { status: "ACCEPTED",            label: "Принят",         iconName: "accepted",  etaField: null },
  { status: "COOKING",             label: "Готовится",      iconName: "cooking",   etaField: "estimatedCookingAt" },
  { status: "READY",               label: "Готов",          iconName: "ready",     etaField: "estimatedReadyAt" },
  { status: "COURIER_DISPATCHED",  label: "Курьер выехал",  iconName: "courier",   etaField: "estimatedCourierAt" },
  { status: "DELIVERED",           label: "Доставлено",     iconName: "delivered", etaField: "estimatedDeliveryAt" }
];

const PICKUP_STATUS_INDEX = {
  ACCEPTED: 0, COOKING: 1, READY: 2, PICKED_UP: 3
};

const DELIVERY_STATUS_INDEX = {
  ACCEPTED: 0, COOKING: 1, READY: 2, COURIER_DISPATCHED: 3, DELIVERED: 4
};

function formatCountdown(secondsLeft) {
  const safe = Math.max(0, Math.floor(secondsLeft));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function OrderTimeline({ order }) {
  const now = useTick(1000);

  const isDelivery = order.type === "DELIVERY";
  const steps = isDelivery ? DELIVERY_STEPS : PICKUP_STEPS;
  const indexMap = isDelivery ? DELIVERY_STATUS_INDEX : PICKUP_STATUS_INDEX;
  const currentIndex = indexMap[order.status] ?? 0;

  const nextStep = steps.find((s, i) => i > currentIndex && s.etaField);
  const nextEta = nextStep ? order[nextStep.etaField] : null;
  const secondsToNext = nextEta ? (new Date(nextEta).getTime() - now) / 1000 : null;

  const isFinalState =
    order.status === "DELIVERED" || order.status === "PICKED_UP";

  const isPickupReady = !isDelivery && order.status === "READY";

  return (
    <div className="timeline">
      <div className="timeline-track">
        {steps.map((step, i) => {
          const isPassed = i < currentIndex;
          const isCurrent = i === currentIndex;
          const cls = isPassed ? "passed" : isCurrent ? "current" : "upcoming";
          const eta = step.etaField ? order[step.etaField] : null;

          return (
            <div key={step.status} className={`timeline-step ${cls}`}>
              <div className="timeline-dot">
                {isPassed
                  ? <Icon name="check" size={16} />
                  : <Icon name={step.iconName} size={16} />}
              </div>
              <div className="timeline-step-info">
                <strong>{step.label}</strong>
                {eta && <small>~ {formatTime(eta)}</small>}
              </div>
              {i < steps.length - 1 && <div className="timeline-line"></div>}
            </div>
          );
        })}
      </div>

      {nextStep && secondsToNext !== null && secondsToNext > 0 && (
        <div className="timeline-countdown">
          <span>До «{nextStep.label.toLowerCase()}»:</span>
          <strong>{formatCountdown(secondsToNext)}</strong>
        </div>
      )}

      {nextStep && secondsToNext !== null && secondsToNext <= 0 && (
        <div className="timeline-countdown updating">
          <span>Обновляем статус...</span>
        </div>
      )}

      {isPickupReady && (
        <div className="timeline-countdown waiting">
          <Icon name="bell" size={16} className="icon-inline" />
          <span>Заказ готов к получению — ждём вас</span>
        </div>
      )}

      {order.status === "DELIVERED" && (
        <div className="timeline-countdown delivered">
          <Icon name="delivered" size={16} className="icon-inline" />
          <span>Заказ доставлен</span>
        </div>
      )}

      {order.status === "PICKED_UP" && (
        <div className="timeline-countdown delivered">
          <Icon name="checkCircle" size={16} className="icon-inline" />
          <span>Приятного аппетита</span>
        </div>
      )}

      {!nextStep && !isFinalState && !isPickupReady && (
        <div className="timeline-countdown updating">
          <span>Готовим...</span>
        </div>
      )}
    </div>
  );
}
