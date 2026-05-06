import Icon from "./Icon";
import { useTick } from "../hooks/useTick";
import "./OrderTimeline.css";

const STEPS = [
  { status: "ACCEPTED",  label: "Принят",     iconName: "accepted",  etaField: null },
  { status: "COOKING",   label: "Готовится",  iconName: "cooking",   etaField: "estimatedCookingAt" },
  { status: "READY",     label: "Готов",      iconName: "ready",     etaField: "estimatedReadyAt" },
  { status: "DELIVERED", label: "Выдан",      iconName: "delivered", etaField: "estimatedDeliveryAt" }
];

const STATUS_INDEX = {
  ACCEPTED: 0,
  COOKING: 1,
  READY: 2,
  DELIVERED: 3
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

  const knownStatuses = ["ACCEPTED", "COOKING", "READY", "DELIVERED"];
  const safeStatus = knownStatuses.includes(order.status) ? order.status : "DELIVERED";
  const currentIndex = STATUS_INDEX[safeStatus] ?? 0;
  const nextStep = STEPS.find((s, i) => i > currentIndex && s.etaField);
  const nextEta = nextStep ? order[nextStep.etaField] : null;
  const secondsToNext = nextEta ? (new Date(nextEta).getTime() - now) / 1000 : null;
  const isDelivered = safeStatus === "DELIVERED";

  const timelineKey = `${order.id}-${safeStatus}-${order.statusUpdatedAt || ""}`;

  return (
    <div className="timeline" key={timelineKey}>
      <div className="timeline-track">
        {STEPS.map((step, i) => {
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
              {i < STEPS.length - 1 && <div className="timeline-line"></div>}
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

      {nextStep && secondsToNext !== null && secondsToNext <= 0 && !isDelivered && (
        <div className="timeline-countdown updating">
          <span>Обновляем статус...</span>
        </div>
      )}

      {isDelivered && (
        <div className="timeline-countdown delivered">
          <Icon name="delivered" size={16} className="icon-inline" />
          <span>Заказ выдан, приятного аппетита</span>
        </div>
      )}
    </div>
  );
}
