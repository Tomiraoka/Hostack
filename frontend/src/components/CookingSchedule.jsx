import Icon from "./Icon";
import { useTick } from "../hooks/useTick";
import "./CookingSchedule.css";

function statusForLine(line, orderReadyAt, now) {
  if (!line.startsAt) return { phase: "unknown", progress: 0 };
  const start = new Date(line.startsAt).getTime();
  const end = new Date(orderReadyAt).getTime();

  if (now < start) return { phase: "waiting", progress: 0 };
  if (now >= end) return { phase: "done", progress: 1 };
  const total = end - start;
  const elapsed = now - start;
  return { phase: "cooking", progress: Math.min(1, elapsed / total) };
}

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function CookingSchedule({ order }) {
  const now = useTick(1000);

  if (!order.items || order.items.length === 0) return null;

  const isFinal =
    order.status === "DELIVERED" || order.status === "PICKED_UP";

  if (!order.estimatedReadyAt) return null;

  const readyAt = order.estimatedReadyAt;

  return (
    <div className="cooking-schedule">
      <div className="cooking-schedule-title">
        <span>
          <Icon name="cooking" size={15} className="icon-inline" />
          План приготовления
        </span>
        <small>Готово к {formatTime(readyAt)}</small>
      </div>

      <div className="cooking-schedule-list">
        {order.items.map((line, idx) => {
          const { phase, progress } = statusForLine(line, readyAt, now);
          const finalPhase = isFinal ? "done" : phase;
          return (
            <div key={idx} className={`cooking-line phase-${finalPhase}`}>
              <div className="cooking-line-head">
                <strong>
                  {line.name}
                  {line.quantity > 1 && <span className="qty"> × {line.quantity}</span>}
                </strong>
                <span className="cooking-line-time">
                  {finalPhase === "waiting" && line.startsAt && (
                    <>
                      <Icon name="time" size={13} className="icon-inline" />
                      старт в {formatTime(line.startsAt)}
                    </>
                  )}
                  {finalPhase === "cooking" && (
                    <>
                      <Icon name="zap" size={13} className="icon-inline" />
                      готовится · {line.prepTime} мин
                    </>
                  )}
                  {finalPhase === "done" && (
                    <>
                      <Icon name="check" size={13} className="icon-inline" />
                      готово
                    </>
                  )}
                  {finalPhase === "unknown" && <>{line.prepTime || "?"} мин</>}
                </span>
              </div>

              {finalPhase !== "unknown" && (
                <div className="cooking-progress">
                  <div
                    className="cooking-progress-fill"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="cooking-schedule-hint">
        <Icon name="info" size={13} className="icon-inline" />
        Быстрые блюда стартуют позже долгих, чтобы заказ был готов одновременно
      </div>
    </div>
  );
}
