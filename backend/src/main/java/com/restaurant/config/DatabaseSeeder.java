package com.restaurant.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.restaurant.enums.Role;
import com.restaurant.model.Ingredient;
import com.restaurant.model.InventoryItem;
import com.restaurant.model.MenuItem;
import com.restaurant.model.User;
import com.restaurant.repository.InventoryRepository;
import com.restaurant.repository.MenuRepository;
import com.restaurant.repository.UserRepository;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(MenuRepository menuRepository,
                                   InventoryRepository inventoryRepository,
                                   UserRepository userRepository) {
        return args -> {
            try {
                seedAdmin(userRepository);
                seedInventory(inventoryRepository);
                seedMenu(menuRepository);
                System.out.println("🚀 База данных готова к работе!");
            } catch (Exception e) {
                System.err.println("⚠️  Не удалось наполнить базу: " + e.getMessage());
                System.err.println("    Приложение продолжит работу, но данных может не хватать.");
                e.printStackTrace();
            }
        };
    }

    private void seedAdmin(UserRepository userRepository) {
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(new BCryptPasswordEncoder().encode("Admin123"));
            admin.setRole(Role.ADMIN.name());
            userRepository.save(admin);
            System.out.println("✅ [SEEDER] Создан админ: admin@gmail.com / Admin123");
        }
    }

    private void seedInventory(InventoryRepository repo) {
        if (repo.count() > 0) return;

        List<InventoryItem> items = new ArrayList<>();

        items.add(stock("Булочка для бургера", "Хлеб", 100, "шт", 20));
        items.add(stock("Тесто для пиццы", "Хлеб", 80, "шт", 15));
        items.add(stock("Круассан-заготовка", "Хлеб", 30, "шт", 5));

        items.add(stock("Котлета говяжья", "Мясо", 80, "шт", 15));
        items.add(stock("Куриное филе", "Мясо", 60, "шт", 10));
        items.add(stock("Пепперони", "Мясо", 40, "шт", 10));
        items.add(stock("Тунец", "Рыба", 25, "шт", 5));

        items.add(stock("Сыр чеддер", "Молочные", 70, "шт", 15));
        items.add(stock("Моцарелла", "Молочные", 50, "шт", 10));
        items.add(stock("Сыр фета", "Молочные", 30, "шт", 5));
        items.add(stock("Молоко", "Молочные", 30, "л", 5));
        items.add(stock("Сливки", "Молочные", 15, "л", 3));
        items.add(stock("Сливочное масло", "Молочные", 10, "кг", 2));
        items.add(stock("Мороженое", "Молочные", 20, "шт", 5));

        items.add(stock("Помидор", "Овощи", 80, "шт", 20));
        items.add(stock("Огурец", "Овощи", 50, "шт", 10));
        items.add(stock("Салат-латук", "Зелень", 60, "шт", 15));
        items.add(stock("Лук", "Овощи", 40, "шт", 10));
        items.add(stock("Картофель", "Овощи", 80, "кг", 20));
        items.add(stock("Грибы", "Овощи", 25, "кг", 5));
        items.add(stock("Авокадо", "Овощи", 30, "шт", 8));
        items.add(stock("Оливки", "Овощи", 20, "кг", 4));
        items.add(stock("Базилик", "Зелень", 15, "пучок", 3));
        items.add(stock("Мята", "Зелень", 10, "пучок", 2));

        items.add(stock("Томатный соус", "Соусы", 30, "л", 5));
        items.add(stock("BBQ соус", "Соусы", 15, "л", 3));
        items.add(stock("Соус Цезарь", "Соусы", 12, "л", 2));
        items.add(stock("Майонез", "Соусы", 18, "л", 4));

        items.add(stock("Кофейные зёрна", "Напитки", 15, "кг", 3));
        items.add(stock("Карамельный сироп", "Напитки", 8, "л", 2));
        items.add(stock("Лимон", "Фрукты", 50, "шт", 10));
        items.add(stock("Апельсин", "Фрукты", 40, "шт", 10));
        items.add(stock("Ягоды (микс)", "Фрукты", 15, "кг", 3));
        items.add(stock("Лёд", "Прочее", 50, "кг", 10));
        items.add(stock("Сахар", "Бакалея", 30, "кг", 5));

        items.add(stock("Шоколад", "Десерты", 20, "кг", 4));
        items.add(stock("Бисквит", "Десерты", 25, "шт", 5));
        items.add(stock("Крем-сыр", "Молочные", 12, "кг", 3));
        items.add(stock("Мёд", "Бакалея", 10, "л", 2));
        items.add(stock("Глазурь", "Десерты", 8, "кг", 2));
        items.add(stock("Тесто пончиковое", "Хлеб", 30, "шт", 8));
        items.add(stock("Сухарики", "Бакалея", 10, "кг", 2));
        items.add(stock("Яйцо", "Бакалея", 100, "шт", 20));

        repo.saveAll(items);
        System.out.println("✅ [SEEDER] Склад заполнен: " + items.size() + " позиций");
    }

    private void seedMenu(MenuRepository repo) {
        if (repo.count() > 0) return;

        List<MenuItem> menu = new ArrayList<>();

        menu.add(dish("Honey Burger", "Бургеры",
                "Сочный бургер с мясом, сыром и фирменным соусом",
                2200, 2700, "350 г",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                "-18%", true, 12,
                ing("Булочка для бургера", 1),
                ing("Котлета говяжья", 1),
                ing("Сыр чеддер", 1),
                ing("Помидор", 1),
                ing("Салат-латук", 1),
                ing("Майонез", 0.05)));

        menu.add(dish("Pepperoni Pizza", "Пицца",
                "Пицца с пепперони, сыром и томатным соусом",
                2900, 3500, "30 см",
                "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
                "-17%", true, 18,
                ing("Тесто для пиццы", 1),
                ing("Томатный соус", 0.1),
                ing("Моцарелла", 1),
                ing("Пепперони", 1)));

        menu.add(dish("Caramel Latte", "Напитки",
                "Кофе с карамелью и мягкой молочной пенкой",
                950, 1200, "350 мл",
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
                "-20%", true, 5,
                ing("Кофейные зёрна", 0.02),
                ing("Молоко", 0.25),
                ing("Карамельный сироп", 0.03)));

        menu.add(dish("Classic Burger", "Бургеры",
                "Классический бургер с говядиной и овощами",
                2500, 0, "330 г",
                "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
                null, false, 12,
                ing("Булочка для бургера", 1),
                ing("Котлета говяжья", 1),
                ing("Помидор", 1),
                ing("Салат-латук", 1),
                ing("Лук", 1)));

        menu.add(dish("Cheese Burger", "Бургеры",
                "Бургер с двойным сыром и соусом",
                2700, 0, "360 г",
                "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600",
                null, false, 12,
                ing("Булочка для бургера", 1),
                ing("Котлета говяжья", 1),
                ing("Сыр чеддер", 2),
                ing("Майонез", 0.05)));

        menu.add(dish("Chicken Burger", "Бургеры",
                "Бургер с курицей, салатом и соусом",
                2300, 0, "320 г",
                "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600",
                null, false, 11,
                ing("Булочка для бургера", 1),
                ing("Куриное филе", 1),
                ing("Салат-латук", 1),
                ing("Майонез", 0.05)));

        menu.add(dish("Double Burger", "Бургеры",
                "Двойная котлета, сыр и фирменный соус",
                3400, 0, "450 г",
                "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600",
                null, false, 15,
                ing("Булочка для бургера", 1),
                ing("Котлета говяжья", 2),
                ing("Сыр чеддер", 2),
                ing("Помидор", 1),
                ing("Салат-латук", 1)));

        menu.add(dish("BBQ Burger", "Бургеры",
                "Бургер с BBQ соусом и хрустящим луком",
                2900, 0, "370 г",
                "https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?w=600",
                null, false, 13,
                ing("Булочка для бургера", 1),
                ing("Котлета говяжья", 1),
                ing("Сыр чеддер", 1),
                ing("BBQ соус", 0.05),
                ing("Лук", 1)));

        menu.add(dish("Mini Burger Set", "Бургеры",
                "Набор мини-бургеров для компании",
                3900, 0, "500 г",
                "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=600",
                null, false, 18,
                ing("Булочка для бургера", 3),
                ing("Котлета говяжья", 3),
                ing("Сыр чеддер", 2)));

        menu.add(dish("Cheese Pizza", "Пицца",
                "Пицца с большим количеством сыра",
                3200, 0, "30 см",
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
                null, false, 18,
                ing("Тесто для пиццы", 1),
                ing("Томатный соус", 0.1),
                ing("Моцарелла", 2)));

        menu.add(dish("Margarita Pizza", "Пицца",
                "Классическая пицца с томатами и сыром",
                2800, 0, "30 см",
                "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                null, false, 17,
                ing("Тесто для пиццы", 1),
                ing("Томатный соус", 0.1),
                ing("Моцарелла", 1),
                ing("Помидор", 2),
                ing("Базилик", 1)));

        menu.add(dish("Chicken Pizza", "Пицца",
                "Пицца с курицей и сливочным соусом",
                3400, 0, "30 см",
                "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600",
                null, false, 19,
                ing("Тесто для пиццы", 1),
                ing("Сливки", 0.1),
                ing("Моцарелла", 1),
                ing("Куриное филе", 1)));

        menu.add(dish("Vegetable Pizza", "Пицца",
                "Пицца со свежими овощами",
                3000, 0, "30 см",
                "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600",
                null, false, 18,
                ing("Тесто для пиццы", 1),
                ing("Томатный соус", 0.1),
                ing("Моцарелла", 1),
                ing("Помидор", 1),
                ing("Лук", 1),
                ing("Грибы", 0.1)));

        menu.add(dish("Mushroom Pizza", "Пицца",
                "Пицца с грибами, сыром и зеленью",
                3100, 0, "30 см",
                "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600",
                null, false, 18,
                ing("Тесто для пиццы", 1),
                ing("Томатный соус", 0.1),
                ing("Моцарелла", 1),
                ing("Грибы", 0.2),
                ing("Базилик", 1)));

        menu.add(dish("Four Cheese Pizza", "Пицца",
                "Пицца с четырьмя видами сыра",
                3700, 0, "30 см",
                "https://images.unsplash.com/photo-1601924582975-7bb3a7a8b8f1?w=600",
                null, false, 19,
                ing("Тесто для пиццы", 1),
                ing("Сливки", 0.05),
                ing("Моцарелла", 1),
                ing("Сыр чеддер", 1),
                ing("Сыр фета", 1)));

        menu.add(dish("Cappuccino", "Напитки",
                "Классический кофе с молочной пенкой",
                900, 0, "300 мл",
                "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600",
                null, false, 4,
                ing("Кофейные зёрна", 0.02),
                ing("Молоко", 0.2)));

        menu.add(dish("Americano", "Напитки",
                "Крепкий чёрный кофе",
                700, 0, "250 мл",
                "https://images.unsplash.com/photo-1497636577773-f1231844b336?w=600",
                null, false, 3,
                ing("Кофейные зёрна", 0.02)));

        menu.add(dish("Orange Juice", "Напитки",
                "Свежий апельсиновый сок",
                1100, 0, "300 мл",
                "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600",
                null, false, 3,
                ing("Апельсин", 4)));

        menu.add(dish("Lemonade", "Напитки",
                "Домашний лимонад с лимоном и мятой",
                1000, 0, "400 мл",
                "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600",
                null, false, 4,
                ing("Лимон", 2),
                ing("Мята", 1),
                ing("Сахар", 0.03),
                ing("Лёд", 0.1)));

        menu.add(dish("Iced Coffee", "Напитки",
                "Холодный кофе со льдом",
                1200, 0, "350 мл",
                "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600",
                null, false, 4,
                ing("Кофейные зёрна", 0.02),
                ing("Молоко", 0.15),
                ing("Лёд", 0.1)));

        menu.add(dish("Milkshake", "Напитки",
                "Молочный коктейль с ванилью",
                1300, 0, "400 мл",
                "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600",
                null, false, 5,
                ing("Молоко", 0.3),
                ing("Мороженое", 1),
                ing("Сахар", 0.02)));

        menu.add(dish("Fresh Salad", "Салаты",
                "Лёгкий салат из свежих овощей",
                1800, 0, "250 г",
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
                null, false, 7,
                ing("Салат-латук", 1),
                ing("Помидор", 1),
                ing("Огурец", 1)));

        menu.add(dish("Caesar Salad", "Салаты",
                "Салат с курицей, сухариками и соусом",
                2300, 0, "300 г",
                "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600",
                null, false, 9,
                ing("Салат-латук", 1),
                ing("Куриное филе", 1),
                ing("Сухарики", 0.05),
                ing("Соус Цезарь", 0.05)));

        menu.add(dish("Greek Salad", "Салаты",
                "Салат с сыром фета, овощами и оливками",
                2100, 0, "280 г",
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600",
                null, false, 8,
                ing("Помидор", 2),
                ing("Огурец", 1),
                ing("Сыр фета", 1),
                ing("Оливки", 0.05),
                ing("Лук", 1)));

        menu.add(dish("Chicken Salad", "Салаты",
                "Салат с курицей и свежей зеленью",
                2400, 0, "320 г",
                "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600",
                null, false, 9,
                ing("Куриное филе", 1),
                ing("Салат-латук", 1),
                ing("Помидор", 1),
                ing("Огурец", 1)));

        menu.add(dish("Avocado Salad", "Салаты",
                "Салат с авокадо и томатами",
                2600, 0, "270 г",
                "https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=600",
                null, false, 7,
                ing("Авокадо", 1),
                ing("Помидор", 2),
                ing("Салат-латук", 1)));

        menu.add(dish("Tuna Salad", "Салаты",
                "Салат с тунцом, яйцом и овощами",
                2700, 0, "300 г",
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
                null, false, 9,
                ing("Тунец", 1),
                ing("Яйцо", 2),
                ing("Салат-латук", 1),
                ing("Помидор", 1)));

        menu.add(dish("Chocolate Cake", "Десерты",
                "Нежный шоколадный торт с кремом",
                1500, 0, "180 г",
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
                null, false, 6,
                ing("Бисквит", 1),
                ing("Шоколад", 0.05),
                ing("Сливки", 0.05)));

        menu.add(dish("Cheesecake", "Десерты",
                "Классический чизкейк с ягодами",
                1600, 0, "170 г",
                "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600",
                null, false, 6,
                ing("Бисквит", 1),
                ing("Крем-сыр", 0.1),
                ing("Ягоды (микс)", 0.05)));

        menu.add(dish("Honey Pancakes", "Десерты",
                "Панкейки с мёдом и ягодами",
                1700, 0, "220 г",
                "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600",
                null, false, 8,
                ing("Молоко", 0.1),
                ing("Яйцо", 2),
                ing("Мёд", 0.05),
                ing("Ягоды (микс)", 0.05)));

        menu.add(dish("Ice Cream", "Десерты",
                "Мороженое с шоколадом и сиропом",
                1200, 0, "160 г",
                "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
                null, false, 3,
                ing("Мороженое", 2),
                ing("Шоколад", 0.03)));

        menu.add(dish("Croissant", "Десерты",
                "Свежий круассан с маслом",
                900, 0, "120 г",
                "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
                null, false, 4,
                ing("Круассан-заготовка", 1),
                ing("Сливочное масло", 0.02)));

        menu.add(dish("Donuts", "Десерты",
                "Пончики с глазурью",
                1300, 0, "200 г",
                "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600",
                null, false, 6,
                ing("Тесто пончиковое", 3),
                ing("Глазурь", 0.05)));

        repo.saveAll(menu);
        System.out.println("✅ [SEEDER] Меню заполнено: " + menu.size() + " блюд");
    }

    private static InventoryItem stock(String name, String category, double qty, String unit, double min) {
        InventoryItem i = new InventoryItem();
        i.setName(name);
        i.setCategory(category);
        i.setQuantity(qty);
        i.setUnit(unit);
        i.setMinQuantity(min);
        return i;
    }

    private static Ingredient ing(String name, double amount) {
        return new Ingredient(name, amount);
    }

    private static MenuItem dish(String name, String category, String desc,
                                 double price, double oldPrice, String size,
                                 String image, String badge, boolean discount,
                                 int prepTime, Ingredient... ingredients) {
        MenuItem m = new MenuItem();
        m.setName(name);
        m.setCategory(category);
        m.setDescription(desc);
        m.setPrice(price);
        m.setOldPrice(oldPrice);
        m.setSize(size);
        m.setImage(image);
        m.setBadge(badge);
        m.setDiscount(discount);
        m.setPreparationTime(prepTime);
        List<Ingredient> list = new ArrayList<>();
        for (Ingredient i : ingredients) list.add(i);
        m.setIngredients(list);
        return m;
    }
}
