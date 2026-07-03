import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260702213050 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_badge" add column if not exists "position" text check ("position" in ('top-left', 'top-right', 'bottom-left', 'bottom-right')) not null default 'top-left';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_badge" drop column if exists "position";`);
  }

}
