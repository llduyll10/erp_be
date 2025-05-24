import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747384757043 implements MigrationInterface {
  name = 'Migration1747384757043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_116eea5d3ceebebe8db0e10c68"`,
    );
    await queryRunner.query(
      `CREATE TABLE "storage_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_path" character varying(255) NOT NULL, "origin_name" character varying(255) NOT NULL, "mime_type" character varying(255) NOT NULL, "checksum" character varying(255) NOT NULL, "size" integer NOT NULL, "disk" character varying(255) NOT NULL, "uploader_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f5d0395ab1f8358e812ac4fe28" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "encrypted_password"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_ee6419219542371563e0592db51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "reset_password_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "reset_password_sent_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "current_sign_in_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "last_sign_in_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "current_sign_in_ip"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "last_sign_in_ip"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sign_in_count"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "password_confirmation"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "locked_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "failed_attempts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_b800fd597d3e239f367bb8852df"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "unlock_token"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_type"`);
    await queryRunner.query(`DROP TYPE "public"."users_user_type_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_code"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "version"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
    await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLoginAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "isEmailVerified"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'sales', 'warehouse')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum_old" AS ENUM('staff_admin', 'staff_general')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "is_active"`);
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "refreshToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "lastLoginAt" TIMESTAMP`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'pending', 'blocked')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_roles_enum" AS ENUM('admin', 'user', 'manager')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{user}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastName" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "firstName" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "version" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "user_code" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_user_type_enum" AS ENUM('staff', 'customer', 'supplier', 'contractor')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "user_type" "public"."users_user_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "unlock_token" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_b800fd597d3e239f367bb8852df" UNIQUE ("unlock_token")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "failed_attempts" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "locked_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password_confirmation" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "sign_in_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_sign_in_ip" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "current_sign_in_ip" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_sign_in_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "current_sign_in_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "reset_password_sent_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "reset_password_token" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_ee6419219542371563e0592db51" UNIQUE ("reset_password_token")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "encrypted_password" character varying(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`DROP TABLE "storage_files"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_116eea5d3ceebebe8db0e10c68" ON "users" ("user_type", "email") `,
    );
  }
}
