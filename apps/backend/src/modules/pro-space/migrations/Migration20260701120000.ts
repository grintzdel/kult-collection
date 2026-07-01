import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260701120000 extends Migration {

  override async up(): Promise<void> {
    // Assainissement du cycle de vie du statut : pending -> active -> revoked.
    // Ancien enum : ('pending', 'contacted', 'converted', 'rejected').
    this.addSql(`alter table if exists "pro_lead" drop constraint if exists "pro_lead_status_check";`);

    // Remappage des lignes existantes.
    this.addSql(`update "pro_lead" set "status" = 'active' where "status" = 'converted';`);
    this.addSql(`update "pro_lead" set "status" = 'revoked' where "status" in ('contacted', 'rejected');`);

    this.addSql(`alter table "pro_lead" add constraint "pro_lead_status_check" check ("status" in ('pending', 'active', 'revoked'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "pro_lead" drop constraint if exists "pro_lead_status_check";`);

    // Retour approximatif vers l'ancien vocabulaire (rejected n'est pas récupérable).
    this.addSql(`update "pro_lead" set "status" = 'converted' where "status" = 'active';`);
    this.addSql(`update "pro_lead" set "status" = 'contacted' where "status" = 'revoked';`);

    this.addSql(`alter table "pro_lead" add constraint "pro_lead_status_check" check ("status" in ('pending', 'contacted', 'converted', 'rejected'));`);
  }

}
