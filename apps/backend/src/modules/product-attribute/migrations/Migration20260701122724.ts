import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260701122724 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "attribute_definition" drop constraint if exists "attribute_definition_key_unique";`);
    this.addSql(`create table if not exists "attribute_definition" ("id" text not null, "key" text not null, "label" text not null, "type" text check ("type" in ('text', 'textarea', 'group')) not null default 'text', "zone" text check ("zone" in ('accroche', 'specs', 'accordeon')) not null default 'accordeon', "rank" integer not null default 0, "group_fields" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "attribute_definition_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_attribute_definition_key_unique" ON "attribute_definition" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_attribute_definition_deleted_at" ON "attribute_definition" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "trust_badge" ("id" text not null, "icon" text not null, "label" text not null, "rank" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "trust_badge_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_trust_badge_deleted_at" ON "trust_badge" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "attribute_definition" cascade;`);

    this.addSql(`drop table if exists "trust_badge" cascade;`);
  }

}
