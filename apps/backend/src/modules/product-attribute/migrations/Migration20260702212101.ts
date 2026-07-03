import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260702212101 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_badge" drop constraint if exists "product_badge_type_unique";`);
    this.addSql(`create table if not exists "product_badge" ("id" text not null, "type" text check ("type" in ('featured', 'new')) not null, "label" text not null, "image_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_badge_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_badge_type_unique" ON "product_badge" ("type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_badge_deleted_at" ON "product_badge" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_badge" cascade;`);
  }

}
