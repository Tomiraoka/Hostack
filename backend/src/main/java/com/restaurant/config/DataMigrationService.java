package com.restaurant.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import com.mongodb.client.result.UpdateResult;

@Component
public class DataMigrationService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void migrate() {
        try {
            migrateOldStatuses();
            migrateOldRoles();
        } catch (Exception e) {
            System.err.println("[migration] Не удалось выполнить миграцию: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void migrateOldStatuses() {
        UpdateResult r1 = mongoTemplate.updateMulti(
                Query.query(Criteria.where("status").is("PICKED_UP")),
                Update.update("status", "DELIVERED"),
                "orders"
        );
        UpdateResult r2 = mongoTemplate.updateMulti(
                Query.query(Criteria.where("status").is("COURIER_DISPATCHED")),
                Update.update("status", "READY"),
                "orders"
        );
        UpdateResult r3 = mongoTemplate.updateMulti(
                Query.query(Criteria.where("type").exists(true)),
                new Update().unset("type"),
                "orders"
        );

        long total = r1.getModifiedCount() + r2.getModifiedCount() + r3.getModifiedCount();
        if (total > 0) {
            System.out.println("[migration] Заказов обновлено: " + total
                    + " (PICKED_UP→DELIVERED: " + r1.getModifiedCount()
                    + ", COURIER_DISPATCHED→READY: " + r2.getModifiedCount()
                    + ", убрано поле type: " + r3.getModifiedCount() + ")");
        }
    }

    private void migrateOldRoles() {

        UpdateResult r1 = mongoTemplate.updateMulti(
                Query.query(Criteria.where("role").exists(false)),
                Update.update("role", "USER"),
                "users"
        );

        UpdateResult r2 = mongoTemplate.updateMulti(
                Query.query(Criteria.where("role").is(null)),
                Update.update("role", "USER"),
                "users"
        );

        long total = r1.getModifiedCount() + r2.getModifiedCount();
        if (total > 0) {
            System.out.println("[migration] Юзеров обновлено: " + total);
        }
    }
}
