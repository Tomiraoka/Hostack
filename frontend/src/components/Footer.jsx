import Icon from "./Icon";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <div className="footer-logo">
            <img src="/logo.png" alt="logo" />
            <span>Hostack</span>
          </div>
          <p>Свежая еда, удобные заказы и уютная атмосфера для каждого.</p>
          <div className="socials">
            <span><Icon name="instagram" size={18} /></span>
            <span><Icon name="chat" size={18} /></span>
            <span><Icon name="telegram" size={18} /></span>
            <span><Icon name="phone" size={18} /></span>
          </div>
        </div>

        <div>
          <h3>Меню</h3>
          <p>Бургеры</p>
          <p>Пицца</p>
          <p>Напитки</p>
          <p>Салаты</p>
          <p>Десерты</p>
        </div>

        <div>
          <h3>Информация</h3>
          <p>О нас</p>
          <p>Заказы</p>
          <p>Скидки</p>
          <p>Доставка</p>
        </div>

        <div>
          <h3>Контакты</h3>
          <p><Icon name="address" size={14} className="icon-inline" />Казахстан, Астана</p>
          <p><Icon name="phone"   size={14} className="icon-inline" />+7 777 123 45 67</p>
          <p><Icon name="mail"    size={14} className="icon-inline" />hostack@mail.com</p>
          <p><Icon name="time"    size={14} className="icon-inline" />Ежедневно 8:00 – 22:00</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Hostack. Все права защищены.</p>
        <p>Сделано с заботой</p>
      </div>
    </footer>
  );
}

export default Footer;
