import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260701074239 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "pro_config" ("id" text not null, "active" boolean not null default false, "online_purchase_enabled" boolean not null default false, "min_order_amount" integer not null default 0, "currency_code" text not null default 'eur', "display_ht" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pro_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pro_config_deleted_at" ON "pro_config" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pro_lead" ("id" text not null, "company" text not null, "vat_or_siret" text null, "email" text not null, "message" text null, "status" text check ("status" in ('pending', 'contacted', 'converted', 'rejected')) not null default 'pending', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pro_lead_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pro_lead_deleted_at" ON "pro_lead" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pro_config" cascade;`);

    this.addSql(`drop table if exists "pro_lead" cascade;`);
  }

}
